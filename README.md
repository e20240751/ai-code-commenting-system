# CodeLearn - Smart Programming Education Platform

A comprehensive web-based platform designed to support beginners in programming by making code easier to understand through AI-powered explanations, interactive exercises, and gamified learning.

## 🌟 Features

### 1. Smart Code Explanation

- **AI-Powered Analysis**: Paste any code snippet and get instant, beginner-friendly explanations
- **Interactive Interface**: Clean, intuitive design with real-time explanation generation
- **Multiple Languages**: Supports JavaScript, Python, React, and more
- **Sample Codes**: Pre-loaded examples to help users get started

### 2. Interactive Learning (QCM Exercises)

- **Three Difficulty Levels**: Easy, Medium, and Hard exercises
- **10 Questions Per Level**: Comprehensive coverage of programming concepts
- **Real-time Feedback**: Immediate explanations for correct/incorrect answers
- **Progress Tracking**: Visual progress indicators and score tracking
- **Point System**: Earn 10 points for each correct answer

### 3. Ranking System

- **5 Rank Levels**:
  - 🥉 **Beginner** (0-299 points)
  - 🥈 **Expert** (300-599 points)
  - 🥇 **Advance** (600-799 points)
  - 💎 **Epic** (800-999 points)
  - 👑 **Legend** (1000+ points)
- **Dynamic Progression**: Automatic rank updates based on points earned
- **Visual Badges**: Beautiful rank indicators with gradient colors

### 4. Leaderboard & Competition

- **Multiple Timeframes**: Global, Weekly, and Monthly leaderboards
- **Real-time Updates**: Live ranking updates as users complete exercises
- **User Profiles**: Individual progress tracking and statistics
- **Achievement System**: Unlock badges and achievements

### 5. Progress Tracking

- **User Dashboard**: Comprehensive overview of learning progress
- **Exercise History**: Track completed exercises and performance
- **Statistics**: Points, rank, and completion rates
- **Next Rank Preview**: See requirements for the next rank level

## 🚀 Tech Stack

### Frontend

- **React.js** - Modern UI library for building interactive interfaces
- **React Router** - Client-side routing for seamless navigation
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Lucide React** - Beautiful, customizable icons
- **Axios** - HTTP client for API communication

### Backend

- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for storing user data and exercises
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing for security

### AI Integration

- **OpenAI API** - GPT models for intelligent code explanations
- **Fallback System** - Graceful degradation when AI service is unavailable

### Additional Tools

- **Multer** - File upload handling
- **CORS** - Cross-Origin Resource Sharing configuration
- **Concurrently** - Running multiple npm scripts simultaneously

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- OpenAI API key (optional, fallback explanations available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd code-learning-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Or use the convenience script
npm run install-all
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/codelearning

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API Key (optional)
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample exercises
cd server
node seed.js
```

### 5. Run the Application

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Backend: npm run server
# Frontend: npm run client
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Usage Guide

### Smart Code Explanation

1. Navigate to the "Smart Explanation" page
2. Paste your code in the text area
3. Click "Explain the Code" to get AI-powered explanations
4. Try the sample codes provided for different programming languages

### Interactive Learning

1. Go to the "Interactive Learning" page
2. Choose your difficulty level (Easy, Medium, Hard)
3. Answer 10 questions to test your knowledge
4. Earn points for correct answers
5. Review explanations for better understanding

### Leaderboard & Ranking

1. Visit the "Leaderboard" page to see your ranking
2. Track your progress and compare with other users
3. View different timeframes (Global, Weekly, Monthly)
4. See rank requirements and next level goals

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile

### Code Explanation

- `POST /api/explain-code` - Generate AI code explanation

### Exercises

- `GET /api/exercises/:difficulty` - Get exercises by difficulty
- `POST /api/exercises/submit` - Submit exercise answer

### User Progress

- `POST /api/user/update-points` - Update user points
- `POST /api/user/complete-exercise` - Mark exercise as completed

### Leaderboard

- `GET /api/leaderboard/:timeframe` - Get leaderboard data
- `POST /api/leaderboard/update` - Update leaderboard

### File Upload

- `POST /api/upload-code` - Upload code file

## 🎨 UI/UX Features

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Seamless experience across all devices
- Modern gradient backgrounds and smooth animations

### Interactive Elements

- Hover effects and transitions
- Loading states and progress indicators
- Real-time feedback and notifications

### Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly components

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Input validation and sanitization
- Environment variable protection

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
# Deploy the build folder to your hosting service
```

### Backend (Render/Heroku)

```bash
cd server
# Add your environment variables to your hosting platform
# Deploy the server directory
```

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Update your `MONGODB_URI` in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎉 Acknowledgments

- OpenAI for providing the AI explanation capabilities
- The React and Node.js communities for excellent documentation
- All contributors and users who help improve this platform

---

**Happy Learning! 🚀**

Start your programming journey with CodeLearn and become a coding legend!
