#!/bin/bash

# Navigate to the project directory
cd "/Users/anbschool0004/Downloads/code comment"

# Check if server-8080.js exists
if [ ! -f "server-8080.js" ]; then
    echo "❌ Error: server-8080.js not found!"
    exit 1
fi

# Check for syntax errors
echo "🔍 Checking syntax..."
if ! node -c server-8080.js; then
    echo "❌ Syntax error in server-8080.js"
    exit 1
fi

echo "✅ Syntax OK"

# Start the server
echo "🚀 Starting server on port 8080..."
echo "📱 Access your app at: http://localhost:8080/working-app.html"
echo "💻 Terminal app at: http://localhost:8080/terminal-app.html"
echo "🤖 API endpoint: http://localhost:8080/api/explain-code"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server-8080.js
