# PHASES.md — Rakshak AI (24-Hour Build)

## Phase 0 — Hour 0–2: Freeze & Setup
- Lock architecture, JSON contracts, folder structure (all 4 agree, no changes after this without a group ping).
- Create GitHub repo + branches: `main`, `vision`, `decision-engine`, `backend`, `frontend`.
- Each member scaffolds their empty folder + a "hello world" file that runs.

## Phase 1 — Hour 2–8: Independent Module Build (parallel, mock data only)
- **Vision (M1):** detect.py + tracker.py producing Vision JSON on sample images/video; no waiting on backend.
- **Decision Engine (M2):** rule_engine.py + explainability.py; test against hardcoded Decision-Engine-input JSON samples covering LOW/MEDIUM/HIGH + false-alarm cases (bird, dog, human, unknown).
- **Backend (M3):** FastAPI skeleton with all 4 routes returning mock/static JSON matching contracts; models.py with Pydantic schemas.
- **Frontend (M4):** Dashboard layout (CameraFeed, ThreatCard, ReasonPanel, Timeline) wired to mock/static backend responses.

## Phase 2 — Hour 8–12: First Integration
- Backend swaps mock data for real calls to Vision output and Decision Engine.
- Frontend switches from static mock to live `GET /status` polling.
- Smoke test: one full request round-trip, camera frame → dashboard update.

## Phase 3 — Hour 12–18: End-to-End + Feature Completion
- Wire farmer Accept/Ignore/Override actions → `POST /timeline/action` → Timeline updates.
- Cover full false-alarm matrix from PRD (bird/dog/human/unknown/low-confidence → suppressed).
- Add any Nice-to-Have only if MVP is fully stable (flashlight sim, audio alert).

## Phase 4 — Hour 18–22: Bug Fixes & Demo Prep
- Fix integration bugs found by all 4 running the app together.
- Prepare 2–3 scripted demo scenarios (LOW, MEDIUM, HIGH threat) with reliable sample footage/data.
- Polish UI copy: reason lists must read clearly out loud to judges.

## Phase 5 — Hour 22–24: Final Testing & Submission
- Full run-through twice, on a clean machine/browser if possible.
- Record backup demo video in case live demo fails.
- Submit repo + README + slides.

**Checkpoint rule:** at the end of every phase, all 4 members do a 5-min sync — confirm contracts haven't drifted, merge to `main` via PR.
