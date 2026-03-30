# Backend Module

This folder contains the **FastAPI Backend Server** for DivyaDrishti.

## Responsibilities
- REST API endpoints for incidents, cameras, analytics
- WebSocket relay to stream AI detections to the UI
- Database management (SQLite for dev, PostgreSQL for prod)
- Government reporting/notification hooks

## Setup
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Integration with UI
The UI module (`../UI`) expects:
- `POST /api/incidents` — Report new hazards
- `GET /api/incidents` — Fetch incident list
- `PATCH /api/alerts/{id}` — Update incident status
- `GET /api/cameras` — List active camera nodes
- `GET /api/analytics/summary` — Dashboard metrics
- WebSocket at `/ws` path for real-time frame streaming

See `../UI/lib/api.ts` for the full contract.
