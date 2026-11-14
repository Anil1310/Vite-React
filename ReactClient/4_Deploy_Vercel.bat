@echo off
title Divine Classes - Deploy to Vercel
echo ===================================================
echo Deploying Divine Classes to Vercel Cloud...
echo ===================================================
cd /d "%~dp0"
echo 1. Building production bundle...
call npm run build
echo.
echo 2. Launching Vercel CLI (or install with 'npm i -g vercel')...
call npx --yes vercel --prod
echo.
echo Deployment process complete.
pause
