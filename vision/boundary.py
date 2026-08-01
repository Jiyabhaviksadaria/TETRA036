"""
boundary.py

Protected crop boundary analysis module for the Rakshak AI Vision Module.

Responsibility
--------------
Take tracked detections (from tracker.py) and determine whether each
animal is inside, near, or outside the protected crop boundary defined
in config.py. Nothing else - no detection, no tracking, no direction
analysis, no JSON generation, no FastAPI logic.

The boundary is a simple axis-aligned rectangle (x1, y1, x2, y2).
All geometry is pixel-space arithmetic only - no ML, no GPS, no GIS.

TETRA036 | Member 1 - Vision Engineer
"""

import logging
from typing import Any

from config import Config

logger = logging.getLogger(__name__)
# NOTE: no logging.basicConfig() here - this is a library module.
# Global logging configuration belongs in app.py.


class BoundaryAnalyzer:
    """
    Analyzes whether tracked animals are inside or near the protected
    crop boundary.

    The boundary coordinates and near-threshold are read from Config
    once at instantiation - not on every call - so per-frame cost is
    pure arithmetic.

    Usage
    -----
        analyzer = BoundaryAnalyzer()
        results = analyzer.analyze(tracked_detections)
    """

    def __init__(self) -> None:
        """
        Read boundary configuration from Config.

        Raises
        ------
        ValueError
            If the configured boundary is geometrically invalid
            (x1 >= x2 or y1 >= y2). Config.validate() should catch this
            at startup, but we guard here too since BoundaryAnalyzer can
            be used standalone.
        """
        x1, y1, x2, y2 = Config.CROP_BOUNDARY

        if x1 >= x2 or y1 >= y2:
            raise ValueError(
                f"Invalid CROP_BOUNDARY {Config.CROP_BOUNDARY}. "
                "Requires x1 < x2 and y1 < y2."
            )

        self._x1: int = x1
        self._y1: int = y1
        self._x2: int = x2
        self._y2: int = y2
        self._near_threshold: int = Config.NEAR_BOUNDARY_DISTANCE

        logger.info(
            "BoundaryAnalyzer initialized: boundary=(%d,%d,%d,%d), "
            "near_threshold=%dpx",
            x1, y1, x2, y2, self._near_threshold,
        )

    # ------------------------------------------------------------------
    # Core geometry (pure functions - no side effects, no state access)
    # ------------------------------------------------------------------

    def is_inside(self, cx: int, cy: int) -> bool:
        """
        Return True if the point (cx, cy) is inside the boundary.

        A point on the edge itself is considered inside (inclusive bounds),
        matching the intuition that an animal standing exactly on the crop
        border is in the protected zone.

        Parameters
        ----------
        cx, cy : int
            Center point of the tracked animal (pixels).
        """
        return self._x1 <= cx <= self._x2 and self._y1 <= cy <= self._y2

    def is_near(self, cx: int, cy: int) -> bool:
        """
        Return True if the point is outside the boundary but within
        NEAR_BOUNDARY_DISTANCE pixels of it.

        An animal inside the boundary returns False — it is not "near",
        it is already "inside". The two states are mutually exclusive.

        Parameters
        ----------
        cx, cy : int
            Center point of the tracked animal (pixels).
        """
        if self.is_inside(cx, cy):
            return False
        return self.distance_to_boundary(cx, cy) <= self._near_threshold

    def distance_to_boundary(self, cx: int, cy: int) -> float:
        """
        Return the minimum pixel distance from point (cx, cy) to the
        nearest edge of the boundary rectangle.

        Returns 0.0 if the point is inside or on the boundary — an animal
        already inside the crop has zero distance to breach.

        Uses axis-aligned clamping (closest point on AABB), which avoids
        trigonometry and is exact for rectangular boundaries.

        Used internally by is_near() and kept for testing and debugging.
        Not exposed in the public observation JSON output.

        Parameters
        ----------
        cx, cy : int
            Center point of the tracked animal (pixels).

        Returns
        -------
        float
            Distance in pixels. Always >= 0.0.
        """
        if self.is_inside(cx, cy):
            return 0.0

        # Clamp the point to the nearest point on the rectangle's perimeter.
        # If cx is left of x1, nearest x is x1. If right of x2, nearest x is x2.
        # Same logic for y. This gives the closest point on the rectangle edge.
        nearest_x = max(self._x1, min(cx, self._x2))
        nearest_y = max(self._y1, min(cy, self._y2))

        dx = cx - nearest_x
        dy = cy - nearest_y

        return round((dx * dx + dy * dy) ** 0.5, 2)

    # ------------------------------------------------------------------
    # Public pipeline method
    # ------------------------------------------------------------------

    def analyze(
        self, tracked_detections: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """
        Enrich tracked detections with boundary analysis fields.

        Takes the output of tracker.Tracker.update() and adds two fields
        to each detection:
            - insideBoundary (bool) : center is inside the crop zone
            - nearBoundary   (bool) : outside but within near threshold

        distance_to_boundary() is used internally to compute nearBoundary
        but is not included in the output — it is not part of the frozen
        observation JSON contract.

        Parameters
        ----------
        tracked_detections : list[dict]
            Output from tracker.Tracker.update(). Each dict must contain
            a "position" key with value [cx, cy].

        Returns
        -------
        list[dict]
            New list of dicts. Input dicts are NOT mutated - each output
            dict is a shallow copy with the three boundary fields added.
            Returns an empty list if input is empty.

        Notes
        -----
        A malformed detection (missing or invalid "position") is skipped
        with a warning rather than crashing the pipeline. The live demo
        must keep running even if one detection is corrupt.
        """
        if not tracked_detections:
            return []

        results: list[dict[str, Any]] = []

        for detection in tracked_detections:
            center = detection.get("position")

            if not _is_valid_center(center):
                logger.warning(
                    "Skipping detection with invalid 'position': %s",
                    detection,
                )
                continue

            cx, cy = int(center[0]), int(center[1])

            inside = self.is_inside(cx, cy)
            # distance_to_boundary() used internally to drive is_near();
            # kept for testing/debugging but not exposed in output JSON.
            near = self.is_near(cx, cy)

            enriched = {
                **detection,
                "inside_boundary": inside,
                "near_boundary": near,
            }
            results.append(enriched)

        return results


# ------------------------------------------------------------------
# Module-level helper (not a method - no access to boundary state)
# ------------------------------------------------------------------

def _is_valid_center(center: Any) -> bool:
    """
    Return True if `center` is a sequence of exactly two numeric values.

    Used to guard against malformed tracker output without crashing.
    """
    return (
        isinstance(center, (list, tuple))
        and len(center) == 2
        and all(isinstance(v, (int, float)) for v in center)
    )


# ------------------------------------------------------------------
# Standalone test / demo
# ------------------------------------------------------------------

if __name__ == "__main__":
    import cv2
    from pathlib import Path

    from camera import VideoStream, _display_available
    from config import Config
    from detector import Detector
    from tracker import Tracker

    print("Testing boundary.py")

    # --- Colour scheme for boundary states ---
    # Inside  -> red   (animal is breaching the crop zone)
    # Near    -> orange
    # Outside -> green (safe)
    COLOUR_INSIDE = (0, 0, 255)
    COLOUR_NEAR   = (0, 165, 255)
    COLOUR_OUTSIDE = (0, 255, 0)
    COLOUR_BOUNDARY = (255, 255, 0)  # cyan-yellow for the boundary rectangle

    try:
        detector = Detector()
    except RuntimeError as e:
        print(f"ERROR: Could not initialize Detector: {e}")
        raise SystemExit(1)

    tracker = Tracker()

    try:
        analyzer = BoundaryAnalyzer()
    except ValueError as e:
        print(f"ERROR: Could not initialize BoundaryAnalyzer: {e}")
        raise SystemExit(1)

    output_dir = Path(Config.OUTPUT_FOLDER)
    output_dir.mkdir(parents=True, exist_ok=True)
    display_available = _display_available()

    if not display_available:
        print(
            "No display detected (headless environment). "
            f"Will save annotated sample frames to '{output_dir}/'."
        )

    bx1, by1, bx2, by2 = Config.CROP_BOUNDARY
    frame_count = 0

    try:
        with VideoStream() as stream:
            print(
                "Source opened successfully.",
                "Press 'q' to quit." if display_available else "",
            )

            while True:
                frame = stream.read()
                if frame is None:
                    print("No more frames available. Stopping.")
                    break

                frame_count += 1

                detections = detector.detect(frame)
                tracked = tracker.update(detections)
                analyzed = analyzer.analyze(tracked)

                annotated = frame.copy()

                # Draw the protected crop boundary rectangle
                cv2.rectangle(
                    annotated,
                    (bx1, by1),
                    (bx2, by2),
                    COLOUR_BOUNDARY,
                    2,
                )
                cv2.putText(
                    annotated,
                    "Protected Zone",
                    (bx1, max(by1 - 8, 0)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55,
                    COLOUR_BOUNDARY,
                    1,
                )

                for det in analyzed:
                    x1, y1, x2, y2 = det["bbox"]
                    cx, cy = det["position"]

                    # Determine state and colour
                    if det["inside_boundary"]:
                        state = "INSIDE"
                        colour = COLOUR_INSIDE
                    elif det["near_boundary"]:
                        state = "NEAR"
                        colour = COLOUR_NEAR
                    else:
                        state = "OUTSIDE"
                        colour = COLOUR_OUTSIDE

                    # Bounding box
                    cv2.rectangle(annotated, (x1, y1), (x2, y2), colour, 2)

                    # Centre dot
                    cv2.circle(annotated, (cx, cy), 4, colour, -1)

                    # Label: animal · state
                    label = (
                        f"ID{det['tracking_id']} {det['animal']} [{state}]"
                    )
                    cv2.putText(
                        annotated,
                        label,
                        (x1, max(y1 - 10, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.55,
                        colour,
                        2,
                    )

                    # Distance computed on the fly for console debug only
                    debug_dist = analyzer.distance_to_boundary(cx, cy)
                    print(
                        f"Frame {frame_count} | ID{det['tracking_id']} "
                        f"{det['animal']} | {state} | "
                        f"dist={debug_dist:.1f}px"
                    )

                if display_available:
                    cv2.imshow(
                        "Rakshak AI - Boundary Test (press 'q' to quit)",
                        annotated,
                    )
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        print("Quit key pressed. Stopping.")
                        break
                elif frame_count % 30 == 0:
                    snapshot_path = (
                        output_dir / f"boundary_test_frame_{frame_count}.jpg"
                    )
                    cv2.imwrite(str(snapshot_path), annotated)
                    print(f"Saved annotated frame: {snapshot_path}")

        print(f"Done. Total frames processed: {frame_count}")

    except RuntimeError as e:
        print(f"ERROR: {e}")
    finally:
        if display_available:
            cv2.destroyAllWindows()
