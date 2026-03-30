@echo off
echo Setting up Python Virtual Environment...
if not exist "venv" (
    python.exe -m venv venv
)

echo Activating environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Starting Backend Server on port 8000...
python main.py
pause
