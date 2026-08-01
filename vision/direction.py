"""
direction.py

Movement direction analysis module for the Rakshak AI Vision Module.

Responsibility
--------------
Take boundary-analyzed detections (from boundary.py) and determine
whether each tracked animal is moving toward the protected crop boundary,
away from it, or is stationary. Adds exactly one field per detection:
    "direction": "Toward Crop" | "Away From Crop" | "Static"

How direction is determined
---------------------------
Compare distance-to-boundary in the current frame vs the previous frame
(same AABB metric from boundary.py):

    curr_dist < prev_dist - MOVEMENT_THRESHOLD  ->  "Toward Crop"
    curr_dist > prev_dist + MOVEMENT_THRESHOLD  ->  "Away From Crop"
    otherwise                                   ->  "Static"

First appearance defaults to "Static" (no history to compare).

Stale track pruning
-------------------
Absent trackIds accumulate an absence counter each frame and are
discarded after STALE_TRACK_TTL missed frames.

TETRA036 | Member 1 - Vision Engineer
"""

import logging
from typing import Any

from boundary import BoundaryAnalyzer
from config import Config

logger = logging.getLogger(__name__)
# NOTE: no logging.basicConfig() here - this is a library module.
# Global logging configuration belongs in app.py.

# -----------------------------------------------------------------
# Direction labels - defined once so every module that imports this
# file uses the same strings, not hand-typed literals.
# -----------------------------------------------------------------
DIRECTION_TOWARD: str = "Toward Crop"
DIRECTION_AWAY: str = "Away From Crop"
DIRECTION_STATIC: str = "Static"

# -----------------------------------------------------------------
# Default configuration constants
# -----------------------------------------------------------------

# Minimum pixel change in distance-to-boundary between frames to be
# counted as movement. Below this value the animal is "Static".
# Tune upward if direction flickers on a stationary animal; tune
# downward if slow-moving animals are misclassified as Static.
_DEFAULT_MOVEMENT_THRESHOLD: float = Config.MOVEMENT_THRESHOLD

# Number of consecutive frames a trackId must be absent before its
# stored position is discarded. Prevents unbounded memory growth.
_DEFAULT_STALE_TTL: int = Config.STALE_TRACK_TTL


