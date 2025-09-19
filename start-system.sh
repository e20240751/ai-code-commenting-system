#!/bin/bash

# AI Code Commenting System Startup Script
echo "🚀 Starting AI Code Commenting System..."

# Set the Gemini API key
export GEMINI_API_KEY="AIzaSyDL0aewF2Dc_SEKqkeYtcPZtNKr0XibZUk"
echo "✅ Gemini API Key loaded"

# Start the backend server
echo "🔧 Starting backend server..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start the frontend
echo "🎨 Starting frontend..."
cd ../client
npm start &
FRONTEND_PID=$!

echo "✅ System started successfully!"
echo "📊 Backend: http://localhost:5001"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "🔑 Features:"
echo "  • AI Code Commenting with Google Gemini 2.0 Flash"
echo "  • Pattern Analysis Fallback"
echo "  • Support for Python, C, JavaScript, React"
echo "  • Beginner-friendly explanations"
echo ""
echo "📝 To stop the system:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 Open http://localhost:3000 in your browser to start using the system!"
