from flask import Blueprint, request, jsonify
from database.connection import db
from database.models import UploadSession, Alert, AnalyticsCache, Detection, PotholeCluster, PotholeReport
from services.ai_engine import process_upload
from flask_jwt_extended import jwt_required
import json

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    """
    Endpoint 1: Upload a file to start the process.
    Expected Payload: {"filename": "video.mp4", "file_type": "video"}
    """
    data = request.json or {}
    filename = data.get('filename', 'test_video.mp4')
    file_type = data.get('file_type', 'video')
    
    new_session = UploadSession(
        filename=filename,
        file_type=file_type,
        status='processing'
    )
    db.session.add(new_session)
    db.session.commit()
    
    # Trigger background processing
    import gevent
    gevent.spawn(process_upload, new_session.id)
    
    return jsonify({
        "message": "Upload session created, processing started.",
        "session_id": new_session.id
    }), 201

@api_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    """
    Endpoint 2: Get all sessions for the Dashboard list.
    """
    sessions = UploadSession.query.order_by(UploadSession.uploaded_at.desc()).all()
    results = [
        {
            "id": s.id, 
            "filename": s.filename, 
            "status": s.status, 
            "uploaded_at": s.uploaded_at,
            "total_frames": s.total_frames
        } for s in sessions
    ]
    return jsonify(results), 200

@api_bp.route('/sessions/<session_id>/detections', methods=['GET'])
@jwt_required()
def get_session_detections(session_id):
    """
    Endpoint 3: Get all raw detections for a specific session.
    """
    detections = Detection.query.filter_by(session_id=session_id).order_by(Detection.frame_number.asc()).all()
    results = [
        {
            "id": d.id,
            "type": d.type,
            "confidence": d.confidence,
            "bbox": d.bbox,
            "frame_number": d.frame_number,
            "severity": d.severity,
            "risk_score": d.risk_score
        } for d in detections
    ]
    return jsonify(results), 200

@api_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    """
    Endpoint 4: Get Top alerts for the Admin panel.
    """
    alerts = Alert.query.order_by(Alert.triggered_at.desc()).limit(100).all()
    results = [
        {
            "id": a.id,
            "level": a.alert_level,
            "type": a.type,
            "score": a.severity_score,
            "status": a.status,
            "time": a.triggered_at,
            "frame": a.frame_number,
            "timestamp_in_video": a.timestamp_in_video,
            "latitude": a.latitude,
            "longitude": a.longitude
        } for a in alerts
    ]
    return jsonify(results), 200

@api_bp.route('/alerts/<alert_id>/acknowledge', methods=['POST'])
@jwt_required()
def acknowledge_alert(alert_id):
    """
    Endpoint 5: Update alert status to 'acknowledged'
    """
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"message": "Alert not found"}), 404
        
    data = request.json or {}
    alert.status = 'acknowledged'
    alert.acknowledged_by = data.get('user', 'Admin')
    
    from datetime import datetime
    alert.acknowledged_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({"message": "Alert acknowledged", "id": alert.id}), 200

@api_bp.route('/alerts/<alert_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_alert(alert_id):
    """
    Endpoint 6: Update alert status to 'resolved'
    """
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"message": "Alert not found"}), 404
        
    alert.status = 'resolved'
    from datetime import datetime
    alert.resolved_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({"message": "Alert resolved", "id": alert.id}), 200

@api_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    """
    Endpoint 7: Get real-time analytics summary from the database.
    """
    # Get overall counts from Detection table
    total_detections = Detection.query.count()
    pothole_count = Detection.query.filter_by(type='pothole').count()
    animal_count = Detection.query.filter_by(type='animal').count()
    accident_count = Detection.query.filter_by(type='accident').count()
    
    # Get severity breakdown from Alert table
    low_alerts = Alert.query.filter_by(alert_level='low').count()
    medium_alerts = Alert.query.filter_by(alert_level='medium').count()
    high_alerts = Alert.query.filter_by(alert_level='high').count()
    critical_alerts = Alert.query.filter_by(alert_level='critical').count()
    
    # Get today's detections
    from datetime import datetime, timedelta
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_detections = Detection.query.filter(Detection.session_id != None).count() # Simplified for now
    
    results = {
        "total_detections": total_detections,
        "pothole_count": pothole_count,
        "animal_count": animal_count,
        "accident_count": accident_count,
        "today_detections": today_detections,
        "by_severity": {
            "low": low_alerts,
            "medium": medium_alerts,
            "high": high_alerts,
            "critical": critical_alerts
        }
    }
    return jsonify(results), 200

@api_bp.route('/reports/potholes', methods=['GET'])
@jwt_required()
def get_pothole_reports():
    """
    Endpoint 8: Get Automated Generate Reports for potholes
    """
    reports = PotholeReport.query.order_by(PotholeReport.generated_at.desc()).all()
    results = [
        {
            "id": r.id,
            "cluster_id": r.cluster_id,
            "severity": r.severity,
            "location_label": r.location_label,
            "status": r.status,
            "generated_at": r.generated_at
        } for r in reports
    ]
    return jsonify(results), 200
