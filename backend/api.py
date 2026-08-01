"""
FastAPI route handlers for the Rakshak AI Backend.

Module-level state:
  frame_state  — latest data from POST /detect (Vision module)
  threat_cache — latest StatusResponse from POST /decision
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from backend.models import (
    DecisionRequest,
    IncidentRecord,
    StatusResponse,
    TimelineActionRequest,
    VisionInput,
)
from backend.timeline import TimelineStore
from decision_engine.decision_engine import evaluate_threat

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Module-level state (initialised at import time; replaced on each request)
# ---------------------------------------------------------------------------
frame_state: Optional[Dict[str, Any]] = None

threat_cache: Optional[StatusResponse] = None

timeline_store: TimelineStore = TimelineStore()



# ---------------------------------------------------------------------------
# POST /detect
# ---------------------------------------------------------------------------

@router.post("/detect")
async def detect(payload: VisionInput) -> Dict[str, str]:
    """Receive a vision frame, update module-level frame_state."""
    global frame_state
    frame_state = payload.model_dump()
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# POST /decision
# ---------------------------------------------------------------------------

@router.post("/decision")
async def decision(payload: DecisionRequest) -> Dict[str, Any]:
    """
    Run the Decision Engine and persist the result to the timeline.
    Returns the full engine output dict on success, HTTP 500 on any exception.
    """
    global threat_cache

    try:
        engine_output = evaluate_threat(payload.model_dump())
    except Exception as exc:
        logger.exception("Decision Engine raised an unexpected error: %s", exc)
        return JSONResponse(status_code=500, content={"error": str(exc)})

    # Map engine output → StatusResponse (for cache + GET /status)
    assessment = engine_output.get("assessment", {})
    response_block = engine_output.get("response", {})
    observation = engine_output.get("observation", {})

    now_iso = datetime.now(timezone.utc).isoformat()

    status = StatusResponse(
        threat_level=assessment.get("threat_level", "NONE"),
        recommendation=response_block.get("recommended_action", "Monitor"),
        reason=engine_output.get("reason", []),
        animal=observation.get("animal", payload.animal),
        confidence=observation.get("confidence", payload.confidence),
        timestamp=now_iso,
    )
    threat_cache = status

    # Map engine output → IncidentRecord (for timeline persistence)
    record = IncidentRecord(
        id=str(uuid.uuid4()),
        timestamp=now_iso,
        animal=status.animal,
        confidence=status.confidence,
        threat_level=status.threat_level,
        recommendation=status.recommendation,
        reason=status.reason,
        farmer_action=None,
        decision_input=payload.model_dump(),
    )
    timeline_store.append(record)

    return engine_output


# ---------------------------------------------------------------------------
# GET /status
# ---------------------------------------------------------------------------

_DEFAULT_STATUS = StatusResponse(
    threat_level="NONE",
    recommendation="Monitor",
    reason=[],
    animal="",
    confidence=0.0,
    timestamp="",
)


@router.get("/status", response_model=StatusResponse)
async def status() -> StatusResponse:
    """Return the latest threat assessment, or a safe default if none yet."""
    return threat_cache if threat_cache is not None else _DEFAULT_STATUS


# ---------------------------------------------------------------------------
# GET /timeline
# ---------------------------------------------------------------------------

@router.get("/timeline")
async def timeline() -> list:
    """Return all incidents in reverse-chronological order."""
    return [r.model_dump(mode="json") for r in timeline_store.all()]


# ---------------------------------------------------------------------------
# POST /timeline/action
# ---------------------------------------------------------------------------

@router.post("/timeline/action")
async def timeline_action(payload: TimelineActionRequest) -> Dict[str, Any]:
    """Record the farmer's action on an existing incident."""
    updated = timeline_store.update_action(payload.id, payload.action)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Incident '{payload.id}' not found")
    return {"status": "ok", "id": payload.id, "action": payload.action}
