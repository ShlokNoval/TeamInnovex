import os
import sys
import pytest

# Add parent directory to sys.path to import modules from AI_Engine directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pothole_engine import PotholeEngine
# Use config if needed, otherwise rely on the engine's internal imports

@pytest.fixture
def engine():
    return PotholeEngine()

def test_classify_zone_centre(engine):
    # Image width: 640. Center is at 320.
    # We want x_centre exactly in the middle -> x + w/2 = 320
    # Let bbox = [300, 100, 40, 50], then x_centre = 320
    bbox = [300, 100, 40, 50]
    zone = engine.classify_zone(bbox, img_w=640)
    assert zone == 'centre'

def test_classify_zone_edge(engine):
    # Image width: 640. 
    # We want x_centre to be 50. img_w / 4 = 160. So 50 <= 160 -> edge.
    # Let bbox = [30, 100, 40, 50], x_centre = 50.
    bbox = [30, 100, 40, 50]
    zone = engine.classify_zone(bbox, img_w=640)
    assert zone == 'edge'

def test_compute_score_returns_expected_keys(engine):
    detection = {'bbox': [300, 200, 50, 50], 'confidence': 0.8}
    result = engine.compute_score(detection, img_w=640, img_h=480, camera_id='cam1', track_id='trk1')
    
    expected_keys = {'severity_score', 'severity_label', 'zone', 'A_norm', 'F_repeat', 'confidence'}
    for key in expected_keys:
        assert key in result

def test_compute_score_low_severity(engine):
    # Tiny bbox 10x10 in 640x480, Area = 100 / 307200 = 0.000325
    detection = {'bbox': [10, 10, 10, 10], 'confidence': 0.5}
    # x_centre = 15 -> edge zone
    result = engine.compute_score(detection, img_w=640, img_h=480, camera_id='cam_low', track_id='trk_low')
    
    assert result['severity_label'] == 'LOW'

def test_compute_score_high_severity(engine):
    # Large bbox 400x300 in 640x480 image
    # x_centre should be around 320 -> centre zone. Box from [120, 90, 400, 300] -> x_centre = 320
    detection = {'bbox': [120, 90, 400, 300], 'confidence': 0.95}
    camera_id = 'cam_high'
    track_id = 'trk_high'
    
    # Call 10 times to max out F_repeat
    result = None
    for i in range(10):
        result = engine.compute_score(detection, img_w=640, img_h=480, camera_id=camera_id, track_id=track_id)
        
    assert result['zone'] == 'centre'
    assert result['severity_label'] == 'HIGH'
    assert result['F_repeat'] == 1.0

def test_severity_score_range(engine):
    # Generate some random/extreme inputs to make sure score remains valid
    detections = [
        {'bbox': [0, 0, 640, 480], 'confidence': 1.0}, # Full screen
        {'bbox': [0, 0, 1, 1], 'confidence': 0.0},     # Minimum
        {'bbox': [320, 240, 100, 100], 'confidence': 0.75} # Moderate
    ]
    
    for i, detection in enumerate(detections):
        result = engine.compute_score(detection, img_w=640, img_h=480, camera_id='cam_range', track_id=f'trk_range_{i}')
        assert 0 <= result['severity_score'] <= 100

def test_update_lifecycle_new(engine):
    status = engine.update_lifecycle('cam_1', 'trk_new', 0.05)
    assert status == 'NEW'

def test_update_lifecycle_growing(engine):
    # Call 1 -> NEW
    engine.update_lifecycle('cam_grow', 'trk_grow', 0.05)
    # Call 2 -> 0.10 is 100% growth (0.10 - 0.05) / 0.05 = 1.0 = 100%
    status = engine.update_lifecycle('cam_grow', 'trk_grow', 0.10)
    assert status == 'GROWING'

def test_update_lifecycle_stable(engine):
    # Call 1 -> NEW
    engine.update_lifecycle('cam_stable', 'trk_stable', 0.05)
    # Call 2 -> 0.052 is 4% growth (0.052 - 0.05) / 0.05 = 0.04 = 4%
    status = engine.update_lifecycle('cam_stable', 'trk_stable', 0.052)
    assert status == 'STABLE'

def test_update_lifecycle_resolved(engine):
    # Call 1 -> NEW
    engine.update_lifecycle('cam_resolved', 'trk_resolved', 0.10)
    # Call 2 -> 0.01 is 90% drop (0.01 - 0.10) / 0.10 = -0.90 = -90%
    status = engine.update_lifecycle('cam_resolved', 'trk_resolved', 0.01)
    assert status == 'RESOLVED'

def test_update_lifecycle_updates_before_area(engine):
    camera_id = 'cam_update'
    track_id = 'trk_update'
    
    # Call 1: area = 0.05 -> NEW. before_area becomes 0.05
    status1 = engine.update_lifecycle(camera_id, track_id, 0.05)
    assert status1 == 'NEW'
    
    # Call 2: area = 0.10 -> (0.10 - 0.05) / 0.05 = 100% -> GROWING. before_area becomes 0.10
    status2 = engine.update_lifecycle(camera_id, track_id, 0.10)
    assert status2 == 'GROWING'
    
    # Call 3: area = 0.102 -> (0.102 - 0.10) / 0.10 = 2% -> STABLE.
    # If it didn't update before_area, it would compare string 0.102 with 0.05 (104% growth -> GROWING).
    status3 = engine.update_lifecycle(camera_id, track_id, 0.102)
    assert status3 == 'STABLE'

def test_should_alert_high(engine):
    assert engine.should_alert('HIGH') is True

def test_should_alert_low(engine):
    assert engine.should_alert('LOW') is False

def test_f_repeat_maxes_at_1(engine):
    detection = {'bbox': [320, 240, 50, 50], 'confidence': 0.8}
    camera_id = 'cam_freq'
    track_id = 'trk_freq'
    
    # Run it 15 times to exceed FRAME_BUFFER (which is 10)
    for _ in range(15):
        result = engine.compute_score(detection, img_w=640, img_h=480, camera_id=camera_id, track_id=track_id)
        
    assert result['F_repeat'] == 1.0
