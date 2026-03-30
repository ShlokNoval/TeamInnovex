import pytest
import numpy as np
from detector import Detector

@pytest.fixture
def detector_day():
    # Will fail if model doesn't exist, maybe mock for tests
    return Detector('yolov8n.pt', night_mode=False)

def test_preprocess_day_mode(detector_day):
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    out = detector_day.preprocess(frame)
    assert np.array_equal(frame, out)

def test_preprocess_night_mode():
    detector_night = Detector('yolov8n.pt', night_mode=True)
    frame = np.ones((100, 100, 3), dtype=np.uint8) * 50
    out = detector_night.preprocess(frame)
    assert out is != None
    assert out.shape == frame.shape
    
def test_detect_empty_frame(detector_day):
    # Depending on YOLO, a blank frame shouldn't detect anything
    frame = np.zeros((640, 480, 3), dtype=np.uint8)
    detections = detector_day.detect(frame)
    assert isinstance(detections, list)
    assert len(detections) == 0
