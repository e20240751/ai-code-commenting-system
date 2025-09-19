#!/bin/bash

echo "🔍 DETECTING YOUR GITHUB ACCOUNTS"
echo "================================="

# Get current git config
CURRENT_USER=$(git config --global user.name)
CURRENT_EMAIL=$(git config --global user.email)

echo "📋 Current Git Configuration:"
echo "  Username: $CURRENT_USER"
echo "  Email: $CURRENT_EMAIL"
echo ""

# List of possible usernames for both accounts
ACCOUNTS=("e20240751" "vongvichekaly1")

echo "🔄 Trying to push to different GitHub accounts..."
echo ""

for account in "${ACCOUNTS[@]}"; do
    echo "🔄 Trying account: $account"
    
    # Try different repository names for this account
    REPOS=("ai-code-commenting-system" "code-comment-system" "ai-app" "code-comment" "ai-system")
    
    for repo in "${REPOS[@]}"; do
        echo "  📁 Trying repository: $repo"
        git remote set-url origin https://github.com/$account/$repo.git
        
        if git push -u origin main 2>/dev/null; then
            echo ""
            echo "🎉 SUCCESS! Code pushed to GitHub!"
            echo "🔗 Repository: https://github.com/$account/$repo"
            echo "👤 Account: $account"
            echo ""
            echo "✅ Your AI Code Commenting System is now live!"
            echo "   - Complete React frontend with AI integration"
            echo "   - Node.js backend with Google Gemini API"
            echo "   - Multi-language support (Python, C, JavaScript, React)"
            echo "   - Educational code commenting system"
            exit 0
        else
            echo "    ❌ Repository $repo not found for account $account"
        fi
    done
    echo ""
done

echo "🚨 No existing repositories found for any account!"
echo ""
echo "📋 QUICK SETUP OPTIONS:"
echo ""
echo "🔹 Option 1 - Current Account ($CURRENT_USER):"
echo "   1. Go to: https://github.com/new"
echo "   2. Make sure you're logged in as: $CURRENT_USER"
echo "   3. Repository name: ai-code-commenting-system"
echo "   4. Description: AI-powered code commenting system"
echo "   5. ⚠️  DO NOT check 'Initialize with README'"
echo "   6. Click 'Create repository'"
echo ""
echo "🔹 Option 2 - Switch to Other Account:"
echo "   1. Go to: https://github.com/new"
echo "   2. Make sure you're logged in as your other account"
echo "   3. Repository name: ai-code-commenting-system"
echo "   4. Description: AI-powered code commenting system"
echo "   5. ⚠️  DO NOT check 'Initialize with README'"
echo "   6. Click 'Create repository'"
echo ""
echo "🎯 After creating the repository, run: ./push-correct-account.sh"
echo ""
echo "💡 TIP: Check which account you're logged into at: https://github.com/settings/profile"
