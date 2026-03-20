@echo off
echo ========================================
echo Starting Crop Disease Detection App
echo ========================================

echo.
echo Starting ML Service (Port 8000)...
start "ML Service" cmd /k "cd /d %~dp0ml-service && python -m uvicorn app:app --host 0.0.0.0 --port 8000"

timeout /t 5 /nobreak > nul

echo.
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0server && npm start"

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend (Port 3000)...
start "Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo All services starting...
echo ML Service: http://localhost:8000
echo Backend:    http://localhost:5000
echo Frontend:   http://localhost:3000
echo ========================================
echo.
echo Press any key to exit...
pause > nul
