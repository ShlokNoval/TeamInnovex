import os
import cv2
import uuid
import time
import base64
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from detector import Detector
from tracking import CentroidTracker
from config import MODEL_PATH, BACKEND_INCIDENT_URL
import httpx

app = FastAPI(title="AI Analysis Engine API")

# Setup CORS to allow UI (Shlok's Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],  # Ngrok wildcard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engine Singletons
detector = None
tracker = None

@app.on_event("startup")
async def startup_event():
    global detector, tracker
    detector = Detector(model_path=MODEL_PATH)
    tracker = CentroidTracker()
    print("AI Analysis Engine started - YOLOv8 model loaded.")

async def send_incident_to_backend(payload: dict):
    # This matches JJ's required interface
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                BACKEND_INCIDENT_URL,
                json=payload,
                headers={"Authorization": "Bearer YOUR_TOKEN_HERE"}
            )
            print(f"Post to Backend returned: {response.status_code}")
    except Exception as e:
        print(f"Failed to post incident: {e}")

@app.websocket("/ws/stream/{camera_id}")
async def websocket_stream(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    print(f"WebSocket connected for {camera_id}")
    try:
        while True:
            data = await websocket.receive_json()
            # Expecting fields: frame (base64_jpeg), timestamp (float)
            frame_data = base64.b64decode(data['frame'])
            
            # Decode frame to numpy array
            nparr = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                continue

            # 1. Inference
            detections = detector.detect(frame)
            
            # 2. Tracking
            track_objects = tracker.update(detections)
            
            # 3. Simulate engines based on detection for this example
            # (In production, route to pothole, animal, or accident engines)
            severity_map = {idx: "LOW" for idx in range(len(detections))}
            
            annotated_frame = detector.annotate(frame, detections, {}, severity_map)
            annotated_b64 = detector.frame_to_base64(annotated_frame)
            
            output_payload = {
                "annotated_frame": annotated_b64,
                "detections": detections,
                "incident_created": False,
                "incident_id": None
            }
            
            await websocket.send_json(output_payload)
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for {camera_id}")

jobs = {}

@app.post("/api/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    # Save video temp
    os.makedirs('tmp', exist_ok=True)
    temp_path = f"tmp/{job_id}_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
        
    jobs[job_id] = {"status": "processing", "progress_percent": 0, "frames_processed": 0, "frames_total": 0}
    
    # Normally we do background_tasks.add_task(process_video, temp_path, job_id)
    # Placeholder:
    jobs[job_id]["status"] = "completed"
    
    return {"job_id": job_id}

@app.get("/api/upload/{job_id}/status")
async def get_upload_status(job_id: str):
    if job_id not in jobs:
        return {"error": "not found"}
    return jobs[job_id]

@app.get("/health")
async def get_health():
    return {"status": "ok", "model_loaded": detector is not None}
