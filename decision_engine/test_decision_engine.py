import unittest
from decision_engine.decision_engine import evaluate_threat
from decision_engine.enums import ThreatLevel, Recommendation

class TestDecisionEngine(unittest.TestCase):

    def test_scenario_1_high_threat_cow(self):
        # Cow, Night, Near (35), Toward Crop, Inside protected region
        input_data = {
            "animal": "Cow",
            "confidence": 0.92,
            "distance": 35.0,
            "direction": "Toward Crop",
            "time": "Night",
            "inside_crop_region": True
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.HIGH.value)
        self.assertEqual(res["assessment"]["threat_score"], 13)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.FLASH_LIGHT_SPEAKER.value)
        self.assertIn("Large Animal", res["reason"])
        self.assertIn("Moving Toward Crop", res["reason"])
        self.assertIn("Near Crop", res["reason"])
        self.assertIn("Night Time", res["reason"])
        self.assertIn("Inside Protected Region", res["reason"])

    def test_scenario_2_low_threat_cow(self):
        # Cow, Day, Far (80), Away from crop, Outside protected region
        input_data = {
            "animal": "Cow",
            "confidence": 0.92,
            "distance": 80.0,
            "direction": "Away From Crop",
            "time": "Day",
            "inside_crop_region": False
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.LOW.value)
        self.assertEqual(res["assessment"]["threat_score"], 0)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.MONITOR.value)
        self.assertIn("Large Animal", res["reason"])
        self.assertIn("Moving Away", res["reason"])
        self.assertIn("Far From Crop", res["reason"])

    def test_scenario_3_suppressed_bird(self):
        # Bird, Night, Near (10)
        input_data = {
            "animal": "Bird",
            "confidence": 0.90,
            "distance": 10.0,
            "direction": "Toward Crop",
            "time": "Night",
            "inside_crop_region": True
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.LOW.value)
        self.assertEqual(res["assessment"]["threat_score"], 0)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.MONITOR.value)
        self.assertEqual(res["reason"], ["Non-threat species (Bird)"])

    def test_scenario_4_suppressed_dog(self):
        # Dog, Near (20)
        input_data = {
            "animal": "Dog",
            "confidence": 0.85,
            "distance": 20.0,
            "direction": "Toward Crop",
            "time": "Night",
            "inside_crop_region": True
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.LOW.value)
        self.assertEqual(res["assessment"]["threat_score"], 0)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.MONITOR.value)
        self.assertEqual(res["reason"], ["Non-threat species (Dog)"])

    def test_scenario_5_suppressed_human(self):
        # Human
        input_data = {
            "animal": "Human",
            "confidence": 0.95,
            "distance": 15.0,
            "direction": "Toward Crop",
            "time": "Day",
            "inside_crop_region": True
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.LOW.value)
        self.assertEqual(res["assessment"]["threat_score"], 0)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.MONITOR.value)
        self.assertEqual(res["reason"], ["Human Intruder (Log Only)"])

    def test_scenario_6_unknown_escalated(self):
        # Unknown, High Confidence, Near, Toward Crop
        input_data = {
            "animal": "Unknown",
            "confidence": 0.95,
            "distance": 30.0,
            "direction": "Toward Crop",
            "time": "Night",
            "inside_crop_region": False
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.MEDIUM.value)
        self.assertEqual(res["assessment"]["threat_score"], 5)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.FLASH_LIGHT.value)
        self.assertEqual(res["reason"], ["Unknown Large Object"])

    def test_scenario_7_low_confidence(self):
        # Cow, confidence 45%
        input_data = {
            "animal": "Cow",
            "confidence": 0.45,
            "distance": 30.0,
            "direction": "Toward Crop",
            "time": "Night",
            "inside_crop_region": True
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.LOW.value)
        self.assertEqual(res["assessment"]["threat_score"], 0)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.MONITOR.value)
        self.assertEqual(res["reason"], ["Low Confidence"])

    def test_scenario_8_missing_input(self):
        # Incomplete Observation
        input_data = {
            "animal": "Cow"
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.LOW.value)
        self.assertEqual(res["assessment"]["threat_score"], 0)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.MONITOR.value)
        self.assertEqual(res["reason"], ["Incomplete Observation"])

    def test_scenario_9_stationary_cow_night(self):
        # Cow, Night, Near (30), Stationary, outside protected region
        input_data = {
            "animal": "Cow",
            "confidence": 0.90,
            "distance": 30.0,
            "direction": "Stationary",
            "time": "Night",
            "inside_crop_region": False
        }
        res = evaluate_threat(input_data)
        self.assertEqual(res["assessment"]["threat_level"], ThreatLevel.HIGH.value)
        self.assertEqual(res["assessment"]["threat_score"], 8)
        self.assertEqual(res["response"]["recommended_action"], Recommendation.FLASH_LIGHT_SPEAKER.value)
        self.assertIn("Large Animal", res["reason"])
        self.assertIn("Near Crop", res["reason"])
        self.assertIn("Night Time", res["reason"])
        self.assertNotIn("Moving Toward Crop", res["reason"])

if __name__ == '__main__':
    unittest.main()
