#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "=== Building Production Assets for Vercel Deployment ==="
npm run build
