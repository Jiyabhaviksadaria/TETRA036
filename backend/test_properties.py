"""
Property-based tests for the Rakshak AI Backend using Hypothesis.
Each test is tagged with the property it validates.
"""
from __future__ import annotations

import math
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from backend.models import DecisionRequest, IncidentRecord, VisionInput
from decision_engine.enums import Direction, TimeOfDay

# ---------------------------------------------------------------------------
# Hypothesis profile
# ---------------------------------------------------------------------------
settings.register_profile(
    "ci",
    max_examples=100,
    suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture],
)
settings.load_profile("ci")

# ---------------------------------------------------------------------------
# Shared strategies
# ---------------------------------------------------------------------------

_directions = st.sampled_from([d.value for d in Direction])
_times = st.sampled_from([t.value for t in TimeOfDay])
_confidence = st.floats(min_value=0.0, max_value=1.0, allow_nan=False, allow_infinity=False)
_two_ints = st.lists(st.integers(min_value=0, max_value=9999), min_size=2, max_size=2)
_animal = st.text(min_size=1, max_size=30, alphabet=st.characters(whitelist_categories=("Lu", "Ll")))
_distance = st.floats(min_value=0.0, max_value=1000.0, allow_nan=False, allow_infinity=False)

_vision_strategy = st.fixed_dictionaries(
    {
        "animal": _animal,
        "confidence": _confidence,
        "position": _two_ints,
        "previous_position": _two_ints,
        "direction": _directions,
    }
)

_decision_strategy = st.fixed_dictionaries(
    {
        "animal": _animal,
        "confidence": _confidence,
        "distance": _distance,
        "direction": _directions,
        "time": _times,
    }
)

_valid_actions = ["accept", "ignore", "override"]

# ---------------------------------------------------------------------------
# Fixture helpers — fresh client per test
# ---------------------------------------------------------------------------

def _fresh_client():
    import backend.api as api_module
    api_module.frame_state = None
    api_module.threat_cache = None
    api_module.timeline_store._records = []
    from backend.app import app
    return TestClient(app, raise_server_exceptions=False)


def _make_engine_output(animal: str, confidence: float):
    return {
        "observation": {"animal": animal, "confidence": confidence},
        "assessment": {"threat_score": 50, "threat_level": "MEDIUM"},
        "response": {"recommended_action": "Monitor", "farmer_override": True},
        "reason": ["test reason"],
        "trace": [],
        "metadata": {"engine": "EDE", "version": "1.0"},
    }


# ---------------------------------------------------------------------------
# Property 2: Valid VisionInput updates frame state
# Feature: rakshak-ai-backend, Property 2: Valid Vision JSON updates frame state
# ---------------------------------------------------------------------------

@given(payload=_vision_strategy)
def test_valid_vision_updates_frame_state(payload):
    # Feature: rakshak-ai-backend, Property 2: Valid Vision JSON updates frame state
    client = _fresh_client()
    r = client.post("/detect", json=payload)
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

    import backend.api as api_module
    assert api_module.frame_state is not None
    assert api_module.frame_state["animal"] == payload["animal"]


# ---------------------------------------------------------------------------
# Property 1: Out-of-range confidence returns 422
# Feature: rakshak-ai-backend, Property 1: Vision input validation rejects out-of-range confidence
# ---------------------------------------------------------------------------

@given(
    bad_confidence=st.one_of(
        st.floats(min_value=1.001, max_value=1e6, allow_nan=False, allow_infinity=False),
        st.floats(min_value=-1e6, max_value=-0.001, allow_nan=False, allow_infinity=False),
    )
)
def test_invalid_confidence_rejected(bad_confidence):
    # Feature: rakshak-ai-backend, Property 1: Vision input validation rejects out-of-range confidence
    client = _fresh_client()

    import backend.api as api_module
    state_before = api_module.frame_state

    payload = {
        "animal": "deer",
        "confidence": bad_confidence,
        "position": [10, 20],
        "previous_position": [5, 15],
        "direction": "Toward Crop",
    }
    r = client.post("/detect", json=payload)
    assert r.status_code == 422
    # Frame state must not have changed
    assert api_module.frame_state is state_before


# ---------------------------------------------------------------------------
# Property 3: Any valid DecisionRequest appends one timeline entry
# Feature: rakshak-ai-backend, Property 3: Decision evaluation creates timeline entry
# ---------------------------------------------------------------------------

@given(payload=_decision_strategy)
def test_decision_appends_timeline(payload):
    # Feature: rakshak-ai-backend, Property 3: Decision evaluation creates timeline entry
    client = _fresh_client()
    import backend.api as api_module

    engine_out = _make_engine_output(payload["animal"], payload["confidence"])
    before = len(api_module.timeline_store._records)

    with patch("backend.api.evaluate_threat", return_value=engine_out):
        r = client.post("/decision", json=payload)

    assert r.status_code == 200
    assert len(api_module.timeline_store._records) == before + 1

    entry = api_module.timeline_store._records[-1]
    assert entry.animal == payload["animal"]
    assert math.isclose(entry.confidence, payload["confidence"], rel_tol=1e-6)


# ---------------------------------------------------------------------------
# Property 4: GET /status reflects the last POSTed decision's engine output
# Feature: rakshak-ai-backend, Property 4: Status cache reflects last decision
# ---------------------------------------------------------------------------

