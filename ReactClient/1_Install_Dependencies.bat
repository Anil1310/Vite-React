@echo off
title Divine Classes - Install Dependencies
echo ===================================================
echo [1/1] Installing NPM packages for Vite + React App...
echo ===================================================
cd /d "%~dp0"
call npm install
echo.
echo Dependencies installed successfully.
pause
