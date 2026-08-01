# Rakshak AI — Vision Module

AI-powered observation layer for the Rakshak AI Farm Decision Support System.

**Answers one question: "What is happening in front of the camera?"**

---

## Pipeline

```
Camera → Detector → Tracker → Boundary → Direction → JSON → FastAPI
```

| Stage | File | Responsibility |
|-------|------|----------------|
| Camera | `camera.py` | Read frames from webcam or video file |
| Detector | `detector.py` | YOLO inference, filter to supported animals |
| Tracker | `tracker.py` | ByteTrack multi-object tracking, stable IDs |
| Boundary | `boundary.py` | Check if animal is inside or near crop zone |
| Direction | `direction.py` | Movement direction relative to crop boundary |
| Schema | `schemas.py` | Pydantic v2 models, frozen JSON contract |
| API | `app.py` | FastAPI — orchestrates pipeline, serves results |

---

## Supported Animals

`Cow` · `Buffalo` · `Goat` · `Pig` · `Dog`

---

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Add model weights

Place `yolov8n.pt` (or your custom model) in:
```
vision/weights/yolov8n.pt
```

### 3. Configure

Create a `.env` file in the `vision/` folder:

```env
CAMERA_MODE=video
VIDEO_PATH=test_video/animal.mp4
MODEL_PATH=weights/yolov8n.pt
```

Or for webcam:
```env
CAMERA_MODE=webcam
MODEL_PATH=weights/yolov8n.pt
```

### 4. Run pipeline test

```bash
python test_pipeline.py
```

Expected: `Stages passed: 10/10`

### 5. Start the API server

```bash
uvicorn app:app --reload
```

Open Swagger UI: http://127.0.0.1:8000/docs

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service status, camera state, FPS |
| `POST` | `/detect` | Run pipeline on next frame, return observation |
| `GET` | `/live` | Return last processed observation (no inference) |

---

## JSON Contract

```json
{
  "frame_number": 187,
  "timestamp": "2026-08-01T10:45:22.334751Z",
  "detections": [
    {
      "tracking_id": 3,
      "animal": "Cow",
      "confidence": 0.9241,
      "bbox": [218, 134, 487, 412],
      "position": [352, 273],
      "previous_position": [341, 268],
      "inside_boundary": false,
      "near_boundary": true,
      "direction": "Toward Crop"
    }
  ]
}
```

All field names are **snake_case**. Contract is frozen — do not rename fields.

### Direction values

| Value | Meaning |
|-------|---------|
| `"Toward Crop"` | Animal moving closer to the protected zone |
| `"Away From Crop"` | Animal moving away from the protected zone |
| `"Static"` | No significant movement detected |

> **Note for integration:** The first detection of a new animal track will always show
> `direction: "Static"` and `previous_position: null` because movement calculation
> requires a previous frame to compare against. Call `POST /detect` multiple times
> to observe direction changes.

---

## Folder Structure

```
vision/
├── app.py              FastAPI entry point
├── camera.py           Frame capture
├── config.py           Centralized configuration
├── detector.py         YOLO detection
├── tracker.py          ByteTrack multi-object tracking
├── boundary.py         Crop boundary analysis
├── direction.py        Movement direction engine
├── schemas.py          Pydantic v2 models
├── utils.py            Shared utilities
├── test_pipeline.py    End-to-end pipeline smoke test
├── requirements.txt    Python dependencies
├── .env                Local configuration (not committed)
├── weights/            YOLO model weights
├── test_video/         Demo video files
├── outputs/            Saved frames (optional)
└── docs/
    ├── api_contract.md
    ├── sample_detection.json
    └── sample_no_detection.json
```

---

## Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `CAMERA_MODE` | `webcam` | `webcam` or `video` |
| `CAMERA_INDEX` | `0` | Webcam device index |
| `VIDEO_PATH` | `test_video/sample_farm.mp4` | Path to demo video |
| `MODEL_PATH` | `weights/yolov8n.pt` | YOLO weights file |
| `CONFIDENCE_THRESHOLD` | `0.5` | Minimum detection confidence |
| `DEVICE` | `auto` | `cpu`, `cuda`, or `auto` |
| `BOUNDARY_X1/Y1/X2/Y2` | `100,100,500,400` | Crop zone rectangle (pixels) |
| `NEAR_BOUNDARY_DISTANCE` | `50` | Near-zone threshold (pixels) |
| `MOVEMENT_THRESHOLD` | `2.0` | Min pixel change to register movement |
| `STALE_TRACK_TTL` | `30` | Frames before lost track is discarded |

---

## Module Scope

This module is responsible **only** for observation. It does not implement:
- Threat levels or risk scoring
- Recommendations or decisions
- Alerts, notifications, or actuator control
- Database or dashboard logic

Those responsibilities belong to downstream modules.

---

TETRA036 | Member 1 — Vision Engineer
