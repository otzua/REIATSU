#!/bin/bash

# REIATSU Instant Deploy Script (Vercel)
# This script builds the frontend locally and pushes directly to Vercel production.

echo "🚀 Starting Instant Deploy for REIATSU..."

# Navigate to the frontend directory
cd frontend

# Step 1: Fast Build
echo "📦 Building project..."
npm run build

# Step 2: Push to Vercel
echo "🆙 Pushing to Vercel..."
npx vercel --prod --yes

echo "✅ Done! Your site is live at: https://otzua.vercel.app"
