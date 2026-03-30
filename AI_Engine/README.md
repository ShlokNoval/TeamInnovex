# AI Engine Module

This folder contains the **YOLOv8 AI Hazard Detection Engine** for DivyaDrishti.

## Responsibilities
- Real-time detection of: potholes, stray animals, accidents
- Frame ingestion from the mobile camera uplink
- Confidence scoring, bounding box annotation, severity classification

## Setup
```bash
pip install -r requirements.txt
python main.py
```

## Integration with UI
The UI sends raw video frames and expects annotated responses.

### Incoming Frame (from mobile node via `/api/stream`)
```json
{
  "frame": "<base64 JPEG string>",
  "timestamp": 1711780000,
  "location": { "lat": 28.6139, "lng": 77.2090 }
}
```

### Expected Output (to relay back)
```json
{
  "annotatedFrame": "<base64 annotated JPEG>",
  "detections": [
    {
      "class": "pothole",
      "confidence": 0.94,
      "severity": "high",
      "bbox": [x, y, w, h]
    }
  ],
  "timestamp": 1711780000
}
```

See `../UI/lib/types.ts` for the full TypeScript interface definitions.
