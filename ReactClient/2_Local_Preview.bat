@echo off
title Divine Classes - Local Preview Server
echo ===================================================
echo Starting Vite Development Server for Divine Classes...
echo Local URL: http://localhost:5173
echo ===================================================
cd /d "%~dp0"
call npm run dev
pause
