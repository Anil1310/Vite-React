#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "=== Deploying Divine Classes to Vercel Cloud ==="
npm run build
npx --yes vercel --prod
