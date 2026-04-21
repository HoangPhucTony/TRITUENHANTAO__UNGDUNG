@echo off
setlocal

echo Starting SmartStay AI Backend...
python -c "import uvicorn" >nul 2>nul
if %errorlevel%==0 (
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    goto :end
)

py -3.13 -c "import uvicorn" >nul 2>nul
if %errorlevel%==0 (
    py -3.13 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    goto :end
)

py -3 -c "import uvicorn" >nul 2>nul
if %errorlevel%==0 (
    py -3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    goto :end
)

echo No Python interpreter with uvicorn installed was found. Run python -m pip install -r requirements.txt or activate the correct environment first.
exit /b 1

:end
pause
