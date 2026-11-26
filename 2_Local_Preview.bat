@echo off
title ExpenseFlow - Day-to-Day Expense Tracker
cd /d "%~dp0"

echo ==================================================
echo   ExpenseFlow - Day-to-Day Expense Manager
echo ==================================================

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Starting Next.js local server on http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
pause
