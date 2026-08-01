# Decision Engine API Contract (Frozen)

This document defines the frozen API contract between the **Backend** and the **Explainable Decision Engine (EDE)**.

## 1. Input Contract (Backend → Decision Engine)

```json
{
  "animal": "Cow",
  "confidence": 0.92,
  "distance": 35.0,
  "direction": "Toward Crop",
  "time": "Night",
  "inside_crop_region": true
}
```

### Fields Description

| Field | Type | Required | Description / Enum Values |
|---|---|---|---|
| `animal` | `string` | Yes | Species of the detected animal. E.g. `"Cow"`, `"Buffalo"`, `"Wild Boar"`, `"Elephant"`, `"Bird"`, `"Dog"`, `"Human"`, `"Unknown"` |
| `confidence` | `float` | Yes | Confidence score from the Vision Module (0.0 to 1.0) |
| `distance` | `float` | Yes | Calculated distance from the protected crop boundary (in generic units/pixels/meters) |
| `direction` | `string` | Yes | `"Toward Crop"`, `"Away From Crop"`, `"Stationary"` |
| `time` | `string` | Yes | `"Day"`, `"Night"` |
| `inside_crop_region` | `boolean` | Yes | Whether the animal's bounding box intersects the user-marked crop boundary |

---

## 2. Output Contract (Decision Engine → Backend)

```json
{
  "observation": {
    "animal": "Cow",
    "confidence": 0.92
  },
  "assessment": {
    "threat_score": 13,
    "threat_level": "HIGH"
  },
  "response": {
    "recommended_action": "Flash Light + Speaker",
    "farmer_override": true
  },
  "reason": [
    "Large Animal",
    "Moving Toward Crop",
    "Near Crop",
    "Night Time",
    "Inside Protected Region"
  ],
  "trace": {
    "animal_score": 3,
    "distance_score": 3,
    "inside_region_score": 3,
    "direction_score": 2,
    "time_score": 2
  },
  "metadata": {
    "engine": "Explainable Decision Engine",
    "version": "1.0.0"
  }
}
```

### Fields Description

| Field | Type | Description / Enum Values |
|---|---|---|
| `observation.animal` | `string` | Normalized animal species name |
| `observation.confidence` | `float` | Vision model confidence value |
| `assessment.threat_score` | `integer` | Summed threat score based on weights |
| `assessment.threat_level` | `string` | `"LOW"`, `"MEDIUM"`, `"HIGH"` |
| `response.recommended_action`| `string` | `"Monitor"`, `"Flash Light"`, `"Speaker"`, `"Flash Light + Speaker"` |
| `response.farmer_override` | `boolean` | Set to `true` indicating the response requires manual confirmation (override) by the farmer |
| `reason` | `array of strings` | Natural human-readable chips explaining the decision |
| `trace` | `object` | Component scores contributing to the total threat score (used for debugging/auditing) |
| `metadata.engine` | `string` | `"Explainable Decision Engine"` |
| `metadata.version` | `string` | `"1.0.0"` |
