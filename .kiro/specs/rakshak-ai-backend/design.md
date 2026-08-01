# Design Document: Rakshak AI Backend

## Overview

The Rakshak AI Backend is a FastAPI + Uvicorn REST service that acts as the central integration hub for the Rakshak AI wildlife detection system. It bridges the Vision module (upstream frame producer), the Explainable Decision Engine (EDE, a local Python module), and the farmer-facing Next.js dashboard frontend.

The backend is purely software — no hardware, GPIO, or physical device control. It exposes five REST endpoints, maintains an in-memory frame state and threat cache, and persists an append-only incident timeline to `timeline.json`.

```
Vision Module ──POST /detect──► Backend ──POST /decision──► Decision Engine
                                    │                              │
                                    │◄── Threat JSON ──────────────┘
                                    │
                             ┌──────┴──────┐
                     GET /status     GET /timeline
                             │             │
                        Dashboard     Dashboard
                             │
                   POST /timeline/action
                             │
                          Farmer
```

---

## Architecture

### Module Boundaries

```
backend/
  app.py        — FastAPI app instance, CORS middleware, router registration
  api.py        — all route handlers (APIRouter)
  models.py     — Pydantic v2 request/response schemas
  timeline.py   — TimelineStore (in-memory list + timeline.json persistence)

decision_engine/   (existing, read-only from backend's perspective)
  decision_engine.py   — evaluate_threat(dict) → dict
  schemas.py           — DecisionInput / DecisionOutput
  enums.py             — ThreatLevel, Recommendation, Direction, TimeOfDay
```

The backend treats `decision_engine` as an opaque callable. It imports and calls `evaluate_threat` directly; it never subprocesses, patches, or re-implements any engine logic.

### Request Lifecycle

```
HTTP Request
  → FastAPI routing (api.py APIRouter)
  → Pydantic validation (models.py)
  → Handler logic (api.py)
      ├── read/write in-memory state (frame_state, threat_cache)
      └── read/write TimelineStore (timeline.py)
          └── decision path: call evaluate_threat(dict)
  → Pydantic serialization (.model_dump())
  → HTTP Response
```

---

## Components and Interfaces

### app.py

- Creates the `FastAPI()` instance.
- Attaches `CORSMiddleware` with `allow_origins=["*"]`, all methods, all headers.
- Imports the `APIRouter` from `api.py` and registers it with `app.include_router(router)`.
- Instantiates a single `TimelineStore` and passes it as a shared dependency (module-level singleton is acceptable for this scale).

### api.py

Defines an `APIRouter` with five route handlers:

| Method | Path | Handler |
|--------|------|---------|
| POST | `/detect` | `post_detect` |
| POST | `/decision` | `post_decision` |
| GET | `/status` | `get_status` |
| GET | `/timeline` | `get_timeline` |
| POST | `/timeline/action` | `post_timeline_action` |

Module-level mutable state held in `api.py`:
- `frame_state: Optional[VisionInput]` — most recent Vision JSON.
- `threat_cache: Optional[StatusResponse]` — most recent decision result.

### models.py

All Pydantic v2 models; serialization via `.model_dump()` / `.model_dump(mode="json")`.

### timeline.py — TimelineStore

```python
class TimelineStore:
    def __init__(self, path: str = "timeline.json"): ...
    def load(self) -> None: ...          # called at startup
    def append(self, record: IncidentRecord) -> None: ...
    def update_action(self, id: str, action: str) -> bool: ...
    def all(self) -> list[IncidentRecord]: ...  # returns copy, reverse-chron
    def _persist(self) -> None: ...     # writes timeline.json, swallows IOError
```

---

## Data Models

### VisionInput (POST /detect request body)

```python
class VisionInput(BaseModel):
    animal: str
    confidence: float = Field(ge=0.0, le=1.0)
    position: list[int] = Field(min_length=2, max_length=2)
    previous_position: list[int] = Field(min_length=2, max_length=2)
    direction: Direction          # enum: "Toward Crop" | "Away From Crop" | "Stationary"
```

### DecisionRequest (POST /decision request body)

```python
class DecisionRequest(BaseModel):
    animal: str
    confidence: float = Field(ge=0.0, le=1.0)
    distance: float
    direction: Direction
    time: TimeOfDay               # enum: "Day" | "Night"
    inside_crop_region: bool = False
```

### TimelineActionRequest (POST /timeline/action request body)

```python
class TimelineActionRequest(BaseModel):
    id: str
    action: Literal["accept", "ignore", "override"]
```

### IncidentRecord (timeline entry)

```python
class IncidentRecord(BaseModel):
    id: str                        # uuid4 string
    timestamp: str                 # UTC ISO-8601
    animal: str
    confidence: float
    threat_level: str
    recommendation: str
    reason: list[str]
    farmer_action: Optional[str]   # None | "accept" | "ignore" | "override"
    decision_input: dict           # snapshot of the DecisionRequest as dict
```

### StatusResponse (GET /status response)

```python
class StatusResponse(BaseModel):
    threat_level: str              # "NONE" when no decision yet
    recommendation: str
    reason: list[str]
    animal: str
    confidence: float
    timestamp: str
```

### Decision Engine Output Field Mapping

```
evaluate_threat() output           → Backend field
─────────────────────────────────────────────────
assessment.threat_level            → threat_level
response.recommended_action        → recommendation
reason                             → reason
observation.animal                 → animal
observation.confidence             → confidence
```

The timestamp is generated by the backend at decision time (`datetime.utcnow().isoformat() + "Z"`).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Vision input validation rejects out-of-range confidence

*For any* Vision JSON payload where `confidence` is outside [0.0, 1.0], the backend SHALL return HTTP 422 and SHALL NOT update the in-memory frame state.

