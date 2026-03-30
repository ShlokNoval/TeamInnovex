@echo off
echo Starting DivyaDrishti Services...

echo 1/3 Starting AI Engine (Port 8001)...
start "AI Engine" cmd /k "cd AI_Engine && python -m uvicorn app:app --host 0.0.0.0 --port 8001"

echo 2/3 Starting Backend Node Server (Port 8000)...
start "Node Backend" cmd /k "cd Backend && node server.js"

echo 3/3 Starting Next.js Frontend (Port 3000)...
start "Next.js UI" cmd /k "cd UI && npm run dev"

echo ==============================================
echo All services have been launched in new windows!
echo Please safely keep those terminal windows open.
echo ==============================================
pause
