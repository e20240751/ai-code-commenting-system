#!/bin/bash

echo "🚀 PUSHING TO e20240751 ACCOUNT"
echo "==============================="

ACCOUNT="e20240751"
REPO_NAME="ai-code-commenting-system"

echo "👤 Account: $ACCOUNT"
echo "📁 Repository: $REPO_NAME"
echo ""

echo "🔄 Setting remote URL..."
git remote set-url origin https://github.com/$ACCOUNT/$REPO_NAME.git

echo "🚀 Attempting to push..."
if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Your code is now on GitHub!"
    echo "🔗 Repository URL: https://github.com/$ACCOUNT/$REPO_NAME"
    echo ""
    echo "✅ Your AI Code Commenting System is live!"
    echo "   - Complete React frontend with AI integration"
    echo "   - Node.js backend with Google Gemini API"
    echo "   - Multi-language support (Python, C, JavaScript, React)"
    echo "   - Educational code commenting system"
    echo "   - Easy startup with ./start-system.sh"
    echo ""
    echo "🌐 Share your project: https://github.com/$ACCOUNT/$REPO_NAME"
else
    echo ""
    echo "❌ Push failed - Repository not found!"
    echo ""
    echo "📋 CREATE THE REPOSITORY FIRST:"
    echo "1. Go to: https://github.com/new"
    echo "2. Make sure you're logged in as: $ACCOUNT"
    echo "3. Repository name: $REPO_NAME"
    echo "4. Description: AI-powered code commenting system"
    echo "5. ⚠️  DO NOT check 'Initialize with README'"
    echo "6. Click 'Create repository'"
    echo ""
    echo "7. Then run: ./push-e20240751.sh"
    echo ""
    echo "💡 Check your account: https://github.com/$ACCOUNT"
fi
