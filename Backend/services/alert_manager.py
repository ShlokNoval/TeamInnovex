from database.models import Alert
from database.connection import db
from api.websocket import broadcast_alert
import datetime

def handle_alerts(detection):
    """
    Alert Trigger Rule: Created only when risk_score >= 70 OR fusion layer sets CRITICAL.
    """
    fusion_flags = detection.fusion_flags or {}
    
    if detection.risk_score >= 70 or fusion_flags.get('combined_risk') == 'CRITICAL':
        
        alert_level = 'critical' if detection.risk_score >= 90 else 'high' if detection.risk_score >= 80 else 'medium'
        
        new_alert = Alert(
            detection_id=detection.id,
            session_id=detection.session_id,
            alert_level=alert_level,
            severity_score=detection.risk_score,
            type=detection.type,
            frame_number=detection.frame_number,
            timestamp_in_video=detection.timestamp_in_video,
            thumbnail_url=detection.thumbnail_url
        )
        
        db.session.add(new_alert)
        db.session.commit()
        
        # Broadcast immediately to React Admin Panel via websocket
        broadcast_alert({
            "id": new_alert.id,
            "session_id": new_alert.session_id,
            "level": new_alert.alert_level,
            "type": new_alert.type,
            "score": new_alert.severity_score,
            "frame": new_alert.frame_number,
            "time": new_alert.triggered_at.isoformat()
        })
