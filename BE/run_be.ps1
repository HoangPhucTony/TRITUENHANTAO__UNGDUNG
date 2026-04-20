# SmartStay AI - Start Backend
Write-Host "Starting SmartStay AI Backend Setup..." -ForegroundColor Cyan

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
