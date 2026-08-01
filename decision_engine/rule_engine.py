from decision_engine.constants import (
    CONFIDENCE_THRESHOLD, HIGH_RISK_ANIMALS, LOW_RISK_ANIMALS, SCORE_WEIGHTS,
    THREAT_SCORE_LOW_MAX, THREAT_SCORE_MEDIUM_MAX
)
from decision_engine.enums import CropRiskLevel, Direction, TimeOfDay
from decision_engine.utils import normalize_species, validate_direction, is_night, is_near_crop
from typing import Dict, List, Tuple, Any

def evaluate_rules(input_data: Dict[str, Any]) -> Tuple[CropRiskLevel, int, Dict[str, int], List[str]]:
    """
    Evaluates crop risk score, crop risk level, trace score components, and reason keys.
    Returns (CropRiskLevel, crop_risk_score, trace_dict, reason_list)
    """
    # Step 1: Input Validation
    required_fields = ["animal", "confidence", "distance", "direction", "time", "inside_crop_region"]
    missing = [f for f in required_fields if f not in input_data or input_data[f] is None]
    if missing:
        return (
            CropRiskLevel.LOW,
            0,
            {},
            ["Incomplete Observation"]
        )

    animal = normalize_species(input_data["animal"])
    confidence = input_data["confidence"]
    distance = input_data["distance"]
    direction = validate_direction(input_data["direction"])
    time = input_data["time"]
    inside_crop = input_data["inside_crop_region"]

    # Step 2: Confidence Suppression
    if confidence < CONFIDENCE_THRESHOLD:
        return (
            CropRiskLevel.LOW,
            0,
            {"confidence_suppression": 0},
            ["Low Confidence"]
        )

    # Step 3: False Alarm Suppression (Bird, Dog, Human)
    if animal in LOW_RISK_ANIMALS:
        reason_tag = f"Non-threat species ({animal})" if animal != "Human" else "Human Intruder (Log Only)"
        return (
            CropRiskLevel.LOW,
            0,
            {"false_alarm_suppression": 0},
            [reason_tag]
        )

    # Step 4: Unknown Animal Strategy
    is_unknown = (animal not in HIGH_RISK_ANIMALS) and (animal not in LOW_RISK_ANIMALS) and (animal != "Unknown")
    if animal == "Unknown" or is_unknown:
        # If confidence is high, check if near crop or moving toward crop
        is_near = is_near_crop(distance)
        is_toward = direction == Direction.TOWARD_CROP.value
        if is_near or is_toward:
            return (
                CropRiskLevel.MEDIUM,
                5,
                {"unknown_threat_escalation": 5},
                ["Unknown Large Object"]
            )
        else:
            return (
                CropRiskLevel.LOW,
                0,
                {"unknown_threat_low": 0},
                ["Far/Away Unknown Object"]
            )

    # Step 5: Crop Risk Score Calculation (for high-risk animals)
    trace = {}
    
    # Large Animal check
    is_large = animal in HIGH_RISK_ANIMALS
    trace["animal_score"] = SCORE_WEIGHTS["large_animal"] if is_large else 0
    
    # Distance check
    is_near = is_near_crop(distance)
    trace["distance_score"] = SCORE_WEIGHTS["near_crop"] if is_near else SCORE_WEIGHTS["far_from_crop"]
    
    # Inside Crop Region
    trace["inside_region_score"] = SCORE_WEIGHTS["inside_crop_region"] if inside_crop else 0
    
    # Direction check
    if direction == Direction.TOWARD_CROP.value:
        trace["direction_score"] = SCORE_WEIGHTS["moving_toward_crop"]
    elif direction == Direction.AWAY_FROM_CROP.value:
        trace["direction_score"] = SCORE_WEIGHTS["moving_away"]
    else:
        trace["direction_score"] = SCORE_WEIGHTS["stationary"]
        
    # Time check
    trace["time_score"] = SCORE_WEIGHTS["night_time"] if is_night(time) else 0

    total_score = sum(trace.values())
    total_score = max(0, total_score)

    # Step 6: Crop Risk Level Mapping
    if total_score <= THREAT_SCORE_LOW_MAX:
        crop_risk_level = CropRiskLevel.LOW
    elif total_score <= THREAT_SCORE_MEDIUM_MAX:
        crop_risk_level = CropRiskLevel.MEDIUM
    else:
        crop_risk_level = CropRiskLevel.HIGH

    # Reasons will be computed by explainability module using these details
    return crop_risk_level, total_score, trace, []
