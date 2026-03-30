import cv2
import numpy as np
from collections import deque
from config import ACCIDENT_WEIGHTS, MAX_VEHICLES, V_MAX_KMH, SEVERITY_LOW, SEVERITY_HIGH

class AccidentEngine:
    def __init__(self, baseline_window=30):
        self.flow_baseline_history = deque(maxlen=baseline_window)
        self.sigma_baseline = 1.0

    def compute_optical_flow(self, prev_grey: np.ndarray, curr_grey: np.ndarray, roi_bbox=None) -> float:
        flow = cv2.calcOpticalFlowFarneback(prev_grey, curr_grey, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        
        if roi_bbox:
            x, y, w, h = map(int, roi_bbox)
            flow = flow[y:y+h, x:x+w]
            
        magnitudes = np.sqrt(flow[..., 0]**2 + flow[..., 1]**2)
        sigma = np.std(magnitudes)
        
        self.flow_baseline_history.append(sigma)
        if len(self.flow_baseline_history) > 0:
            self.sigma_baseline = np.mean(self.flow_baseline_history) or 1.0
            
        return min(1.0, sigma / self.sigma_baseline)

    def detect_collision(self, tracked_vehicles: dict) -> tuple:
        max_iou = 0.0
        colliding_pairs = []
        track_ids = list(tracked_vehicles.keys())
        
        def compute_iou(box1, box2):
            x1, y1, w1, h1 = box1
            x2, y2, w2, h2 = box2
            
            xi1 = max(x1, x2)
            yi1 = max(y1, y2)
            xi2 = min(x1 + w1, x2 + w2)
            yi2 = min(y1 + h1, y2 + h2)
            inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
            
            box1_area = w1 * h1
            box2_area = w2 * h2
            union_area = box1_area + box2_area - inter_area
            
            return inter_area / union_area if union_area > 0 else 0.0

        for i in range(len(track_ids)):
            for j in range(i + 1, len(track_ids)):
                id1, id2 = track_ids[i], track_ids[j]
                box1 = tracked_vehicles[id1]['bbox']
                box2 = tracked_vehicles[id2]['bbox']
                
                iou = compute_iou(box1, box2)
                if iou > max_iou:
                    max_iou = iou
                if iou > 0.3:
                    colliding_pairs.append((id1, id2))
                    
        return max_iou, colliding_pairs

    def detect_sudden_stop(self, track_id: int, velocity_history: deque) -> bool:
        if len(velocity_history) < 2:
            return False
            
        deceleration = velocity_history[-2] - velocity_history[-1]
        return deceleration > (0.7 * velocity_history[-2])

    def detect_hit_and_run(self, track_id: int, sudden_stop: bool, frames_since_stop: int, exited: bool) -> bool:
        return sudden_stop and exited and (frames_since_stop <= 5)

    def compute_score(self, M_anomaly: float, iou_max: float, N_vehicles: int, human_present: bool, speed_norm: float) -> dict:
        N_norm = min(1.0, N_vehicles / MAX_VEHICLES)
        H_pres = 1.0 if human_present else 0.0
        
        SS = (ACCIDENT_WEIGHTS['iou'] * iou_max +
              ACCIDENT_WEIGHTS['anomaly'] * M_anomaly +
              ACCIDENT_WEIGHTS['vehicles'] * N_norm +
              ACCIDENT_WEIGHTS['human'] * H_pres +
              ACCIDENT_WEIGHTS['speed'] * speed_norm) * 100
              
        if SS <= SEVERITY_LOW:
            label = 'LOW'
        elif SS < SEVERITY_HIGH:
            label = 'MEDIUM'
        else:
            label = 'HIGH'
            
        return {
            'severity_score': round(SS, 2),
            'severity_label': label,
            'hit_and_run': False,
            'congestion_level': N_norm
        }

    def should_alert(self, severity_label: str) -> bool:
        return severity_label == 'HIGH'
