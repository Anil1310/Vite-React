@echo off
title Divine Classes - Push to GitHub
echo ===================================================
echo Pushing Divine Classes to GitHub: Anil1310/DCV2.6
echo ===================================================
cd /d "%~dp0"
git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Anil1310/DCV2.6.git
git add .
git commit -m "feat: complete Vite + React SPA with Golden Architecture ready for Vercel"
git push -u origin main
echo.
echo ===================================================
echo Done! Your code is now live on GitHub.
echo Connect repository 'Anil1310/DCV2.6' in Vercel to deploy.
echo ===================================================
pause
