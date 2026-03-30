from flask import request
from main import socketio

@socketio.on('connect')
def test_connect():
    print(f"Client connected: {request.sid}")
    socketio.emit('connection_response', {'data': 'Connected to AI Road Hazard Backend'})

@socketio.on('disconnect')
def test_disconnect():
    print(f"Client disconnected: {request.sid}")

def broadcast_alert(alert_data):
    """
    Called by backend services to emit an alert to the React Admin Panel.
    """
    socketio.emit('new_alert', alert_data)
    
def stream_annotated_frame(frame_data):
    """
    Called by backend services to stream base64 annotated frame back to Testing Dashboard.
    """
    socketio.emit('frame_stream', frame_data)
