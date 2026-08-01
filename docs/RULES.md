# RULES.md — Rakshak AI

## Use
- FastAPI + Pydantic for backend (schema validation = contract enforcement).
- Ultralytics YOLOv8 pretrained model if live detection is feasible; otherwise a `mock_detect.py` returning fixture JSON matching the contract.
- Plain Python `if/else` or a small rules table for the Decision Engine — deterministic and explainable by design.
- React + Tailwind for frontend; keep components small (ThreatCard, ReasonPanel, TimelineList, CameraFeed).
- SQLite or a flat JSON file for the timeline — no need for Postgres in 24h.
- Env vars / `.env` for any keys (never commit secrets).

## Avoid
- **No hardware whatsoever** — no Arduino/Raspberry Pi/ESP32, no GPIO/relay libraries (RPi.GPIO, pyserial, etc.), no real camera-module SDKs. Input is a video file/webcam via OpenCV only; outputs (flash/speaker) are simulated in software (frontend animation + `Audio()`), never a physical trigger.
- No GPS, GIS, satellite imagery, or geofencing libraries — out of scope per PRD.
- No training a real ML classifier for threat level — threat assessment is a rule engine, not a model. Do not fabricate accuracy numbers.
- No auto-actuation (no code path that fires a physical deterrent without farmer confirmation).
- No heavy state-management libs (Redux, etc.) for a 24h dashboard — React state/context is enough.
- No premature WebSocket complexity — polling `/status` is fine unless Hour 12 checkpoint is ahead of schedule.
- No mixing "detection confidence" with "threat level" anywhere in code, UI copy, or explanations — these are separate concepts (see PRD).
- No blocking calls in FastAPI routes without `async`/background tasks if detection is slow.

## Error Handling
- Every backend route wraps logic in try/except → returns `{"error": "..."}` with proper HTTP status, never a raw 500 stack trace to frontend.
- Vision module: if detection confidence is missing/null, treat as LOW confidence, never crash.
- Decision Engine: unknown animal / missing field → default to `threat: LOW`, `recommendation: Monitor`, and log the gap in `reason`.
- Frontend: dashboard must show a graceful "no data yet" state before first detection arrives, not a blank crash.

## Boundaries for AI Coding Agents
- Follow the frozen JSON contracts in ARCHITECTURE.md exactly — do not rename fields without updating this file first.
- One module per teammate; do not let an agent edit files outside its owner's folder (e.g., vision agent should not touch `frontend/`).
- Always mock the other side's contract before it's ready (e.g., backend dev hardcodes a sample Vision JSON to build against).
- Review-before-execute: read every AI-generated diff before applying, especially around the Decision Engine's rule logic (this is the demo's core innovation — bugs here are visible to judges).
- No fabricated claims in generated docs/comments (e.g., don't let an agent write "95% accurate ML model" when it's a rule engine).
