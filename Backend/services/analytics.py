from database.connection import db
from database.models import FrameAnalytic, AnalyticsCache
from datetime import datetime

def compute_frame_stats(session_id, frame_num, detections):
    """
    Calculates frame-level stats and caches dashboard aggregates.
    """
    max_score = max([d.risk_score for d in detections]) if detections else 0
    pothole_c = sum(1 for d in detections if d.type == 'pothole')
    animal_c = sum(1 for d in detections if d.type == 'animal')
    accident_c = sum(1 for d in detections if d.type == 'accident')
    
    stat = FrameAnalytic(
        session_id=session_id,
        frame_number=frame_num,
        pothole_count=pothole_c,
        animal_count=animal_c,
        accident_count=accident_c,
        max_risk_score=max_score,
        processing_ms=visual_latency_sim()
    )
    db.session.add(stat)
    
    # Aggregate cache for the dashboard
    total_dets = len(detections)
    if total_dets > 0:
        update_global_cache("total_detections", total_dets)
        update_global_cache("avg_risk_score", max_score, average=True)
    
    if pothole_c > 0:
        update_global_cache("pothole_count", pothole_c)
    if animal_c > 0:
        update_global_cache("animal_crossing_count", animal_c)
        
    db.session.commit()

def update_global_cache(metric_name, value, average=False):
    metric = AnalyticsCache.query.filter_by(metric_name=metric_name, session_id=None).first()
    if not metric:
        metric = AnalyticsCache(
            metric_name=metric_name,
            value=value,
            time_bucket='alltime',
            computed_at=datetime.utcnow()
        )
        db.session.add(metric)
    else:
        if average:
            metric.value = (metric.value + value) / 2 # simplified moving average
        else:
            metric.value += value
        metric.computed_at = datetime.utcnow()

def visual_latency_sim():
    import random
    return random.randint(30, 150)
