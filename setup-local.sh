#!/bin/bash

# SKAPA Local Development Setup Script

echo "🎵 SKAPA - Local Development Setup"
echo "=================================="
echo ""

# Check if backend/.env exists
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found!"
    echo ""
    echo "Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
    echo ""
    echo "📝 Please edit backend/.env and add your credentials:"
    echo "   - MONGO_URL (MongoDB connection string)"
    echo "   - SPOTIFY_CLIENT_ID"
    echo "   - SPOTIFY_CLIENT_SECRET"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - TOKEN_ENCRYPTION_KEY (generate with: openssl rand -base64 32)"
    echo ""
    read -p "Press Enter after you've updated backend/.env..."
fi

# Check if .env exists for Expo
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env for Expo..."
    echo "EXPO_PUBLIC_BACKEND_URL=http://localhost:8001" > .env
    echo "✅ Created .env with local backend URL"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Check if Python venv exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv and install backend deps
echo "Installing backend dependencies..."
source venv/bin/activate
pip install -r backend/requirements.txt

echo ""
echo "Installing frontend dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo ""
echo "Terminal 1 - Backend:"
echo "  source venv/bin/activate"
echo "  cd backend"
echo "  uvicorn server:app --reload --host 0.0.0.0 --port 8001"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npx expo start"
echo ""
echo "📱 Scan the QR code with Expo Go app to test on your phone!"
echo ""
