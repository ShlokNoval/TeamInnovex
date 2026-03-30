import time
import random
import datetime
import datetime
from database.connection import db
from database.models import UploadSession, Detection, PotholeDetail, AnimalDetail, AccidentDetail
from services.feature_extraction import classify_severity, assess_behavior, analyze_accident
from services.fusion import compute_multi_hazard_risk
from services.alert_manager import handle_alerts
from services.tracker import track_animal, track_vehicle, cluster_potholes
from services.analytics import compute_frame_stats
from services.annotation import draw_bounding_boxes
from api.websocket import stream_annotated_frame

def process_upload(session_id):
    """
    Simulates the 6-Layer AI Pipeline running in the background for a video upload.
    Normally uses cv2 to decode base64 frames and runs YOLOv8 models.
    """
    from main import app
    with app.app_context():
        session = UploadSession.query.get(session_id)
        if not session:
            return
            
        session.status = 'processing'
        session.processing_start = datetime.datetime.utcnow()
        db.session.commit()
        
        total_mock_frames = 15
        session.total_frames = total_mock_frames
        db.session.commit()
        
        for frame_idx in range(1, total_mock_frames + 1):
            time.sleep(1) # Simulate inference time
            
            # Layer 3: AI Model Layer (Mock YOLO output)
            hazards_detected = random.choices(
                ['pothole', 'animal', 'accident', 'none'], 
                weights=[30, 20, 10, 40]
            )[0]
            
            frame_detections = []
            
            if hazards_detected != 'none':
                timestamp_sec = frame_idx * 0.5 
                detection = Detection(
                    session_id=session.id,
                    type=hazards_detected,
                    confidence=random.uniform(0.65, 0.98),
                    bbox={"x": random.randint(0, 400), "y": random.randint(0, 300), "w": random.randint(50, 150), "h": random.randint(50, 150)},
                    frame_number=frame_idx,
                    timestamp_in_video=timestamp_sec,
                    thumbnail_url=f"/static/frames/{session.id}_{frame_idx}.jpg",
                    annotated_frame_url=f"/static/frames/{session.id}_{frame_idx}_annot.jpg"
                )
                
                # Apply Type-Specific Feature Extraction & Tracking
                if hazards_detected == 'pothole':
                    severity_class, reason, pos = classify_severity(detection.bbox)
                    detection.severity = severity_class
                    db.session.add(detection)
                    db.session.flush()
                    
                    details = PotholeDetail(
                        detection_id=detection.id,
                        area_px=detection.bbox['w'] * detection.bbox['h'],
                        aspect_ratio=detection.bbox['w'] / detection.bbox['h'],
                        severity_class=severity_class,
                        severity_reason=reason,
                        road_position=pos
                    )
                    db.session.add(details)
                    # Tracking USP
                    cluster_potholes(detection, session.id, severity_class)
                    
                elif hazards_detected == 'animal':
                    animal_type = random.choice(['dog', 'cow', 'pig'])
                    behavior, in_zone = assess_behavior()
                    detection.severity = 'high' if behavior == 'crossing' else 'medium'
                    db.session.add(detection)
                    db.session.flush()
                    
                    details = AnimalDetail(
                        detection_id=detection.id,
                        species=animal_type,
                        behavior=behavior,
                        behavior_confidence=random.uniform(0.7, 1.0),
                        in_road_zone=in_zone,
                        zone_label='road_center' if in_zone else 'safe',
                        night_mode_applied=False,
                        light_level='day',
                        estimated_speed_px=random.uniform(0, 15) if behavior in ['walking', 'running', 'crossing'] else 0.0
                    )
                    db.session.add(details)
                    # Tracking USP
                    track_animal(detection, session.id)
                    
                elif hazards_detected == 'accident':
                    score, details = analyze_accident(frame_idx)
                    detection.severity = 'high' if score > 80 else 'medium'
                    db.session.add(detection)
                    db.session.flush()
                    
                    acc_detail = AccidentDetail(
                        detection_id=detection.id,
                        severity_score=score,
                        vehicle_count=details['v_count'],
                        vehicle_types=details['v_types'],
                        human_detected=details['human'],
                        is_predictive=False,
                        hit_and_run_flag=details['hit_and_run'],
                        traffic_density_before=4.5,
                        traffic_density_after=0.5,
                        disruption_score=88.5,
                        road_blocked=True
                    )
                    db.session.add(acc_detail)
                    # Tracking USP
                    track_vehicle(detection, session.id)

                # Layer 5: Multi-Hazard Fusion
                risk_score, combined_risk_flag = compute_multi_hazard_risk(detection, session.id, frame_idx)
                detection.risk_score = risk_score
                detection.fusion_flags = {"combined_risk": combined_risk_flag}
                db.session.add(detection)
                db.session.commit()
                frame_detections.append(detection)
                
                # Layer 6: Output / Alert Trigger
                handle_alerts(detection)
                
            # Compute cross-frame analytics USP
            compute_frame_stats(session.id, frame_idx, frame_detections)
            
            # Layer 6: Stream Annotated Frame
            dummy_b64 = "base64_string_here"
            annotated_frame = draw_bounding_boxes(dummy_b64, frame_detections)
            stream_annotated_frame({
                "session_id": session.id,
                "frame": frame_idx,
                "url": f"/mock_stream/{frame_idx}.jpg",
                "annotated_frame": annotated_frame
            })
            
        session.status = 'completed'
        session.processing_end = datetime.datetime.utcnow()
        db.session.commit()

def process_live_frame(session_id, frame_b64, location=None):
    """
    NEW: Processes a single real-time frame from the mobile stream.
    Directly triggers the AI pipeline (Inference -> Fusion -> Alert).
    """
    from main import app
    with app.app_context():
        # Layer 3: Simulation (In production, replace with YOLO session inference)
        hazards_detected = random.choices(
            ['pothole', 'animal', 'accident', 'none'], 
            weights=[5, 5, 2, 88] # Lower frequency for live stream simulation
        )[0]
        
        # Robust session checking: If the session doesn't exist, use the default live session
        session = UploadSession.query.get(session_id)
        if not session:
            session_id = 'live-session-001'
        
        if hazards_detected == 'none':
            return {"detections": [], "alert_triggered": False}

        # Create localized detection
        lat = location.get('lat') if location else None
        lng = location.get('lng') if location else None
        
        detection = Detection(
            session_id=session_id,
            type=hazards_detected,
            confidence=random.uniform(0.75, 0.95),
            bbox={"x": 100, "y": 100, "w": 200, "h": 200},
            latitude=lat,
            longitude=lng
        )
        db.session.add(detection)
        db.session.commit()

        # Layer 5: Fusion 
        risk_score, combined_risk_flag = compute_multi_hazard_risk(detection, session_id, 0)
        detection.risk_score = risk_score
        
        # Layer 6: Alert Trigger (Pass location to AlertManager)
        alert = handle_alerts(detection, latitude=lat, longitude=lng)
        
        db.session.commit()
        return {
            "detections": [{
                "class": hazards_detected, 
                "confidence": detection.confidence,
                "bbox": [100, 100, 200, 200]
            }], 
            "alert_triggered": alert is not None
        }
