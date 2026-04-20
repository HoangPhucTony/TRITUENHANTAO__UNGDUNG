@echo off
echo Starting SmartStay AI Backend...
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
pause
