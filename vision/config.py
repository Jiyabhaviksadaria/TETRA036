"""
config.py

Centralized configuration for the Rakshak AI Vision Module.

All configurable values are defined here to avoid hardcoded values
across the Vision Module.

Member 1 - Vision Engineer
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env if present.
# Safe to call even when no .env file exists.
load_dotenv()


class Config:
    """Central configuration used by the entire Vision Module."""

    # ==========================================================
    # Camera Configuration
    # ==========================================================

    # Available modes:
    # "webcam" -> Live webcam
    # "video"  -> Video file
    CAMERA_MODE = os.getenv("CAMERA_MODE", "webcam")

    # Webcam device index
    CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))

    # Test/demo video path
    VIDEO_PATH = os.getenv(
        "VIDEO_PATH",
        "test_video/sample_farm.mp4"
    )

    # ==========================================================
    # YOLO Configuration
    # ==========================================================

    # YOLO weights (.pt)
    MODEL_PATH = os.getenv(
        "MODEL_PATH",
        "weights/yolov8n.pt"
    )

    # Detection confidence threshold
    CONFIDENCE_THRESHOLD = float(
        os.getenv("CONFIDENCE_THRESHOLD", "0.5")
    )

    # Inference device
    # auto -> Use GPU if available, otherwise CPU
    DEVICE = os.getenv("DEVICE", "auto")

    # ==========================================================
    # Supported Animals
    # ==========================================================

    # Only these animals are reported.
    SUPPORTED_ANIMALS = (
        "Cow",
        "Buffalo",
        "Goat",
        "Pig",
        "Dog",
    )

    # ==========================================================
    # Protected Crop Boundary
    # ==========================================================

    # Rectangle:
    # (x1, y1, x2, y2)
    #
    # Top-left ---------
    # |                |
    # |                |
    # |                |
    # -------- Bottom-right
    #
    CROP_BOUNDARY = (
        int(os.getenv("BOUNDARY_X1", "100")),
        int(os.getenv("BOUNDARY_Y1", "100")),
        int(os.getenv("BOUNDARY_X2", "500")),
        int(os.getenv("BOUNDARY_Y2", "400")),
    )

    # Distance from boundary (pixels)
    NEAR_BOUNDARY_DISTANCE = int(
        os.getenv("NEAR_BOUNDARY_DISTANCE", "50")
    )

    # ==========================================================
    # Direction Analysis
    # ==========================================================

    # Minimum pixel change in distance-to-boundary between frames
    # to be counted as movement. Below this the animal is "Static".
    # Tune upward to reduce flickering; downward to catch slow movers.
    MOVEMENT_THRESHOLD = float(
        os.getenv("MOVEMENT_THRESHOLD", "2.0")
    )

    # Frames a trackId must be absent before its stored position
    # is discarded. ~1 second at 30 fps.
    STALE_TRACK_TTL = int(
        os.getenv("STALE_TRACK_TTL", "30")
    )

    # ==========================================================
    # Output
    # ==========================================================

    OUTPUT_FOLDER = os.getenv(
        "OUTPUT_FOLDER",
        "outputs"
    )

    # ==========================================================
    # Logging
    # ==========================================================

    LOG_LEVEL = os.getenv(
        "LOG_LEVEL",
        "INFO"
    ).upper()

    # ==========================================================
    # Validation
    # ==========================================================

    @classmethod
    def validate(cls) -> None:
        """Validate configuration before starting the application."""

        errors = []

        # Camera mode
        if cls.CAMERA_MODE not in ("webcam", "video"):
            errors.append(
                "CAMERA_MODE must be 'webcam' or 'video'."
            )

        # Video path
        if (
            cls.CAMERA_MODE == "video"
            and not Path(cls.VIDEO_PATH).exists()
        ):
            errors.append(
                f"Video file not found: {cls.VIDEO_PATH}"
            )

        # Model path
        if not Path(cls.MODEL_PATH).exists():
            errors.append(
                f"YOLO model not found: {cls.MODEL_PATH}"
            )

        # Confidence threshold
        if not (0.0 <= cls.CONFIDENCE_THRESHOLD <= 1.0):
            errors.append(
                "CONFIDENCE_THRESHOLD must be between 0 and 1."
            )

        # Device
        if cls.DEVICE not in ("cpu", "cuda", "auto"):
            errors.append(
                "DEVICE must be 'cpu', 'cuda', or 'auto'."
            )

        # Boundary validation
        x1, y1, x2, y2 = cls.CROP_BOUNDARY

        if x1 >= x2 or y1 >= y2:
            errors.append(
                "Invalid crop boundary. "
                "Expected x1 < x2 and y1 < y2."
            )

        # Near distance
        if cls.NEAR_BOUNDARY_DISTANCE < 0:
            errors.append(
                "NEAR_BOUNDARY_DISTANCE cannot be negative."
            )

        # Create output directory automatically
        Path(cls.OUTPUT_FOLDER).mkdir(
            parents=True,
            exist_ok=True,
        )

        # Raise all errors together
        if errors:
            raise ValueError(
                "Configuration Error:\n- "
                + "\n- ".join(errors)
            )