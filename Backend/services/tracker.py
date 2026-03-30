from database.connection import db
from database.models import PotholeCluster, PotholeClusterSighting, AnimalTrackSession, AnimalTrackFrame, VehicleTrackSession, VehicleTrackFrame

def track_animal(detection, session_id):
    """
    Groups repeating animal detections into tracks.
    If an existing track for this species is active, appending to it.
    Otherwise, creating a new track session.
    """
    # Find active track for this species
    active_track = AnimalTrackSession.query.filter_by(
        session_id=session_id, 
        track_end_frame=None
    ).first()

    if not active_track:
        # Create new track
        active_track = AnimalTrackSession(
            session_id=session_id,
            species='unknown', # Would be pulled from details in real run
            track_start_frame=detection.frame_number,
            entered_road=False,
            predicted_entry=False
        )
        db.session.add(active_track)
        db.session.flush()

    # Create the frame record
    bbox = detection.bbox
    centroid_x = bbox['x'] + (bbox['w'] / 2)
    centroid_y = bbox['y'] + (bbox['h'] / 2)
    
    frame_record = AnimalTrackFrame(
        track_id=active_track.id,
        detection_id=detection.id,
        frame_number=detection.frame_number,
        centroid_x=centroid_x,
        centroid_y=centroid_y,
        velocity_x=0.0, # Need diffing logic in real life
        velocity_y=0.0
    )
    db.session.add(frame_record)
    db.session.commit()
    return active_track

def track_vehicle(detection, session_id):
    """
    Mock logic for hit-and-run and trajectory tracking features.
    """
    active_track = VehicleTrackSession.query.filter_by(
        session_id=session_id, 
        track_end_frame=None
    ).first()

    if not active_track:
        active_track = VehicleTrackSession(
            session_id=session_id,
            vehicle_type='unknown',
            track_start_frame=detection.frame_number,
            involved_in_accident=False
        )
        db.session.add(active_track)
        db.session.flush()

    bbox = detection.bbox
    centroid_x = bbox['x'] + (bbox['w'] / 2)
    centroid_y = bbox['y'] + (bbox['h'] / 2)

    frame_record = VehicleTrackFrame(
        track_id=active_track.id,
        detection_id=detection.id,
        frame_number=detection.frame_number,
        centroid_x=centroid_x,
        centroid_y=centroid_y,
        velocity_x=0.0,
        velocity_y=0.0,
        left_scene=False
    )
    db.session.add(frame_record)
    db.session.commit()
    return active_track

def cluster_potholes(detection, session_id, severity_class):
    """
    De-duplicates the same pothole over many frames.
    """
    active_cluster = PotholeCluster.query.filter_by(session_id=session_id).order_by(PotholeCluster.last_frame.desc()).first()
    
    if not active_cluster:
        active_cluster = PotholeCluster(
            session_id=session_id,
            first_frame=detection.frame_number,
            last_frame=detection.frame_number,
            sighting_count=1,
            current_severity=severity_class,
            status='active',
            avg_bbox=detection.bbox,
            representative_thumbnail=detection.thumbnail_url
        )
        db.session.add(active_cluster)
        db.session.flush()
    else:
        active_cluster.last_frame = detection.frame_number
        active_cluster.sighting_count += 1
        active_cluster.current_severity = severity_class
    
    sighting = PotholeClusterSighting(
        cluster_id=active_cluster.id,
        detection_id=detection.id,
        frame_number=detection.frame_number,
        severity_at_frame=severity_class
    )
    db.session.add(sighting)
    db.session.commit()
    return active_cluster
