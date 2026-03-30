from config import POTHOLE_WEIGHTS, ZONE_WEIGHTS, SEVERITY_LOW, SEVERITY_HIGH

class PotholeEngine:
    def __init__(self):
        self.state = {} # Maps (camera_id, track_id) to state

    def classify_zone(self, bbox, img_w) -> str:
        # bbox is [x, y, w, h]
        x, y, w, h = bbox
        x_centre = x + w / 2
        
        if (img_w / 4) < x_centre < (3 * img_w / 4):
            return 'centre'
        elif 0 <= x_centre <= img_w:
            return 'edge'
        else:
            return 'off_road'

    def compute_score(self, detection: dict, img_w: int, img_h: int, camera_id: str, track_id: int) -> dict:
        x, y, w, h = detection['bbox']
        A_norm = (w * h) / (img_w * img_h)
        C = detection.get('confidence', 0.0)
        
        zone = self.classify_zone(detection['bbox'], img_w)
        Z = ZONE_WEIGHTS.get(zone, 0.2)
        
        key = (camera_id, track_id)
        if key not in self.state:
            self.state[key] = {
                'before_area': A_norm,
                'before_image': None,
                'detection_history': []
            }
            
        history = self.state[key]['detection_history']
        history.append(A_norm)
        if len(history) > 10:
            history.pop(0)
            
        F_repeat = len(history) / 10.0
        
        SS = (POTHOLE_WEIGHTS['area'] * A_norm +
              POTHOLE_WEIGHTS['conf'] * C +
              POTHOLE_WEIGHTS['zone'] * Z +
              POTHOLE_WEIGHTS['freq'] * F_repeat) * 100
              
        if SS <= SEVERITY_LOW:
            label = 'LOW'
        elif SS < SEVERITY_HIGH:
            label = 'MEDIUM'
        else:
            label = 'HIGH'
            
        return {
            'severity_score': round(SS, 2),
            'severity_label': label,
            'zone': zone,
            'A_norm': A_norm,
            'F_repeat': F_repeat
        }

    def update_lifecycle(self, camera_id: str, track_id: int, current_area: float, current_frame: int) -> str:
        key = (camera_id, track_id)
        if key not in self.state or self.state[key].get('before_area') is None:
            self.state[key] = {'before_area': current_area, 'history': []}
            return 'NEW'
            
        before_area = self.state[key]['before_area']
        growth_rate = (current_area - before_area) / before_area * 100
        
        if growth_rate > 15:
            return 'GROWING'
        elif -15 <= growth_rate <= 15:
            return 'STABLE'
        else:
            return 'RESOLVED'

    def should_alert(self, severity_label: str) -> bool:
        return severity_label == 'HIGH'
