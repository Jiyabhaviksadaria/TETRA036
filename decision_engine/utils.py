from decision_engine.constants import CLOSE_DISTANCE, ANIMAL_SPEEDS
from decision_engine.enums import Direction, TimeOfDay
from typing import Optional

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

def calculate_eta(animal: str, distance: Optional[float]) -> Optional[int]:
    """
    Calculates the estimated time of arrival (ETA) in seconds for the animal.
    Formula: ETA = round(Distance / Speed)
    Assumptions:
    - Animal moves at a constant speed towards the crop boundary.
    - If distance is not provided, negative, or invalid, returns None.
    - Speed is determined from the constants.py ANIMAL_SPEEDS mapping, defaulting to 1.5 m/s.
    """
    if distance is None or distance < 0:
        return None
    try:
        norm_animal = normalize_species(animal)
        speed = ANIMAL_SPEEDS.get(norm_animal, ANIMAL_SPEEDS.get("Unknown", 1.5))
        if speed <= 0:
            return None
        return int(round(distance / speed))
    except Exception:
        # Never throw exceptions, return None as fallback
        return None
