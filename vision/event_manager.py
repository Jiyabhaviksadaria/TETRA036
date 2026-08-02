"""
event_manager.py

Hardware Trigger & Event State Machine for the Rakshak AI Vision Module.

Responsibility
--------------
Manage the system state machine that gates camera and pipeline activity.
The Vision Module should NOT run continuously — it wakes on a motion
trigger and returns to sleep after the event is fully processed.

State Machine
-------------

    ┌──────────┐   motion trigger    ┌────────┐
    │ WAITING  │ ─────────────────→  │ ACTIVE │
    └──────────┘                     └────────┘
         ↑                               │
         │                               │ camera opened, pipeline starts
         │                               ↓
         │                          ┌────────────┐
         │    complete() called      │ PROCESSING │
         └─────────────────────────  └────────────┘
                                          │
                                          │ pipeline done
                                          ↓
                                     ┌──────────┐
                                     │ COMPLETE │
                                     └──────────┘
                                          │
                                          │ auto-reset to WAITING
                                          ↓
                                     ┌──────────┐
                                     │ WAITING  │ (next cycle)
                                     └──────────┘

Trigger sources
---------------
Mode 1 — Hardware (ESP32 / Arduino Nano ESP32):
    ESP32 POSTs to POST /sensor-trigger:
    {
        "event":     "motion_detected",
        "sensor":    "PIR",
        "location":  "north_boundary",
        "timestamp": "12:30"
    }

Mode 2 — Demo / Hackathon simulation:
    POST /sensor-trigger with minimal body:
    {
        "motion":     true,
        "sensor_id":  "farm_01"
    }
    This simulates the PIR firing, so a button in the frontend can
    trigger the full flow without any real hardware.

Design constraints
------------------
- Does NOT touch YOLO, ByteTrack, boundary, direction, or decision engine.
- Does NOT change the VisionResponse JSON contract.
- Thread-safe enough for a single-worker ASGI server (no asyncio locks
  needed; FastAPI serialises concurrent requests in a single thread by
  default for sync routes).

TETRA036 | Member 1 - Vision Engineer
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# State enum
# ---------------------------------------------------------------------------

class SystemState(str, Enum):
    """
    Four states the Vision Module can be in at any point.

    WAITING    — low-power idle; camera is closed; no pipeline running.
    ACTIVE     — motion trigger received; camera is being opened.
    PROCESSING — camera open; pipeline executing frame-by-frame.
    COMPLETE   — event processing finished; results ready; resetting soon.
    """
    WAITING    = "WAITING"
    ACTIVE     = "ACTIVE"
    PROCESSING = "PROCESSING"
    COMPLETE   = "COMPLETE"


# ---------------------------------------------------------------------------
# Motion event payload
# ---------------------------------------------------------------------------

class MotionEvent:
    """
    Normalised motion trigger payload.

    Accepts both the hardware format (event/sensor/location/timestamp)
    and the demo format (motion/sensor_id) and normalises them into one
    consistent object so the rest of the system does not need to branch.
    """

    def __init__(
        self,
        sensor_id: str = "unknown",
        location: str  = "unknown",
        source: str    = "demo",          # "hardware" | "demo"
        raw: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.sensor_id  = sensor_id
        self.location   = location
        self.source     = source
        self.received_at: datetime = datetime.now(timezone.utc)
        self.raw        = raw or {}

    @classmethod
    def from_hardware_payload(cls, payload: Dict[str, Any]) -> "MotionEvent":
        """
        Parse an ESP32 / Arduino hardware trigger payload.

        Expected shape:
        {
            "event":     "motion_detected",
            "sensor":    "PIR",
            "location":  "north_boundary",
            "timestamp": "12:30"
        }
        """
        return cls(
            sensor_id = payload.get("sensor", "PIR"),
            location  = payload.get("location", "unknown"),
            source    = "hardware",
            raw       = payload,
        )

    @classmethod
    def from_demo_payload(cls, payload: Dict[str, Any]) -> "MotionEvent":
        """
        Parse a demo / simulated trigger payload.

        Expected shape:
        {
            "motion":    true,
            "sensor_id": "farm_01"
        }
        """
        return cls(
            sensor_id = payload.get("sensor_id", "demo_sensor"),
            location  = payload.get("location", "simulated"),
            source    = "demo",
            raw       = payload,
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sensor_id":   self.sensor_id,
            "location":    self.location,
            "source":      self.source,
            "received_at": self.received_at.isoformat(),
        }


# ---------------------------------------------------------------------------
# Event Manager
# ---------------------------------------------------------------------------

class EventManager:
    """
    Central state machine that controls when the camera and pipeline run.

    The Vision Module's app.py holds a single EventManager instance and
    consults it before every camera or pipeline operation.

    Typical call sequence
    ---------------------
    1. trigger(event)        → WAITING → ACTIVE
    2. mark_processing()     → ACTIVE  → PROCESSING  (camera now open)
    3. mark_complete()       → PROCESSING → COMPLETE (pipeline done)
    4. reset()               → COMPLETE → WAITING    (called automatically
                                                       by mark_complete)
    """

    def __init__(self) -> None:
        self._state: SystemState = SystemState.WAITING
        self._current_event: Optional[MotionEvent] = None
        self._event_count: int = 0
        logger.info("EventManager initialised — state: %s", self._state)

    # ------------------------------------------------------------------
    # State transitions
    # ------------------------------------------------------------------

    def trigger(self, event: MotionEvent) -> None:
        """
        Accept an incoming motion event and move to ACTIVE.

        Ignores duplicate triggers while already active or processing —
        the system is already awake, so there is nothing to do.

        Parameters
        ----------
        event : MotionEvent
            Normalised motion event from hardware or demo source.
        """
        if self._state != SystemState.WAITING:
            logger.info(
                "Trigger received but system already in state '%s' — ignored.",
                self._state,
            )
            return

        self._current_event = event
        self._event_count  += 1
        self._state         = SystemState.ACTIVE

        logger.info(
            "Motion trigger received (event #%d) — "
            "sensor=%s, location=%s, source=%s — state: WAITING → ACTIVE",
            self._event_count,
            event.sensor_id,
            event.location,
            event.source,
        )

    def mark_processing(self) -> None:
        """
        Signal that the camera is open and the pipeline is running.
        Moves ACTIVE → PROCESSING.
        """
        if self._state != SystemState.ACTIVE:
            logger.warning(
                "mark_processing() called from state '%s' — expected ACTIVE.",
                self._state,
            )
            return

        self._state = SystemState.PROCESSING
        logger.info("Camera active — state: ACTIVE → PROCESSING")

    def mark_complete(self) -> None:
        """
        Signal that the event pipeline has finished.
        Moves PROCESSING → COMPLETE, then immediately resets to WAITING.

        Auto-reset is intentional: for a hackathon demo the system should
        be immediately ready for the next trigger without manual intervention.
        """
        if self._state != SystemState.PROCESSING:
            logger.warning(
                "mark_complete() called from state '%s' — expected PROCESSING.",
                self._state,
            )
            return

        self._state = SystemState.COMPLETE
        logger.info("Pipeline complete — state: PROCESSING → COMPLETE")
        self.reset()

    def reset(self) -> None:
        """
        Return to WAITING state and clear the current event.
        Called automatically by mark_complete(). Can also be called
        manually to abort an in-progress event.
        """
        prev = self._state
        self._state         = SystemState.WAITING
        self._current_event = None
        logger.info("Reset — state: %s → WAITING (ready for next trigger)", prev)

    # ------------------------------------------------------------------
    # State queries
    # ------------------------------------------------------------------

    @property
    def state(self) -> SystemState:
        """Current system state (read-only)."""
        return self._state

    @property
    def is_waiting(self) -> bool:
        return self._state == SystemState.WAITING

    @property
    def is_active(self) -> bool:
        return self._state == SystemState.ACTIVE

    @property
    def is_processing(self) -> bool:
        return self._state == SystemState.PROCESSING

    @property
    def is_complete(self) -> bool:
        return self._state == SystemState.COMPLETE

    @property
    def can_accept_trigger(self) -> bool:
        """True only in WAITING — the camera is closed and idle."""
        return self._state == SystemState.WAITING

    @property
    def camera_should_be_open(self) -> bool:
        """True when the camera must be open (ACTIVE or PROCESSING)."""
        return self._state in (SystemState.ACTIVE, SystemState.PROCESSING)

    @property
    def current_event(self) -> Optional[MotionEvent]:
        """The MotionEvent that caused the current activation, or None."""
        return self._current_event

    @property
    def event_count(self) -> int:
        """Total number of motion events processed since startup."""
        return self._event_count

    def status_dict(self) -> Dict[str, Any]:
        """
        Serialisable snapshot of current state — used by GET /trigger-status.
        """
        return {
            "state":       self._state.value,
            "event_count": self._event_count,
            "current_event": (
                self._current_event.to_dict()
                if self._current_event else None
            ),
        }
