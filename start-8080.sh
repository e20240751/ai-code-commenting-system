#!/bin/bash

# Simple server startup script for port 8080
echo "🚀 Starting Programming Learning Platform on port 8080..."

# Kill any existing processes on port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Start Python HTTP server on port 8080
echo "📡 Starting HTTP server..."
python3 -m http.server 8080 &

# Wait a moment for server to start
sleep 2

# Check if server is running
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Server is running successfully!"
    echo "🌐 Access your app at: http://localhost:8080/working-app.html"
    echo "🎯 Main page: http://localhost:8080"
    echo ""
    echo "📱 Your Programming Learning Platform is ready!"
    echo "   • AI-powered code explanations"
    echo "   • Interactive learning exercises"
    echo "   • Programming challenges"
    echo "   • Leaderboard system"
    echo ""
    echo "Press Ctrl+C to stop the server"
    
    # Keep the script running
    wait
else
    echo "❌ Failed to start server. Trying alternative method..."
    
    # Alternative: Open file directly in browser
    echo "🔄 Opening application directly in browser..."
    open working-app.html 2>/dev/null || open "/Users/anbschool0004/Downloads/code comment/working-app.html"
    
    echo "✅ Application opened in browser!"
fi
