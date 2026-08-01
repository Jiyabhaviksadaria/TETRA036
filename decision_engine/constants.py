# Configurable constants for the Explainable Decision Engine (EDE)

CONFIDENCE_THRESHOLD = 0.60
CLOSE_DISTANCE = 50.0  # Threshold for "Near Crop"

ENGINE_NAME = "Explainable Decision Engine"
ENGINE_VERSION = "1.0.0"

# Risk classification groups
HIGH_RISK_ANIMALS = {
    "Cow",
    "Buffalo",
    "Wild Boar",
    "Elephant"
}

LOW_RISK_ANIMALS = {
    "Bird",
    "Dog",
    "Human"
}

# Threat Score Weights
SCORE_WEIGHTS = {
    "large_animal": 3,
    "near_crop": 3,
    "inside_crop_region": 3,
    "moving_toward_crop": 2,
    "night_time": 2,
    "stationary": 0,
    "moving_away": -2,
    "far_from_crop": -2
}

# Score boundaries
THREAT_SCORE_LOW_MAX = 2
THREAT_SCORE_MEDIUM_MAX = 6
# 7+ is HIGH
