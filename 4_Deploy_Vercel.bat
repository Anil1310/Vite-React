@echo off
title Divine Classes - Deploy to Vercel
cd /d "%~dp0ReactClient"
call npm run build
call npx --yes vercel --prod
pause
