#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "=================================================="
echo "  ExpenseFlow - Day-to-Day Expense Manager"
echo "=================================================="

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Next.js local server on http://localhost:3000 ..."
if command -v open >/dev/null 2>&1; then
  (sleep 2 && open http://localhost:3000) &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 2 && xdg-open http://localhost:3000) &
fi

npm run dev
