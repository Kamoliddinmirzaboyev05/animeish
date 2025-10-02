#!/bin/bash

echo "🚀 Starting Aniki development server..."
echo ""
echo "📦 Checking dependencies..."
npm install

echo ""
echo "🧹 Cleaning cache..."
rm -rf node_modules/.vite dist .vite 2>/dev/null

echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo "✨ Starting dev server..."
echo "🌐 Open http://localhost:5173 in your browser"
echo ""
npm run dev
