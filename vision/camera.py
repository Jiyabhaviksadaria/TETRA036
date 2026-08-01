"""
camera.py

Frame capture module for the Rakshak AI Vision Module.

Responsibility
--------------
Open a video source (webcam or video file, per config.py's CAMERA_MODE)
and return frames, one at a time. Nothing else.

This module does NOT perform detection, tracking, boundary analysis,
direction detection, or JSON generation - those belong to other files
in the pipeline (detector.py, tracker.py, boundary.py, direction.py,
utils.py).

TETRA036 | Member 1 - Vision Engineer
"""

import logging
import os
import sys
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

from config import Config

logger = logging.getLogger(__name__)
logging.basicConfig(level=Config.LOG_LEVEL)


class VideoStream:
    """
    Wraps a single OpenCV VideoCapture source (webcam or video file).

    Usage
    -----
        stream = VideoStream()
        stream.open()
        frame = stream.read()   # np.ndarray or None
        stream.release()

    Or, as a context manager (recommended - guarantees release() runs):

        with VideoStream() as stream:
            frame = stream.read()
    """

    def __init__(self) -> None:
        """Initialize the stream wrapper. Does NOT open the source yet."""
        self._cap: Optional[cv2.VideoCapture] = None
        self._mode: str = Config.CAMERA_MODE

    def open(self) -> None:
        """
        Open the configured video source (webcam or video file).

        Raises
        ------
        RuntimeError
            If the source cannot be opened for any reason (invalid camera
            index, missing/corrupt video file, camera disconnected/busy).
        """
        if self._mode == "video":
            self._open_video_file()
        elif self._mode == "webcam":
            self._open_webcam()
        else:
            # Should be unreachable if Config.validate() ran at startup,
            # but guarded here too since camera.py can be used standalone.
            raise RuntimeError(
                f"Invalid CAMERA_MODE '{self._mode}'. Must be 'webcam' or 'video'."
            )

    def _open_video_file(self) -> None:
        """Open a video file source. Raises RuntimeError if it fails."""
        video_path = Path(Config.VIDEO_PATH)

        if not video_path.exists():
            raise RuntimeError(
                f"Video file not found: '{video_path}'. "
                "Check VIDEO_PATH in config.py / .env."
            )

        self._cap = cv2.VideoCapture(str(video_path))

        if not self._cap.isOpened():
            raise RuntimeError(
                f"Video file exists but could not be opened (corrupt or "
                f"unsupported codec?): '{video_path}'"
            )

        logger.info("Opened video file source: %s", video_path)

    def _open_webcam(self) -> None:
        """Open a live webcam source. Raises RuntimeError if it fails."""
        index = Config.CAMERA_INDEX
        self._cap = cv2.VideoCapture(index)

        if not self._cap.isOpened():
            raise RuntimeError(
                f"Could not open webcam at index {index}. "
                "Check CAMERA_INDEX in config.py / .env, confirm the camera "
                "is connected, and that no other process is using it."
            )

        logger.info("Opened webcam source at index %d", index)

    def is_opened(self) -> bool:
        """Return True if the video source is currently open and ready."""
        return self._cap is not None and self._cap.isOpened()

    def read(self) -> Optional[np.ndarray]:
        """
        Read the next available frame.

        Returns
        -------
        np.ndarray or None
            The next frame (BGR, as returned by OpenCV) if one is available.
            Returns None if:
              - the video file has reached its end, OR
              - a webcam frame read transiently failed (e.g. brief glitch).
            Callers should treat None as "no frame right now" and decide
            whether to stop (video) or keep trying (webcam), not treat it
            as a fatal error.

        Raises
        ------
        RuntimeError
            If called before open() / after release(), i.e. programmer error,
            not a runtime camera condition.
        """
        if not self.is_opened():
            raise RuntimeError(
                "VideoStream.read() called but the source is not open. "
                "Call open() first (or use VideoStream as a context manager)."
            )

        ret, frame = self._cap.read()

        if not ret:
            # Video file: this is normal end-of-video, not an error.
            # Webcam: this is a transient read failure (unplugged, busy, etc).
            if self._mode == "video":
                logger.info("Reached end of video file.")
            else:
                logger.warning("Failed to read frame from webcam (transient?).")
            return None

        return frame

    def release(self) -> None:
        """Release the underlying video source. Safe to call multiple times."""
        if self._cap is not None:
            self._cap.release()
            logger.info("Video source released.")
            self._cap = None

    def __enter__(self) -> "VideoStream":
        """Context manager entry: opens the source and returns self."""
        self.open()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """Context manager exit: guarantees release() runs, even on error."""
        self.release()


def _display_available() -> bool:
    """
    Check whether a GUI display is likely available, WITHOUT calling any
    cv2 GUI function.

    cv2.imshow() does not raise a catchable Python exception when no
    display backend is present (e.g. headless Linux/CI/judge Docker
    container) - it hard-aborts the entire process (SIGABRT). So this
    must be checked BEFORE calling imshow, not caught after.

    Returns
    -------
    bool
        False if we can positively determine no display is available.
        True otherwise (best-effort).
    """
    if sys.platform.startswith("linux"):
        return bool(os.environ.get("DISPLAY"))
    return True


if __name__ == "__main__":
    print(f"Testing camera.py with CAMERA_MODE='{Config.CAMERA_MODE}'")

    output_dir = Path(Config.OUTPUT_FOLDER)
    output_dir.mkdir(parents=True, exist_ok=True)

    display_available = _display_available()
    if not display_available:
        print(
            "No display detected (headless environment). "
            f"Will save sample frames to '{output_dir}/' instead of a window."
        )

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

                if display_available:
                    cv2.imshow("Rakshak AI - Camera Test (press 'q' to quit)", frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        print("Quit key pressed. Stopping.")
                        break
                elif frame_count % 30 == 0:
                    snapshot_path = output_dir / f"camera_test_frame_{frame_count}.jpg"
                    cv2.imwrite(str(snapshot_path), frame)
                    print(f"Saved sample frame: {snapshot_path}")

        print(f"Done. Total frames read: {frame_count}")

    except RuntimeError as e:
        print(f"ERROR: {e}")
    finally:
        if display_available:
            cv2.destroyAllWindows()