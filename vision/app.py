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
GET  /health          Service status, camera connectivity, FPS.
GET  /live            Most recent VisionResponse (no pipeline execution).
POST /detect          Execute the full pipeline; return a new VisionResponse.
POST /sensor-trigger  Receive PIR motion trigger (hardware or demo).
GET  /trigger-status  Current EventManager state (for dashboard polling).

Trigger flow
------------
WAITING → (POST /sensor-trigger) → ACTIVE → camera opens
        → (POST /detect)         → PROCESSING → pipeline runs
        → result returned        → COMPLETE → WAITING (auto-reset)

The camera is NOT held open permanently. It opens on trigger and is
released after the event completes, matching the low-power design intent.

Start with:
    uvicorn app:app --reload

TETRA036 | Member 1 - Vision Engineer
"""

import logging
import time
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from boundary import BoundaryAnalyzer
from camera import VideoStream
from config import Config
from detector import Detector
from direction import DirectionAnalyzer
from event_manager import EventManager, MotionEvent, SystemState
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

    KEY CHANGE from original: the camera is NOT opened here.
    It opens only when a motion trigger is received (POST /sensor-trigger)
    and is released after each event completes. This matches the
    low-power, event-driven hardware design.

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

    # 2. Load YOLO model — expensive; do it once at startup.
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

    # 4. Camera stream object is created but NOT opened yet.
    #    It will be opened by _open_camera() when a trigger fires
    #    and closed by _close_camera() after the event completes.
    stream = VideoStream()

    # 5. Event manager — controls the WAITING/ACTIVE/PROCESSING/COMPLETE
    #    state machine that gates all camera and pipeline operations.
    event_manager = EventManager()

    # 6. Store shared state on the app object.
    app.state.detector           = detector
    app.state.tracker            = tracker
    app.state.boundary_analyzer  = boundary_analyzer
    app.state.direction_analyzer = direction_analyzer
    app.state.stream             = stream
    app.state.event_manager      = event_manager
    app.state.frame_counter      = 0
    app.state.last_response: VisionResponse | None = None
    app.state.fps_tracker        = _FpsTracker()

    logger.info(
        "All pipeline components initialized. "
        "Camera is CLOSED — waiting for motion trigger."
    )

    yield  # Application runs here.

    # ------------------------------------------------------------------
    # Shutdown — release camera if somehow still open.
    # ------------------------------------------------------------------
    logger.info("Rakshak AI Vision Module shutting down.")
    if stream.is_opened():
        stream.release()
        logger.info("Camera released on shutdown.")


# ------------------------------------------------------------------
# FastAPI application
# ------------------------------------------------------------------

app = FastAPI(
    title="Rakshak AI — Vision Module",
    description=(
        "Observation API for the Rakshak AI Farm Decision Support System. "
        "Answers: 'What is happening in front of the camera?' "
        "Camera activates only on PIR motion trigger."
    ),
    version="1.1.0",
    lifespan=lifespan,
)

# Allow the frontend (Next.js) and backend service to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic schemas for the new trigger endpoints
# ---------------------------------------------------------------------------

class SensorTriggerRequest(BaseModel):
    """
    POST /sensor-trigger — unified body accepted from both sources.

    Hardware (ESP32) sends:
        { "event": "motion_detected", "sensor": "PIR",
          "location": "north_boundary", "timestamp": "12:30" }

    Demo / frontend button sends:
        { "motion": true, "sensor_id": "farm_01" }

    Both shapes are valid. The EventManager normalises them internally.
    """
    # Demo fields
    motion:    Optional[bool]  = None
    sensor_id: Optional[str]   = None

    # Hardware fields
    event:     Optional[str]   = None
    sensor:    Optional[str]   = None
    location:  Optional[str]   = None
    timestamp: Optional[str]   = None


class SensorTriggerResponse(BaseModel):
    """Response returned by POST /sensor-trigger."""
    status:       str            # "camera_started" | "already_active" | "ignored"
    state:        str            # current EventManager state
    event_count:  int
    trigger_info: Dict[str, Any]


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
# Camera lifecycle helpers (called by trigger & detect endpoints)
# ------------------------------------------------------------------

def _open_camera() -> None:
    """
    Open the camera stream. Called when a motion trigger transitions
    the system to ACTIVE. Safe to call if already open (no-op).
    """
    stream: VideoStream = app.state.stream
    if stream.is_opened():
        return
    try:
        stream.open()
        logger.info("Camera opened after motion trigger.")
    except RuntimeError as e:
        logger.error("Failed to open camera after trigger: %s", e)
        raise


def _close_camera() -> None:
    """
    Release the camera stream. Called after an event pipeline completes
    or is aborted. Returns the system to low-power WAITING state.
    """
    stream: VideoStream = app.state.stream
    if stream.is_opened():
        stream.release()
        logger.info("Camera released — returning to WAITING state.")


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------

@app.post(
    "/sensor-trigger",
    response_model=SensorTriggerResponse,
    summary="Receive PIR motion trigger (hardware or demo)",
    tags=["Trigger"],
)
def sensor_trigger(payload: SensorTriggerRequest) -> SensorTriggerResponse:
    """
    Entry point for motion events.

    **Hardware mode** — ESP32 POSTs when PIR fires:
    ```json
    { "event": "motion_detected", "sensor": "PIR",
      "location": "north_boundary", "timestamp": "12:30" }
    ```

    **Demo mode** — frontend button simulates PIR:
    ```json
    { "motion": true, "sensor_id": "farm_01" }
    ```

    If the system is already ACTIVE or PROCESSING (a previous event is
    still being handled), the trigger is acknowledged but ignored —
    returns `status: "already_active"`.

    On success the camera opens immediately and the system moves to
    ACTIVE, ready for `POST /detect` calls.
    """
    em: EventManager = app.state.event_manager

    # --- Already awake? ---
    if not em.can_accept_trigger:
        logger.info(
            "Trigger received but system is already %s — ignoring.", em.state
        )
        return SensorTriggerResponse(
            status="already_active",
            state=em.state.value,
            event_count=em.event_count,
            trigger_info=payload.model_dump(exclude_none=True),
        )

    # --- Normalise payload into a MotionEvent ---
    raw = payload.model_dump(exclude_none=True)

    # Detect hardware payload by presence of "event" key
    if payload.event == "motion_detected" or payload.sensor:
        motion_event = MotionEvent.from_hardware_payload(raw)
    else:
        # Demo / frontend button
        motion_event = MotionEvent.from_demo_payload(raw)

    # --- Transition WAITING → ACTIVE ---
    em.trigger(motion_event)

    # --- Open camera ---
    try:
        _open_camera()
    except RuntimeError as e:
        # Camera failed — reset state machine so we don't get stuck
        em.reset()
        raise HTTPException(
            status_code=503,
            detail=f"Motion trigger received but camera failed to open: {e}",
        )

    # --- Transition ACTIVE → PROCESSING ---
    em.mark_processing()

    logger.info(
        "Camera started. System ready for POST /detect calls. "
        "Source: %s | Sensor: %s | Location: %s",
        motion_event.source,
        motion_event.sensor_id,
        motion_event.location,
    )

    return SensorTriggerResponse(
        status="camera_started",
        state=em.state.value,
        event_count=em.event_count,
        trigger_info=motion_event.to_dict(),
    )


@app.get(
    "/trigger-status",
    summary="Current EventManager state",
    tags=["Trigger"],
)
def trigger_status() -> Dict[str, Any]:
    """
    Poll current system state. Used by the frontend dashboard to show
    whether the system is sleeping or active, and by the hardware ESP32
    to confirm its trigger was received.

    Returns the EventManager status dict:
    ```json
    {
        "state":         "WAITING",
        "event_count":   3,
        "current_event": null
    }
    ```
    """
    em: EventManager = app.state.event_manager
    return em.status_dict()


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

    **Trigger-gated**: this endpoint requires a prior POST /sensor-trigger
    to have moved the system to PROCESSING state. If called while WAITING
    it returns 425 (Too Early) so the caller knows to trigger first.

    After returning, the event is marked COMPLETE and the camera is
    released — the system returns to WAITING automatically, ready for
    the next PIR trigger.

    Returns an empty detections list if no supported animals are
    found in the frame — this is not an error.
    """
    em: EventManager = app.state.event_manager

    # --- Guard: camera must have been triggered ---
    if not em.camera_should_be_open:
        raise HTTPException(
            status_code=425,
            detail=(
                f"System is in state '{em.state.value}'. "
                "Send POST /sensor-trigger first to activate the camera, "
                "then call POST /detect."
            ),
        )

    t_start = time.perf_counter()

    # --- Acquire frame ---
    try:
        frame = _read_frame()
    except RuntimeError as e:
        logger.error("Frame acquisition failed: %s", e)
        # Camera failed mid-event — reset so the system isn't stuck
        _close_camera()
        em.reset()
        raise HTTPException(status_code=503, detail=str(e))

    if frame is None:
        # Camera gave no frame — release and reset state machine
        _close_camera()
        em.reset()
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
        _close_camera()
        em.reset()
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

    # --- Event complete: release camera, reset to WAITING ---
    # mark_complete() transitions PROCESSING → COMPLETE → WAITING automatically.
    em.mark_complete()
    _close_camera()

    logger.info(
        "Event complete. Camera released. System back to WAITING. "
        "Detections this event: %d",
        len(detections),
    )

    return response


# ------------------------------------------------------------------
# Camera read helper
# ------------------------------------------------------------------

def _read_frame():
    """
    Read the next frame from the stream.

    The stream is opened on demand by _open_camera() when a trigger fires
    and must be open when this function is called.

    Video mode — rewinds on end-of-file and returns the first frame of
    the next loop, so the demo works continuously without manual reset.

    Webcam mode — returns None on a transient read failure.

    Returns the frame (np.ndarray) or None if unavailable.
    Raises RuntimeError if the stream is not open.
    """
    stream: VideoStream = app.state.stream

    if not stream.is_opened():
        raise RuntimeError(
            "Camera stream is not open. "
            "POST /sensor-trigger must be called first."
        )

    frame = stream.read()

    if frame is None and Config.CAMERA_MODE == "video":
        # End of video file during an active event — rewind and retry
        # so the hackathon demo loops continuously.
        logger.info("End of video file during event — rewinding.")
        stream.release()
        stream.open()
        frame = stream.read()

    return frame
