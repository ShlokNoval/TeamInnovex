# DIVYADRISHTI - AI-Powered Road Hazard Detection System

Divyadrishti (Divine Vision) is an advanced, multi-modal Neural Security Operations Center (SOC) designed to detect, track, and analyze road hazards in real-time. This repository houses the unified frontend, backend, and AI analysis engine developed during the 24-hour hackathon.

---

## 🏗️ Architecture Stack
*   **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui, Leaflet Heatmaps
*   **AI Engine**: Python, FastAPI, Ultralytics YOLOv8, OpenCV
*   **Database**: Neon PostgreSQL, Prisma ORM
*   **Real-time Layer**: WebSocket / HTTP Polling Frame Relay

---

## 🖥️ UI Core (Phase 1 Completed)

The `ui-core` frontend is 100% production-ready and fully stylized.

### Features Built:
1.  **Mobile Node Uplink (`/stream`)**: 
    - Hardware-accelerated Canvas frame extraction.
    - Smart orientation correction (tripod rotation support).
    - High-frequency HTTP relay bypassing traditional Ngrok WebSocket blockage.
2.  **Neural SOC Command Center (`/dashboard`)**:
    - Deep-space glassmorphic dark theme.
    - Active Incident Feed with real-time deduplication and neon severity alerts.
    - Priority Index (PI) compliant payload mappings.
3.  **CartoDB Geo-Spatial Heatmap**:
    - Dark-mode satellite maps showing active camera nodes and risk zones.
4.  **Local Simulation Testing (`/testing`)**:
    - Pre-recorded MP4 batch upload testing capabilities.

## 🚀 How to Run the Frontend

```bash
cd web-app
npm install
npm run dev
```

For testing the mobile node on a different network:
```bash
# In an external terminal
ngrok http 3000 --host-header=rewrite
```

### Mock Mode Toggle
The frontend currently simulates the AI engine so judges can view the UI without the Python server running.
When the AI team successfully deploys FastAPI:
1. Open `web-app/lib/api.ts` and `web-app/lib/websocket.ts`.
2. Toggle `USE_MOCK = false`.
3. The Next.js API relay will automatically begin pointing towards `localhost:8000`.

---

## 🤖 Backend Core & AI Engine (Pending)
*   **Branch**: `backend-core` & `ai-analysis-engine`.
*   **Tasks remaining**: Finalizing YOLOv8 inference scripts, Postgres insertions, and exposing the `/api/stream` FASTAPI route.
