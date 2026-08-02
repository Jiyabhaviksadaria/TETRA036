"""
FastAPI route handlers for the Rakshak AI Backend.

Module-level state:
  frame_state      — latest data from POST /detect (Vision module)
  threat_cache     — latest StatusResponse from POST /decision
  system_state     — Mission Control panel state
  active_scenario  — currently selected scenario animal
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
    FullStatusResponse,
    IncidentRecord,
    ScenarioRequest,
    SimulateRequest,
    SimulationResult,
    StatusResponse,
    SystemState,
    TimelineActionRequest,
    VisionInput,
)
from backend.timeline import TimelineStore
from decision_engine.decision_engine import evaluate_threat

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Module-level state
# ---------------------------------------------------------------------------
frame_state: Optional[Dict[str, Any]] = None
threat_cache: Optional[StatusResponse] = None
timeline_store: TimelineStore = TimelineStore()
system_state: SystemState = SystemState()
active_scenario: Optional[str] = None

# ---------------------------------------------------------------------------
# Scenario presets — fixed inputs per animal for demo simulation
# ---------------------------------------------------------------------------
SCENARIO_PRESETS: Dict[str, Dict[str, Any]] = {
    "Wild Boar": {
        "animal": "Wild Boar",
        "confidence": 0.92,
        "distance": 20.0,
        "direction": "Toward Crop",
        "position": [120, 80],
        "previous_position": [140, 100],
    },
    "Cow": {
        "animal": "Cow",
        "confidence": 0.88,
        "distance": 35.0,
        "direction": "Toward Crop",
        "position": [200, 150],
        "previous_position": [220, 170],
    },
    "Nilgai": {
        "animal": "Nilgai",
        "confidence": 0.85,
        "distance": 30.0,
        "direction": "Toward Crop",
        "position": [160, 110],
        "previous_position": [180, 130],
    },
    "Dog": {
        "animal": "Dog",
        "confidence": 0.78,
        "distance": 60.0,
        "direction": "Stationary",
        "position": [90, 200],
        "previous_position": [90, 200],
    },
    "Human": {
        "animal": "Human",
        "confidence": 0.95,
        "distance": 15.0,
        "direction": "Toward Crop",
        "position": [50, 50],
        "previous_position": [70, 70],
    },
}



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


@router.get("/status", response_model=FullStatusResponse)
async def status() -> FullStatusResponse:
    """Return latest threat assessment + Mission Control system state."""
    threat = threat_cache if threat_cache is not None else _DEFAULT_STATUS
    return FullStatusResponse(
        threat_level=threat.threat_level,
        recommendation=threat.recommendation,
        reason=threat.reason,
        animal=threat.animal,
        confidence=threat.confidence,
        timestamp=threat.timestamp,
        system_state=system_state,
        active_scenario=active_scenario,
    )


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


# ---------------------------------------------------------------------------
# POST /scenario — set active scenario
# ---------------------------------------------------------------------------

@router.post("/scenario")
async def set_scenario(payload: ScenarioRequest) -> Dict[str, Any]:
    """Select the active scenario animal for the demo."""
    global active_scenario
    active_scenario = payload.animal
    logger.info("Active scenario set to: %s", active_scenario)
    return {"status": "ok", "active_scenario": active_scenario}


# ---------------------------------------------------------------------------
# POST /simulate — run full end-to-end simulation
# ---------------------------------------------------------------------------

@router.post("/simulate", response_model=SimulationResult)
async def simulate(payload: SimulateRequest) -> SimulationResult:
    """
    Trigger a full scenario simulation:
    Motion → Camera → Vision → Threat → Decision → Alert → Timeline
    """
    global threat_cache, system_state, active_scenario, frame_state

    preset = SCENARIO_PRESETS.get(payload.animal)
    if not preset:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {payload.animal}")

    active_scenario = payload.animal
    now_iso = datetime.now(timezone.utc).isoformat()

    # --- Step 1: Motion detected ---
    system_state = SystemState(
        farm_status="ALERT",
        system="ACTIVE",
        camera="STANDBY",
        motion="DETECTED",
        ai="READY",
        alert="STANDBY",
    )

    # --- Step 2: Camera activated ---
    system_state = SystemState(
        farm_status="ALERT",
        system="ACTIVE",
        camera="ACTIVE",
        motion="DETECTED",
        ai="READY",
        alert="STANDBY",
    )

    # --- Step 3: Vision frame update ---
    frame_state = {
        "animal": preset["animal"],
        "confidence": preset["confidence"],
        "position": preset["position"],
        "previous_position": preset["previous_position"],
        "direction": preset["direction"],
    }

    # --- Step 4: AI analyzing ---
    system_state = SystemState(
        farm_status="ALERT",
        system="ACTIVE",
        camera="ACTIVE",
        motion="DETECTED",
        ai="ANALYZING",
        alert="STANDBY",
    )

    # --- Step 5: Call Decision Engine ---
    decision_input = {
        "animal": preset["animal"],
        "confidence": preset["confidence"],
        "distance": preset["distance"],
        "direction": preset["direction"],
        "time": payload.time.value,
        "inside_crop_region": payload.inside_crop_region,
    }

    try:
        engine_output = evaluate_threat(decision_input)
    except Exception as exc:
        logger.exception("Decision Engine error during simulation: %s", exc)
        system_state = SystemState(farm_status="SAFE", system="ACTIVE", camera="STANDBY", motion="WAITING", ai="READY", alert="STANDBY")
        return JSONResponse(status_code=500, content={"error": str(exc)})

    assessment = engine_output.get("assessment", {})
    response_block = engine_output.get("response", {})
    observation = engine_output.get("observation", {})

    threat = StatusResponse(
        threat_level=assessment.get("threat_level", "NONE"),
        recommendation=response_block.get("recommended_action", "Monitor"),
        reason=engine_output.get("reason", []),
        animal=observation.get("animal", preset["animal"]),
        confidence=observation.get("confidence", preset["confidence"]),
        timestamp=now_iso,
    )
    threat_cache = threat

    # --- Step 6: Threat assessed, alert sent ---
    system_state = SystemState(
        farm_status="ALERT" if threat.threat_level != "NONE" else "SAFE",
        system="ACTIVE",
        camera="ACTIVE",
        motion="DETECTED",
        ai="ANALYZING",
        alert="SENT",
    )

    # --- Step 7: Append to timeline ---
    incident_id = str(uuid.uuid4())
    record = IncidentRecord(
        id=incident_id,
        timestamp=now_iso,
        animal=threat.animal,
        confidence=threat.confidence,
        threat_level=threat.threat_level,
        recommendation=threat.recommendation,
        reason=threat.reason,
        farmer_action=None,
        decision_input=decision_input,
    )
    timeline_store.append(record)

    logger.info("Simulation complete: %s → %s", payload.animal, threat.threat_level)

    return SimulationResult(
        scenario=payload.animal,
        system_state=system_state,
        threat=threat,
        incident_id=incident_id,
        timestamp=now_iso,
    )
