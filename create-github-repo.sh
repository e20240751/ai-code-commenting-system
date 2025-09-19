#!/bin/bash

echo "🚀 Creating GitHub Repository for AI Code Commenting System"
echo "=========================================================="

# Repository details
REPO_NAME="ai-code-commenting-system"
USERNAME="e20240751"
DESCRIPTION="AI-powered code commenting system with Google Gemini integration for Python, C, JavaScript, and React"

echo "📋 Repository Details:"
echo "  Name: $REPO_NAME"
echo "  Username: $USERNAME"
echo "  Description: $DESCRIPTION"
echo ""

echo "🔗 Please follow these steps:"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Description: $DESCRIPTION"
echo "4. Set to Public (or Private if you prefer)"
echo "5. ⚠️  DO NOT initialize with README (we already have files)"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repository, run:"
echo "  git remote set-url origin https://github.com/$USERNAME/$REPO_NAME.git"
echo "  git push -u origin main"
echo ""

# Set the remote URL
git remote set-url origin https://github.com/$USERNAME/$REPO_NAME.git
echo "✅ Remote URL set to: https://github.com/$USERNAME/$REPO_NAME.git"
echo ""
echo "🎯 Ready to push! Just create the repository on GitHub and then run:"
echo "   git push -u origin main"
