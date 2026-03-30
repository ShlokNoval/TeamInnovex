# DivyaDrishti Backend — Node.js + Socket.io

## Quick Start
```bash
npm install
node server.js
```

## Architecture
- **Port**: 8000
- **Socket.io**: Receives `raw_frame` from mobile, broadcasts `frame_stream` and `new_alert` to dashboards
- **REST API**: `/api/incidents`, `/api/cameras`, `/api/analytics/summary`, `/api/analytics/heatmap`
- **AI Bridge**: Forwards frames to the Python AI Engine at `ws://localhost:8001` via native WebSocket

## Environment Variables
- `PORT` — Server port (default: 8000)
- `AI_ENGINE_WS` — AI Engine WebSocket URL (default: `ws://localhost:8001/ws/stream/mobile`)
