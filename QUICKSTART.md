# 🚀 CodeLearn Quick Start Guide

Get your CodeLearn platform up and running in just a few minutes!

## ⚡ Quick Setup (5 minutes)

### 1. Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd code-learning-platform

# Run the startup script
./start.sh
```

### 3. Configure Environment

Edit `server/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/codelearning
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key-here  # Optional
```

### 4. Start the Platform

```bash
npm run dev
```

🎉 **That's it!** Your platform is now running at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 First Steps

### 1. Explore Smart Explanation

- Go to "Smart Explanation" page
- Try pasting this sample code:

```javascript
function calculateArea(length, width) {
  return length * width;
}
```

- Click "Explain the Code" to see AI-powered explanations

### 2. Take Your First Quiz

- Navigate to "Interactive Learning"
- Choose "Easy" difficulty
- Answer 10 questions to earn your first points

### 3. Check Your Progress

- Visit the "Leaderboard" page
- See your rank and points
- Track your progress toward the next level

## 🏆 Ranking System

| Rank        | Points Required | Badge  |
| ----------- | --------------- | ------ |
| 🥉 Beginner | 0-299           | Award  |
| 🥈 Expert   | 300-599         | Medal  |
| 🥇 Advance  | 600-799         | Trophy |
| 💎 Epic     | 800-999         | Star   |
| 👑 Legend   | 1000+           | Crown  |

## 🎮 Features Overview

### Smart Explanation

- Paste any code snippet
- Get AI-powered explanations
- Try sample codes for different languages
- Copy and download code functionality

### Interactive Learning

- **Easy**: Basic programming concepts (10 questions)
- **Medium**: Intermediate topics (10 questions)
- **Hard**: Advanced programming concepts (10 questions)
- Earn 10 points per correct answer

### Leaderboard

- **Global**: All-time rankings
- **Weekly**: This week's top performers
- **Monthly**: This month's leaders
- Real-time progress tracking

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000
```

**MongoDB connection error:**

- Make sure MongoDB is running: `mongod`
- Check your MongoDB URI in `.env`
- For MongoDB Atlas, use the connection string from your cluster

**Missing dependencies:**

```bash
npm run install-all
```

**OpenAI API errors:**

- The platform works without OpenAI API key
- You'll get fallback explanations instead
- Add your API key to `.env` for full AI features

## 📚 Sample Codes to Try

### JavaScript Function

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

### Python Loop

```python
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(num * 2)
```

### React Component

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

## 🎯 Next Steps

1. **Complete Exercises**: Work through all difficulty levels
2. **Earn Points**: Aim for the next rank
3. **Explore Features**: Try all platform features
4. **Customize**: Modify the code to fit your needs

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the API endpoints in the server code
- Look at the component structure in the client code

---

**Happy Learning! 🚀**

Start your coding journey with CodeLearn and become a programming legend!
