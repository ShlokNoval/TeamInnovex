import pytest
from animal_engine import AnimalEngine

def test_classify_behavior():
    engine = AnimalEngine()
    # velocity > 20 is RUNNING
    assert engine.classify_behavior(25, None, None) == 'RUNNING'
    assert engine.classify_behavior(10, None, None) == 'MOVING'
    assert engine.classify_behavior(2, None, None) == 'STATIONARY'

def test_classify_proximity():
    engine = AnimalEngine()
    # default fallback logic: y > img_h * 0.4 -> on_road
    assert engine.classify_proximity((50, 60), None, 100) == 'on_road'
    assert engine.classify_proximity((50, 30), None, 100) == 'approaching'
    assert engine.classify_proximity((50, 10), None, 100) == 'roadside'

def test_compute_score():
    engine = AnimalEngine()
    detection = {'confidence': 0.8, 'bbox': [10, 50, 20, 20]}
    velocity = 15.0 # MOVING
    result = engine.compute_score(detection, velocity, None, None, 100, 100)
    
    assert result['risk_label'] == 'HIGH'
    assert result['risk_score'] > 0
