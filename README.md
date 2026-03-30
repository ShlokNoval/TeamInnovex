# DivyaDrishti — AI-Powered Road Hazard Detection System

## 🏗️ Architecture

```
TeamInnovex/
├── UI/              ← Next.js 16 Frontend (Neural SOC Dashboard)
├── Backend/         ← Node.js Express + Socket.io (Relay Server)
├── AI_Engine/       ← FastAPI + YOLOv8 Detection Engine
└── README.md
```

---

## 🚀 Quick Start (3 Terminals)

### Terminal 1 — AI Engine (Python)
```bash
cd AI_Engine
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8001
```

### Terminal 2 — Backend Server (Node.js)
```bash
cd Backend
npm install
node server.js
```

### Terminal 3 — Frontend (Next.js)
```bash
cd UI
npm install
npm run dev
```

### Terminal 4 — Mobile Access (Optional)
```bash
ngrok http 3000
```

---

## 🔗 Port Assignments

| Service | Port | Purpose |
|---------|------|---------|
| Next.js UI | 3000 | SOC Dashboard + Mobile Stream Page |
| Node.js Backend | 8000 | REST API + Socket.io Relay |
| AI Engine | 8001 | YOLOv8 Inference + WebSocket |

---

## 📱 Usage

1. **Start all 3 services** (Terminals 1-3 above)
2. Open `http://localhost:3000` on your PC → Landing page
3. Open `http://localhost:3000/dashboard` → SOC Command Hub
4. Open `http://localhost:3000/stream` on your phone (via ngrok URL) → Camera uplink
5. Tap **LINK TO SOC** → Mobile starts streaming frames
6. Open `http://localhost:3000/testing?mode=live` on PC → Watch AI-annotated live feed
7. AI detects hazards → Alerts appear in the dashboard in real-time

---

## 🧬 Data Flow

```
Phone Camera → /stream page → Socket.io raw_frame → Node.js Backend
  → WebSocket → AI Engine (YOLOv8) → Annotated frame + incidents
  → Node.js Backend → Socket.io frame_stream + new_alert → SOC Dashboard
```

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, demo-ready code |
| `production-v1` | Full integrated build |
| `ui-core` | Frontend development |
| `backend-core` | Legacy backend (deprecated) |
| `ai-analysis-engine` | AI Engine development |
