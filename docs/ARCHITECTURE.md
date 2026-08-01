# ARCHITECTURE.md — Rakshak AI

## Scope Note
**Fully software — no hardware integration.** "Camera" = pre-recorded video file(s) or laptop webcam, read in software via OpenCV. Response actions (flashlight/speaker) are simulated in the frontend (CSS flash animation + `Audio()` playback) — no GPIO, no relay, no microcontroller, no real device control.

## App Flow
```
Video File / Webcam (software input)
  → AI Vision Module (detect.py, tracker.py)
  → Backend /detect (receives Vision JSON)
  → Backend /decision (calls Decision Engine)
  → Explainable Decision Engine (rule_engine.py, explainability.py)
  → Backend returns Threat JSON
  → Frontend Dashboard (live card, reasons, timeline)
  → Farmer Accept/Ignore/Override → Backend logs outcome → Timeline
```

## Tech Stack
| Layer | Choice | Notes |
|---|---|---|
| Vision | Python, YOLOv8 (ultralytics) or mocked JSON | Swap-in-place; contract-first |
| Decision Engine | Python, plain rule engine (no ML needed) | Deterministic, explainable |
| Backend | FastAPI + Uvicorn | REST, simple, fast to stand up |
| Storage | SQLite or in-memory list + JSON file | Timeline only, not training data |
| Frontend | React (Vite) + Tailwind | Fast styling, matches dashboard needs |
| Realtime (optional) | Polling `/status` every 2-3s, or WebSocket if time allows | Prefer polling for 24h safety |

## Folder & File Structure
```
Rakshak-AI/
├── backend/
│   ├── app.py            # FastAPI entrypoint
│   ├── api.py             # route handlers
│   ├── models.py          # pydantic schemas (shared contracts)
│   └── timeline.py        # timeline store + logic
├── vision/
│   ├── detect.py
│   ├── tracker.py
│   └── utils.py
├── decision_engine/
│   ├── decision_engine.py
│   ├── rule_engine.py
│   ├── response_engine.py
│   └── explainability.py
├── frontend/
│   └── src/
│       ├── components/    # ThreatCard, ReasonPanel, Timeline, CameraView
│       └── pages/          # Dashboard.jsx
├── docs/                  # PRD, ARCHITECTURE, RULES, PHASES, DESIGN, MEMORY
└── README.md
```

## API Contract (frozen at Hour 2)
```
POST /detect     → accepts Vision JSON, stores latest frame state
POST /decision    → accepts Decision-Engine input, returns Threat JSON
GET  /status      → latest threat + recommendation (for dashboard polling)
GET  /timeline    → list of past incidents
POST /timeline/action → { id, action: accept|ignore|override }
```

### Vision JSON (Vision → Backend)
```json
{"animal":"Cow","confidence":0.91,"position":[430,280],"previous_position":[400,275],"direction":"Toward Crop"}
```

### Backend → Decision Engine
```json
{"animal":"Cow","confidence":0.91,"distance":42,"direction":"Toward Crop","time":"Night"}
```

### Decision Engine → Backend
```json
{"threat":"HIGH","recommendation":"Flash Light + Speaker","reason":["Large Animal","Moving Toward Crop","Night Time"]}
```

## Git Branches
`main` (protected) · `vision` · `decision-engine` · `backend` · `frontend` — never push directly to main; PR + quick review before merge.
