from decision_engine.enums import CropRiskLevel, Recommendation, AdaptivePrevention
from decision_engine.constants import ADAPTIVE_PREVENTION_ACTIONS, ADAPTIVE_PREVENTION_DECISIONS
from decision_engine.utils import is_night
from typing import Tuple, List

def determine_prevention(threat_level: CropRiskLevel, time_str: str) -> Tuple[str, List[str]]:
    """
    Determines the crop protection decision and list of adaptive prevention actions.
    - LOW -> Monitor Crop, ["Monitor"]
    - MEDIUM -> Activate Prevention, ["Flash Light", "Notify Farmer"]
    - HIGH -> Activate Prevention, ["Flash Light", "Speaker", "Notify Farmer"]
    """
    # Look up based on CropRiskLevel
    level_str = threat_level.value if hasattr(threat_level, "value") else str(threat_level)
    level_str = level_str.upper()
    
    decision = ADAPTIVE_PREVENTION_DECISIONS.get(level_str, "Monitor Crop")
    preventive_actions = ADAPTIVE_PREVENTION_ACTIONS.get(level_str, ["Monitor"])
    
    return decision, preventive_actions

def determine_recommendation(threat_level: CropRiskLevel, time_str: str) -> Recommendation:
    """
    Legacy method for backward compatibility. Maps threat level and time of day to response recommendation.
    Internally routes and maps the output from determine_prevention.
    - LOW -> Recommendation.MONITOR
    - MEDIUM -> Recommendation.FLASH_LIGHT
    - HIGH + Day -> Recommendation.SPEAKER
    - HIGH + Night -> Recommendation.FLASH_LIGHT_SPEAKER
    """
    decision, actions = determine_prevention(threat_level, time_str)
    
    # Map back to legacy Recommendation enum value
    level_str = threat_level.value if hasattr(threat_level, "value") else str(threat_level)
    level_str = level_str.upper()
    
    if level_str == "LOW":
        return Recommendation.MONITOR
    elif level_str == "MEDIUM":
        return Recommendation.FLASH_LIGHT
    elif level_str == "HIGH":
        if is_night(time_str):
            return Recommendation.FLASH_LIGHT_SPEAKER
        else:
            return Recommendation.SPEAKER
            
    return Recommendation.MONITOR
