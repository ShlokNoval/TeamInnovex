# DivyaDrishti — AI-Powered Road Hazard Detection System

## 🏗️ Monorepo Architecture

This repository is organized into **3 independent modules** to ensure clean separation of concerns and zero merge conflicts between teams.

```
TeamInnovex/
├── UI/              ← Next.js Frontend (Neural SOC Dashboard)
├── Backend/         ← FastAPI Python Backend (REST API + WebSocket)
├── AI_Engine/       ← YOLOv8 AI Detection Engine
├── README.md
└── COMMIT.md
```

---

## 🚀 Module Overview

### 📱 UI — Neural Command Center
**Owner**: Shlok | **Stack**: Next.js 16, TypeScript, TailwindCSS, Leaflet
- Real-time mobile camera uplink via Ngrok tunnel
- Live AI detection visualization with SOC-grade UI
- Admin dashboard with incident management & geolocation tracking

**To run:**
```bash
cd UI
npm install
node mock-backend.mjs   # Terminal 1 (mock relay)
npm run dev             # Terminal 2 (Next.js)
ngrok http 3000         # Terminal 3 (mobile tunnel)
```

---

### ⚙️ Backend — FastAPI Server
**Owner**: Backend Team | **Stack**: Python, FastAPI, SQLite/PostgreSQL
- REST API for incidents, cameras, and analytics
- WebSocket relay for real-time AI detections
- Government reporting endpoints

**To run:**
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

### 🤖 AI_Engine — YOLOv8 Detection Engine
**Owner**: AI Team | **Stack**: Python, YOLOv8, OpenCV
- Real-time hazard detection (potholes, stray animals, accidents)
- Frame ingestion from mobile camera nodes
- Confidence scoring and bounding box annotation

**To run:**
```bash
cd AI_Engine
pip install -r requirements.txt
python main.py
```

---

## 🔗 Integration Checklist (Final Merge)

When all 3 modules are complete, enable live integration:

1. **Start Backend** on port `8000`
2. **Start AI Engine** (it will connect to the Backend)
3. In `UI/lib/api.ts` — set `NEXT_PUBLIC_USE_MOCK=false`
4. In `UI/lib/websocket.ts` — set `USE_MOCK = false`
5. **Start UI** on port `3000`

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, demo-ready code |
| `ui-core` | Frontend development |
| `backend-core` | Backend development |
| `ai-analysis-engine` | AI Engine development |

**Final merge order**: All feature branches → `ui-core` → `main`
