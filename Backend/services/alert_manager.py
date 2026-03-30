from database.models import Alert
from database.connection import db
from api.websocket import broadcast_alert
from services.notification import send_authority_notification
import datetime

def handle_alerts(detection, latitude=None, longitude=None):
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
            latitude=latitude,
            longitude=longitude,
            thumbnail_url=detection.thumbnail_url
        )
        
        db.session.add(new_alert)
        db.session.commit()
        
        # Construct alert data for broadcast
        alert_data = {
            "id": new_alert.id,
            "session_id": new_alert.session_id,
            "hazard_type": new_alert.type,
            "severity_label": new_alert.alert_level,
            "severity_score": new_alert.severity_score,
            "frame": new_alert.frame_number,
            "time": new_alert.triggered_at.isoformat(),
            "status": new_alert.status,
            "camera_id": "cam-001",
            "latitude": latitude,
            "longitude": longitude
        }
        
        # Broadcast immediately to React Admin Panel via websocket
        broadcast_alert(alert_data)
        
        # Dispatch SMTP if level is high or critical
        if alert_level in ['high', 'critical']:
            send_authority_notification(alert_data)
            
        return new_alert
    return None
