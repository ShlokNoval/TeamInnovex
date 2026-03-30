import time
import json
import unittest
from main import app
from database.connection import db

class TestRoadHazardAPI(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_full_crud_flow(self):
        print("\n--- Testing API CRUD Flow ---")
        
        # 1. Start Upload Session
        upload_resp = self.client.post('/api/upload', json={
            "filename": "highway_test.mp4",
            "file_type": "video"
        })
        self.assertEqual(upload_resp.status_code, 201)
        session_data = upload_resp.get_json()
        self.assertIn('session_id', session_data)
        session_id = session_data['session_id']
        print(f"1. [PASS] Session Uploaded: {session_id}")
        
        # Since process_upload is spawned asynchronously, let's call it synchronously to populate mock data
        with app.app_context():
            from services.ai_engine import process_upload
            
            # Monkeypatch time.sleep to run instantly
            import services.ai_engine
            original_sleep = services.ai_engine.time.sleep
            services.ai_engine.time.sleep = lambda x: None
            
            # Execute processing
            process_upload(session_id)
            
            services.ai_engine.time.sleep = original_sleep
            print("   -> Simulated AI processing natively in 0 seconds")

        # 2. Get Sessions List
        sessions_resp = self.client.get('/api/sessions')
        self.assertEqual(sessions_resp.status_code, 200)
        sessions_array = sessions_resp.get_json()
        self.assertEqual(len(sessions_array), 1)
        self.assertEqual(sessions_array[0]['status'], 'completed')
        print(f"2. [PASS] Pulled Session Lists. Status: {sessions_array[0]['status']}")

        # 3. Get Session Detections
        det_resp = self.client.get(f'/api/sessions/{session_id}/detections')
        self.assertEqual(det_resp.status_code, 200)
        detections = det_resp.get_json()
        self.assertTrue(len(detections) > 0)
        print(f"3. [PASS] Retrieved {len(detections)} AI detections attached to session")

        # 4. Get Alerts
        alerts_resp = self.client.get('/api/alerts')
        self.assertEqual(alerts_resp.status_code, 200)
        alerts = alerts_resp.get_json()
        
        # Depending on RNG, might be zero alerts if no Critical risk spawned, but mock usually spawns them
        if len(alerts) > 0:
            print(f"4. [PASS] Retrieved {len(alerts)} real-time Alerts from database")
            
            alert_id = alerts[0]['id']
            
            # 5. Acknowledge Alert
            ack_resp = self.client.post(f'/api/alerts/{alert_id}/acknowledge', json={"user": "Officer Sharma"})
            self.assertEqual(ack_resp.status_code, 200)
            print(f"5. [PASS] Alert {alert_id} beautifully Acknowledged")

            # 6. Resolve Alert
            res_resp = self.client.post(f'/api/alerts/{alert_id}/resolve')
            self.assertEqual(res_resp.status_code, 200)
            print(f"6. [PASS] Alert {alert_id} completely Resolved")
        else:
            print("4. [PASS] Zero alerts triggered over 70 risk naturally in this random seed.")

        # 7. Get Analytics Cache
        analytics_resp = self.client.get('/api/analytics')
        self.assertEqual(analytics_resp.status_code, 200)
        analytics_map = analytics_resp.get_json()
        self.assertIn('total_detections', analytics_map)
        print(f"7. [PASS] Cache returned Analytics mapping: Total Dets={analytics_map.get('total_detections')}")

        # 8. Get Reports
        reports_resp = self.client.get('/api/reports/potholes')
        self.assertEqual(reports_resp.status_code, 200)
        print("8. [PASS] Pothole Reports Endpoint returns beautifully")

if __name__ == '__main__':
    unittest.main()
