# DivyaDrishti — Chhatrapati Sambhajinagar (CSN) Smart City Dashboard

![CSN Logo]

**DivyaDrishti** is a state-of-the-art AI-powered road hazard detection and incident management platform, developed in strategic partnership with the **Chhatrapati Sambhajinagar (CSN) Municipal Corporation X Smart City** initiative. 

The system leverages YOLOv8 neural networks to monitor live CCTV feeds, automatically identifying potholes, accidents, and animal hazards to orchestrate real-time emergency responses.

---

## 🌟 Core Features

### 📡 Neural Command Center (SOC)
- **Real-Time Inference**: Sub-50ms hazard detection using a distributed YOLOv8 pipeline.
- **Geospatial Intelligence**: Active mapping of hazards on a high-density "Dark Matter" heatmap for precise dispatching.
- **Live Stream Uplinks**: Secure WebSocket-based frame relay from mobile neural nodes and fixed CCTV infrastructure.

### 📋 Intelligent Incident Management
- **Advanced Filtering**: Hierarchical data drilling by **Hazard Type**, **Severity (Critical-Low)**, and **Resolution Status**.
- **Global Search**: Unified header search that synchronizes across all dashboard modules.
- **Real-Time Alerts**: A functional Notification Center that tracks the latest high-priority detections instantly.

### 📤 Operational Communication (Sharing & Export)
- **Instant Field Alerts**: Share incident reports directly to field units via **WhatsApp** or **SMS** with pre-formatted mission data.
- **Data Export**: Bulk export of global logs and **Individual Incident Dossiers** (CSV) for official municipal auditing.
- **Dossier System**: Detailed single-incident reports including GPS coordinates, confidence scores, and raw AI metadata.

### 🎨 Premium UI/UX
- **Adaptive Theme Engine**: Fully functional **Light and Dark modes** tailored for 24/7 Security Operations Center (SOC) environments.
- **Glassmorphic Aesthetic**: A "Military-Grade" interface design using premium typography (Inter/Mono) and sleek micro-animations.

---

## 🏗️ Architecture

```
TeamInnovex/
├── UI/              ← Next.js 14+ Frontend (Neural SOC Dashboard)
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

---

## 🧬 Data Flow

1. **Edge Detections**: Mobile/Fixed cameras stream frames via Socket.io to the Node.js relay.
2. **AI Inference**: The relay forwards frames to the Python AI Engine; YOLOv8 identifies hazards and calculates risk scores.
3. **SOC Broadcast**: Annotated frames and structured incident data are broadcasted to the Next.js Command Hub.
4. **Field Action**: Operators filter, analyze, and dispatch alerts via the integrated WhatsApp/SMS sharing system.

---

## 🔧 Port Assignments

| Service | Port | Purpose |
|---------|------|---------|
| Next.js UI | 3000 | SOC Dashboard + Branding |
| Node.js Backend | 8000 | REST API + Socket.io Relay |
| AI Engine | 8001 | YOLOv8 Inference + JSON Telemetry |

---

## 🏢 Partnership
Developed for **Chhatrapati Sambhajinagar Municipal Corporation X Smart City**.
*"Understand every anomaly instantly."*
