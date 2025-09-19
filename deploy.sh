#!/bin/bash

echo "🚀 Programming Learning Platform Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Preparing for deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Project structure verified${NC}"

echo -e "${BLUE}Step 2: Frontend deployment to Vercel...${NC}"
echo -e "${YELLOW}To deploy frontend to Vercel:${NC}"
echo "1. Go to https://vercel.com"
echo "2. Sign in with GitHub"
echo "3. Click 'New Project'"
echo "4. Import your repository: https://github.com/e20240751/programming-learning-platform"
echo "5. Configure:"
echo "   - Framework Preset: Create React App"
echo "   - Root Directory: client"
echo "   - Build Command: npm install && npm run build"
echo "   - Output Directory: build"
echo "   - Environment Variables:"
echo "     - REACT_APP_API_URL: https://your-backend-url.onrender.com"
echo ""

echo -e "${BLUE}Step 3: Backend deployment to Render...${NC}"
echo -e "${YELLOW}To deploy backend to Render:${NC}"
echo "1. Go to https://render.com"
echo "2. Sign in with GitHub"
echo "3. Click 'New Web Service'"
echo "4. Connect your repository: https://github.com/e20240751/programming-learning-platform"
echo "5. Configure:"
echo "   - Name: programming-learning-platform-api"
echo "   - Root Directory: server"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Environment Variables:"
echo "     - NODE_ENV: production"
echo "     - PORT: 10000"
echo "     - MONGODB_URI: mongodb://localhost:27017/codelearning (or your MongoDB URI)"
echo "     - OPENAI_API_KEY: your_openai_api_key"
echo "     - JWT_SECRET: your_jwt_secret"
echo ""

echo -e "${BLUE}Step 4: Database setup...${NC}"
echo -e "${YELLOW}For production database, consider:${NC}"
echo "1. MongoDB Atlas (Free tier available): https://cloud.mongodb.com"
echo "2. Create a cluster"
echo "3. Get connection string"
echo "4. Update MONGODB_URI in Render environment variables"
echo ""

echo -e "${BLUE}Step 5: Environment Variables Summary${NC}"
echo -e "${YELLOW}Frontend (Vercel):${NC}"
echo "- REACT_APP_API_URL: https://your-backend-url.onrender.com"
echo ""
echo -e "${YELLOW}Backend (Render):${NC}"
echo "- NODE_ENV: production"
echo "- PORT: 10000"
echo "- MONGODB_URI: your_mongodb_connection_string"
echo "- OPENAI_API_KEY: your_openai_api_key"
echo "- JWT_SECRET: your_jwt_secret"
echo ""

echo -e "${GREEN}🎉 Deployment guide complete!${NC}"
echo -e "${YELLOW}After deployment, update the REACT_APP_API_URL in Vercel with your Render backend URL${NC}"
echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo "git add ."
echo "git commit -m 'Add deployment configuration'"
echo "git push origin main"
echo ""
echo -e "${GREEN}Your app will be live at:${NC}"
echo "- Frontend: https://your-app.vercel.app"
echo "- Backend: https://your-app.onrender.com"
