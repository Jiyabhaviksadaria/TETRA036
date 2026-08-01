from decision_engine.enums import ThreatLevel, Recommendation
from decision_engine.utils import is_night

def determine_recommendation(threat_level: ThreatLevel, time_str: str) -> Recommendation:
    """
    Maps threat level and time of day to response recommendation.
    - LOW -> Monitor
    - MEDIUM -> Flash Light
    - HIGH + Day -> Speaker
    - HIGH + Night -> Flash Light + Speaker
    """
    if threat_level == ThreatLevel.LOW:
        return Recommendation.MONITOR
    elif threat_level == ThreatLevel.MEDIUM:
        return Recommendation.FLASH_LIGHT
    elif threat_level == ThreatLevel.HIGH:
        if is_night(time_str):
            return Recommendation.FLASH_LIGHT_SPEAKER
        else:
            return Recommendation.SPEAKER
    
    return Recommendation.MONITOR
