import base64
import json

def draw_bounding_boxes(frame_b64, detections):
    """
    Normally, this would decode the base64 string to a cv2 numpy array,
    iterate through the detections, use cv2.rectangle and cv2.putText,
    and then encode back to base64.
    
    Since this is a backend service stub for the MVP hackathon,
    we simulate returning an annotated frame string.
    """
    if not frame_b64:
        return ""
        
    try:
        # Validate base64 string
        base64.b64decode(frame_b64)
    except Exception:
        pass
        
    # In a full OpenCV implementation:
    # img_np = np.frombuffer(base64.b64decode(frame_b64), dtype=np.uint8)
    # img = cv2.imdecode(img_np, flags=1)
    # for d in detections:
    #     cv2.rectangle(img, (d.x, d.y), (d.x+d.w, d.y+d.h), (0, 0, 255), 2)
    # _, buffer = cv2.imencode('.jpg', img)
    # return base64.b64encode(buffer).decode('utf-8')
    
    # Returning the original string mock for now so UI doesn't break
    return frame_b64

def generate_report_payload(cluster, sightings, details):
    """
    Generates a structured JSON payload for pothole automated reporting.
    """
    return json.dumps({
        "pothole_id": cluster.id,
        "severity": cluster.current_severity,
        "sightings_count": len(sightings),
        "location": "Session location",
        "bbox_history": [s.frame_number for s in sightings]
    })
