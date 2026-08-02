"""
Pydantic v2 request/response schemas for the Rakshak AI Backend.
All enums are imported from decision_engine to avoid contract drift.
"""
from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from decision_engine.enums import Direction, TimeOfDay


# ---------------------------------------------------------------------------
# Request bodies
# ---------------------------------------------------------------------------

class VisionInput(BaseModel):
    """POST /detect — payload from the Vision module."""
    animal: str
    confidence: float = Field(ge=0.0, le=1.0)
    position: List[int] = Field(min_length=2, max_length=2)
    previous_position: List[int] = Field(min_length=2, max_length=2)
    direction: Direction


class DecisionRequest(BaseModel):
    """POST /decision — input forwarded to the Decision Engine."""
    animal: str
    confidence: float = Field(ge=0.0, le=1.0)
    distance: float
    direction: Direction
    time: TimeOfDay
    inside_crop_region: bool = False


class TimelineActionRequest(BaseModel):
    """POST /timeline/action — farmer action on an incident."""
    id: str
    action: Literal["accept", "ignore", "override"]


# ---------------------------------------------------------------------------
# Response / storage models
# ---------------------------------------------------------------------------

class IncidentRecord(BaseModel):
    """A single entry in the incident timeline."""
    id: str
    timestamp: str                        # UTC ISO-8601
    animal: str
    confidence: float
    threat_level: str
    recommendation: str
    reason: List[str]
    farmer_action: Optional[str] = None   # None | "accept" | "ignore" | "override"
    decision_input: dict                  # snapshot of the DecisionRequest


class StatusResponse(BaseModel):
    """GET /status — latest threat state served to the dashboard."""
    threat_level: str
    recommendation: str
    reason: List[str]
    animal: str
    confidence: float
    timestamp: str


# ---------------------------------------------------------------------------
# Scenario & Simulation models
# ---------------------------------------------------------------------------

ScenarioAnimal = Literal["Wild Boar", "Cow", "Nilgai", "Dog", "Human"]

SystemStateValue = Literal["STANDBY", "WAITING", "ACTIVE", "DETECTED", "ANALYZING", "CRITICAL", "SENT", "READY", "SAFE"]


class ScenarioRequest(BaseModel):
    """POST /scenario — select the active scenario animal."""
    animal: ScenarioAnimal


class SimulateRequest(BaseModel):
    """POST /simulate — trigger a full end-to-end simulation."""
    animal: ScenarioAnimal
    time: TimeOfDay = TimeOfDay.NIGHT
    inside_crop_region: bool = False


class SystemState(BaseModel):
    """Mission Control panel state — real-time system component statuses."""
    farm_status: str = "SAFE"       # SAFE | ALERT
    system: str = "ACTIVE"
    camera: str = "STANDBY"
    motion: str = "WAITING"
    ai: str = "READY"
    alert: str = "STANDBY"


class FullStatusResponse(BaseModel):
    """Extended GET /status — threat state + system state for Mission Control."""
    threat_level: str
    recommendation: str
    reason: List[str]
    animal: str
    confidence: float
    timestamp: str
    system_state: SystemState
    active_scenario: Optional[str] = None


class SimulationResult(BaseModel):
    """Response from POST /simulate."""
    scenario: str
    system_state: SystemState
    threat: StatusResponse
    incident_id: str
    timestamp: str