class DirectionAnalyzer:
    """
    Determines movement direction of tracked animals relative to the
    protected crop boundary.

    Requires a shared BoundaryAnalyzer instance — reuses its
    distance_to_boundary() rather than duplicating geometry.

    Must be instantiated once and reused across frames; internal state
    (previous centers, absence counters) is what makes direction stable.

    Usage
    -----
        boundary_analyzer = BoundaryAnalyzer()
        direction_analyzer = DirectionAnalyzer(boundary_analyzer)

        # each frame:
        with_boundary  = boundary_analyzer.analyze(tracked)
        with_direction = direction_analyzer.analyze(with_boundary)
    """

    def __init__(
        self,
        boundary_analyzer: BoundaryAnalyzer,
        movement_threshold: float = _DEFAULT_MOVEMENT_THRESHOLD,
        stale_track_ttl: int = _DEFAULT_STALE_TTL,
    ) -> None:
        """
        Parameters
        ----------
        boundary_analyzer : BoundaryAnalyzer
            Shared instance for distance_to_boundary() calls.
        movement_threshold : float
            Minimum pixel change in distance-to-boundary to register
            as movement. Defaults to Config.MOVEMENT_THRESHOLD.
        stale_track_ttl : int
            Frames of absence before a trackId's position is pruned.
            Defaults to Config.STALE_TRACK_TTL.
        """
        self._boundary = boundary_analyzer
        self._threshold: float = movement_threshold
        self._stale_ttl: int = stale_track_ttl

        # trackId -> (cx, cy) of the previous frame
        self._prev_centers: dict[int, tuple[int, int]] = {}

        # trackId -> consecutive frames absent (for stale pruning)
        self._absent_frames: dict[int, int] = {}
        logger.info(
            "DirectionAnalyzer initialized "
            "(movement_threshold=%.1fpx, stale_ttl=%d frames)",
            movement_threshold,
            stale_track_ttl,
        )

    # ------------------------------------------------------------------
    # Public pipeline method
    # ------------------------------------------------------------------

    def analyze(
        self, boundary_detections: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """
        Enrich boundary-analyzed detections with a "direction" field.

        Parameters
        ----------
        boundary_detections : list[dict]
            Output of BoundaryAnalyzer.analyze(). Each dict must contain
            "tracking_id" (int) and "position" ([cx, cy]).

        Returns
        -------
        list[dict]
            Shallow copies of input dicts with "direction" added.
            Input dicts are never mutated. Empty list if input is empty.
        """
        active_ids: set[int] = set()
        results: list[dict[str, Any]] = []

        for detection in boundary_detections:
            track_id = detection.get("tracking_id")
            position = detection.get("position")

            if not isinstance(track_id, int):
                logger.warning(
                    "Skipping detection with missing/invalid 'tracking_id': %s",
                    detection,
                )
                continue

            if not _is_valid_center(position):
                logger.warning(
                    "Skipping detection with invalid 'position': %s",
                    detection,
                )
                continue

            cx, cy = int(position[0]), int(position[1])
            active_ids.add(track_id)

            # Retrieve previous position before updating state.
            # On first appearance prev is None -> previous_position is null.
            # Convention: null on first frame; real coords on every subsequent
            # frame. Chosen over "equal to current" so consumers can
            # distinguish "genuinely no history" from "animal stood still".
            prev = self._prev_centers.get(track_id)
            previous_position = list(prev) if prev is not None else None

            direction = self._compute_direction(track_id, cx, cy)

            # Update stored position for next frame
            self._prev_centers[track_id] = (cx, cy)
            # Reset absence counter - track is active this frame
            self._absent_frames[track_id] = 0

            results.append({
                **detection,
                "previous_position": previous_position,
                "direction": direction,
            })

        self._prune_stale_tracks(active_ids)
        return results

    # ------------------------------------------------------------------
    # Direction logic
    # ------------------------------------------------------------------

    def _compute_direction(self, track_id: int, cx: int, cy: int) -> str:
        """
        Return direction label by comparing current vs previous
        distance-to-boundary. Returns "Static" on first appearance.
        """
        prev = self._prev_centers.get(track_id)

        if prev is None:
            # First appearance - no history to compare against.
            return DIRECTION_STATIC

        curr_dist = self._boundary.distance_to_boundary(cx, cy)
        prev_dist = self._boundary.distance_to_boundary(prev[0], prev[1])

        delta = curr_dist - prev_dist

        if delta < -self._threshold:
            return DIRECTION_TOWARD
        if delta > self._threshold:
            return DIRECTION_AWAY
        return DIRECTION_STATIC

    # ------------------------------------------------------------------
    # Stale track pruning
    # ------------------------------------------------------------------

    def _prune_stale_tracks(self, active_ids: set[int]) -> None:
        """
        Increment absence counters for unseen tracks and remove entries
        that have exceeded stale_track_ttl consecutive missed frames.
        """
        all_known = set(self._prev_centers.keys())
        absent_this_frame = all_known - active_ids

        for track_id in absent_this_frame:
            self._absent_frames[track_id] = (
                self._absent_frames.get(track_id, 0) + 1
            )

        stale = [
            tid
            for tid, age in self._absent_frames.items()
            if age > self._stale_ttl
        ]

        for tid in stale:
            self._prev_centers.pop(tid, None)
            self._absent_frames.pop(tid, None)
            logger.debug("Pruned stale track ID %d.", tid)


# ------------------------------------------------------------------
# Module-level helper
# ------------------------------------------------------------------

def _is_valid_center(center: Any) -> bool:
    """
    Return True if `center` is a sequence of exactly two numeric values.
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
    from detector import Detector
    from tracker import Tracker

    print("Testing direction.py")

    # --- Colour scheme ---
    # Toward Crop  -> red    (approaching protected zone)
    # Away From Crop -> green (retreating)
    # Static       -> white
    COLOUR_TOWARD  = (0, 0, 255)
    COLOUR_AWAY    = (0, 255, 0)
    COLOUR_STATIC  = (255, 255, 255)
    COLOUR_BOUNDARY = (255, 255, 0)

    DIR_COLOURS = {
        DIRECTION_TOWARD: COLOUR_TOWARD,
        DIRECTION_AWAY:   COLOUR_AWAY,
        DIRECTION_STATIC: COLOUR_STATIC,
    }

    try:
        detector = Detector()
    except RuntimeError as e:
        print(f"ERROR: Could not initialize Detector: {e}")
        raise SystemExit(1)

    tracker = Tracker()

    try:
        boundary_analyzer = BoundaryAnalyzer()
    except ValueError as e:
        print(f"ERROR: Could not initialize BoundaryAnalyzer: {e}")
        raise SystemExit(1)

    direction_analyzer = DirectionAnalyzer(boundary_analyzer)

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

                detections        = detector.detect(frame)
                tracked           = tracker.update(detections)
                with_boundary     = boundary_analyzer.analyze(tracked)
                with_direction    = direction_analyzer.analyze(with_boundary)

                annotated = frame.copy()

                # Protected crop boundary rectangle
                cv2.rectangle(
                    annotated, (bx1, by1), (bx2, by2), COLOUR_BOUNDARY, 2
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

                for det in with_direction:
                    x1, y1, x2, y2 = det["bbox"]
                    cx, cy = det["position"]
                    direction = det["direction"]
                    colour = DIR_COLOURS.get(direction, COLOUR_STATIC)

                    # Bounding box
                    cv2.rectangle(annotated, (x1, y1), (x2, y2), colour, 2)

                    # Centre dot
                    cv2.circle(annotated, (cx, cy), 4, colour, -1)

                    # Label: ID · animal · direction
                    label = (
                        f"ID{det['tracking_id']} {det['animal']} | {direction}"
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

                    print(
                        f"Frame {frame_count} | "
                        f"ID{det['tracking_id']} {det['animal']} | "
                        f"{direction} | "
                        f"pos={det['position']} prev={det['previous_position']}"
                    )

                if display_available:
                    cv2.imshow(
                        "Rakshak AI - Direction Test (press 'q' to quit)",
                        annotated,
                    )
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        print("Quit key pressed. Stopping.")
                        break
                elif frame_count % 30 == 0:
                    snapshot_path = (
                        output_dir / f"direction_test_frame_{frame_count}.jpg"
                    )
                    cv2.imwrite(str(snapshot_path), annotated)
                    print(f"Saved annotated frame: {snapshot_path}")

        print(f"Done. Total frames processed: {frame_count}")

    except RuntimeError as e:
        print(f"ERROR: {e}")
    finally:
        if display_available:
            cv2.destroyAllWindows()
