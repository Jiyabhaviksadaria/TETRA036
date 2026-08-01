# Rakshak AI — Vision Module API Contract

## Purpose

The Vision Module is the observation layer of the Rakshak AI Farm Decision Support System. It answers one question:

> **"What is happening in front of the camera?"**

It does not assess threat levels, make recommendations, or control any actuators. That responsibility belongs to downstream modules.

---

## Base URL

```
http://localhost:8000
```

Interactive docs available at `/docs` (Swagger UI) when the server is running.

---

## Endpoints

### `GET /health`

Returns the current service status.

**Response `200 OK`**

```json
{
  "status": "healthy",
  "camera": "online",
  "fps": 28.4
}
```

| Field    | Type    | Description |
|----------|---------|-------------|
| `status` | `string` | Always `"healthy"` when the service is running normally. |
| `camera` | `string` | `"online"` when frames are being read. `"offline"` if the camera source has dropped. |
| `fps`    | `float`  | Observed pipeline throughput in frames per second. `0.0` before the first `/detect` call. |

---

### `POST /detect`

Reads the next frame from the camera, runs the full pipeline, and returns a structured observation.

- Always returns `200 OK` with an empty `detections` array if no supported animals are present.
- Returns `503` if the camera cannot provide a frame.
- Returns `500` on an unexpected internal error.

**Response `200 OK` → `VisionResponse`**

See [Response Structure](#response-structure) below.

---

### `GET /live`

Returns the most recently processed `VisionResponse` without running the pipeline again.

Useful for polling dashboards or downstream modules that need the latest observation without triggering inference.

- Returns `503` if no frame has been processed yet (call `POST /detect` first).

---

## Response Structure

### `VisionResponse`

Top-level wrapper returned by `POST /detect` and `GET /live`.

```json
{
  "frame_number": 187,
  "timestamp": "2026-08-01T10:45:22.334751Z",
  "detections": [ ... ]
}
```

| Field          | Type               | Description |
|----------------|--------------------|-------------|
| `frame_number` | `integer`          | Monotonically increasing counter since the module started. Resets on server restart. |
| `timestamp`    | `string` (ISO 8601 UTC) | UTC timestamp of when the frame was processed. |
| `detections`   | `array[Detection]` | All tracked animals in this frame. Empty array if none detected. |

---

### `Detection`

One entry per tracked animal in the frame.

```json
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
```

| Field               | Type              | Description |
|---------------------|-------------------|-------------|
| `tracking_id`       | `integer`         | Stable ID assigned by ByteTrack. Consistent across frames for the same physical animal until the track is lost. |
| `animal`            | `string`          | Detected species. One of: `Cow`, `Buffalo`, `Goat`, `Pig`, `Dog`. |
| `confidence`        | `float` (0.0–1.0) | YOLO detection confidence score. |
| `bbox`              | `[x1, y1, x2, y2]` | Bounding box in pixels. Top-left corner `(x1, y1)` to bottom-right `(x2, y2)`. |
| `position`          | `[cx, cy]`        | Center of the bounding box in pixels. |
| `previous_position` | `[cx, cy]` or `null` | Center from the previous frame. `null` on the animal's first appearance. |
| `inside_boundary`   | `boolean`         | `true` if the animal's center is inside the protected crop zone. |
| `near_boundary`     | `boolean`         | `true` if the animal is outside but within `NEAR_BOUNDARY_DISTANCE` pixels of the zone. Mutually exclusive with `inside_boundary`. |
| `direction`         | `string`          | Movement relative to the crop boundary. One of: `Toward Crop`, `Away From Crop`, `Static`. |

---

## Supported Animals

Only the following species are detected and reported. All other YOLO classes are silently ignored.

- Cow
- Buffalo
- Goat
- Pig
- Dog

---

## Direction Values

| Value            | Meaning |
|------------------|---------|
| `"Toward Crop"`  | Animal's distance to the boundary decreased between the last two frames. |
| `"Away From Crop"` | Animal's distance to the boundary increased between the last two frames. |
| `"Static"`       | No significant movement detected, or first appearance (no prior frame to compare). |

---

## Boundary Logic

| State | `inside_boundary` | `near_boundary` |
|-------|-------------------|-----------------|
| Inside the crop zone | `true` | `false` |
| Outside, within threshold | `false` | `true` |
| Outside, beyond threshold | `false` | `false` |

`inside_boundary` and `near_boundary` are **mutually exclusive**. An animal can never be both.

---

## Example Responses

### With detections

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
    },
    {
      "tracking_id": 7,
      "animal": "Dog",
      "confidence": 0.8103,
      "bbox": [54, 310, 162, 428],
      "position": [108, 369],
      "previous_position": [112, 374],
      "inside_boundary": false,
      "near_boundary": false,
      "direction": "Away From Crop"
    }
  ]
}
```

### No animals detected

```json
{
  "frame_number": 188,
  "timestamp": "2026-08-01T10:45:22.701843Z",
  "detections": []
}
```

---

## Error Responses

| Status | Condition |
|--------|-----------|
| `503`  | Camera unavailable, webcam disconnected, or no frame processed yet (`GET /live`). |
| `500`  | Unexpected internal pipeline error. |

Error body:

```json
{
  "detail": "Human-readable error message."
}
```

---

## Integration Notes

**For backend / Decision Engine:**
- Poll `POST /detect` at your desired rate to drive the pipeline.
- Use `GET /live` for read-only access to the latest observation without triggering inference.
- A response with `detections: []` is valid and means the scene is clear — handle it gracefully.
- `tracking_id` is stable within a session but **resets on server restart**. Do not persist it across sessions.
- `previous_position: null` means the animal just entered the frame. Do not attempt to compute direction from a null previous position — the `direction` field already accounts for this (`"Static"`).

**For frontend / dashboard:**
- `inside_boundary: true` is the highest-priority state — the animal is in the crop zone.
- `near_boundary: true` is a warning state — the animal is approaching.
- Use `direction` to show movement arrows or status labels.
- The `bbox` and `position` fields map directly to pixel coordinates of the camera feed for overlay rendering.

**Forbidden fields** — the following will never appear in Vision Module output:
`threat`, `threat_level`, `recommendation`, `decision`, `alert`, `flashlight`, `speaker`, `notification`

---

## Versioning

Current contract version: **1.0.0**

All field names are frozen. Do not rename or remove fields without a coordinated version bump across all consuming modules.
