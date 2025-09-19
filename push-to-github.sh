#!/bin/bash

echo "🚀 Pushing AI Code Commenting System to GitHub"
echo "=============================================="

# Repository details
REPO_NAME="ai-code-commenting-system"
USERNAME="e20240751"

echo "📋 Repository: https://github.com/$USERNAME/$REPO_NAME"
echo ""

# Set remote URL
echo "🔗 Setting remote URL..."
git remote set-url origin https://github.com/$USERNAME/$REPO_NAME.git

# Check git status
echo "📊 Current git status:"
git status

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your code has been pushed to GitHub!"
    echo "🔗 Repository URL: https://github.com/$USERNAME/$REPO_NAME"
    echo ""
    echo "🎉 Your AI Code Commenting System is now live on GitHub!"
    echo "   - Complete React frontend with AI integration"
    echo "   - Node.js backend with Google Gemini API"
    echo "   - Multi-language support (Python, C, JavaScript, React)"
    echo "   - Educational code commenting system"
    echo "   - Easy setup with startup scripts"
else
    echo ""
    echo "❌ Push failed. Please make sure you've created the repository on GitHub first."
    echo "🔗 Go to: https://github.com/new"
    echo "   Repository name: $REPO_NAME"
    echo "   Description: AI-powered code commenting system"
    echo "   ⚠️  DO NOT initialize with README"
    echo ""
    echo "After creating the repository, run this script again:"
    echo "   ./push-to-github.sh"
fi
