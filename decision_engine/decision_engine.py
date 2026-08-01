from decision_engine.constants import ENGINE_NAME, ENGINE_VERSION
from decision_engine.rule_engine import evaluate_rules
from decision_engine.response_engine import determine_recommendation
from decision_engine.explainability import generate_reasons
from decision_engine.schemas import DecisionInput, DecisionOutput, Observation, Assessment, Response, Metadata
from typing import Dict, Any

def evaluate_threat(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main orchestration entrypoint for the Explainable Decision Engine (EDE).
    Validates input, evaluates rules, determines recommendation, generates reasons,
    and returns a structured response following the frozen contract.
    """
    # 1. Input Validation and Normalization using rule engine
    threat_level, threat_score, trace, rule_reasons = evaluate_rules(input_data)

    # 2. Get animal/confidence from input or defaults if missing
    animal = input_data.get("animal", "Unknown")
    confidence = input_data.get("confidence", 0.0)

    # 3. Determine Deterrent Recommendation
    time_str = input_data.get("time", "Day")
    recommended_action = determine_recommendation(threat_level, time_str)

    # 4. Generate Explainability Reason Chips
    reasons = generate_reasons(input_data, rule_reasons)

    # 5. Build structured Output following schemas
    output = {
        "observation": {
            "animal": animal,
            "confidence": confidence
        },
        "assessment": {
            "threat_score": threat_score,
            "threat_level": threat_level.value
        },
        "response": {
            "recommended_action": recommended_action.value,
            "farmer_override": True
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
