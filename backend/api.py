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

import io
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from backend.models import (
    DecisionRequest,
    DeviceActionRequest,
    FullStatusResponse,
    IncidentRecord,
    ScenarioRequest,
    SensorTriggerRequest,
    SensorTriggerResponse,
    SimulateRequest,
    SimulationResult,
    StatusResponse,
    SystemState,
    TimelineActionRequest,
    VisionInput,
    VisionStatusResponse,
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

# ---------------------------------------------------------------------------
# POST /sensor-trigger — PIR/ESP32 motion event
# ---------------------------------------------------------------------------

@router.post("/sensor-trigger", response_model=SensorTriggerResponse)
async def sensor_trigger(payload: SensorTriggerRequest) -> SensorTriggerResponse:
    """
    Receive a motion event from PIR sensor / ESP32.
    When motion=True, marks camera as active and updates system state.
    The Vision module should begin detection after this trigger.
    """
    global system_state

    if payload.motion:
        system_state = SystemState(
            farm_status=system_state.farm_status,
            system="ACTIVE",
            camera="ACTIVE",
            motion="DETECTED",
            ai=system_state.ai,
            alert=system_state.alert,
        )
        logger.info("Sensor trigger received: motion detected at %s", payload.location)
        return SensorTriggerResponse(
            status="camera_started",
            motion=payload.motion,
            location=payload.location,
        )

    # Motion cleared — reset motion/camera state
    system_state = SystemState(
        farm_status=system_state.farm_status,
        system="ACTIVE",
        camera="STANDBY",
        motion="WAITING",
        ai=system_state.ai,
        alert=system_state.alert,
    )
    logger.info("Sensor trigger received: no motion at %s", payload.location)
    return SensorTriggerResponse(
        status="ignored",
        motion=payload.motion,
        location=payload.location,
    )


# ---------------------------------------------------------------------------
# GET /vision/status — latest vision detection output
# ---------------------------------------------------------------------------

@router.get("/vision/status", response_model=VisionStatusResponse)
async def vision_status() -> VisionStatusResponse:
    """
    Return the latest frame state received from the Vision module.
    Frontend can display live detection data from this endpoint.
    """
    if frame_state is None:
        return VisionStatusResponse(
            animal="",
            confidence=0.0,
            tracking_id=None,
            direction="Stationary",
            inside_boundary=None,
            position=None,
            timestamp="",
        )

    return VisionStatusResponse(
        animal=frame_state.get("animal", ""),
        confidence=frame_state.get("confidence", 0.0),
        tracking_id=frame_state.get("tracking_id"),
        direction=frame_state.get("direction", "Stationary"),
        inside_boundary=frame_state.get("inside_boundary"),
        position=frame_state.get("position"),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


# ---------------------------------------------------------------------------
# POST /device-action — trigger hardware outputs (buzzer, lights, siren)
# ---------------------------------------------------------------------------

@router.post("/device-action")
async def device_action(payload: DeviceActionRequest) -> Dict[str, Any]:
    """
    Send action commands to ESP32/hardware devices.
    For simulation/hackathon this returns the activated state immediately.
    In production this would forward the command to the ESP32 over MQTT/HTTP.
    """
    activated = []
    if payload.buzzer:
        activated.append("buzzer")
    if payload.red_light:
        activated.append("red_light")
    if payload.green_light:
        activated.append("green_light")
    if payload.siren:
        activated.append("siren")

    logger.info("Device action triggered: %s", activated)
    return {
        "status": "device activated",
        "activated": activated,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# GET /reports/monthly — generate PDF report
# ---------------------------------------------------------------------------

@router.get("/reports/monthly")
async def get_monthly_report():
    """Generate a PDF summary of the incident timeline."""
    records = timeline_store.all()

    buffer = io.BytesIO()

    # Setup document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Theme colors
    primary_color = colors.HexColor("#1b4332")
    secondary_color = colors.HexColor("#2d6a4f")
    text_color = colors.HexColor("#1b1b1b")
    light_bg = colors.HexColor("#f4f7f6")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#666666"),
        spaceAfter=15
    )

    section_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=secondary_color,
        spaceBefore=12,
        spaceAfter=8
    )

    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_color
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("Rakshak AI — Farm Security Monthly Report", title_style))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Total Incidents Logged: {len(records)}", subtitle_style))
    elements.append(Spacer(1, 10))

    # Metrics Summary
    total_incidents = len(records)
    high_threats = sum(1 for r in records if r.threat_level == "HIGH")
    medium_threats = sum(1 for r in records if r.threat_level == "MEDIUM")
    low_threats = sum(1 for r in records if r.threat_level in ("LOW", "NONE"))

    # Table layout for stats
    stat_data = [
        [
            Paragraph("<b>Total Intrusions</b>", cell_style),
            Paragraph("<b>High Threat Level</b>", cell_style),
            Paragraph("<b>Medium Threat Level</b>", cell_style),
            Paragraph("<b>Low/No Threat Level</b>", cell_style)
        ],
        [
            Paragraph(f"<b>{total_incidents}</b>", title_style),
            Paragraph(f"<b>{high_threats}</b>", title_style),
            Paragraph(f"<b>{medium_threats}</b>", title_style),
            Paragraph(f"<b>{low_threats}</b>", title_style)
        ]
    ]

    stat_table = Table(stat_data, colWidths=[135, 135, 135, 135])
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,0), 0),
        ('TOPPADDING', (0,1), (-1,1), 0),
        ('BOTTOMPADDING', (0,1), (-1,1), 10),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dddddd")),
        ('BOX', (0,0), (-1,-1), 1, secondary_color)
    ]))

    elements.append(Paragraph("Overview Dashboard Metrics", section_style))
    elements.append(stat_table)
    elements.append(Spacer(1, 15))

    # Incidents List Table
    elements.append(Paragraph("Incident Log Details", section_style))

    # Table headers
    headers = [
        Paragraph("Timestamp", th_style),
        Paragraph("Animal / Confidence", th_style),
        Paragraph("Threat Level", th_style),
        Paragraph("Recommendation", th_style),
        Paragraph("Farmer Action", th_style)
    ]

    table_data = [headers]

    for r in records:
        try:
            dt = datetime.fromisoformat(r.timestamp.replace("Z", "+00:00"))
            time_str = dt.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            time_str = r.timestamp

        action_str = r.farmer_action if r.farmer_action else "No Action"

        # Color highlight for threat level
        threat_color = "#2d6a4f" # normal green
        if r.threat_level == "HIGH":
            threat_color = "#b7094c"
        elif r.threat_level == "MEDIUM":
            threat_color = "#a01a58"

        threat_p = Paragraph(f"<font color='{threat_color}'><b>{r.threat_level}</b></font>", cell_style)

        row = [
            Paragraph(time_str, cell_style),
            Paragraph(f"<b>{r.animal}</b> ({r.confidence * 100:.0f}%)", cell_style),
            threat_p,
            Paragraph(r.recommendation, cell_style),
            Paragraph(action_str.capitalize(), cell_style)
        ]
        table_data.append(row)

    if len(records) == 0:
        table_data.append([Paragraph("No incidents recorded in the timeline.", cell_style), "", "", "", ""])

    inc_table = Table(table_data, colWidths=[110, 110, 80, 140, 100])
    inc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#dddddd"))
    ]))

    elements.append(inc_table)

    # Build document
    doc.build(elements)

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="rakshak_ai_monthly_report.pdf"'}
    )
