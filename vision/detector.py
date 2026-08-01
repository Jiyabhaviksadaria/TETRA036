"""
detector.py

YOLO detection module for the Rakshak AI Vision Module.

Responsibility
--------------
Take a single frame, run YOLO inference, filter to supported animals
above the confidence threshold, and return clean structured detections.

This module does NOT perform tracking, boundary analysis, movement
direction, threat assessment, JSON generation, or FastAPI logic -
those belong to other files in the pipeline.

Known limitation (documented, not hidden)
------------------------------------------
Standard COCO-pretrained YOLO models only include "cow" and "dog" from
Config.SUPPORTED_ANIMALS - "Buffalo", "Goat", and "Pig" are not native
COCO classes. If weights/best.pt is a COCO-pretrained model rather than
a custom-trained one, those three animals will never be detected. This
module checks the loaded model's class list against SUPPORTED_ANIMALS
at startup and logs exactly which supported animals it can and cannot
detect, so this gap is visible in logs rather than silently producing
zero detections for those classes.

TETRA036 | Member 1 - Vision Engineer
"""

import logging
import time
from pathlib import Path
from typing import Any, Optional

import numpy as np
from ultralytics import YOLO

from config import Config

logger = logging.getLogger(__name__)
# NOTE: logging is NOT configured here (no basicConfig call). This is a
# library module - global logging configuration (level, format, handlers)
# belongs in app.py, the single entry point. Configuring it here would
# silently override or conflict with whatever app.py sets up.


class Detector:
    """
    Wraps a YOLO model for animal detection.

    The model is loaded exactly once, in __init__. detect() is the only
    method other modules should call.

    Usage
    -----
        detector = Detector()
        detections = detector.detect(frame)
    """

    def __init__(self) -> None:
        """
        Load the YOLO model from Config.MODEL_PATH.

        Raises
        ------
        RuntimeError
            If the model file is missing, corrupt, or fails to load for
            any other reason. This is intentionally fatal at startup -
            the application should not come up with a broken detector.
        """
        model_path = Path(Config.MODEL_PATH)

        if not model_path.exists():
            raise RuntimeError(
                f"YOLO model file not found: '{model_path}'. "
                "Check Config.MODEL_PATH / MODEL_PATH in .env."
            )

        try:
            self._model = YOLO(str(model_path))
        except Exception as e:
            # Ultralytics can raise several different exception types for a
            # corrupt/incompatible weights file; we normalize all of them
            # into one clear RuntimeError rather than leaking library
            # internals to the caller.
            raise RuntimeError(
                f"Failed to load YOLO model from '{model_path}': {e}"
            ) from e

        self._device: Optional[str] = self._resolve_device(Config.DEVICE)
        self._confidence_threshold: float = Config.CONFIDENCE_THRESHOLD
        # Normalized once here (not per-frame) so every comparison in
        # _extract_detections() is guaranteed consistent-case, even if
        # Config.SUPPORTED_ANIMALS is ever edited with inconsistent casing.
        self._supported_animals: set = {
            self._normalize_class_name(animal) for animal in Config.SUPPORTED_ANIMALS
        }

        logger.info(
            "YOLO model loaded from '%s' (device=%s, confidence_threshold=%.2f)",
            model_path,
            self._device if self._device is not None else "auto",
            self._confidence_threshold,
        )
        self._log_class_coverage()

    @staticmethod
    def _resolve_device(configured_device: str) -> Optional[str]:
        """
        Translate Config.DEVICE into a value Ultralytics actually accepts.

        Ultralytics' predict(device=...) does NOT accept the literal string
        "auto" - it expects "cpu", a CUDA index string (e.g. "0"), or None
        (which triggers Ultralytics' own auto GPU-if-available/else-CPU
        selection). Passing "auto" directly fails inference on every call.

        Parameters
        ----------
        configured_device : str
            Config.DEVICE value: "cpu", "cuda", or "auto".

        Returns
        -------
        str or None
            A value safe to pass to model.predict(device=...).
        """
        if configured_device == "auto":
            return None
        if configured_device == "cuda":
            # "0" is Ultralytics' expected format for "first CUDA device".
            # NOTE: this path has not been exercised against real CUDA
            # hardware in development/testing (dev environment is CPU-only) -
            # verify on an actual GPU machine before relying on it for the demo.
            return "0"
        return configured_device  # "cpu"

    def _log_class_coverage(self) -> None:
        """
        Compare the loaded model's class list against Config.SUPPORTED_ANIMALS
        and log which supported animals this model can and cannot detect.

        This surfaces the COCO-class-coverage gap (see module docstring)
        at startup instead of leaving it as a silent runtime mystery.
        """
        model_class_names = {
            self._normalize_class_name(name) for name in self._model.names.values()
        }

        detectable = self._supported_animals & model_class_names
        missing = self._supported_animals - model_class_names

        if detectable:
            logger.info("Model CAN detect: %s", sorted(detectable))
        if missing:
            logger.warning(
                "Model CANNOT detect (not in model's class list): %s. "
                "These will never appear in detection output unless a "
                "custom-trained model with these classes is used.",
                sorted(missing),
            )

    @staticmethod
    def _normalize_class_name(raw_name: str) -> str:
        """
        Normalize a raw YOLO class name for comparison against
        Config.SUPPORTED_ANIMALS (e.g. 'cow' -> 'Cow').

        Parameters
        ----------
        raw_name : str
            The class name as reported by the model (e.g. model.names values).

        Returns
        -------
        str
            Title-cased name, e.g. 'cow' -> 'Cow'.
        """
        return raw_name.strip().title()

    def detect(self, frame: np.ndarray) -> list[dict[str, Any]]:
        """
        Run YOLO detection on a single frame and return filtered,
        clean detections.

        Parameters
        ----------
        frame : np.ndarray
            A single BGR frame, as returned by camera.VideoStream.read().

        Returns
        -------
        list[dict]
            Zero or more detections in the format:
                {
                    "animal": str,
                    "confidence": float,
                    "bbox": [x1, y1, x2, y2],
                    "position": [cx, cy]
                }
            Returns an empty list if the frame is invalid, inference fails,
            or no supported animals are detected above the confidence
            threshold. This method NEVER raises for "no detections" - only
            genuinely invalid input is rejected (see below).

        Notes
        -----
        This method never crashes the caller due to zero detections - an
        empty list is a normal, expected return value, not an error.
        """
        if not self._is_valid_frame(frame):
            logger.warning("detect() received an invalid frame; skipping.")
            return []

        try:
            start = time.perf_counter()
            results = self._model.predict(
                frame,
                conf=self._confidence_threshold,
                device=self._device,
                verbose=False,
            )
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.debug("Inference: %.2f ms", elapsed_ms)
        except Exception as e:
            # Inference failures (e.g. transient device/memory issues) should
            # degrade to "no detections this frame", not crash the pipeline -
            # a live demo cannot afford to die because of one bad frame.
            logger.error("YOLO inference failed on this frame: %s", e)
            return []

        return self._extract_detections(results)

    def _is_valid_frame(self, frame: np.ndarray) -> bool:
        """Return True if frame looks like a usable BGR image array."""
        return (
            isinstance(frame, np.ndarray)
            and frame.ndim == 3
            and frame.shape[0] > 0
            and frame.shape[1] > 0
            and frame.shape[2] == 3
        )

    def _extract_detections(self, results: list) -> list[dict[str, Any]]:
        """
        Convert raw Ultralytics Results objects into the frozen output
        format, filtering out unsupported classes.

        Parameters
        ----------
        results : list
            The list returned by self._model.predict(...) (one Results
            object per input frame; we only ever pass one frame, so we
            use results[0]).

        Returns
        -------
        list[dict]
            Clean detection dicts. See detect() docstring for the schema.
        """
        detections: list[dict[str, Any]] = []

        if not results:
            return detections

        boxes = results[0].boxes
        if boxes is None or len(boxes) == 0:
            return detections

        for box in boxes:
            class_id = int(box.cls[0])
            raw_name = self._model.names.get(class_id, "")
            animal_name = self._normalize_class_name(raw_name)

            # Belt-and-suspenders: predict(conf=...) already filters by
            # confidence, but we re-check explicitly so this method's
            # correctness never silently depends on Ultralytics' internal
            # filtering behavior matching our expectations across versions.
            confidence = float(box.conf[0])
            if confidence < self._confidence_threshold:
                continue

            if animal_name not in self._supported_animals:
                continue

            x1, y1, x2, y2 = (int(v) for v in box.xyxy[0].tolist())
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2

            detections.append(
                {
                    "animal": animal_name,
                    "confidence": round(confidence, 4),
                    "bbox": [x1, y1, x2, y2],
                    "position": [center_x, center_y],
                }
            )

        return detections


