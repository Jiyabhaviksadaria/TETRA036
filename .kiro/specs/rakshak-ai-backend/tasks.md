# Tasks

## Task List

- [x] 1. Set up backend package structure
  - [x] 1.1 Create `backend/` directory with `__init__.py`
  - [x] 1.2 Create `backend/app.py`

- [x] 2. Implement Pydantic v2 models in `backend/models.py`
  - [x] 2.1 Define `VisionInput` with `animal`, `confidence` (0–1), `position`, `previous_position`, `direction` (Direction enum)
  - [x] 2.2 Define `DecisionRequest` with `animal`, `confidence` (0–1), `distance`, `direction` (Direction enum), `time` (TimeOfDay enum), `inside_crop_region` (default False)
  - [x] 2.3 Define `TimelineActionRequest` with `id` (str) and `action` (Literal["accept","ignore","override"])
  - [x] 2.4 Define `IncidentRecord` with all required timeline fields: `id`, `timestamp`, `animal`, `confidence`, `threat_level`, `recommendation`, `reason`, `farmer_action`, `decision_input`
  - [x] 2.5 Define `StatusResponse` with `threat_level`, `recommendation`, `reason`, `animal`, `confidence`, `timestamp`

- [x] 3. Implement `TimelineStore` in `backend/timeline.py`
  - [x] 3.1 Implement `__init__` with configurable `path` defaulting to `"timeline.json"`
  - [x] 3.2 Implement `load()` — deserialise `timeline.json` into `list[IncidentRecord]`; on missing file or malformed JSON, initialise empty list without raising
  - [x] 3.3 Implement `append(record: IncidentRecord)` — add to in-memory list and call `_persist()`
  - [x] 3.4 Implement `update_action(id: str, action: str) -> bool` — find matching record, update `farmer_action`, call `_persist()`, return True; return False if not found
  - [x] 3.5 Implement `all() -> list[IncidentRecord]` — return copy in reverse-chronological order
  - [x] 3.6 Implement `_persist()` — write all records via `.model_dump(mode="json")` to `timeline.json`; log and swallow `IOError`/`OSError` without crashing

- [x] 4. Implement route handlers in `backend/api.py`
  - [x] 4.1 Implement `POST /detect` — validate `VisionInput`, update module-level `frame_state`, return `{"status": "ok"}`
  - [x] 4.2 Implement `POST /decision` — validate `DecisionRequest`, call `evaluate_threat(payload.model_dump())`, map output fields to `StatusResponse` and `IncidentRecord`, append to timeline, cache in `threat_cache`, return full engine output; on exception return HTTP 500 `{"error": "..."}`
  - [x] 4.3 Implement `GET /status` — return `threat_cache` if set, otherwise return default `StatusResponse(threat_level="NONE", recommendation="Monitor", reason=[], animal="", confidence=0.0, timestamp="")`
  - [x] 4.4 Implement `GET /timeline` — return `timeline_store.all()` as JSON array
  - [x] 4.5 Implement `POST /timeline/action` — validate `TimelineActionRequest`, call `timeline_store.update_action()`; return 404 if not found, else return `{"status": "ok", "id": ..., "action": ...}`

- [x] 5. Wire up `backend/app.py`
  - [x] 5.1 Create `FastAPI()` instance
  - [x] 5.2 Add `CORSMiddleware` with `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`
  - [x] 5.3 Instantiate `TimelineStore` and call `.load()` on startup
  - [x] 5.4 Import and register `APIRouter` from `api.py` via `app.include_router(router)`

- [x] 6. Write unit tests in `backend/test_api.py`
  - [x] 6.1 Test HTTP 200 for valid payloads on all five routes
  - [x] 6.2 Test HTTP 422 for missing required fields on POST routes
  - [x] 6.3 Test HTTP 404 for unknown incident ID on `POST /timeline/action`
  - [x] 6.4 Test default GET /status response shape when no decision has been made (Property 5)
  - [x] 6.5 Test GET /timeline returns empty array on fresh start
  - [x] 6.6 Test Decision Engine exception maps to HTTP 500 with no timeline append (mock `evaluate_threat` to raise)
  - [x] 6.7 Test CORS headers present on responses
  - [x] 6.8 Test `inside_crop_region` defaults to False when omitted from DecisionRequest

- [x] 7. Write property-based tests in `backend/test_properties.py` using Hypothesis
  - [x] 7.1 Property 1 & 2: Valid VisionInput updates frame state; out-of-range confidence returns 422
  - [x] 7.2 Property 3: Any valid DecisionRequest appends one timeline entry with matching fields
  - [x] 7.3 Property 4: GET /status reflects the last POSTed decision's engine output fields
  - [x] 7.4 Property 6: N sequential decisions produce timeline with N entries in reverse-chronological order
  - [x] 7.5 Property 7: IncidentRecord serialise → deserialise round-trip produces equal object
  - [x] 7.6 Property 8: Any valid action value on an existing incident is persisted; re-posting overwrites
  - [x] 7.7 Property 9: Any action string not in {accept, ignore, override} returns HTTP 422
  - [x] 7.8 Property 10: Any ID not in timeline returns HTTP 404 from POST /timeline/action