**Validates: Requirements 1.3, 1.2**

---

### Property 2: Valid Vision JSON updates frame state

*For any* well-formed VisionInput, POSTing it to `/detect` should result in the frame state being equal to that input, and return HTTP 200 `{"status": "ok"}`.

**Validates: Requirements 1.1, 1.2, 1.5**

---

### Property 3: Decision evaluation creates timeline entry

*For any* valid DecisionRequest, POSTing it to `/decision` should increase the timeline length by exactly one, and the new entry should contain the same `animal`, `confidence`, `direction`, and `time` values as the request.

**Validates: Requirements 2.4**

---

### Property 4: Status cache reflects last decision

*For any* valid DecisionRequest POSTed to `/decision`, a subsequent GET `/status` should return `threat_level`, `recommendation`, `reason`, `animal`, and `confidence` values that match the Decision Engine output for that request.

**Validates: Requirements 2.5, 3.1**

---

### Property 5: Default status before any decision

*For any* freshly-started backend with no prior decision evaluated, GET `/status` SHALL return `threat_level: "NONE"`, `recommendation: "Monitor"`, and an empty `reason` list.

**Validates: Requirements 3.2**

---

### Property 6: Timeline reverse-chronological order

*For any* sequence of N decisions posted to `/decision`, GET `/timeline` SHALL return exactly N entries, with entries ordered so that each entry's timestamp is greater than or equal to the timestamp of the entry that follows it.

**Validates: Requirements 4.1**

---

### Property 7: Timeline persistence round-trip

*For any* valid IncidentRecord, serialising it with `.model_dump(mode="json")` and then deserialising it back into an `IncidentRecord` SHALL produce an object equal to the original.

**Validates: Requirements 9.3**

---

### Property 8: Farmer action update and persistence

*For any* incident in the timeline and any valid action value (`"accept"`, `"ignore"`, `"override"`), POSTing that action to `/timeline/action` SHALL update the incident's `farmer_action` field to the provided value and persist the change to `timeline.json`.

**Validates: Requirements 5.1, 5.2, 5.5**

---

### Property 9: Invalid action values rejected

*For any* action string that is not one of `"accept"`, `"ignore"`, `"override"`, POSTing it to `/timeline/action` SHALL return HTTP 422, and the timeline SHALL be unchanged.

**Validates: Requirements 5.3**

---

### Property 10: Missing incident returns 404

*For any* incident ID that does not exist in the current timeline, POSTing a valid action to `/timeline/action` with that ID SHALL return HTTP 404, and the timeline SHALL be unchanged.

**Validates: Requirements 5.4**

---

## Error Handling

| Condition | Response |
|-----------|----------|
| Pydantic validation failure (any route) | HTTP 422, JSON list of field errors (FastAPI default) |
| Decision Engine raises exception | HTTP 500 `{"error": "<message>"}`, no timeline append |
| `POST /timeline/action` with unknown `id` | HTTP 404 `{"error": "Incident not found"}` |
| `timeline.json` write fails on startup load or corrupt JSON | Log error, initialise empty timeline, continue serving |
| `timeline.json` write fails mid-request | Log error, continue serving (in-memory state still consistent) |

All unhandled exceptions bubble to FastAPI's default 500 handler. The Decision Engine path explicitly wraps `evaluate_threat` in a try/except to distinguish engine failures from validation failures.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary: unit tests catch concrete bugs at specific inputs; property tests verify the general rules hold across all valid inputs.

### Unit Tests (`backend/test_api.py`)

Use `fastapi.testclient.TestClient` for route-level tests. Focus on:

- HTTP 200 for valid payloads on all five routes.
- HTTP 422 for missing required fields.
- HTTP 404 for unknown incident ID on `/timeline/action`.
- Default status response shape when no decision has been made.
- Timeline is empty array on first GET `/timeline`.
- Decision Engine exception is mapped to HTTP 500 (mock `evaluate_threat` to raise).

### Property-Based Tests (`backend/test_properties.py`)

Use **Hypothesis** (`hypothesis` + `hypothesis[pytest]`) as the property-based testing library. Configure `settings(max_examples=100)` on each test.

Each property test MUST include a comment tag in the format:
```
# Feature: rakshak-ai-backend, Property N: <property text>
```

**Property tests to implement:**

| Test | Property | Hypothesis Strategy |
|------|----------|-------------------|
| `test_valid_vision_updates_frame_state` | Property 2 | `st.builds(VisionInput, ...)` |
| `test_invalid_confidence_rejected` | Property 1 | `st.floats(min_value=1.001) \| st.floats(max_value=-0.001)` |
| `test_decision_appends_timeline` | Property 3 | `st.builds(DecisionRequest, ...)` |
| `test_status_reflects_last_decision` | Property 4 | `st.builds(DecisionRequest, ...)` |
| `test_timeline_order` | Property 6 | `st.lists(st.builds(DecisionRequest, ...), min_size=1, max_size=20)` |
| `test_incident_round_trip` | Property 7 | `st.builds(IncidentRecord, ...)` |
| `test_valid_farmer_action_persisted` | Property 8 | `st.sampled_from(["accept", "ignore", "override"])` |
| `test_invalid_action_rejected` | Property 9 | `st.text().filter(lambda s: s not in {...})` |
| `test_unknown_id_returns_404` | Property 10 | `st.uuids()` |

For Property 5 (default status), a single unit test suffices as it tests a specific initial state rather than a universal rule across inputs.

### Test Configuration

```python
from hypothesis import settings, HealthCheck
settings.register_profile("ci", max_examples=100, suppress_health_check=[HealthCheck.too_slow])
settings.load_profile("ci")
```
