@echo off
echo ========================================================
echo   Launching TRACK MY SPEND Full-Stack Application
echo ========================================================
echo.
start "Track My Spend - Backend (Django)" "%~dp0run_backend.bat"
timeout /t 2 /nobreak >nul
start "Track My Spend - Frontend (React)" "%~dp0run_frontend.bat"
echo.
echo Both Backend (port 8000) and Frontend (port 5173) are starting!
echo Open http://localhost:5173 in your web browser.
echo ========================================================
timeout /t 5
