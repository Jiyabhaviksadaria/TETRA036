"""
test_pipeline.py

End-to-end pipeline smoke test for the Rakshak AI Vision Module.

Runs every stage in sequence on a single real frame and prints the
result. If this script passes, the full pipeline is wired correctly
and the FastAPI server will work.

Usage
-----
    python test_pipeline.py

Exit codes
----------
    0  All stages passed.
    1  One or more stages failed (details printed to stdout).

TETRA036 | Member 1 - Vision Engineer
"""

import json
import sys
import traceback
from datetime import datetime, timezone

# ── Colour helpers (no dependencies) ──────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def ok(msg: str)   -> None: print(f"  {GREEN}✓{RESET}  {msg}")
def fail(msg: str) -> None: print(f"  {RED}✗{RESET}  {msg}")
def warn(msg: str) -> None: print(f"  {YELLOW}⚠{RESET}  {msg}")
def header(msg: str) -> None: print(f"\n{BOLD}{msg}{RESET}")


def run() -> bool:
    """
    Execute all pipeline stages in order.
    Returns True if every mandatory stage passed, False otherwise.
    """
    passed = 0
    failed = 0

    # ------------------------------------------------------------------
    # Stage 0 — Configuration
    # ------------------------------------------------------------------
    header("Stage 0 · Configuration")
    try:
        from config import Config
        Config.validate()
        ok(f"Config validated  "
           f"(mode={Config.CAMERA_MODE}, "
           f"model={Config.MODEL_PATH}, "
           f"device={Config.DEVICE})")
        passed += 1
    except Exception as e:
        fail(f"Config.validate() raised: {e}")
        failed += 1
        # Config is a hard dependency — nothing else can run without it.
        _print_summary(passed, failed)
        return False

    # ------------------------------------------------------------------
    # Stage 1 — Camera
    # ------------------------------------------------------------------
    header("Stage 1 · Camera")
    frame = None
    stream = None
    try:
        from camera import VideoStream
        stream = VideoStream()
        stream.open()
        ok(f"VideoStream opened  (mode={Config.CAMERA_MODE})")
        passed += 1
    except Exception as e:
        fail(f"VideoStream.open() raised: {e}")
        failed += 1
        _print_summary(passed, failed)
        return False

    try:
        frame = stream.read()
        if frame is None:
            warn("stream.read() returned None — video may be empty or at EOF.")
            warn("Continuing with a blank frame to test remaining stages.")
            import numpy as np
            frame = np.zeros((480, 640, 3), dtype="uint8")
        else:
            ok(f"Frame read  (shape={frame.shape}, dtype={frame.dtype})")
            passed += 1
    except Exception as e:
        fail(f"VideoStream.read() raised: {e}")
        failed += 1
    finally:
        # Always release — we only need one frame.
        stream.release()
        ok("VideoStream released.")

    if frame is None:
        fail("No frame available; cannot continue.")
        _print_summary(passed, failed)
        return False

    # ------------------------------------------------------------------
    # Stage 2 — Detector
    # ------------------------------------------------------------------
    header("Stage 2 · Detector  (YOLO inference)")
    raw_detections = []
    try:
        from detector import Detector
        detector = Detector()
        ok(f"Detector initialized  (model={Config.MODEL_PATH})")
        passed += 1
    except Exception as e:
        fail(f"Detector.__init__() raised: {e}")
        traceback.print_exc()
        failed += 1
        _print_summary(passed, failed)
        return False

    try:
        raw_detections = detector.detect(frame)
        ok(f"detector.detect()  → {len(raw_detections)} raw detection(s)")
        for d in raw_detections:
            print(f"       {d['animal']}  conf={d['confidence']:.4f}  "
                  f"bbox={d['bbox']}  pos={d['position']}")
        passed += 1
    except Exception as e:
        fail(f"detector.detect() raised: {e}")
        failed += 1

    # ------------------------------------------------------------------
    # Stage 3 — Tracker
    # ------------------------------------------------------------------
    header("Stage 3 · Tracker  (ByteTrack)")
    tracked = []
    try:
        from tracker import Tracker
        tracker = Tracker()
        tracked = tracker.update(raw_detections)
        ok(f"tracker.update()  → {len(tracked)} tracked detection(s)")
        for t in tracked:
            print(f"       tracking_id={t['tracking_id']}  "
                  f"{t['animal']}  conf={t['confidence']:.4f}  "
                  f"pos={t['position']}")
        passed += 1
    except Exception as e:
        fail(f"Tracker raised: {e}")
        failed += 1

    # ------------------------------------------------------------------
    # Stage 4 — Boundary Analyzer
    # ------------------------------------------------------------------
    header("Stage 4 · Boundary Analyzer")
    with_boundary = []
    try:
        from boundary import BoundaryAnalyzer
        boundary_analyzer = BoundaryAnalyzer()
        ok(f"BoundaryAnalyzer initialized  "
           f"(boundary={Config.CROP_BOUNDARY}, "
           f"near_threshold={Config.NEAR_BOUNDARY_DISTANCE}px)")
        with_boundary = boundary_analyzer.analyze(tracked)
        ok(f"boundary_analyzer.analyze()  → {len(with_boundary)} result(s)")
        for b in with_boundary:
            print(f"       tracking_id={b['tracking_id']}  "
                  f"inside={b['inside_boundary']}  "
                  f"near={b['near_boundary']}")
        passed += 1
    except Exception as e:
        fail(f"BoundaryAnalyzer raised: {e}")
        failed += 1

    # ------------------------------------------------------------------
    # Stage 5 — Direction Analyzer
    # ------------------------------------------------------------------
    header("Stage 5 · Direction Analyzer")
    with_direction = []
    try:
        from direction import DirectionAnalyzer
        # boundary_analyzer must already exist from Stage 4.
        direction_analyzer = DirectionAnalyzer(boundary_analyzer)
        with_direction = direction_analyzer.analyze(with_boundary)
        ok(f"direction_analyzer.analyze()  → {len(with_direction)} result(s)")
        for d in with_direction:
            print(f"       tracking_id={d['tracking_id']}  "
                  f"direction={d['direction']}  "
                  f"prev={d['previous_position']}")
        passed += 1
    except Exception as e:
        fail(f"DirectionAnalyzer raised: {e}")
        failed += 1

    # ------------------------------------------------------------------
    # Stage 6 — Schema Validation
    # ------------------------------------------------------------------
    header("Stage 6 · Schema Validation  (Pydantic)")
    validated_detections = []
    try:
        from schemas import Detection, VisionResponse
        for d in with_direction:
            validated_detections.append(Detection.model_validate(d))
        ok(f"Detection.model_validate()  → "
           f"{len(validated_detections)} detection(s) validated")
        passed += 1
    except Exception as e:
        fail(f"Schema validation raised: {e}")
        failed += 1

    # ------------------------------------------------------------------
    # Stage 7 — Final JSON Output
    # ------------------------------------------------------------------
    header("Stage 7 · Final VisionResponse JSON")
    try:
        from schemas import VisionResponse
        response = VisionResponse(
            frame_number=1,
            timestamp=datetime.now(timezone.utc),
            detections=validated_detections,
        )
        output = json.loads(response.model_dump_json())
        ok("VisionResponse assembled and serialized successfully.")
        passed += 1

        print(f"\n{BOLD}── JSON Output ──────────────────────────────────────{RESET}")
        print(json.dumps(output, indent=2, default=str))
        print(f"{BOLD}─────────────────────────────────────────────────────{RESET}")

        if not output["detections"]:
            warn("detections is empty — no supported animals in this frame.")
            warn("This is valid. Try with a video containing animals to "
                 "verify the full detection path.")
    except Exception as e:
        fail(f"VisionResponse assembly raised: {e}")
        failed += 1

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    _print_summary(passed, failed)
    return failed == 0


def _print_summary(passed: int, failed: int) -> None:
    total = passed + failed
    header("Summary")
    print(f"  Stages passed : {GREEN}{passed}/{total}{RESET}")
    if failed:
        print(f"  Stages failed : {RED}{failed}/{total}{RESET}")
        print(f"\n  {RED}{BOLD}Pipeline NOT ready.{RESET} Fix the failures above "
              f"before starting the FastAPI server.")
    else:
        print(f"\n  {GREEN}{BOLD}All stages passed.{RESET} "
              f"The pipeline is ready — run the FastAPI server with:")
        print(f"  {BOLD}uvicorn app:app --reload{RESET}\n")


if __name__ == "__main__":
    print(f"{BOLD}Rakshak AI — Vision Module Pipeline Test{RESET}")
    print(f"{'─' * 50}")
    success = run()
    sys.exit(0 if success else 1)
