#!/bin/bash

# REIATSU Instant Deploy Script (Vercel)
# Project: otzua (otzua.vercel.app)

echo "🚀 Starting Instant Deploy for REIATSU (otzua)..."

# Navigate to the frontend directory
if [ -d "frontend" ]; then
  cd frontend
fi

# Step 1: Fast Build
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting."
    exit 1
fi

# Step 2: Push to Vercel
echo "🆙 Pushing to Vercel (otzua)..."
npx vercel --prod --yes

echo "✅ Done! Your site is live at: https://otzua.vercel.app"
