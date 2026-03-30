import pytest
from scoring import ScoringEngine

def test_priority_index():
    engine = ScoringEngine()
    pi = engine.priority_index('accident', 80.0, 0.9, 0)
    assert pi == 72.0

def test_resolution_rate():
    engine = ScoringEngine()
    assert engine.resolution_rate(5, 10) == 50.0
    assert engine.resolution_rate(0, 0) == 0.0

def test_hotspot_score():
    engine = ScoringEngine()
    incidents = [
        {'type': 'accident', 'severity_score': 80.0},
        {'type': 'pothole', 'severity_score': 50.0}
    ]
    # 80*1.0 + 50*0.6 = 80 + 30 = 110
    assert engine.hotspot_score(incidents) == 110.0
