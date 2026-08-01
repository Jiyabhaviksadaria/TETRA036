from decision_engine.constants import ENGINE_NAME, ENGINE_VERSION
from decision_engine.rule_engine import evaluate_rules
from decision_engine.response_engine import determine_recommendation, determine_prevention
from decision_engine.explainability import generate_reasons
from decision_engine.utils import calculate_eta
from decision_engine.schemas import DecisionInput, DecisionOutput, Observation, Assessment, Response, Metadata
from typing import Dict, Any

def evaluate_threat(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main orchestration entrypoint for the Crop Risk Intelligence Engine (formerly EDE).
    Validates input, evaluates rules, calculates ETA, determines prevention actions,
    generates reasons, and returns a structured response following the evolved contract.
    """
    # 1. Input Validation and Normalization using rule engine
    crop_risk_level, crop_risk_score, trace, rule_reasons = evaluate_rules(input_data)

    # 2. Get animal/confidence/distance from input or defaults if missing
    animal = input_data.get("animal", "Unknown")
    confidence = input_data.get("confidence", 0.0)
    distance = input_data.get("distance", None)
    time_str = input_data.get("time", "Day")
    scenario = input_data.get("scenario", None)
    zone = input_data.get("zone", None)

    # 3. Calculate deterministic ETA
    eta_seconds = calculate_eta(animal, distance)

    # 4. Determine Deterrent Recommended Action and Adaptive Prevention
    recommended_action = determine_recommendation(crop_risk_level, time_str)
    decision, preventive_actions = determine_prevention(crop_risk_level, time_str)

    # 5. Generate Explainability Reason Chips
    reasons = generate_reasons(
        input_data=input_data,
        rule_reasons=rule_reasons,
        crop_risk=crop_risk_level.value,
        recommended_action=recommended_action.value,
        eta_seconds=eta_seconds
    )

    # 6. Build structured Output following schemas (evolved nested structure)
    output = {
        "observation": {
            "animal": animal,
            "confidence": confidence,
            "scenario": scenario,
            "zone": zone
        },
        "assessment": {
            "threat_score": crop_risk_score,
            "threat_level": crop_risk_level.value,
            "crop_risk": crop_risk_level.value,
            "crop_risk_score": crop_risk_score,
            "eta_seconds": eta_seconds
        },
        "response": {
            "recommended_action": recommended_action.value,
            "farmer_override": True,
            "decision": decision,
            "preventive_actions": preventive_actions
        },
        "reason": reasons,
        "trace": trace,
        "metadata": {
            "engine": ENGINE_NAME,
            "version": ENGINE_VERSION
        }
    }

    # Validate output schema against Pydantic
    try:
        validated_output = DecisionOutput(**output)
        # Return dict representation
        return validated_output.model_dump() if hasattr(validated_output, "model_dump") else validated_output.dict()
    except Exception as e:
        # Fallback in case of schema validation failure (ensure we never crash)
        output["error"] = str(e)
        return output