@given(payload=_decision_strategy)
def test_status_reflects_last_decision(payload):
    # Feature: rakshak-ai-backend, Property 4: Status cache reflects last decision
    client = _fresh_client()
    engine_out = _make_engine_output(payload["animal"], payload["confidence"])

    with patch("backend.api.evaluate_threat", return_value=engine_out):
        client.post("/decision", json=payload)

    r = client.get("/status")
    assert r.status_code == 200
    body = r.json()
    assert body["threat_level"] == engine_out["assessment"]["threat_level"]
    assert body["recommendation"] == engine_out["response"]["recommended_action"]
    assert body["animal"] == engine_out["observation"]["animal"]
    assert math.isclose(body["confidence"], engine_out["observation"]["confidence"], rel_tol=1e-6)


# ---------------------------------------------------------------------------
# Property 6: N sequential decisions produce timeline with N entries, reverse-chron
# Feature: rakshak-ai-backend, Property 6: Timeline reverse-chronological order
# ---------------------------------------------------------------------------

@given(payloads=st.lists(_decision_strategy, min_size=1, max_size=10))
def test_timeline_order(payloads):
    # Feature: rakshak-ai-backend, Property 6: Timeline reverse-chronological order
    client = _fresh_client()

    for p in payloads:
        engine_out = _make_engine_output(p["animal"], p["confidence"])
        with patch("backend.api.evaluate_threat", return_value=engine_out):
            client.post("/decision", json=p)

    r = client.get("/timeline")
    assert r.status_code == 200
    entries = r.json()
    assert len(entries) == len(payloads)

    # Verify reverse-chronological order (each timestamp >= the one after it)
    for i in range(len(entries) - 1):
        assert entries[i]["timestamp"] >= entries[i + 1]["timestamp"]


# ---------------------------------------------------------------------------
# Property 7: IncidentRecord serialise → deserialise round-trip
# Feature: rakshak-ai-backend, Property 7: Timeline persistence round-trip
# ---------------------------------------------------------------------------

_incident_strategy = st.fixed_dictionaries(
    {
        "id": st.uuids().map(str),
        "timestamp": st.just("2024-01-01T00:00:00+00:00"),
        "animal": _animal,
        "confidence": _confidence,
        "threat_level": st.sampled_from(["LOW", "MEDIUM", "HIGH", "NONE"]),
        "recommendation": st.sampled_from(["Monitor", "Flash Light", "Speaker", "Flash Light + Speaker"]),
        "reason": st.lists(st.text(min_size=1, max_size=50), max_size=5),
        "farmer_action": st.one_of(st.none(), st.sampled_from(_valid_actions)),
        "decision_input": st.just({"animal": "deer", "confidence": 0.5}),
    }
)


@given(data=_incident_strategy)
def test_incident_round_trip(data):
    # Feature: rakshak-ai-backend, Property 7: Timeline persistence round-trip
    original = IncidentRecord(**data)
    serialised = original.model_dump(mode="json")
    restored = IncidentRecord(**serialised)
    assert original == restored


# ---------------------------------------------------------------------------
# Property 8: Valid farmer action persisted; re-posting overwrites
# Feature: rakshak-ai-backend, Property 8: Farmer action update and persistence
# ---------------------------------------------------------------------------

@given(
    first_action=st.sampled_from(_valid_actions),
    second_action=st.sampled_from(_valid_actions),
)
def test_valid_farmer_action_persisted(first_action, second_action):
    # Feature: rakshak-ai-backend, Property 8: Farmer action update and persistence
    client = _fresh_client()
    import backend.api as api_module

    engine_out = _make_engine_output("deer", 0.8)
    with patch("backend.api.evaluate_threat", return_value=engine_out):
        client.post("/decision", json={
            "animal": "deer", "confidence": 0.8,
            "distance": 10.0, "direction": "Toward Crop", "time": "Day",
        })

    incident_id = api_module.timeline_store._records[0].id

    # First action
    r1 = client.post("/timeline/action", json={"id": incident_id, "action": first_action})
    assert r1.status_code == 200
    assert api_module.timeline_store._records[0].farmer_action == first_action

    # Second action overwrites
    r2 = client.post("/timeline/action", json={"id": incident_id, "action": second_action})
    assert r2.status_code == 200
    assert api_module.timeline_store._records[0].farmer_action == second_action


# ---------------------------------------------------------------------------
# Property 9: Invalid action string returns 422
# Feature: rakshak-ai-backend, Property 9: Invalid action values rejected
# ---------------------------------------------------------------------------

_invalid_actions = st.text().filter(lambda s: s not in {"accept", "ignore", "override"})


@given(bad_action=_invalid_actions)
def test_invalid_action_rejected(bad_action):
    # Feature: rakshak-ai-backend, Property 9: Invalid action values rejected
    client = _fresh_client()
    import backend.api as api_module
    before = len(api_module.timeline_store._records)

    r = client.post("/timeline/action", json={"id": "some-id", "action": bad_action})
    assert r.status_code == 422
    assert len(api_module.timeline_store._records) == before


# ---------------------------------------------------------------------------
# Property 10: Unknown ID returns 404
# Feature: rakshak-ai-backend, Property 10: Missing incident returns 404
# ---------------------------------------------------------------------------

@given(unknown_id=st.uuids().map(str))
def test_unknown_id_returns_404(unknown_id):
    # Feature: rakshak-ai-backend, Property 10: Missing incident returns 404
    client = _fresh_client()
    r = client.post("/timeline/action", json={"id": unknown_id, "action": "accept"})
    assert r.status_code == 404
