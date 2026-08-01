"""
Unit tests for the Rakshak AI Backend routes.
Uses FastAPI TestClient and unittest.mock for isolation.
"""
from __future__ import annotations

import importlib
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Helpers — canonical valid payloads
# ---------------------------------------------------------------------------

VALID_VISION = {
    "animal": "deer",
    "confidence": 0.85,
    "position": [10, 20],
    "previous_position": [5, 15],
    "direction": "Toward Crop",
}

VALID_DECISION = {
    "animal": "deer",
    "confidence": 0.85,
    "distance": 12.5,
    "direction": "Toward Crop",
    "time": "Night",
}

MOCK_ENGINE_OUTPUT = {
    "observation": {"animal": "deer", "confidence": 0.85},
    "assessment": {"threat_score": 80, "threat_level": "HIGH"},
    "response": {"recommended_action": "Speaker", "farmer_override": True},
    "reason": ["Animal moving toward crop", "Night time"],
    "trace": [],
    "metadata": {"engine": "EDE", "version": "1.0"},
}


# ---------------------------------------------------------------------------
# Fixture — fresh app + client per test to avoid shared state bleed
# ---------------------------------------------------------------------------

@pytest.fixture()
def client():
    """Return a TestClient backed by a freshly-reset app."""
    import backend.api as api_module
    # Reset module-level state between tests
    api_module.frame_state = None
    api_module.threat_cache = None
    api_module.timeline_store._records = []

    from backend.app import app
    return TestClient(app, raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# 6.1 HTTP 200 for valid payloads on all five routes
# ---------------------------------------------------------------------------

def test_detect_200(client):
    r = client.post("/detect", json=VALID_VISION)
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_decision_200(client):
    with patch("backend.api.evaluate_threat", return_value=MOCK_ENGINE_OUTPUT):
        r = client.post("/decision", json=VALID_DECISION)
    assert r.status_code == 200


def test_status_200(client):
    r = client.get("/status")
    assert r.status_code == 200


def test_timeline_200(client):
    r = client.get("/timeline")
    assert r.status_code == 200


def test_timeline_action_200(client):
    # Seed one incident first
    with patch("backend.api.evaluate_threat", return_value=MOCK_ENGINE_OUTPUT):
        client.post("/decision", json=VALID_DECISION)

    import backend.api as api_module
    incident_id = api_module.timeline_store._records[0].id

    r = client.post("/timeline/action", json={"id": incident_id, "action": "accept"})
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# 6.2 HTTP 422 for missing required fields on POST routes
# ---------------------------------------------------------------------------

def test_detect_422_missing_animal(client):
    payload = {k: v for k, v in VALID_VISION.items() if k != "animal"}
    r = client.post("/detect", json=payload)
    assert r.status_code == 422


def test_decision_422_missing_distance(client):
    payload = {k: v for k, v in VALID_DECISION.items() if k != "distance"}
    r = client.post("/decision", json=payload)
    assert r.status_code == 422


def test_timeline_action_422_missing_id(client):
    r = client.post("/timeline/action", json={"action": "accept"})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# 6.3 HTTP 404 for unknown incident ID on POST /timeline/action
# ---------------------------------------------------------------------------

def test_timeline_action_404_unknown_id(client):
    r = client.post("/timeline/action", json={"id": "nonexistent-id", "action": "ignore"})
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# 6.4 Default GET /status when no decision has been made (Property 5)
# ---------------------------------------------------------------------------

def test_status_default_shape(client):
    r = client.get("/status")
    assert r.status_code == 200
    body = r.json()
    assert body["threat_level"] == "NONE"
    assert body["recommendation"] == "Monitor"
    assert body["reason"] == []


# ---------------------------------------------------------------------------
# 6.5 GET /timeline returns empty array on fresh start
# ---------------------------------------------------------------------------

def test_timeline_empty_on_fresh_start(client):
    r = client.get("/timeline")
    assert r.status_code == 200
    assert r.json() == []


# ---------------------------------------------------------------------------
# 6.6 Decision Engine exception → HTTP 500, no timeline append
# ---------------------------------------------------------------------------

def test_decision_engine_exception_returns_500(client):
    import backend.api as api_module
    before = len(api_module.timeline_store._records)

    with patch("backend.api.evaluate_threat", side_effect=RuntimeError("engine boom")):
        r = client.post("/decision", json=VALID_DECISION)

    assert r.status_code == 500
    assert "error" in r.json()
    # Timeline must not have grown
    assert len(api_module.timeline_store._records) == before


# ---------------------------------------------------------------------------
# 6.7 CORS headers present on responses
# ---------------------------------------------------------------------------

def test_cors_headers_on_status(client):
    r = client.get("/status", headers={"Origin": "http://localhost:3000"})
    assert "access-control-allow-origin" in r.headers


def test_cors_headers_on_detect(client):
    r = client.post(
        "/detect",
        json=VALID_VISION,
        headers={"Origin": "http://localhost:3000"},
    )
    assert "access-control-allow-origin" in r.headers


# ---------------------------------------------------------------------------
# 6.8 inside_crop_region defaults to False when omitted
# ---------------------------------------------------------------------------

def test_inside_crop_region_defaults_false(client):
    captured: list = []

    def mock_evaluate(data):
        captured.append(data)
        return MOCK_ENGINE_OUTPUT

    with patch("backend.api.evaluate_threat", side_effect=mock_evaluate):
        client.post("/decision", json=VALID_DECISION)

    assert captured, "evaluate_threat was not called"
    assert captured[0].get("inside_crop_region") is False
