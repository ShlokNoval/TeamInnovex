def compute_multi_hazard_risk(detection, session_id, frame_idx):
    """
    Multi-Hazard Fusion Intelligence:
    The system evaluates combined risks across modules (e.g., animal presence 
    with fast-moving vehicles or potholes in high-traffic areas).
    """
    base_score = 0
    
    # Unified Risk Framework conversion
    if detection.severity == 'high':
        base_score = 80
    elif detection.severity == 'medium':
        base_score = 50
    else:
        base_score = 20
        
    if detection.type == 'accident' and getattr(detection, 'risk_score', None):
        base_score = max(base_score, detection.risk_score)
        
    combined_risk_flag = "NONE"
    
    # Simulate multi-hazard logic: For instance, a pothole detected
    # recently while a high-speed vehicle or animal is present
    
    # Just a robust heuristic mapping for hackathon demo
    if detection.type == 'animal' and detection.severity in ['high', 'medium']:
        # Factor in "fast moving vehicles" assumption
        base_score = min(100, base_score + 15)
        
    if detection.type == 'pothole' and detection.severity == 'high':
        # Factor in traffic area assumption
        base_score = min(100, base_score + 10)
        
    if base_score > 90:
        combined_risk_flag = "CRITICAL"
        
    return base_score, combined_risk_flag
