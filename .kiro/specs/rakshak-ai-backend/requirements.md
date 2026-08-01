# Requirements Document

## Introduction

Rakshak AI Backend is a FastAPI + Uvicorn REST service that bridges the Vision module and the Explainable Decision Engine (EDE) with the farmer-facing dashboard frontend. It receives detection frames from the Vision module, invokes the EDE to assess threat level, stores incidents in an append-only timeline, and exposes polling and action endpoints consumed by the frontend. The system is entirely software — no hardware, GPIO, or physical device control of any kind.

## Glossary

- **Backend**: The FastAPI + Uvicorn application defined in `backend/`.
- **Vision_Module**: The upstream component that produces Vision JSON from camera input.
- **Decision_Engine**: The existing Python module in `decision_engine/` that evaluates threat and produces structured output.
- **Threat_JSON**: The structured response produced by the Decision Engine containing threat level, recommendation, and reasons.
- **Vision_JSON**: The JSON payload sent by the Vision_Module to `POST /detect`.
- **Decision_Input**: The JSON payload forwarded by the Backend to the Decision_Engine via `POST /decision`.
- **Frame_State**: The most recent Vision_JSON payload held in memory by the Backend.
- **Timeline**: The ordered, append-only list of incident records persisted by the Backend.
- **Incident**: A single timeline entry created from a Decision_Engine evaluation, containing threat metadata and farmer action state.
- **Farmer_Action**: One of three discrete values — `accept`, `ignore`, or `override` — that a farmer may apply to an Incident.
- **Status_Response**: The composite payload returned by `GET /status`, containing the latest Threat_JSON and recommendation.
- **inside_crop_region**: A boolean field in Decision_Input indicating whether the detected animal is inside the designated protected crop area.

---

## Requirements

### Requirement 1: Frame State Ingestion

**User Story:** As the Vision_Module, I want to POST detection data to the Backend, so that the latest animal position and context are always available for threat assessment.

#### Acceptance Criteria

1. WHEN a Vision_JSON payload is received at `POST /detect`, THE Backend SHALL validate it against the Vision_JSON schema (fields: `animal` string, `confidence` float 0–1, `position` array of two integers, `previous_position` array of two integers, `direction` string).
2. WHEN a valid Vision_JSON payload is received, THE Backend SHALL overwrite the in-memory Frame_State with the new payload.
3. IF the `confidence` field in Vision_JSON is outside the range 0.0 to 1.0 inclusive, THEN THE Backend SHALL return HTTP 422 with a descriptive validation error.
4. IF any required field is missing from the Vision_JSON payload, THEN THE Backend SHALL return HTTP 422 with a field-level error identifying the missing field.
5. WHEN Frame_State is successfully updated, THE Backend SHALL return HTTP 200 with a JSON body `{"status": "ok"}`.

---

### Requirement 2: Threat Decision Evaluation

**User Story:** As the frontend or Vision_Module, I want to POST decision-engine input and receive a Threat_JSON response, so that the dashboard can display the current threat level and recommendation.

#### Acceptance Criteria

1. WHEN a Decision_Input payload is received at `POST /decision`, THE Backend SHALL validate it against the Decision_Input schema (fields: `animal` string, `confidence` float 0–1, `distance` float, `direction` string, `time` string, `inside_crop_region` boolean).
2. WHEN a valid Decision_Input is received, THE Backend SHALL invoke `decision_engine.decision_engine.evaluate_threat` with the payload as a dict.
3. WHEN the Decision_Engine returns a result, THE Backend SHALL return HTTP 200 with the full Decision_Engine output serialized as JSON.
4. WHEN a decision is evaluated, THE Backend SHALL append a new Incident to the Timeline containing the Decision_Input, the Threat_JSON result, a UTC ISO-8601 timestamp, and a `farmer_action` field initialised to `null`.
5. WHEN a decision is evaluated, THE Backend SHALL cache the latest Threat_JSON result in memory for serving via `GET /status`.
6. IF the Decision_Engine raises an unhandled exception, THEN THE Backend SHALL return HTTP 500 with `{"error": "<message>"}` and SHALL NOT append an Incident to the Timeline.
7. IF any required field is missing from the Decision_Input payload, THEN THE Backend SHALL return HTTP 422 with a field-level error identifying the missing field.

---

### Requirement 3: Status Polling

**User Story:** As the frontend dashboard, I want to poll `GET /status` every 2–3 seconds, so that the threat card and recommendation panel always reflect the most recent decision.

#### Acceptance Criteria

1. WHEN `GET /status` is requested, THE Backend SHALL return HTTP 200 with a JSON body containing `threat_level`, `recommendation`, `reason` list, `animal`, `confidence`, and `timestamp` fields drawn from the latest cached Threat_JSON.
2. WHILE no decision has been evaluated yet, THE Backend SHALL return HTTP 200 with a Status_Response indicating `threat_level: "NONE"`, an empty `reason` list, and `recommendation: "Monitor"`.
3. THE Backend SHALL serve `GET /status` responses in under 100 ms under normal load (no external I/O on this path).
4. THE Backend SHALL include CORS headers permitting requests from any origin on `GET /status` and all other routes, so that the Next.js frontend running on a different port can call the API without browser CORS errors.

---

### Requirement 4: Incident Timeline Retrieval

**User Story:** As the frontend dashboard, I want to fetch the incident list from `GET /timeline`, so that farmers can review past events and their outcomes.

#### Acceptance Criteria

