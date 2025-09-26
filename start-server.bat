@echo off
echo 🚀 Starting Programming Learning Platform Server...
echo.

cd /d "C:\Users\anbschool0004\Downloads\code comment"

echo 📦 Checking dependencies...
if not exist "node_modules\express" (
    echo Installing Express...
    npm install express
)

echo 🚀 Starting server on port 8080...
echo 📱 Access your app at: http://localhost:8080/working-app.html
echo 🤖 API endpoint: http://localhost:8080/api/explain-code
echo.
echo Press Ctrl+C to stop the server
echo.

node simple-server.js
