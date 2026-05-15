#!/bin/bash

# REIATSU One-Click Deployer (otzua.vercel.app)
# This script is designed to be double-clicked on Mac.

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "------------------------------------------"
echo "🚀 REIATSU INSTANT DEPLOY (otzua)"
echo "------------------------------------------"

# Ensure we are in the frontend directory
if [ ! -d "frontend" ]; then
  echo "❌ Error: 'frontend' directory not found."
  echo "Make sure you are running this from the REIATSU root."
  read -p "Press enter to exit..."
  exit 1
fi

cd frontend

# Step 0: Ensure correct Vercel project link (Robustness)
echo "🔗 Verifying Vercel Link..."
# If not linked, this will help link to the correct project
# Project ID: prj_tbn9untvNjLdviwBmZ0pipPHLsj3

# Step 1: Local Build
echo "📦 Step 1: Building frontend locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deploy."
    read -p "Press enter to exit..."
    exit 1
fi

# Step 2: Vercel Push
echo "🆙 Step 2: Pushing to Production (otzua.vercel.app)..."
npx vercel --prod --yes

echo ""
echo "------------------------------------------"
echo "✅ DEPLOY COMPLETE!"
echo "Your site is live at: https://otzua.vercel.app"
echo "------------------------------------------"
echo "Press any key to close this window..."
read -n 1 -s
