"""
TimelineStore — append-only incident timeline with JSON file persistence.
"""
from __future__ import annotations

import json
import logging
from typing import List

from backend.models import IncidentRecord

logger = logging.getLogger(__name__)


class TimelineStore:
    def __init__(self, path: str = "timeline.json") -> None:
        self._path = path
        self._records: List[IncidentRecord] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def load(self) -> None:
        """Load timeline from disk on startup. Silently starts empty on any error."""
        try:
            with open(self._path, "r", encoding="utf-8") as f:
                raw = json.load(f)
            self._records = [IncidentRecord(**entry) for entry in raw]
            logger.info("Loaded %d incidents from %s", len(self._records), self._path)
        except FileNotFoundError:
            logger.info("No existing %s — starting with empty timeline.", self._path)
        except (json.JSONDecodeError, Exception) as exc:
            logger.warning("Could not load %s (%s) — starting with empty timeline.", self._path, exc)

    def append(self, record: IncidentRecord) -> None:
        """Append a new incident and persist to disk."""
        self._records.append(record)
        self._persist()

    def update_action(self, incident_id: str, action: str) -> bool:
        """
        Update farmer_action on the matching incident.
        Returns True if found and updated, False if not found.
        """
        for record in self._records:
            if record.id == incident_id:
                record.farmer_action = action
                self._persist()
                return True
        return False

    def all(self) -> List[IncidentRecord]:
        """Return all incidents in reverse-chronological order (newest first)."""
        return list(reversed(self._records))

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _persist(self) -> None:
        """Write the current timeline to disk. Logs and swallows I/O errors."""
        try:
            data = [r.model_dump(mode="json") for r in self._records]
            with open(self._path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except (IOError, OSError) as exc:
            logger.error("Failed to persist timeline to %s: %s", self._path, exc)
