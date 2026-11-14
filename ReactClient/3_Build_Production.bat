@echo off
title Divine Classes - Build Production Bundle
echo ===================================================
echo Building Production Assets for Vercel Deployment...
echo Output folder: dist/
echo ===================================================
cd /d "%~dp0"
call npm run build
echo.
echo Build complete. Ready for Vercel deployment.
pause