if __name__ == "__main__":
    import cv2

    from camera import VideoStream, _display_available

    print("Testing detector.py")

    try:
        detector = Detector()
    except RuntimeError as e:
        print(f"ERROR: Could not initialize Detector: {e}")
        raise SystemExit(1)

    output_dir = Path(Config.OUTPUT_FOLDER)
    output_dir.mkdir(parents=True, exist_ok=True)
    display_available = _display_available()

    if not display_available:
        print(
            "No display detected (headless environment). "
            f"Will save annotated sample frames to '{output_dir}/'."
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
                detections = detector.detect(frame)

                print(
                    f"Frame {frame_count}: {len(detections)} detection(s) - "
                    + ", ".join(
                        f"{d['animal']} ({d['confidence']:.2f})" for d in detections
                    )
                    if detections
                    else f"Frame {frame_count}: 0 detections"
                )

                annotated = frame.copy()
                for det in detections:
                    x1, y1, x2, y2 = det["bbox"]
                    label = f"{det['animal']} {det['confidence']:.2f}"
                    cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(
                        annotated,
                        label,
                        (x1, max(y1 - 10, 0)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 0),
                        2,
                    )

                if display_available:
                    cv2.imshow("Rakshak AI - Detector Test (press 'q' to quit)", annotated)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        print("Quit key pressed. Stopping.")
                        break
                elif frame_count % 30 == 0:
                    snapshot_path = output_dir / f"detector_test_frame_{frame_count}.jpg"
                    cv2.imwrite(str(snapshot_path), annotated)
                    print(f"Saved annotated frame: {snapshot_path}")

        print(f"Done. Total frames processed: {frame_count}")

    except RuntimeError as e:
        print(f"ERROR: {e}")
    finally:
        if display_available:
            cv2.destroyAllWindows()