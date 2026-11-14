#!/usr/bin/env bash
set -e
echo "==================================================="
echo "Pushing Divine Classes to GitHub: Anil1310/Vite-React"
echo "==================================================="
cd "$(dirname "$0")"
git init
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin https://Anil1310@github.com/Anil1310/Vite-React.git
git add .
git commit -m "feat: complete Vite + React SPA ready for Vercel" 2>/dev/null || true
echo ""
echo "Pushing to origin main..."
git push -u origin main
echo ""
echo "==================================================="
echo "Done! Connect 'Anil1310/Vite-React' on Vercel."
echo "==================================================="
