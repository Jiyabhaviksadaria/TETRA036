from decision_engine.constants import HIGH_RISK_ANIMALS
from decision_engine.enums import Direction
from decision_engine.utils import is_night, is_near_crop, normalize_species, validate_direction
from typing import List, Dict, Any

def generate_reasons(input_data: Dict[str, Any], rule_reasons: List[str]) -> List[str]:
    """
    Generates explainable reason tags based on input data and rule engine conclusions.
    Reasons are concise, human-readable 1-3 word tags for UI chips.
    """
    # If the rule engine already determined a reason (e.g. suppression, unknown, errors)
    if rule_reasons:
        return rule_reasons

    reasons = []
    
    animal = normalize_species(input_data.get("animal", ""))
    distance = input_data.get("distance", 999.0)
    direction = validate_direction(input_data.get("direction", ""))
    time = input_data.get("time", "")
    inside_crop = input_data.get("inside_crop_region", False)

    # 1. Animal Risk
    if animal in HIGH_RISK_ANIMALS:
        reasons.append("Large Animal")

    # 2. Movement Direction
    if direction == Direction.TOWARD_CROP.value:
        reasons.append("Moving Toward Crop")
    elif direction == Direction.AWAY_FROM_CROP.value:
        reasons.append("Moving Away")

    # 3. Proximity
    if is_near_crop(distance):
        reasons.append("Near Crop")
    else:
        reasons.append("Far From Crop")

    # 4. Time
    if is_night(time):
        reasons.append("Night Time")

    # 5. Inside Crop Region
    if inside_crop:
        reasons.append("Inside Protected Region")

    return reasons
