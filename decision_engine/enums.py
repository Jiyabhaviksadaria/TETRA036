from enum import Enum

class ThreatLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class Recommendation(str, Enum):
    MONITOR = "Monitor"
    FLASH_LIGHT = "Flash Light"
    SPEAKER = "Speaker"
    FLASH_LIGHT_SPEAKER = "Flash Light + Speaker"

class Direction(str, Enum):
    TOWARD_CROP = "Toward Crop"
    AWAY_FROM_CROP = "Away From Crop"
    STATIONARY = "Stationary"

class TimeOfDay(str, Enum):
    DAY = "Day"
    NIGHT = "Night"
