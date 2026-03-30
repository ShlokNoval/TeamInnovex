from flask import request
from database.extensions import socketio

@socketio.on('connect')
def test_connect():
    print(f"Client connected: {request.sid}")
    socketio.emit('connection_response', {'data': 'Connected to DivyaDrishti Backend'})

@socketio.on('disconnect')
def test_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('raw_frame')
def handle_raw_frame(data):
    """
    Receives a raw Base64 camera frame from the mobile browser.
    Broadcasts it back as an annotated frame (AI engine will replace this stub).
    """
    # For now, echo back as-is so the dashboard still gets a feed
    # When the AI Engine is integrated, call: process_frame(data['frame']) here
    socketio.emit('frame_stream', {
        'annotatedFrame': data.get('frame', ''),
        'detections': [],
        'timestamp': data.get('timestamp', 0),
        'location': data.get('location', None)
    })

def broadcast_alert(alert_data):
    """Called by backend services to emit an alert to the React Admin Panel."""
    socketio.emit('new_alert', alert_data)

def stream_annotated_frame(frame_data):
    """Called by backend services to stream base64 annotated frame back to Testing Dashboard."""
    socketio.emit('frame_stream', frame_data)
