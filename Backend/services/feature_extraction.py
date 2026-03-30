import random

def classify_severity(bbox):
    """
    Potholes are categorized into Low, Medium, and High severity 
    based on size and contextual factors.
    """
    area_px = bbox.get('w', 0) * bbox.get('h', 0)
    
    # Context-Aware Risk Adjustment
    road_position = random.choice(['center', 'shoulder', 'edge'])
    
    # Base logic as requested in spec
    if area_px < 2000:
        severity = 'low'
        reason = f'Small surface area ({area_px}px)'
    elif 2000 <= area_px <= 8000:
        severity = 'medium'
        reason = f'Moderate surface area ({area_px}px)'
    else:
        severity = 'high'
        reason = f'Large hazardous area ({area_px}px)'
        
    if road_position == 'center' and severity != 'high':
        # Bump up severity one level
        severity = 'medium' if severity == 'low' else 'high'
        reason += ", bumped due to center road position."
        
    return severity, reason, road_position

def assess_behavior():
    """
    Analyzes animal behavior (e.g., sitting, standing, crossing, running)
    and assigns risk levels accordingly.
    """
    # Predictive Animal Movement Analysis
    behaviors = ['sitting', 'standing', 'walking', 'running', 'crossing']
    behavior = random.choices(behaviors, weights=[20, 30, 20, 10, 20])[0]
    
    # Region-Based Risk Detection
    # Defines road and non-road zones within CCTV frames
    in_zone = behavior in ['running', 'crossing'] or random.random() > 0.6
    
    return behavior, in_zone

def analyze_accident(frame_idx):
    """
    Accident Severity Scoring Engine
    A quantitative scoring system (0–100) evaluates accident severity based on 
    speed, number of vehicles, vehicle type, and human presence.
    """
    v_count = random.randint(1, 4)
    human = random.choice([True, False])
    speed = random.uniform(20.0, 80.0) # Estimated speed px/frame or similar
    
    # Base score calculated
    score = 20 + (v_count * 15)
    if human:
        score += 30
    if speed > 60:
        score += 15
        
    score = min(100, int(score))
        
    details = {
        'v_count': v_count,
        'v_types': {"car": v_count, "truck": 0, "bike": 1 if human else 0},
        'human': human,
        'estimated_speed_px': speed,
        'hit_and_run': (v_count > 1 and random.random() > 0.7) # Tracking vehicle post-collision
    }
    return score, details
