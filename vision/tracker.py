"""
tracker.py

Multi-object tracking module for the Rakshak AI Vision Module.

Responsibility
--------------
Take a list of per-frame detections (from detector.py) and assign stable
trackIds across frames using ByteTrack. Nothing else - no boundary
analysis, no movement direction, no JSON generation, no FastAPI logic.

Why ByteTrack (via `supervision`)
----------------------------------
ByteTrack is the right fit here: it's fast (motion + IoU based, no extra
neural network to run per frame - important since we're already paying
YOLO's inference cost), handles multiple simultaneous animals naturally,
and is the industry-standard choice bundled in `supervision`, so there is
no custom tracking math to write or debug under hackathon time pressure.

Known, tested behaviors (documented, not hidden)
--------------------------------------------------
1. A track needs to be seen for a couple of consecutive frames before
   ByteTrack "confirms" it and assigns a trackId. This means a detection
   can legitimately appear in a frame's input and NOT appear in that
   frame's tracked output yet (e.g. right after an animal re-enters the
   frame following an absence). This is normal ByteTrack behavior, not a
   bug - update() simply returns fewer entries than went in on that frame.
2. In this supervision version, trackId matching is based on motion/IoU,
   not class_id - a trackId's "animal" label reflects that frame's own
   YOLO classification, not a smoothed/voted species label. If detector.py
   classification flickers between frames for the same physical animal,
   the "animal" field can flicker too. Smoothing that (if ever needed) is
   a Decision Engine concern, not this module's.

TETRA036 | Member 1 - Vision Engineer
"""

import logging
from typing import Any

import numpy as np
import supervision as sv

logger = logging.getLogger(__name__)
# NOTE: no logging.basicConfig() here - this is a library module.
# Global logging configuration belongs in app.py.


