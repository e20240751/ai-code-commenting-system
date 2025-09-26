#!/bin/bash

echo "🚀 Starting Programming Learning Platform Server..."
echo ""

# Navigate to project directory
cd "/Users/anbschool0004/Downloads/code comment"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if Express is installed
if [ ! -d "node_modules/express" ]; then
    echo "📦 Installing Express..."
    npm install express
fi

# Start the simple server
echo "🚀 Starting server on port 8080..."
echo "📱 Access your app at: http://localhost:8080/working-app.html"
echo "🤖 API endpoint: http://localhost:8080/api/explain-code"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node simple-server.js
