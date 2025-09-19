#!/bin/bash

# Git setup script for pushing to GitHub under username e20240751

echo "Setting up Git repository for e20240751..."

# Initialize git repository
git init

# Set git configuration
git config user.name "e20240751"
git config user.email "e20240751@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Programming Learning Platform with AI Challenge"

# Create repository on GitHub (you'll need to do this manually)
echo "Next steps:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository named 'programming-learning-platform'"
echo "3. Don't initialize with README (we already have files)"
echo "4. Copy the repository URL"
echo "5. Run: git remote add origin https://github.com/e20240751/programming-learning-platform.git"
echo "6. Run: git branch -M main"
echo "7. Run: git push -u origin main"

echo ""
echo "Or run this script and follow the prompts:"
echo "git remote add origin https://github.com/e20240751/programming-learning-platform.git"
echo "git branch -M main"
echo "git push -u origin main"
