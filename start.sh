#!/bin/bash

# CodeLearn Platform Startup Script

echo "🚀 Starting CodeLearn Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. Make sure you have MongoDB running or using MongoDB Atlas."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "⚙️  Creating environment configuration..."
    cp server/env.example server/.env
    echo "📝 Please edit server/.env file with your configuration (especially OpenAI API key)"
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the platform:"
echo "   npm run dev"
echo ""
echo "📚 Available commands:"
echo "   npm run dev      - Start both frontend and backend"
echo "   npm run server   - Start backend only"
echo "   npm run client   - Start frontend only"
echo "   npm run build    - Build for production"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🎉 Happy Learning!"
