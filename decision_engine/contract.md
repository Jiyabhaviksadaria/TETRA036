# Crop Risk Intelligence Engine API Contract (Evolved)

This document defines the evolved API contract between the **Backend** and the **Crop Risk Intelligence Engine (CRIE)** (formerly EDE).

---

## 1. Input Contract (Backend → Decision Engine)

```json
{
  "animal": "Cow",
  "confidence": 0.92,
  "distance": 35.0,
  "direction": "Toward Crop",
  "time": "Night",
  "inside_crop_region": true,
  "scenario": "Night Simulation",
  "zone": "North Buffer"
}
```

### Fields Description

| Field | Type | Required | Description / Enum Values |
|---|---|---|---|
| `animal` | `string` | Yes | Species of the detected animal. E.g. `"Cow"`, `"Buffalo"`, `"Wild Boar"`, `"Nilgai"`, `"Elephant"`, `"Bird"`, `"Dog"`, `"Human"`, `"Unknown"` |
| `confidence` | `float` | Yes | Confidence score from the Vision Module (0.0 to 1.0) |
| `distance` | `float` | Yes | Calculated distance from the protected crop boundary (in meters) |
| `direction` | `string` | Yes | `"Toward Crop"`, `"Away From Crop"`, `"Stationary"` |
| `time` | `string` | Yes | `"Day"`, `"Night"` |
| `inside_crop_region` | `boolean` | Yes | Whether the animal's bounding box intersects the user-marked crop boundary |
| `scenario` | `string` | No | Optional simulation scenario (e.g. `"Night Simulation"`, `"Normal Day"`) |
| `zone` | `string` | No | Optional detection zone or buffer |

---

## 2. Output Contract (Decision Engine → Backend)

```json
{
  "observation": {
    "animal": "Cow",
    "confidence": 0.92,
    "scenario": "Night Simulation",
    "zone": "North Buffer"
  },
  "assessment": {
    "threat_score": 13,
    "threat_level": "HIGH",
    "crop_risk": "HIGH",
    "crop_risk_score": 13,
    "eta_seconds": 29
  },
  "response": {
    "recommended_action": "Flash Light + Speaker",
    "farmer_override": true,
    "decision": "Activate Prevention",
    "preventive_actions": [
      "Flash Light",
      "Speaker",
      "Notify Farmer"
    ]
  },
  "reason": [
    "Large Animal",
    "Moving Toward Crop",
    "Near Crop",
    "Night Time",
    "Inside Protected Region",
    "ETA 29 sec",
    "High Crop Risk",
    "Flash Light + Speaker Recommended"
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
| `observation.scenario` | `string` | Optional simulation scenario name |
| `observation.zone` | `string` | Optional zone name where detection occurred |
| `assessment.threat_score` | `integer` | (Legacy compatibility) Summed threat score based on weights |
| `assessment.threat_level` | `string` | (Legacy compatibility) `"LOW"`, `"MEDIUM"`, `"HIGH"` |
| `assessment.crop_risk` | `string` | Evolved Crop Risk Level: `"LOW"`, `"MEDIUM"`, `"HIGH"` |
| `assessment.crop_risk_score` | `integer` | Evolved Crop Risk score based on rule weights |
| `assessment.eta_seconds` | `integer` or `null` | Estimated Time of Arrival in seconds (computed deterministically using speeds, or `null` if unavailable) |
| `response.recommended_action`| `string` | (Legacy compatibility) `"Monitor"`, `"Flash Light"`, `"Speaker"`, `"Flash Light + Speaker"` |
| `response.farmer_override` | `boolean` | Set to `true` indicating the response requires manual confirmation by the farmer |
| `response.decision` | `string` | Adaptive prevention decision: `"Monitor Crop"` or `"Activate Prevention"` |
| `response.preventive_actions` | `array of strings` | List of adaptive actions selected: `["Monitor"]`, `["Flash Light", "Notify Farmer"]`, or `["Flash Light", "Speaker", "Notify Farmer"]` |
| `reason` | `array of strings` | Natural human-readable chips explaining the decision (including ETA, Crop Risk, and Recommended Prevention Action chips) |
| `trace` | `object` | Component scores contributing to the total threat/risk score |
| `metadata.engine` | `string` | `"Explainable Decision Engine"` |
| `metadata.version` | `string` | `"1.0.0"` |
