"""
app.py

FastAPI entry point for the Rakshak AI Vision Module.

Responsibility
--------------
Orchestrate the Vision Module pipeline and expose its output via HTTP.
No detection, tracking, or analysis logic lives here — this file only
wires the modules together and handles HTTP concerns.

Endpoints
---------
GET  /health   Service status, camera connectivity, FPS.
GET  /live     Most recent VisionResponse (no pipeline execution).
POST /detect   Execute the full pipeline; return a new VisionResponse.

Start with:
    uvicorn app:app --reload

TETRA036 | Member 1 - Vision Engineer
"""

import logging
import time
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException

from boundary import BoundaryAnalyzer
from camera import VideoStream
from config import Config
from detector import Detector
from direction import DirectionAnalyzer
from schemas import Detection, HealthResponse, VisionResponse
from tracker import Tracker

# ------------------------------------------------------------------
# Logging — configured once here, the single entry point.
# All library modules use getLogger(__name__) and inherit this.
# ------------------------------------------------------------------
logging.basicConfig(
    level=Config.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# FPS tracker — simple exponential moving average
# ------------------------------------------------------------------

class _FpsTracker:
    """
    Tracks observed pipeline throughput using a rolling window of
    recent frame durations. Thread-safe enough for a single-threaded
    ASGI server; no lock needed.
    """

    def __init__(self, window: int = 30) -> None:
        self._times: deque[float] = deque(maxlen=window)

    def record(self, elapsed_seconds: float) -> None:
        """Record the elapsed time for one pipeline execution."""
        if elapsed_seconds > 0:
            self._times.append(elapsed_seconds)

    @property
    def fps(self) -> float:
        """Return the current FPS estimate, or 0.0 if no data yet."""
        if not self._times:
            return 0.0
        return round(1.0 / (sum(self._times) / len(self._times)), 1)


# ------------------------------------------------------------------
# Lifespan — startup and shutdown
# ------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initialize all pipeline components on startup.
    Release resources on shutdown.

    Raises SystemExit on configuration or model loading failure so
    that a misconfigured server never silently starts serving garbage.
    """
    logger.info("Rakshak AI Vision Module starting up.")

    # 1. Validate configuration — fail fast before touching any hardware.
    try:
        Config.validate()
        logger.info("Configuration validated.")
    except ValueError as e:
        logger.critical("Configuration error: %s", e)
        raise SystemExit(1) from e

    # 2. Load YOLO model — expensive; do it once.
    try:
        detector = Detector()
    except RuntimeError as e:
        logger.critical("Failed to initialize Detector: %s", e)
        raise SystemExit(1) from e

    # 3. Initialize stateless / cheap components.
    tracker = Tracker()

    try:
        boundary_analyzer = BoundaryAnalyzer()
    except ValueError as e:
        logger.critical("Failed to initialize BoundaryAnalyzer: %s", e)
        raise SystemExit(1) from e

    direction_analyzer = DirectionAnalyzer(boundary_analyzer)

    # 4. Open the camera. Both webcam and video stream are held open
    #    for the session. Video files rewind automatically when they
    #    reach the end (handled in _read_frame), so the demo loops
    #    continuously without restarting the server.
    stream = VideoStream()
    try:
        stream.open()
        logger.info(
            "Camera opened in '%s' mode and held open for the session.",
            Config.CAMERA_MODE,
        )
    except RuntimeError as e:
        logger.critical("Failed to open camera: %s", e)
        raise SystemExit(1) from e

    # 5. Store shared state on the app object.
    app.state.detector           = detector
    app.state.tracker            = tracker
    app.state.boundary_analyzer  = boundary_analyzer
    app.state.direction_analyzer = direction_analyzer
    app.state.stream             = stream
    app.state.frame_counter      = 0
    app.state.last_response: VisionResponse | None = None
    app.state.fps_tracker        = _FpsTracker()

    logger.info("All pipeline components initialized. Ready to serve.")

    yield  # Application runs here.

    # ------------------------------------------------------------------
    # Shutdown
    # ------------------------------------------------------------------
    logger.info("Rakshak AI Vision Module shutting down.")
    stream.release()
    logger.info("Camera released.")


# ------------------------------------------------------------------
# FastAPI application
# ------------------------------------------------------------------

app = FastAPI(
    title="Rakshak AI — Vision Module",
    description=(
        "Observation API for the Rakshak AI Farm Decision Support System. "
        "Answers: 'What is happening in front of the camera?'"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ------------------------------------------------------------------
# Pipeline helper
# ------------------------------------------------------------------

def _run_pipeline(
    frame,
    detector: Detector,
    tracker: Tracker,
    boundary_analyzer: BoundaryAnalyzer,
    direction_analyzer: DirectionAnalyzer,
) -> list[dict[str, Any]]:
    """
    Execute the full Vision pipeline on a single frame.

    Returns a list of fully enriched detection dicts, ready for
    schema validation. Returns an empty list on any pipeline stage
    failure (each stage already degrades gracefully).
    """
    raw         = detector.detect(frame)
    tracked     = tracker.update(raw)
    with_boundary = boundary_analyzer.analyze(tracked)
    with_direction = direction_analyzer.analyze(with_boundary)
    return with_direction


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    tags=["System"],
)
def health() -> HealthResponse:
    """
    Return service status, camera connectivity, and observed FPS.

    Always returns 200. Downstream callers can use `status` and
    `camera` fields to determine whether the module is fully operational.
    """
    stream: VideoStream = app.state.stream
    camera_status = "online" if stream.is_opened() else "offline"

    return HealthResponse(
        status="healthy",
        camera=camera_status,
        fps=app.state.fps_tracker.fps,
    )


@app.get(
    "/live",
    response_model=VisionResponse,
    summary="Most recent frame observation",
    tags=["Vision"],
)
def live() -> VisionResponse:
    """
    Return the most recently processed VisionResponse without
    running the pipeline again.

    Returns 503 if no frame has been processed yet (e.g. immediately
    after startup before the first POST /detect call).
    """
    last: VisionResponse | None = app.state.last_response

    if last is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "No frame has been processed yet. "
                "Call POST /detect first."
            ),
        )

    return last


@app.post(
    "/detect",
    response_model=VisionResponse,
    summary="Run detection pipeline on next frame",
    tags=["Vision"],
)
def detect() -> VisionResponse:
    """
    Read one frame from the configured camera source, run the full
    pipeline (detect → track → boundary → direction), and return a
    validated VisionResponse.

    Returns an empty detections list if no supported animals are
    found in the frame — this is not an error.

    Raises 503 if the camera cannot provide a frame (end of video
    file, disconnected webcam, etc.).
    """
    t_start = time.perf_counter()

    # --- Acquire frame ---
    try:
        frame = _read_frame()
    except RuntimeError as e:
        logger.error("Frame acquisition failed: %s", e)
        raise HTTPException(status_code=503, detail=str(e))

    if frame is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "No frame available from the camera source. "
                "The webcam may be unavailable or returning blank frames."
            ),
        )

    # --- Run pipeline ---
    try:
        results = _run_pipeline(
            frame,
            app.state.detector,
            app.state.tracker,
            app.state.boundary_analyzer,
            app.state.direction_analyzer,
        )
    except Exception as e:
        # Defensive catch — each stage already handles its own errors,
        # but we never want an unhandled exception to crash the server.
        logger.exception("Unexpected pipeline error: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline error: {e}",
        )

    # --- Build and validate response ---
    app.state.frame_counter += 1

    try:
        detections = [Detection.model_validate(d) for d in results]
    except Exception as e:
        # Schema validation failure means a pipeline stage produced
        # an unexpected shape. Log it and return empty rather than 500.
        logger.error(
            "Schema validation failed for pipeline output: %s", e
        )
        detections = []

    response = VisionResponse(
        frame_number=app.state.frame_counter,
        timestamp=datetime.now(timezone.utc),
        detections=detections,
    )

    # --- Update shared state ---
    app.state.last_response = response
    elapsed = time.perf_counter() - t_start
    app.state.fps_tracker.record(elapsed)

    logger.debug(
        "Frame %d processed in %.1fms — %d detection(s).",
        app.state.frame_counter,
        elapsed * 1000,
        len(detections),
    )

    return response


# ------------------------------------------------------------------
# Camera read helper
# ------------------------------------------------------------------

def _read_frame():
    """
    Read the next frame from the persistent stream (held open for
    both webcam and video modes).

    Video mode — rewind and retry on end-of-file so the demo loops
    continuously without manual intervention.

    Webcam mode — returns None on a transient read failure; the
    caller converts this to a 503.

    Returns the frame (np.ndarray) or None if unavailable.
    Raises RuntimeError if the stream is not open.
    """
    stream: VideoStream = app.state.stream

    if not stream.is_opened():
        raise RuntimeError(
            "Camera stream is not open. "
            "The camera may have been disconnected."
        )

    frame = stream.read()

    if frame is None and Config.CAMERA_MODE == "video":
        # End of file — reopen to rewind and serve the first frame
        # of the next loop so the demo runs continuously.
        logger.info("End of video file — rewinding for continuous demo.")
        stream.release()
        stream.open()
        frame = stream.read()

    return frame
