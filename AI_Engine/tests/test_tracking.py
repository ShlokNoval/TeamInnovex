import pytest
from tracking import CentroidTracker

def test_tracking_register():
    tracker = CentroidTracker(D_max=50, max_disappeared=5)
    dets = [{'bbox': [10, 10, 20, 20], 'class_name': 'car'}]
    objects = tracker.update(dets)
    
    assert len(objects) == 1
    assert 0 in objects
    assert objects[0]['centroid'] == (20, 20)

def test_tracking_update_existing():
    tracker = CentroidTracker(D_max=50, max_disappeared=5)
    # Frame 1
    tracker.update([{'bbox': [10, 10, 20, 20], 'class_name': 'car'}])
    # Frame 2 (Moved slightly)
    objects = tracker.update([{'bbox': [15, 15, 20, 20], 'class_name': 'car'}])
    
    assert len(objects) == 1
    assert 0 in objects
    assert objects[0]['centroid'] == (25, 25)

def test_tracking_velocity():
    tracker = CentroidTracker(D_max=50)
    tracker.update([{'bbox': [0, 0, 10, 10], 'class_name': 'car'}])
    tracker.update([{'bbox': [3, 4, 10, 10], 'class_name': 'car'}])
    
    vel = tracker.get_velocity(0, frame_interval=1)
    # distance from (5,5) to (8,9) is sqrt(3^2 + 4^2) = 5
    assert vel == 5.0
