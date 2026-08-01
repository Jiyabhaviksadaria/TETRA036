# Rakshak AI — Vision Module (Member 1)

## Role

You are implementing the AI Vision Module only.

Your responsibility ends after producing structured observations.

Do not implement business logic.

---

# Ownership

You own ONLY:

- Camera input
- Video capture
- Animal detection
- Multi-object tracking
- Detection confidence
- Bounding boxes
- Position calculation
- Previous position tracking
- Movement direction
- Vision API (if applicable)

---

# You DO NOT own

Never implement:

- Threat calculation
- Threat score
- Risk assessment
- Recommendations
- Alerts
- Flashlight control
- Speaker control
- Notification logic
- Backend business logic
- Database
- Dashboard
- Decision Engine

Never create files related to these features.

---

# Supported Animals

Only detect:

- Cow
- Buffalo
- Goat
- Pig
- Dog

Ignore every other class.

---

# Frozen Detection Output

The output format below is **frozen**.

Do NOT rename keys.

Do NOT remove keys.

Do NOT add new keys.

```json
{
  "animal": "Cow",
  "confidence": 0.92,
  "bbox": [250,120,500,430],
  "tracking_id": 12,
  "position": [430,280],
  "previous_position": [400,275]
}
```

The following fields are forbidden:

- threat
- threatLevel
- recommendation
- decision
- alert
- explanation
- flashlight
- speaker
- notification

---

# Public Interface

Detector

```python
detect_frame(frame) -> list[dict]
```

Tracker

```python
update_tracks(detections) -> list[dict]
```

---

# Folder Structure

Only modify files inside:

vision/
├── camera.py
├── detector.py
├── tracker.py
├── boundary.py
├── direction.py
├── schemas.py
├── utils.py
├── app.py
└── config.py

Do not create new folders unless explicitly requested.

---

# Coding Rules

- Python 3.11
- PEP 8
- Type hints
- Small functions
- Single Responsibility Principle
- No duplicate code
- Handle exceptions gracefully
- Keep modules independent

---

# Integration Rules

The detector must never import:

- tracker
- boundary
- direction
- decision_engine

The tracker must never import:

- decision_engine

The Vision Module must never depend on backend business logic.

---

# Design Principle

The Vision Module answers only one question:

"What is happening in front of the camera?"

It never answers:

"What should we do?"

---

# Success Criteria

The module should provide:

- Stable detection
- Stable tracking IDs
- Accurate confidence
- Clean bounding boxes
- Movement direction
- Consistent JSON output

Nothing more.