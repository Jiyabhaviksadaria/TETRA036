"""
schemas.py

Pydantic v2 models for the Rakshak AI Vision Module.

Defines the frozen JSON contract exchanged between pipeline stages
and returned by the FastAPI endpoints.

All field names are snake_case — consistent with the pipeline dicts
produced by detector.py, tracker.py, boundary.py, and direction.py.

Frozen contract (Detection):
{
    "tracking_id":       int,
    "animal":            str,
    "confidence":        float,
    "bbox":              [x1, y1, x2, y2],
    "position":          [cx, cy],
    "previous_position": [cx, cy] | null,
    "inside_boundary":   bool,
    "near_boundary":     bool,
    "direction":         str
}

TETRA036 | Member 1 - Vision Engineer
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ------------------------------------------------------------------
# Detection
# ------------------------------------------------------------------

class Detection(BaseModel):
    """
    Single tracked animal detection — the core output unit of the
    Vision Module pipeline.

    Produced after the full pipeline:
        detector → tracker → boundary → direction
    """

    tracking_id: int = Field(
        description="Stable track ID assigned by ByteTrack. "
                    "Consistent across frames for the same animal.",
    )
    animal: str = Field(
        description="Detected species. One of: Cow, Buffalo, Goat, Pig, Dog.",
    )
    confidence: float = Field(
        description="YOLO detection confidence (0.0 – 1.0).",
        ge=0.0,
        le=1.0,
    )
    bbox: list[int] = Field(
        description="Bounding box [x1, y1, x2, y2] in pixels.",
    )
    position: list[int] = Field(
        description="Current bounding box center [cx, cy] in pixels.",
    )
    previous_position: Optional[list[int]] = Field(
        default=None,
        description="Center from the previous frame [cx, cy]. "
                    "Null on first appearance of a track.",
    )
    inside_boundary: bool = Field(
        description="True if the animal's center is inside the "
                    "protected crop zone.",
    )
    near_boundary: bool = Field(
        description="True if outside but within NEAR_BOUNDARY_DISTANCE "
                    "pixels of the crop zone. "
                    "Mutually exclusive with inside_boundary.",
    )
    direction: str = Field(
        description="Movement relative to crop boundary. "
                    "One of: 'Toward Crop', 'Away From Crop', 'Static'.",
    )

    @field_validator("bbox")
    @classmethod
    def bbox_must_have_four_elements(cls, v: list[int]) -> list[int]:
        if len(v) != 4:
            raise ValueError(
                f"bbox must have 4 elements [x1, y1, x2, y2], got {len(v)}."
            )
        return v

    @field_validator("position")
    @classmethod
    def position_must_have_two_elements(cls, v: list[int]) -> list[int]:
        if len(v) != 2:
            raise ValueError(
                f"position must have 2 elements [cx, cy], got {len(v)}."
            )
        return v

    @field_validator("previous_position")
    @classmethod
    def previous_position_must_have_two_elements(
        cls, v: Optional[list[int]]
    ) -> Optional[list[int]]:
        if v is not None and len(v) != 2:
            raise ValueError(
                f"previous_position must have 2 elements [cx, cy] "
                f"or be null, got {len(v)}."
            )
        return v

    @field_validator("direction")
    @classmethod
    def direction_must_be_valid(cls, v: str) -> str:
        valid = {"Toward Crop", "Away From Crop", "Static"}
        if v not in valid:
            raise ValueError(
                f"direction must be one of {sorted(valid)}, got '{v}'."
            )
        return v

    @field_validator("animal")
    @classmethod
    def animal_must_be_supported(cls, v: str) -> str:
        valid = {"Cow", "Buffalo", "Goat", "Pig", "Dog"}
        if v not in valid:
            raise ValueError(
                f"animal must be one of {sorted(valid)}, got '{v}'."
            )
        return v


# ------------------------------------------------------------------
# VisionResponse
# ------------------------------------------------------------------

class VisionResponse(BaseModel):
    """
    Full observation payload returned by POST /detect and GET /stream.
    Wraps per-frame detections with frame metadata.
    """

    frame_number: int = Field(
        description="Monotonically increasing frame counter "
                    "since the Vision Module started.",
        ge=0,
    )
    timestamp: datetime = Field(
        description="UTC timestamp of frame processing. "
                    "Pydantic validates and serializes automatically.",
    )
    detections: list[Detection] = Field(
        description="All tracked animals detected this frame. "
                    "Empty list if no supported animals are present.",
    )


# ------------------------------------------------------------------
# HealthResponse
# ------------------------------------------------------------------

class HealthResponse(BaseModel):
    """Returned by GET /health."""

    status: str = Field(
        description="Service status. Always 'healthy' when running normally.",
    )
    camera: str = Field(
        description="Camera source connectivity. 'online' when frames are "
                    "being read successfully.",
    )
    fps: float = Field(
        description="Observed processing rate in frames per second.",
        ge=0.0,
    )


# ------------------------------------------------------------------
# __main__ — sample objects + validator tests
# ------------------------------------------------------------------

if __name__ == "__main__":
    from datetime import timezone

    # --- Valid VisionResponse with two detections ---
    d1 = Detection.model_validate({
        "tracking_id": 12,
        "animal": "Cow",
        "confidence": 0.92,
        "bbox": [250, 120, 500, 430],
        "position": [375, 275],
        "previous_position": None,       # first appearance
        "inside_boundary": False,
        "near_boundary": True,
        "direction": "Toward Crop",
    })

    d2 = Detection.model_validate({
        "tracking_id": 7,
        "animal": "Dog",
        "confidence": 0.87,
        "bbox": [60, 80, 180, 220],
        "position": [120, 150],
        "previous_position": [115, 145],
        "inside_boundary": True,
        "near_boundary": False,
        "direction": "Static",
    })

    response = VisionResponse(
        frame_number=142,
        timestamp=datetime.now(timezone.utc),
        detections=[d1, d2],
    )

    print("=== VisionResponse ===")
    print(response.model_dump_json(indent=2))

    # --- HealthResponse ---
    health = HealthResponse(status="healthy", camera="online", fps=28.4)
    print("\n=== HealthResponse ===")
    print(health.model_dump_json(indent=2))

    # --- Validator: invalid direction ---
    print("\n=== Validator test: invalid direction ===")
    try:
        Detection.model_validate({
            "tracking_id": 1, "animal": "Cow", "confidence": 0.9,
            "bbox": [0, 0, 100, 100], "position": [50, 50],
            "previous_position": None, "inside_boundary": False,
            "near_boundary": False, "direction": "Running Away",
        })
    except Exception as e:
        print(f"Caught expected error: {e}")

    # --- Validator: unsupported animal ---
    print("\n=== Validator test: unsupported animal ===")
    try:
        Detection.model_validate({
            "tracking_id": 2, "animal": "Tiger", "confidence": 0.8,
            "bbox": [0, 0, 100, 100], "position": [50, 50],
            "previous_position": None, "inside_boundary": False,
            "near_boundary": False, "direction": "Static",
        })
    except Exception as e:
        print(f"Caught expected error: {e}")