1. WHEN `GET /timeline` is requested, THE Backend SHALL return HTTP 200 with a JSON array of all Incidents in reverse-chronological order (most recent first).
2. THE Backend SHALL include in each Incident the fields: `id` (unique string), `timestamp` (UTC ISO-8601), `animal`, `confidence`, `threat_level`, `recommendation`, `reason` list, `farmer_action` (string or null), and `decision_input` snapshot.
3. WHILE the Timeline is empty, THE Backend SHALL return HTTP 200 with an empty JSON array `[]`.
4. THE Backend SHALL persist the Timeline to a JSON file (`timeline.json`) so that incidents survive a Backend process restart.
5. WHEN the Backend starts, THE Backend SHALL load any existing `timeline.json` into memory; IF the file does not exist or is malformed, THEN THE Backend SHALL initialise with an empty Timeline and SHALL NOT crash.

---

### Requirement 5: Farmer Action Recording

**User Story:** As a farmer, I want to mark an incident as accepted, ignored, or overridden, so that my response decision is logged against the correct event.

#### Acceptance Criteria

1. WHEN `POST /timeline/action` is received with a valid body `{"id": "<incident_id>", "action": "<accept|ignore|override>"}`, THE Backend SHALL locate the Incident with the matching `id` and update its `farmer_action` field to the provided value.
2. WHEN a Farmer_Action is successfully recorded, THE Backend SHALL persist the updated Timeline to `timeline.json` and return HTTP 200 with `{"status": "ok", "id": "<id>", "action": "<action>"}`.
3. IF the `action` field is not one of `accept`, `ignore`, or `override`, THEN THE Backend SHALL return HTTP 422 with a descriptive error.
4. IF no Incident with the given `id` exists in the Timeline, THEN THE Backend SHALL return HTTP 404 with `{"error": "Incident not found"}`.
5. THE Backend SHALL allow a Farmer_Action to be updated multiple times; each update SHALL overwrite the previous `farmer_action` value for that Incident.

---

### Requirement 6: Decision Engine Integration

**User Story:** As a backend developer, I want the Backend to call the existing Decision_Engine module directly, so that threat evaluation logic is not duplicated and contracts remain consistent.

#### Acceptance Criteria

1. THE Backend SHALL import and call `decision_engine.decision_engine.evaluate_threat` using only the Python module interface — no subprocess, no HTTP call to a separate process.
2. WHEN building the Decision_Input dict for the Decision_Engine, THE Backend SHALL include the `inside_crop_region` field; WHERE the field is not provided in the incoming `POST /decision` payload, THE Backend SHALL default `inside_crop_region` to `False`.
3. THE Backend SHALL map the Decision_Engine output fields (`assessment.threat_level`, `response.recommended_action`, `reason`, `observation.animal`, `observation.confidence`) to the Status_Response and Incident schemas without loss.
4. THE Backend SHALL NOT modify, monkey-patch, or re-implement any logic inside the `decision_engine/` package.

---

### Requirement 7: Schema Validation and Data Contracts

**User Story:** As a backend developer, I want all API inputs and outputs validated by Pydantic schemas, so that contract drift between modules is caught at runtime rather than silently corrupting state.

#### Acceptance Criteria

1. THE Backend SHALL define Pydantic models in `backend/models.py` for all request and response bodies: `VisionInput`, `DecisionRequest`, `TimelineActionRequest`, `IncidentRecord`, and `StatusResponse`.
2. WHEN FastAPI receives a request body that fails Pydantic validation, THE Backend SHALL return HTTP 422 with a JSON body listing each validation error by field path.
3. THE `direction` field in `VisionInput` and `DecisionRequest` SHALL be constrained to the values `"Toward Crop"`, `"Away From Crop"`, and `"Stationary"`, matching the `Direction` enum in `decision_engine/enums.py`.
4. THE `time` field in `DecisionRequest` SHALL be constrained to the values `"Day"` and `"Night"`, matching the `TimeOfDay` enum in `decision_engine/enums.py`.
5. THE Backend SHALL serialise all Pydantic response models using `.model_dump()` (Pydantic v2) for JSON output.

---

### Requirement 8: CORS and Startup Configuration

**User Story:** As a frontend developer, I want the Backend to accept cross-origin requests and start with a single command, so that local development works without proxy configuration.

#### Acceptance Criteria

1. THE Backend SHALL enable FastAPI `CORSMiddleware` allowing all origins (`"*"`), all methods, and all headers.
2. WHEN the Backend is started with `uvicorn backend.app:app --reload`, THE Backend SHALL be reachable at `http://localhost:8000`.
3. THE Backend SHALL not require any environment variables or external configuration files to run; all defaults SHALL be hardcoded in `app.py` or `api.py`.
4. THE Backend SHALL register all route handlers from `api.py` on the FastAPI application instance in `app.py` using an `APIRouter`.

---

### Requirement 9: Timeline Persistence Round-Trip

**User Story:** As a system operator, I want timeline data to survive restarts, so that incident history is not lost if the process is restarted during a demo.

#### Acceptance Criteria

1. THE Timeline_Store SHALL serialise each Incident to JSON using Pydantic's `.model_dump(mode="json")` before writing to `timeline.json`.
2. WHEN `timeline.json` is loaded on startup, THE Timeline_Store SHALL deserialise each entry back into an `IncidentRecord` Pydantic model and reconstruct the in-memory list.
3. FOR ALL valid IncidentRecord objects, serialising then deserialising SHALL produce an object equal to the original (round-trip property).
4. WHEN a write to `timeline.json` fails (e.g., permission error), THE Backend SHALL log the error and continue serving requests without crashing.
