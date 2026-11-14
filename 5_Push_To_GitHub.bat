@echo off
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\mingw64\bin;%PATH%"
title Divine Classes - Push to GitHub
echo ===================================================
echo Pushing Divine Classes to GitHub: Anil1310/Vite-React
echo ===================================================
cd /d "%~dp0"
git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://Anil1310@github.com/Anil1310/Vite-React.git
git add .
git commit -m "feat: complete Vite + React SPA ready for Vercel" 2>nul
echo.
echo Pushing to origin main...
git push -u origin main
echo.
echo ===================================================
echo Done! Your code is now live on GitHub.
echo Connect repository 'Anil1310/Vite-React' in Vercel to deploy.
echo ===================================================
pause
