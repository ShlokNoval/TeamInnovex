import pytest
from pothole_engine import PotholeEngine

def test_classify_zone():
    engine = PotholeEngine()
    img_w = 100
    # Center zone is 25 to 75
    assert engine.classify_zone([40, 10, 10, 10], img_w) == 'centre' # centroid at 45
    assert engine.classify_zone([10, 10, 10, 10], img_w) == 'edge'   # centroid at 15
    assert engine.classify_zone([-20, 10, 10, 10], img_w) == 'off_road' # centroid at -15

def test_update_lifecycle():
    engine = PotholeEngine()
    res1 = engine.update_lifecycle('cam1', 1, 100.0, 1)
    assert res1 == 'NEW'
    
    res2 = engine.update_lifecycle('cam1', 1, 120.0, 2)
    assert res2 == 'GROWING' # 20% growth
    
    res3 = engine.update_lifecycle('cam1', 1, 105.0, 3)
    assert res3 == 'STABLE'

def test_compute_score():
    engine = PotholeEngine()
    det = {'bbox': [40, 40, 20, 20], 'confidence': 0.9}
    img_w, img_h = 100, 100
    result = engine.compute_score(det, img_w, img_h, 'cam1', 1)
    
    # A_norm = 400/10000 = 0.04 -> 0.35 * 0.04 = 0.014
    # Conf = 0.90 -> 0.30 * 0.9 = 0.27
    # Zone = center (1.0) -> 0.20 * 1 = 0.20
    # Freq = 1/10 = 0.1 -> 0.15 * 0.1 = 0.015
    # SS = (0.014 + 0.27 + 0.20 + 0.015) * 100 = 49.9 -> round to 49.9
    
    assert result['severity_label'] == 'MEDIUM'
    assert result['severity_score'] > 0