class Tracker:
    """
    Wraps a single ByteTrack instance and converts to/from the Vision
    Module's plain-dict detection format.

    The tracker is created once, in __init__, and carries state across
    calls to update() - that persistent state IS what makes trackIds
    stable across frames, so a new Tracker() must not be created per frame.

    Usage
    -----
        tracker = Tracker()
        tracked_detections = tracker.update(detections_from_detector)
    """

    def __init__(self) -> None:
        """Initialize a single, persistent ByteTrack instance."""
        self._tracker = sv.ByteTrack()
        logger.info("ByteTrack tracker initialized.")

    def update(self, detections: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        Update tracking state with this frame's detections and return
        tracked detections with stable trackIds.

        Parameters
        ----------
        detections : list[dict]
            Detections from detector.Detector.detect(), each with keys
            "animal", "confidence", "bbox", "position".

        Returns
        -------
        list[dict]
            Zero or more tracked detections in the format:
                {
                    "tracking_id": int,
                    "animal": str,
                    "confidence": float,
                    "bbox": [x1, y1, x2, y2],
                    "position": [cx, cy]
                }
            Returns an empty list if there are no input detections, if no
            tracks are confirmed yet this frame (see module docstring,
            point 1), or if tracking update fails for any reason. This
            method never raises for those cases - only a genuine internal
            error would surface, and even that is caught and logged.
        """
        try:
            sv_detections = self._to_sv_detections(detections)
            tracked = self._tracker.update_with_detections(sv_detections)
            return self._to_output(tracked)
        except Exception as e:
            # Tracking must never crash the pipeline - a live demo cannot
            # afford to die because of one bad frame's tracking update.
            logger.error("Tracking update failed on this frame: %s", e)
            return []

    @staticmethod
    def _to_sv_detections(detections: list[dict[str, Any]]) -> sv.Detections:
        """
        Convert the Vision Module's plain-dict detections into a
        supervision.Detections object, which is what ByteTrack requires.

        Parameters
        ----------
        detections : list[dict]
            Detections from detector.Detector.detect().

        Returns
        -------
        sv.Detections
            Empty (via sv.Detections.empty()) if `detections` is empty -
            NOT hand-built with a zero-length array, which raises inside
            supervision's own shape validation.
        """
        if not detections:
            return sv.Detections.empty()

        xyxy = np.array([d["bbox"] for d in detections], dtype=np.float32)
        confidence = np.array([d["confidence"] for d in detections], dtype=np.float32)
        # class_id is required by supervision's Detections shape but is not
        # semantically used for matching in this version (verified: matching
        # is motion/IoU-based, not class-based) - a fixed placeholder is
        # sufficient. The actual species label travels through `data` below,
        # not class_id.
        class_id = np.zeros(len(detections), dtype=int)
        data = {"animal": np.array([d["animal"] for d in detections], dtype=object)}

        return sv.Detections(
            xyxy=xyxy, confidence=confidence, class_id=class_id, data=data
        )

    @staticmethod
    def _to_output(tracked: sv.Detections) -> list[dict[str, Any]]:
        """
        Convert a tracked supervision.Detections object back into the
        Vision Module's plain-dict output format, with trackId attached.

        Parameters
        ----------
        tracked : sv.Detections
            The result of ByteTrack.update_with_detections().

        Returns
        -------
        list[dict]
            See update() docstring for the schema. Empty list if there are
            no confirmed tracks this frame.
        """
        output: list[dict[str, Any]] = []

        if tracked.tracker_id is None or len(tracked) == 0:
            return output

        animals = tracked.data.get("animal", [])

        for i in range(len(tracked)):
            x1, y1, x2, y2 = (int(v) for v in tracked.xyxy[i])
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2

            output.append(
                {
                    "tracking_id": int(tracked.tracker_id[i]),
                    "animal": str(animals[i]) if i < len(animals) else "Unknown",
                    "confidence": round(float(tracked.confidence[i]), 4),
                    "bbox": [x1, y1, x2, y2],
                    "position": [center_x, center_y],
                }
            )

        return output


if __name__ == "__main__":
    import cv2

    from camera import VideoStream, _display_available
    from config import Config
    from detector import Detector
    from pathlib import Path

    print("Testing tracker.py")

    try:
        detector = Detector()
    except RuntimeError as e:
        print(f"ERROR: Could not initialize Detector: {e}")
        raise SystemExit(1)

    tracker = Tracker()

    output_dir = Path(Config.OUTPUT_FOLDER)
    output_dir.mkdir(parents=True, exist_ok=True)
    display_available = _display_available()

    if not display_available:
        print(
            "No display detected (headless environment). "
            f"Will save annotated sample frames to '{output_dir}/'."
        )

    frame_count = 0
    # Fixed color per trackId (cycled) purely for visual debugging clarity.
    colors = [(0, 255, 0), (255, 0, 0), (0, 165, 255), (255, 0, 255), (0, 255, 255)]

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

                print(
                    f"Frame {frame_count}: {len(detections)} raw detection(s), "
                    f"{len(tracked)} tracked -",
                    ", ".join(
                        f"id={t['tracking_id']}:{t['animal']}({t['confidence']:.2f})"
                        for t in tracked
                    )
                    or "none",
                )

                annotated = frame.copy()
                for t in tracked:
                    x1, y1, x2, y2 = t["bbox"]
                    color = colors[t["tracking_id"] % len(colors)]
                    label = f"ID {t['tracking_id']} {t['animal']} {t['confidence']:.2f}"
                    cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(
                        annotated,
                        label,
                        (x1, max(y1 - 10, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        color,
                        2,
                    )

                if display_available:
                    cv2.imshow("Rakshak AI - Tracker Test (press 'q' to quit)", annotated)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        print("Quit key pressed. Stopping.")
                        break
                elif frame_count % 30 == 0:
                    snapshot_path = output_dir / f"tracker_test_frame_{frame_count}.jpg"
                    cv2.imwrite(str(snapshot_path), annotated)
                    print(f"Saved annotated frame: {snapshot_path}")

        print(f"Done. Total frames processed: {frame_count}")

    except RuntimeError as e:
        print(f"ERROR: {e}")
    finally:
        if display_available:
            cv2.destroyAllWindows()