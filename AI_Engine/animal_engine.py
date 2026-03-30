import cv2
import numpy as np
from config import ANIMAL_WEIGHTS, BEHAVIOR_WEIGHTS, PROXIMITY_WEIGHTS, V_THRESH_HIGH, V_THRESH_LOW, SEVERITY_LOW, SEVERITY_HIGH

class AnimalEngine:
    def __init__(self):
        pass

    def classify_behavior(self, velocity_px: float, trajectory_vector: tuple, road_boundary_polygon) -> str:
        if velocity_px > V_THRESH_HIGH:
            return 'RUNNING'
            
        # Simplified crossing logic for lack of precise trajectory projection without full tracker
        # In a real system, you'd calculate line intersections. For this module:
        # Crosses if velocity isn't small and it intersects road bounds
        if trajectory_vector and road_boundary_polygon is not None:
             pass # In full cv2, compute intersection
             
        if velocity_px > V_THRESH_LOW:
            return 'MOVING'
            
        return 'STATIONARY'

    def classify_proximity(self, centroid: tuple, road_boundary_polygon: list, img_h: int) -> str:
        # Default road polygon is the middle 60% if none provided
        y = centroid[1]
        
        if road_boundary_polygon is None:
            # Fallback proximity check (vertical mapping assuming road is bottom half)
            if y > (img_h * 0.4): 
                return 'on_road'
            elif y > (img_h * 0.2):
                return 'approaching'
            else:
                return 'roadside'
        
        poly = np.array(road_boundary_polygon, dtype=np.int32)
        dist = cv2.pointPolygonTest(poly, centroid, True)
        
        if dist >= 0:
            return 'on_road'
        elif -50 < dist < 0:
            return 'approaching'
        else:
            return 'roadside'

    def compute_score(self, detection: dict, velocity_px: float, trajectory_vector: tuple, road_boundary_polygon: list, img_w: int, img_h: int) -> dict:
        C = detection.get('confidence', 0.0)
        
        x, y, w, h = detection['bbox']
        centroid = (x + w/2, y + h/2)
        
        behavior = self.classify_behavior(velocity_px, trajectory_vector, road_boundary_polygon)
        proximity = self.classify_proximity(centroid, road_boundary_polygon, img_h)
        
        B_weight = BEHAVIOR_WEIGHTS.get(behavior, 0.2)
        P_road = PROXIMITY_WEIGHTS.get(proximity, 0.3)
        
        V_norm = min(1.0, velocity_px / (1 * img_w))
        
        RS = (ANIMAL_WEIGHTS['conf'] * C +
              ANIMAL_WEIGHTS['proximity'] * P_road +
              ANIMAL_WEIGHTS['behavior'] * B_weight +
              ANIMAL_WEIGHTS['velocity'] * V_norm) * 100
              
        if RS <= SEVERITY_LOW:
            label = 'LOW'
        elif RS < SEVERITY_HIGH:
            label = 'MEDIUM'
        else:
            label = 'HIGH'
            
        return {
            'risk_score': round(RS, 2),
            'risk_label': label,
            'behavior': behavior,
            'proximity': proximity,
            'velocity_px': round(velocity_px, 2)
        }

    def should_alert(self, risk_label: str) -> bool:
        return risk_label == 'HIGH'
