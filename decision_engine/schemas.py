from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from decision_engine.enums import ThreatLevel, Recommendation

class DecisionInput(BaseModel):
    animal: str
    confidence: float
    distance: float
    direction: str
    time: str
    inside_crop_region: bool
    scenario: Optional[str] = None
    zone: Optional[str] = None

class Observation(BaseModel):
    animal: str
    confidence: float
    scenario: Optional[str] = None
    zone: Optional[str] = None

class Assessment(BaseModel):
    threat_score: int
    threat_level: ThreatLevel
    crop_risk: str
    crop_risk_score: int
    eta_seconds: Optional[int] = None

class Response(BaseModel):
    recommended_action: Recommendation
    farmer_override: bool = True  # Farmer override is true to prompt manually
    decision: str
    preventive_actions: List[str]

class Metadata(BaseModel):
    engine: str
    version: str

class DecisionOutput(BaseModel):
    observation: Observation
    assessment: Assessment
    response: Response
    reason: List[str]
    trace: Optional[Dict[str, int]] = None
    metadata: Metadata
