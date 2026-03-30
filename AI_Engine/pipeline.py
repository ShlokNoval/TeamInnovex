import cv2
import numpy as np

from detector import Detector
from tracking import CentroidTracker
from pothole_engine import PotholeEngine
from accident_engine import AccidentEngine
from animal_engine import AnimalEngine
from config import MODEL_PATH, SEVERITY_HIGH

class AIPipeline:
    def __init__(self, model_path=MODEL_PATH):
        self.detector = Detector(model_path=model_path)
        self.tracker = CentroidTracker()
        self.pothole_engine = PotholeEngine()
        self.accident_engine = AccidentEngine()
        self.animal_engine = AnimalEngine()
        
        # State mapping camera_id to prev_frame for AccidentEngine optical flow
        self.prev_frames = {}
        self.frame_counts = {}

    def process_frame(self, frame, camera_id="default"):
        if camera_id not in self.frame_counts:
            self.frame_counts[camera_id] = 0
            
        self.frame_counts[camera_id] += 1
        frame_num = self.frame_counts[camera_id]
        img_h, img_w = frame.shape[:2]

        # 1. Detection
        detections = self.detector.detect(frame)
        
        # 2. Tracking 
        track_objects = self.tracker.update(detections)
        
        # Build enriched detections combining YOLO metadata with tracker persistent IDs
        enriched_detections = []
        for det in detections:
            det_bbox = tuple(det['bbox'])
            mapped_track_id = None
            velocity_px = 0.0
            
            # Find matching track from tracker based on identical bbox coordinates
            for t_id, t_info in track_objects.items():
                if tuple(t_info['bbox']) == det_bbox:
                    mapped_track_id = str(t_id)
                    velocity_px = t_info.get('velocity_px', 0.0)
                    break
                    
            if mapped_track_id is None:
                mapped_track_id = "unk"
                
            det['track_id'] = mapped_track_id
            det['velocity_px'] = velocity_px
            # Ensure class mapping covers both conventions
            det['class'] = det['class_name']
            enriched_detections.append(det)

        track_severities = {}
        all_incidents = []

        # 3. Cross-Engine Evaluation
        # --- Accident Engine ---
        prev_frame = self.prev_frames.get(camera_id)
        M_anomaly = 0.0
        if prev_frame is not None:
            M_anomaly = self.accident_engine.compute_optical_flow(prev_frame, frame, camera_id)
            
        accident_result = self.accident_engine.compute_score(
            enriched_detections, M_anomaly, img_w, img_h, camera_id, frame_num
        )
        
        hit_and_run_detected = False
        hit_and_run_tracks = []
        for det in enriched_detections:
            if det['class'] in {'car', 'truck', 'motorcycle', 'bus'}:
                if self.accident_engine.detect_hit_and_run(camera_id, det['track_id'], frame_num):
                    hit_and_run_detected = True
                    hit_and_run_tracks.append(det['track_id'])
                    
        # Hit & run manual severity spike override natively ported
        if hit_and_run_detected and accident_result['severity_score'] < SEVERITY_HIGH:
            accident_result['severity_score'] = min(100, accident_result['severity_score'] + 20)
            if accident_result['severity_score'] >= SEVERITY_HIGH:
                accident_result['severity_label'] = 'HIGH'

        if self.accident_engine.should_alert(accident_result['severity_label']):
            all_incidents.append({
                'type': 'accident',
                'camera_id': camera_id,
                'frame': frame_num,
                'severity': accident_result['severity_label'],
                'data': accident_result
            })
            # Map all vehicle tracks to this severity for UI annotation
            for det in enriched_detections:
                if det['class'] in {'car', 'truck', 'motorcycle', 'bus'}:
                    track_severities[det['track_id']] = accident_result['severity_label']

        # --- Pothole & Animal Engine (Object-level Iteration) ---
        for det in enriched_detections:
            cls_name = det['class']
            t_id = det['track_id']
            
            if cls_name == 'pothole':
                score_info = self.pothole_engine.compute_score(det, img_w, img_h, camera_id, t_id)
                self.pothole_engine.update_lifecycle(camera_id, t_id, score_info['A_norm'])
                
                track_severities[t_id] = score_info['severity_label']
                if self.pothole_engine.should_alert(score_info['severity_label']):
                    all_incidents.append({
                        'type': 'pothole',
                        'camera_id': camera_id,
                        'frame': frame_num,
                        'severity': score_info['severity_label'],
                        'data': score_info
                    })
                    
            elif cls_name in {'dog', 'cat', 'cow', 'horse', 'sheep', 'animal'}:
                # Fetch recent centroid path history safely bounding backwards compatible index loops
                t_id_int = int(t_id) if t_id.isdigit() else t_id
                centroid_history = self.tracker.history.get(t_id_int, [])
                
                score_info = self.animal_engine.compute_score(
                    det, det['velocity_px'], centroid_history, None, img_w, img_h # road_boundary_polygon natively set to None
                )
                
                track_severities[t_id] = score_info['risk_label']
                if self.animal_engine.should_alert(score_info['risk_label'], centroid_history):
                    all_incidents.append({
                        'type': 'animal',
                        'camera_id': camera_id,
                        'frame': frame_num,
                        'severity': score_info['risk_label'],
                        'data': score_info
                    })

        self.prev_frames[camera_id] = frame.copy()
        
        # 4. Annotation Routing
        track_ids_idx = {}
        severity_map_idx = {}
        for idx, det in enumerate(enriched_detections):
            t_id = det['track_id']
            track_ids_idx[idx] = t_id
            severity_map_idx[idx] = track_severities.get(t_id, 'LOW')

        annotated_frame = self.detector.annotate(frame, detections, track_ids_idx, severity_map_idx)
        
        return annotated_frame, all_incidents
