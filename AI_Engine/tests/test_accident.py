import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from accident_engine import AccidentEngine  # Now should work

class TestAccidentEngine(unittest.TestCase):

    def setUp(self):
        self.engine = AccidentEngine()

    # ------------------ IoU Tests ------------------
    def test_compute_iou_no_overlap(self):
        boxA = [0, 0, 10, 10]
        boxB = [20, 20, 10, 10]
        self.assertEqual(self.engine.compute_iou(boxA, boxB), 0.0)

    def test_compute_iou_perfect_overlap(self):
        boxA = [10, 10, 50, 50]
        self.assertEqual(self.engine.compute_iou(boxA, boxA), 1.0)

    def test_compute_iou_partial_overlap(self):
        boxA = [0, 0, 20, 20]
        boxB = [10, 10, 20, 20]
        iou = self.engine.compute_iou(boxA, boxB)
        self.assertAlmostEqual(iou, 100/700, places=4)

    # ------------------ Collision Detection ------------------
    def test_detect_collision_no_vehicles(self):
        has_collision, max_iou = self.engine.detect_collision([])
        self.assertFalse(has_collision)
        self.assertEqual(max_iou, 0.0)

    def test_detect_collision_overlapping_vehicles(self):
        detections = [
            {'bbox': [0,0,100,100], 'class':'car', 'confidence':0.9},
            {'bbox': [10,10,100,100], 'class':'car', 'confidence':0.9}
        ]
        has_collision, max_iou = self.engine.detect_collision(detections)
        self.assertTrue(has_collision)
        self.assertGreater(max_iou, 0.3)

    def test_detect_collision_non_overlapping(self):
        detections = [
            {'bbox':[0,0,20,20],'class':'car','confidence':0.9},
            {'bbox':[100,100,20,20],'class':'car','confidence':0.9}
        ]
        has_collision, max_iou = self.engine.detect_collision(detections)
        self.assertFalse(has_collision)
        self.assertEqual(max_iou, 0.0)

    # ------------------ Severity Score ------------------
    def test_compute_score_returns_expected_keys(self):
        detections = [{'bbox':[10,10,50,50],'class':'car','confidence':0.8,'track_id':'trk1'}]
        M_anomaly = 0.5
        result = self.engine.compute_score(detections, M_anomaly, 640, 480, 'cam1', 10)
        expected_keys = {
            'severity_score', 'severity_label', 'IoU_collision',
            'M_anomaly', 'N_vehicles', 'human_present', 'collision_detected'
        }
        self.assertTrue(expected_keys.issubset(result.keys()))

    def test_compute_score_high_with_collision_and_human(self):
        detections = [
            {'bbox':[0,0,100,100],'class':'car','confidence':0.9,'track_id':'trk1'},
            {'bbox':[5,5,100,100],'class':'car','confidence':0.9,'track_id':'trk2'},
            {'bbox':[300,300,40,80],'class':'person','confidence':0.8,'track_id':'trk3'}
        ]
        M_anomaly = 0.9
        result = self.engine.compute_score(detections, M_anomaly, 640, 480, 'cam_high', 1)
        self.assertEqual(result['severity_label'], 'HIGH')

    def test_compute_score_low_no_hazard(self):
        detections = [{'bbox':[0,0,100,100],'class':'car','confidence':0.9,'track_id':'trk1'}]
        M_anomaly = 0.1
        result = self.engine.compute_score(detections, M_anomaly, 640, 480, 'cam_low', 1)
        self.assertEqual(result['severity_label'], 'LOW')

    # ------------------ Sudden Stop Detection ------------------
    def test_detect_sudden_stop_insufficient_history(self):
        self.assertFalse(self.engine.detect_sudden_stop('cam1', 'trk1'))

    def test_detect_sudden_stop_true(self):
        key = ('cam1','trk1')
        self.engine.state[key] = {'velocities':[20.0, 2.0]}
        self.assertTrue(self.engine.detect_sudden_stop('cam1','trk1'))

    def test_detect_sudden_stop_false(self):
        key = ('cam1','trk1')
        self.engine.state[key] = {'velocities':[10.0, 9.5]}
        self.assertFalse(self.engine.detect_sudden_stop('cam1','trk1'))

    # ------------------ Alert Tests ------------------
    def test_should_alert_high(self):
        self.assertTrue(self.engine.should_alert('HIGH'))

    def test_should_alert_low(self):
        self.assertFalse(self.engine.should_alert('LOW'))

if __name__ == '__main__':
    unittest.main()