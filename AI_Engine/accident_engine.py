"""
AccidentEngine: Detects road accidents from video frames using
vehicle IoU collision detection, optical flow motion anomaly scoring,
sudden stop detection, hit-and-run flagging, and a composite
severity score combining all signals as per official documentation.
"""

import cv2
import numpy as np
import math

# Configuration constants as per documentation
MAX_VEHICLES = 5
V_MAX_KMH = 120.0  # speed normalization proxy
ACCIDENT_WEIGHTS = {'iou': 0.35, 'anomaly': 0.25, 'vehicles': 0.15, 'human': 0.15, 'speed': 0.10}
SEVERITY_LOW = 30
SEVERITY_HIGH = 71
FRAME_BUFFER = 5  # frames for hit-and-run detection
VELOCITY_HISTORY = 5  # frames for rolling velocity
FLOW_HISTORY_MAX = 30  # frames for baseline flow std

class AccidentEngine:
    def __init__(self):
        # Vehicle tracking state: keyed by (camera_id, track_id)
        self.state = {}
        # Flow baseline and history keyed by camera_id
        self.flow_baseline = {}
        self.flow_history = {}

    # ----------------- Bounding Box & Collision -----------------
    @staticmethod
    def compute_iou(boxA, boxB):
        """Compute IoU between two boxes [x, y, w, h]."""
        xA1, yA1, xA2, yA2 = boxA[0], boxA[1], boxA[0]+boxA[2], boxA[1]+boxA[3]
        xB1, yB1, xB2, yB2 = boxB[0], boxB[1], boxB[0]+boxB[2], boxB[1]+boxB[3]

        inter_w = max(0, min(xA2, xB2) - max(xA1, xB1))
        inter_h = max(0, min(yA2, yB2) - max(yA1, yB1))
        inter_area = inter_w * inter_h

        union_area = boxA[2]*boxA[3] + boxB[2]*boxB[3] - inter_area
        return inter_area / union_area if union_area > 0 else 0.0

    def detect_collision(self, detections):
        """Detect collision between vehicles based on IoU > 0.3."""
        vehicle_classes = {'car', 'truck', 'motorcycle'}
        vehicles = [d for d in detections if str(d.get('class','')).lower() in vehicle_classes]

        max_iou = 0.0
        n = len(vehicles)
        for i in range(n):
            for j in range(i+1, n):
                iou = self.compute_iou(vehicles[i]['bbox'], vehicles[j]['bbox'])
                max_iou = max(max_iou, iou)

        collision_detected = max_iou > 0.3
        return collision_detected, max_iou

    # ----------------- Optical Flow & Motion -----------------
    def compute_optical_flow(self, prev_frame, curr_frame, camera_id):
        """Compute motion anomaly score M_anomaly based on flow std dev."""
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)

        if prev_gray.shape != curr_gray.shape:
            # Different resolutions or orientations—reset state
            self.flow_history[camera_id] = []
            return 0.0

        flow = cv2.calcOpticalFlowFarneback(
            prev_gray, curr_gray, None,
            pyr_scale=0.5, levels=3, winsize=15,
            iterations=3, poly_n=5, poly_sigma=1.2, flags=0
        )
        mag, _ = cv2.cartToPolar(flow[...,0], flow[...,1])
        _, std_val = cv2.meanStdDev(mag)
        std_val = float(std_val[0][0])

        # Update flow history
        if camera_id not in self.flow_history:
            self.flow_history[camera_id] = []
        self.flow_history[camera_id].append(std_val)
        if len(self.flow_history[camera_id]) > FLOW_HISTORY_MAX:
            self.flow_history[camera_id] = self.flow_history[camera_id][-FLOW_HISTORY_MAX:]

        # Compute baseline
        history = self.flow_history[camera_id]
        baseline = np.mean(history) if len(history) >= 10 else std_val
        self.flow_baseline[camera_id] = baseline

        safe_baseline = max(baseline, 0.001)
        M_anomaly = min(1.0, std_val / safe_baseline)
        return M_anomaly

    # ----------------- Velocity & Sudden Stop -----------------
    def compute_velocity(self, camera_id, track_id, centroid, frame_interval=1):
        key = (camera_id, track_id)
        if key not in self.state:
            self.state[key] = {'centroid': centroid, 'velocities': [], 'last_seen': 0, 'sudden_stop_detected': False, 'stop_frame': -1}
            return 0.0

        prev_centroid = self.state[key]['centroid']
        dx, dy = centroid[0]-prev_centroid[0], centroid[1]-prev_centroid[1]
        v_pixel = math.sqrt(dx**2 + dy**2) / max(1, frame_interval)

        velocities = self.state[key]['velocities']
        velocities.append(v_pixel)
        if len(velocities) > VELOCITY_HISTORY:
            velocities = velocities[-VELOCITY_HISTORY:]
        self.state[key]['velocities'] = velocities
        self.state[key]['centroid'] = centroid
        self.state[key]['v_pixel_avg'] = sum(velocities)/len(velocities)
        return self.state[key]['v_pixel_avg']

    def detect_sudden_stop(self, camera_id, track_id):
        key = (camera_id, track_id)
        if key not in self.state:
            return False

        velocities = self.state[key].get('velocities', [])
        if len(velocities) < 2:
            return False

        v_prev, v_curr = velocities[-2], velocities[-1]
        deceleration = v_prev - v_curr
        if v_prev > 0 and deceleration > 0.7 * v_prev:
            self.state[key]['sudden_stop_detected'] = True
            return True
        return False

    def detect_hit_and_run(self, camera_id, track_id, current_frame):
        key = (camera_id, track_id)
        if key not in self.state:
            return False

        sudden_stop = self.state[key].get('sudden_stop_detected', False)
        if not sudden_stop:
            return False

        if self.state[key].get('stop_frame', -1) == -1:
            self.state[key]['stop_frame'] = current_frame

        last_seen = self.state[key].get('last_seen', current_frame)
        if current_frame - last_seen > FRAME_BUFFER:
            return True
        return False

    # ----------------- Accident Severity -----------------
    def compute_score(self, detections, M_anomaly, img_w, img_h, camera_id, frame_num):
        # Update last_seen for active tracks
        active_track_ids = []
        for det in detections:
            if 'track_id' in det:
                track_id = det['track_id']
                key = (camera_id, track_id)
                if key in self.state:
                    self.state[key]['last_seen'] = frame_num
                active_track_ids.append(track_id)

        # Collision
        collision_detected, max_iou = self.detect_collision(detections)
        IoU_collision = max_iou if collision_detected else 0.0

        # Vehicle count normalization
        vehicle_classes = {'car', 'truck', 'motorcycle'}
        N_vehicles = sum(1 for d in detections if str(d.get('class','')).lower() in vehicle_classes)
        N_vehicles_norm = min(1.0, N_vehicles / MAX_VEHICLES)

        # Human presence
        H_pres = 1.0 if any(str(d.get('class','')).lower()=='person' for d in detections) else 0.0

        # Speed normalization
        max_v = 0.0
        for track_id in active_track_ids:
            key = (camera_id, track_id)
            if key in self.state:
                max_v = max(max_v, self.state[key].get('v_pixel_avg',0.0))
        S_norm = min(1.0, max_v / V_MAX_KMH)

        # Accident Severity Score
        SS = (ACCIDENT_WEIGHTS['iou']*IoU_collision +
              ACCIDENT_WEIGHTS['anomaly']*M_anomaly +
              ACCIDENT_WEIGHTS['vehicles']*N_vehicles_norm +
              ACCIDENT_WEIGHTS['human']*H_pres +
              ACCIDENT_WEIGHTS['speed']*S_norm) * 100
        SS = round(SS, 2)

        # Severity label
        if SS <= SEVERITY_LOW:
            label = 'LOW'
        elif SS >= SEVERITY_HIGH:
            label = 'HIGH'
        else:
            label = 'MEDIUM'

        return {
            'severity_score': SS,
            'severity_label': label,
            'IoU_collision': IoU_collision,
            'M_anomaly': M_anomaly,
            'N_vehicles': N_vehicles,
            'human_present': H_pres > 0.0,
            'collision_detected': collision_detected
        }

    def should_alert(self, severity_label):
        return severity_label == 'HIGH'