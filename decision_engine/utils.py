from decision_engine.constants import CLOSE_DISTANCE
from decision_engine.enums import Direction, TimeOfDay

def normalize_species(species: str) -> str:
    """Normalize species name (e.g. 'cow ' -> 'Cow', 'elephant' -> 'Elephant')"""
    if not species:
        return "Unknown"
    return species.strip().title()

def validate_direction(direction_str: str) -> str:
    """Normalize and validate movement direction, mapping to standard enum string."""
    if not direction_str:
        return Direction.STATIONARY.value
    
    norm = direction_str.strip().lower()
    if "toward" in norm:
        return Direction.TOWARD_CROP.value
    elif "away" in norm:
        return Direction.AWAY_FROM_CROP.value
    elif "stationary" in norm:
        return Direction.STATIONARY.value
    
    return Direction.STATIONARY.value

def is_night(time_str: str) -> bool:
    """Check if the time of day corresponds to Night."""
    if not time_str:
        return False
    return time_str.strip().lower() == "night"

def is_near_crop(distance: float) -> bool:
    """Determine if distance is within the close distance threshold."""
    return distance <= CLOSE_DISTANCE
