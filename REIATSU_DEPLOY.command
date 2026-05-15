#!/bin/bash

# REIATSU One-Click Deployer
# This script is designed to be double-clicked on Mac.

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "------------------------------------------"
echo "🚀 REIATSU INSTANT DEPLOY STARTING..."
echo "------------------------------------------"

# Navigate to frontend
cd frontend

# Step 1: Local Build
echo "📦 Step 1: Building frontend locally..."
npm run build

# Step 2: Vercel Push
echo "🆙 Step 2: Pushing to https://otzua.vercel.app..."
npx vercel --prod --yes

echo ""
echo "------------------------------------------"
echo "✅ DEPLOY COMPLETE!"
echo "Your site is live at: https://otzua.vercel.app"
echo "------------------------------------------"
echo "Press any key to close this window..."
read -n 1 -s
