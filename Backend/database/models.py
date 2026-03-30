import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Enum, Text, JSON
from sqlalchemy.orm import relationship
from database.connection import db

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default='admin')

class UploadSession(db.Model):
    __tablename__ = 'upload_sessions'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(Text, nullable=False)
    file_type = Column(String(50)) # video | image
    file_size_bytes = Column(Integer)
    duration_seconds = Column(Float, nullable=True)
    total_frames = Column(Integer, nullable=True)
    fps = Column(Float, nullable=True)
    resolution_w = Column(Integer)
    resolution_h = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processing_start = Column(DateTime, nullable=True)
    processing_end = Column(DateTime, nullable=True)
    status = Column(String(50), default='pending') # pending | processing | completed | failed
    label = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

class Detection(db.Model):
    __tablename__ = 'detections'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    type = Column(String(50)) # pothole | animal | accident
    confidence = Column(Float)
    bbox = Column(JSON) # {x, y, w, h}
    frame_number = Column(Integer, default=0)
    timestamp_in_video = Column(Float, default=0.0)
    severity = Column(String(50)) # low | medium | high
    risk_score = Column(Integer)
    thumbnail_url = Column(Text)
    annotated_frame_url = Column(Text)
    fusion_flags = Column(JSON, nullable=True)

    session = relationship('UploadSession', backref='detections')

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    detection_id = Column(String(36), ForeignKey('detections.id'))
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    alert_level = Column(String(50)) # medium | high | critical
    severity_score = Column(Integer)
    type = Column(String(50))
    triggered_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default='new') # new | acknowledged | resolved
    acknowledged_by = Column(Text, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    frame_number = Column(Integer)
    timestamp_in_video = Column(Float)
    thumbnail_url = Column(Text)

class PotholeDetail(db.Model):
    __tablename__ = 'pothole_details'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    detection_id = Column(String(36), ForeignKey('detections.id'), unique=True)
    area_px = Column(Integer)
    aspect_ratio = Column(Float)
    severity_class = Column(String(50))
    severity_reason = Column(Text)
    road_position = Column(String(50))
    estimated_cm2 = Column(Float, nullable=True)
    surface_context = Column(Text, nullable=True)

class PotholeCluster(db.Model):
    __tablename__ = 'pothole_clusters'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    first_frame = Column(Integer)
    last_frame = Column(Integer)
    sighting_count = Column(Integer)
    current_severity = Column(String(50))
    status = Column(String(50)) # active | worsening | stable
    avg_bbox = Column(JSON)
    representative_thumbnail = Column(Text)

class PotholeClusterSighting(db.Model):
    __tablename__ = 'pothole_cluster_sightings'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey('pothole_clusters.id'))
    detection_id = Column(String(36), ForeignKey('detections.id'))
    frame_number = Column(Integer)
    severity_at_frame = Column(String(50))

class PotholeReport(db.Model):
    __tablename__ = 'pothole_reports'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cluster_id = Column(String(36), ForeignKey('pothole_clusters.id'))
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    generated_at = Column(DateTime, default=datetime.utcnow)
    severity = Column(String(50))
    location_label = Column(Text)
    frame_reference = Column(Integer)
    image_url = Column(Text)
    report_payload = Column(JSON)
    status = Column(String(50), default='draft') # draft | sent | acknowledged

class AnimalDetail(db.Model):
    __tablename__ = 'animal_details'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    detection_id = Column(String(36), ForeignKey('detections.id'), unique=True)
    species = Column(String(50))
    behavior = Column(String(50))
    behavior_confidence = Column(Float)
    in_road_zone = Column(Boolean)
    zone_label = Column(Text)
    night_mode_applied = Column(Boolean)
    light_level = Column(String(50))
    estimated_speed_px = Column(Float, nullable=True)

class AnimalTrackSession(db.Model):
    __tablename__ = 'animal_track_sessions'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    species = Column(String(50))
    track_start_frame = Column(Integer)
    track_end_frame = Column(Integer, nullable=True)
    entered_road = Column(Boolean)
    predicted_entry = Column(Boolean)
    prediction_was_correct = Column(Boolean, nullable=True)

class AnimalTrackFrame(db.Model):
    __tablename__ = 'animal_track_frames'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    track_id = Column(String(36), ForeignKey('animal_track_sessions.id'))
    detection_id = Column(String(36), ForeignKey('detections.id'))
    frame_number = Column(Integer)
    centroid_x = Column(Float)
    centroid_y = Column(Float)
    velocity_x = Column(Float)
    velocity_y = Column(Float)
    predicted_road_entry_in_frames = Column(Integer, nullable=True)

class AnimalHotspot(db.Model):
    __tablename__ = 'animal_hotspots'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    species = Column(String(50))
    frame_range_start = Column(Integer)
    frame_range_end = Column(Integer)
    detection_count = Column(Integer)
    risk_level = Column(String(50))
    heatmap_grid = Column(JSON)

class AccidentDetail(db.Model):
    __tablename__ = 'accident_details'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    detection_id = Column(String(36), ForeignKey('detections.id'), unique=True)
    severity_score = Column(Integer)
    vehicle_count = Column(Integer)
    vehicle_types = Column(JSON)
    human_detected = Column(Boolean)
    estimated_speed_px = Column(Float, nullable=True)
    is_predictive = Column(Boolean)
    prediction_confidence = Column(Float, nullable=True)
    hit_and_run_flag = Column(Boolean)
    hit_and_run_confidence = Column(Float, nullable=True)
    traffic_density_before = Column(Float)
    traffic_density_after = Column(Float)
    disruption_score = Column(Float)
    road_blocked = Column(Boolean)

class VehicleTrackSession(db.Model):
    __tablename__ = 'vehicle_track_sessions'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    vehicle_type = Column(String(50))
    track_start_frame = Column(Integer)
    track_end_frame = Column(Integer, nullable=True)
    involved_in_accident = Column(Boolean)

class VehicleTrackFrame(db.Model):
    __tablename__ = 'vehicle_track_frames'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    track_id = Column(String(36), ForeignKey('vehicle_track_sessions.id'))
    detection_id = Column(String(36), ForeignKey('detections.id'))
    frame_number = Column(Integer)
    centroid_x = Column(Float)
    centroid_y = Column(Float)
    velocity_x = Column(Float)
    velocity_y = Column(Float)
    left_scene = Column(Boolean)

class AccidentPrecursor(db.Model):
    __tablename__ = 'accident_precursors'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    vehicle_track_id = Column(String(36), ForeignKey('vehicle_track_sessions.id'))
    detected_at_frame = Column(Integer)
    precursor_type = Column(String(50))
    confidence = Column(Float)
    led_to_accident = Column(Boolean, nullable=True)
    related_detection_id = Column(String(36), ForeignKey('detections.id'), nullable=True)

class AnalyticsCache(db.Model):
    __tablename__ = 'analytics_cache'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'), nullable=True)
    metric_name = Column(Text)
    value = Column(Float)
    breakdown = Column(JSON, nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow)
    time_bucket = Column(String(50))

class FrameAnalytic(db.Model):
    __tablename__ = 'frame_analytics'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey('upload_sessions.id'))
    frame_number = Column(Integer)
    pothole_count = Column(Integer)
    animal_count = Column(Integer)
    accident_count = Column(Integer)
    max_risk_score = Column(Integer)
    processing_ms = Column(Integer)
