#!/bin/bash

# SKAPA Demo - Quick Start Script
# No backend, no deployment, just beautiful UI!

echo "🎵 SKAPA - Frontend Demo"
echo "======================="
echo ""
echo "📱 This is a demo mode - No backend required!"
echo "   All data is mocked for demonstration purposes."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 Starting SKAPA..."
echo ""
echo "📱 How to open on your phone:"
echo "   1. Download 'Expo Go' app from App Store/Play Store"
echo "   2. Scan the QR code that appears below"
echo "   3. App will load in 10-20 seconds"
echo ""
echo "⌨️  Or press 'w' to open in web browser"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Expo
npx expo start
