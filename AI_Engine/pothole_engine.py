"""
PotholeEngine: AI road hazard detection module for identifying, scoring, and tracking potholes.

The PotholeEngine supports two input modes: video files and real-time RTSP streams.
It calculates a dynamic severity score for each detected pothole by combining:
- Normalized area (size relative to screen)
- Model confidence
- Image zone placement (center vs edge)
- Frequency of appearance over the last few frames

It can run in both regular and low-light (night) modes using CLAHE and gamma correction for preprocessing.
"""

import cv2
import numpy as np

# Import constants from config.py in the same directory
from config import (
    POTHOLE_WEIGHTS, 
    ZONE_WEIGHTS, 
    SEVERITY_LOW, 
    SEVERITY_HIGH, 
    CONF_THRESHOLD, 
    CONF_THRESHOLD_NIGHT, 
    FRAME_BUFFER
)

GROWTH_RATE_GROWING = 15
GROWTH_RATE_RESOLVED = -80

class PotholeEngine:
    def __init__(self):
        self.state = {}

    def preprocess_frame(self, frame):
        # Convert BGR to LAB color space
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel only
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        
        # Merge back to BGR
        limg = cv2.merge((cl, a, b))
        clahe_bgr = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
        # Gamma correction
        gamma = 0.5
        invGamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** invGamma) * 255
                          for i in np.arange(0, 256)]).astype("uint8")
        gamma_corrected = cv2.LUT(clahe_bgr, table)
        
        # Apply Gaussian Blur (3,3)
        blurred = cv2.GaussianBlur(gamma_corrected, (3, 3), 0)
        return blurred

    def classify_zone(self, bbox, img_w):
        x, y, w, h = bbox
        x_centre = x + w / 2.0
        
        if x_centre < 0 or x_centre > img_w:
            return 'off_road'
        elif img_w / 4 < x_centre < 3 * img_w / 4:
            return 'centre'
        else:
            return 'edge'

    def compute_score(self, detection, img_w, img_h, camera_id, track_id):
        x, y, w, h = detection['bbox']
        confidence = detection['confidence']
        
        # Use pre-computed area_norm from pipeline alias if available,
        # otherwise calculate from actual bbox dimensions
        A_norm = detection.get('area_norm', (w * h) / (img_w * img_h))
        C = confidence
        
        zone_str = self.classify_zone(detection['bbox'], img_w)
        Z = ZONE_WEIGHTS.get(zone_str, 0)
        
        key = (camera_id, track_id)
        if key not in self.state:
            # On first visit, initialise state
            self.state[key] = {
                'before_area': A_norm,
                'detection_history': [],
                'first_frame': True
            }
        
        # History
        self.state[key]['detection_history'].append(A_norm)
        if len(self.state[key]['detection_history']) > FRAME_BUFFER:
            self.state[key]['detection_history'] = self.state[key]['detection_history'][-FRAME_BUFFER:]
            
        history = self.state[key]['detection_history']
        F_repeat = len(history) / float(FRAME_BUFFER)
        
        # Severity Score Calculation
        ss_val = (POTHOLE_WEIGHTS['area'] * A_norm + 
                  POTHOLE_WEIGHTS['conf'] * C + 
                  POTHOLE_WEIGHTS['zone'] * Z + 
                  POTHOLE_WEIGHTS['freq'] * F_repeat) * 100
                  
        ss_val = round(ss_val, 2)
        
        if ss_val <= SEVERITY_LOW:
            label = 'LOW'
        elif ss_val >= SEVERITY_HIGH:
            label = 'HIGH'
        else:
            label = 'MEDIUM'
            
        return {
            'severity_score': ss_val,
            'severity_label': label,
            'zone': zone_str,
            'A_norm': A_norm,
            'F_repeat': F_repeat,
            'confidence': confidence
        }

    def update_lifecycle(self, camera_id, track_id, current_area):
        key = (camera_id, track_id)
        
        is_new = False
        if key not in self.state:
            self.state[key] = {}
            is_new = True
        elif self.state[key].get('first_frame', False):
            is_new = True
            self.state[key]['first_frame'] = False
            
        if is_new:
            self.state[key]['before_area'] = current_area
            return 'NEW'
            
        before_area = self.state[key].get('before_area', current_area)
        
        if before_area == 0:
            growth_rate = 0
        else:
            growth_rate = (current_area - before_area) / before_area * 100
            
        # Update before_area so next call compares to the last known area
        self.state[key]['before_area'] = current_area
            
        if growth_rate > GROWTH_RATE_GROWING:
            return 'GROWING'
        elif growth_rate < GROWTH_RATE_RESOLVED:
            return 'RESOLVED'
        elif -80 <= growth_rate < -15:
            return 'RECOVERING'
        elif -15 <= growth_rate <= 15:
            return 'STABLE'
        else:
            return 'STABLE'

    def should_alert(self, severity_label):
        return severity_label in ('MEDIUM', 'HIGH')

    def process_video(self, video_path, model, camera_id, is_night=False):
        cap = cv2.VideoCapture(video_path)
        conf_thresh = CONF_THRESHOLD_NIGHT if is_night else CONF_THRESHOLD
        
        incidents = []
        alerts_list = []
        total_frames = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            total_frames += 1
            img_h, img_w = frame.shape[:2]
            
            if is_night:
                frame = self.preprocess_frame(frame)
                
            # Run YOLO inference
            results = model.predict(frame, conf=conf_thresh, verbose=False)
            
            for result in results:
                if not hasattr(result, 'boxes') or result.boxes is None:
                    continue
                    
                names = getattr(result, 'names', {})
                
                boxes = result.boxes.xywh.cpu().numpy()
                confs = result.boxes.conf.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy()
                
                for i, (bbox, conf, cls) in enumerate(zip(boxes, confs, classes)):
                    # Filter detections to class 'pothole' only
                    if names.get(cls, '').lower() != 'pothole':
                        continue
                        
                    xyxy = result.boxes.xyxy.cpu().numpy()[i]
                    x1, y1, x2, y2 = xyxy
                    tl_w = x2 - x1
                    tl_h = y2 - y1
                    detection = {
                        'bbox': [x1, y1, tl_w, tl_h],
                        'confidence': float(conf)
                    }
                    
                    track_id = f"trk_{i}"
                    
                    score_info = self.compute_score(detection, img_w, img_h, camera_id, track_id)
                    lifecycle_status = self.update_lifecycle(camera_id, track_id, score_info['A_norm'])
                    
                    incident = {
                        'camera_id': camera_id,
                        'track_id': track_id,
                        'frame': total_frames,
                        'lifecycle_status': lifecycle_status,
                        **score_info
                    }
                    incidents.append(incident)
                    
                    if self.should_alert(score_info['severity_label']):
                        alerts_list.append(incident)
                        
        cap.release()
        return {
            'total_frames': total_frames,
            'total_incidents': len(incidents),
            'alerts': alerts_list,
            'incidents': incidents
        }

    def process_stream(self, rtsp_url, model, camera_id, is_night=False, max_frames=None):
        cap = cv2.VideoCapture(rtsp_url)
        conf_thresh = CONF_THRESHOLD_NIGHT if is_night else CONF_THRESHOLD
        
        incidents = []
        alerts_list = []
        total_frames = 0
        
        try:
            while cap.isOpened():
                if max_frames is not None and total_frames >= max_frames:
                    break
                    
                ret, frame = cap.read()
                if not ret:
                    break
                    
                total_frames += 1
                img_h, img_w = frame.shape[:2]
                
                if is_night:
                    frame = self.preprocess_frame(frame)
                    
                results = model.predict(frame, conf=conf_thresh, verbose=False)
                
                for result in results:
                    if not hasattr(result, 'boxes') or result.boxes is None:
                        continue
                        
                    names = getattr(result, 'names', {})
                    
                    boxes = result.boxes.xywh.cpu().numpy()
                    confs = result.boxes.conf.cpu().numpy()
                    classes = result.boxes.cls.cpu().numpy()
                    
                    for i, (bbox, conf, cls) in enumerate(zip(boxes, confs, classes)):
                        # Filter detections to class 'pothole' only
                        if names.get(cls, '').lower() != 'pothole':
                            continue
                            
                        xyxy = result.boxes.xyxy.cpu().numpy()[i]
                        x1, y1, x2, y2 = xyxy
                        tl_w = x2 - x1
                        tl_h = y2 - y1
                        detection = {
                            'bbox': [x1, y1, tl_w, tl_h],
                            'confidence': float(conf)
                        }
                        
                        track_id = f"trk_{i}"
                        
                        score_info = self.compute_score(detection, img_w, img_h, camera_id, track_id)
                        lifecycle_status = self.update_lifecycle(camera_id, track_id, score_info['A_norm'])
                        
                        incident = {
                            'camera_id': camera_id,
                            'track_id': track_id,
                            'frame': total_frames,
                            'lifecycle_status': lifecycle_status,
                            **score_info
                        }
                        incidents.append(incident)
                        
                        if self.should_alert(score_info['severity_label']):
                            alerts_list.append(incident)
                            
        except KeyboardInterrupt:
            # Stop stream gracefully on interrupt
            pass
        finally:
            cap.release()
            
        return {
            'total_frames': total_frames,
            'total_incidents': len(incidents),
            'alerts': alerts_list,
            'incidents': incidents
        }
