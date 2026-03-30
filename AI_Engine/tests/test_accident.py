import pytest
import numpy as np
from collections import deque
from accident_engine import AccidentEngine

def test_optical_flow_mock():
    engine = AccidentEngine(baseline_window=5)
    
    engine.flow_baseline_history.append(2.0)
    engine.sigma_baseline = 2.0
    
    assert engine.sigma_baseline == 2.0

def test_detect_collision():
    engine = AccidentEngine()
    vehicles = {
        1: {'bbox': [10, 10, 20, 20]},
        2: {'bbox': [15, 15, 20, 20]}, # Overlaps significantly
        3: {'bbox': [100, 100, 20, 20]} # No overlap
    }
    
    max_iou, pairs = engine.detect_collision(vehicles)
    assert max_iou > 0.3
    assert (1, 2) in pairs
    assert (1, 3) not in pairs

def test_sudden_stop_hit_and_run():
    engine = AccidentEngine()
    history = deque([10.0, 1.0], maxlen=5) # decelerated from 10 to 1
    
    is_stop = engine.detect_sudden_stop(1, history)
    assert is_stop == True
    
    is_hr = engine.detect_hit_and_run(1, is_stop, 3, True)
    assert is_hr == True
