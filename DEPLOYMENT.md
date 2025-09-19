# 🚀 Deployment Guide - Programming Learning Platform

This guide will help you deploy your Programming Learning Platform to production using Vercel (frontend) and Render (backend).

## 📋 Prerequisites

- GitHub repository: `https://github.com/e20240751/programming-learning-platform`
- OpenAI API key
- MongoDB database (MongoDB Atlas recommended)

## 🎯 Deployment Architecture

```
Frontend (Vercel) ←→ Backend (Render) ←→ MongoDB Atlas
```

## 🖥️ Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Connect your GitHub account

### Step 2: Deploy Frontend

1. Click **"New Project"**
2. Import your repository: `e20240751/programming-learning-platform`
3. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel:

- `REACT_APP_API_URL`: `https://your-backend-name.onrender.com`

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

## ⚙️ Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Connect your GitHub account

### Step 2: Deploy Backend

1. Click **"New Web Service"**
2. Connect your repository: `e20240751/programming-learning-platform`
3. Configure the service:
   - **Name**: `programming-learning-platform-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Environment Variables

Add these environment variables in Render:

- `NODE_ENV`: `production`
- `PORT`: `10000`
- `MONGODB_URI`: `mongodb+srv://username:password@cluster.mongodb.net/codelearning`
- `OPENAI_API_KEY`: `your_openai_api_key`
- `JWT_SECRET`: `your_jwt_secret_here`

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment.

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up for free account
3. Create a new cluster

### Step 2: Configure Database

1. Create database user
2. Whitelist IP addresses (0.0.0.0/0 for all IPs)
3. Get connection string
4. Update `MONGODB_URI` in Render environment variables

### Step 3: Seed Database

The server will automatically seed the database with exercises on first run.

## 🔧 Configuration Summary

### Frontend (Vercel)

```bash
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### Backend (Render)

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codelearning
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret_here
```

## 🧪 Testing Deployment

### 1. Test Backend Health

```bash
curl https://your-backend-name.onrender.com/api/health
```

### 2. Test Frontend

1. Visit your Vercel URL
2. Try the Smart Explanation feature
3. Test Interactive Learning
4. Try the AI Challenge
5. Check Leaderboard

### 3. Test Authentication

1. Try login/signup
2. Verify user data persistence
3. Check point system

## 🚀 Quick Deploy Commands

```bash
# Push latest changes to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# Run deployment script
npm run deploy
```

## 📱 Live URLs

After deployment, your app will be available at:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend-name.onrender.com`
- **API Health**: `https://your-backend-name.onrender.com/api/health`

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**

   - Ensure backend URL is correct in frontend environment variables
   - Check CORS configuration in server

2. **Database Connection**

   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas

3. **OpenAI API Errors**

   - Verify API key is correct
   - Check API key permissions

4. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed

## 📊 Monitoring

### Vercel Analytics

- Monitor frontend performance
- Track user engagement
- Check error rates

### Render Logs

- Monitor backend performance
- Check API response times
- Debug server errors

## 🎉 Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Database connected and seeded
- [ ] Environment variables configured
- [ ] All features working
- [ ] Authentication functional
- [ ] AI explanations working
- [ ] Exercises loading
- [ ] Challenge mode functional
- [ ] Leaderboard updating

## 🔄 Updates and Maintenance

### Deploying Updates:

1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Vercel and Render will auto-deploy

### Monitoring:

- Check logs regularly
- Monitor API usage
- Update dependencies monthly

Your Programming Learning Platform is now live and ready for users! 🚀
