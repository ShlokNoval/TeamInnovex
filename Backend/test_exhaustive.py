import time
import unittest
from main import app
from database.connection import db
from database.models import (
    UploadSession, Detection, Alert, PotholeDetail, PotholeCluster, PotholeClusterSighting,
    AnimalDetail, AnimalTrackSession, AnimalTrackFrame, AccidentDetail, VehicleTrackSession,
    VehicleTrackFrame, AnalyticsCache, FrameAnalytic
)

class TestExhaustiveHackathonFeatures(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Clean slate per test
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_full_pipeline_and_all_tables(self):
        print("\n=== EXHAUSTIVE HACKATHON BACKEND TEST RUN ===")
        
        # 1. API - Upload Session (POST)
        upload_payload = {"filename": "test_video.mp4", "file_type": "video"}
        upload_resp = self.client.post('/api/upload', json=upload_payload)
        self.assertEqual(upload_resp.status_code, 201)
        session_id = upload_resp.get_json()['session_id']
        print("[API-POST] /api/upload -> SUCCESS (201)")

        # 2. Force AI inference synchronously for testing
        with app.app_context():
            from services.ai_engine import process_upload
            
            # Monkeypatch random to ensure all 3 modules trigger at least once
            import random
            original_choices = random.choices
            original_sleep = time.sleep
            
            # Force exact sequence: Pothole, Animal, Accident, Pothole, Animal...
            fake_sequence = ['pothole', 'animal', 'accident', 'pothole', 'animal']
            seq_idx = [0]
            def mock_choices(population, weights=None, **kwargs):
                if 'pothole' in population:
                    val = fake_sequence[seq_idx[0] % len(fake_sequence)]
                    seq_idx[0] += 1
                    return [val]
                return original_choices(population, weights=weights, **kwargs)
            
            random.choices = mock_choices
            time.sleep = lambda x: None # Remove artificial wait
            
            process_upload(session_id)
            
            random.choices = original_choices
            time.sleep = original_sleep
            print("[AI-PIPELINE] Process_upload generated simulated 15 frames -> SUCCESS")

            # 3. Database Constraints Validation - Check core tables
            self.assertTrue(UploadSession.query.count() == 1)
            self.assertTrue(Detection.query.count() > 5)
            print("[DB-CORE] Detections & UploadSession populated gracefully -> SUCCESS")

            # 4. Database Validation - POTHOLE MODULE (4 Tables)
            self.assertTrue(PotholeDetail.query.count() > 0)
            self.assertTrue(PotholeCluster.query.count() > 0)
            self.assertTrue(PotholeClusterSighting.query.count() > 0)
            # PotholeReport handles in routes or async; wait, did I auto-gen a report? 
            # It's an API pull, so we test it in REST below.
            print("[DB-MODULE] Pothole (Details, Clusters, Sightings) relational inserts -> SUCCESS")

            # 5. Database Validation - ANIMAL MODULE (5 Tables)
            self.assertTrue(AnimalDetail.query.count() > 0)
            self.assertTrue(AnimalTrackSession.query.count() > 0)
            self.assertTrue(AnimalTrackFrame.query.count() > 0)
            print("[DB-MODULE] Animal (Details, Tracking, Frames) relational inserts -> SUCCESS")

            # 6. Database Validation - ACCIDENT MODULE (4 Tables)
            self.assertTrue(AccidentDetail.query.count() > 0)
            self.assertTrue(VehicleTrackSession.query.count() > 0)
            self.assertTrue(VehicleTrackFrame.query.count() > 0)
            print("[DB-MODULE] Accident (Details, Vehicles, Frames) relational inserts -> SUCCESS")

            # 7. Database Validation - ANALYTICS (2 Tables)
            self.assertTrue(FrameAnalytic.query.count() == 15) # 15 frames processed
            self.assertTrue(AnalyticsCache.query.count() > 0)
            print("[DB-MODULE] Analytics (Caches, Frames) aggregation logic -> SUCCESS")

        # 8. REST GET APIs
        get_sess = self.client.get('/api/sessions')
        self.assertEqual(get_sess.status_code, 200)
        print("[API-GET] /api/sessions -> SUCCESS (200)")
        
        get_dets = self.client.get(f'/api/sessions/{session_id}/detections')
        self.assertEqual(get_dets.status_code, 200)
        print(f"[API-GET] /api/sessions/.../detections -> SUCCESS (200) returned {len(get_dets.get_json())} rows")
        
        get_alerts = self.client.get('/api/alerts')
        self.assertEqual(get_alerts.status_code, 200)
        alerts = get_alerts.get_json()
        print(f"[API-GET] /api/alerts -> SUCCESS (200) returned {len(alerts)} alerts")
        
        get_analytic = self.client.get('/api/analytics')
        self.assertEqual(get_analytic.status_code, 200)
        print("[API-GET] /api/analytics -> SUCCESS (200)")

        get_report = self.client.get('/api/reports/potholes')
        self.assertEqual(get_report.status_code, 200)
        print("[API-GET] /api/reports/potholes -> SUCCESS (200)")

        # 9. REST POST (Modifying state)
        if len(alerts) > 0:
            alert_id = alerts[0]['id']
            post_ack = self.client.post(f'/api/alerts/{alert_id}/acknowledge', json={"user": "JASJYOT"})
            self.assertEqual(post_ack.status_code, 200)
            self.assertEqual(post_ack.get_json()['message'], 'Alert acknowledged')
            print("[API-POST] /api/alerts/.../acknowledge -> SUCCESS (200) state modified")
            
            post_res = self.client.post(f'/api/alerts/{alert_id}/resolve')
            self.assertEqual(post_res.status_code, 200)
            self.assertEqual(post_res.get_json()['message'], 'Alert resolved')
            print("[API-POST] /api/alerts/.../resolve -> SUCCESS (200) state modified")

if __name__ == '__main__':
    unittest.main()
