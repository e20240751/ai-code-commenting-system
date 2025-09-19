const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");
const multer = require("multer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key-here",
});

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/codelearning",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rank: { type: String, default: "beginner" },
  points: { type: Number, default: 0 },
  completedExercises: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: [String],
  correct: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

// Leaderboard Schema
const leaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: { type: String, required: true },
  rank: { type: String, required: true },
  points: { type: Number, required: true },
  completedExercises: { type: Number, required: true },
  timeframe: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Helper function to calculate rank based on points
const calculateRank = (points) => {
  if (points >= 1000) return "legend";
  if (points >= 800) return "epic";
  if (points >= 600) return "advance";
  if (points >= 300) return "expert";
  return "beginner";
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Code Learning Platform API is running!" });
});

// User registration
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        points: user.points,
        completedExercises: user.completedExercises,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        points: user.points,
        completedExercises: user.completedExercises,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        points: user.points,
        completedExercises: user.completedExercises,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user points and rank
app.post("/api/user/update-points", authenticateToken, async (req, res) => {
  try {
    const { points } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.points += points;
    user.rank = calculateRank(user.points);
    await user.save();

    res.json({
      message: "Points updated successfully",
      user: {
        id: user._id,
        username: user.username,
        rank: user.rank,
        points: user.points,
      },
    });
  } catch (error) {
    console.error("Update points error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Complete exercise
app.post("/api/user/complete-exercise", authenticateToken, async (req, res) => {
  try {
    const { exerciseId } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.completedExercises.includes(exerciseId)) {
      user.completedExercises.push(exerciseId);
      await user.save();
    }

    res.json({
      message: "Exercise marked as completed",
      completedExercises: user.completedExercises,
    });
  } catch (error) {
    console.error("Complete exercise error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// AI Code Explanation
app.post("/api/explain-code", authenticateToken, async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Prepare prompt for OpenAI
    const prompt = `Please explain this ${
      language || "code"
    } in simple, beginner-friendly language. Break down what each part does and explain the overall purpose. Make it educational and easy to understand for someone learning to program:

\`\`\`${language || ""}
${code}
\`\`\`

Please provide a clear explanation that covers:
1. What the code does overall
2. Key concepts or functions used
3. How each part contributes to the whole
4. Any important programming principles demonstrated`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful programming tutor who explains code in simple, beginner-friendly language. Focus on making complex concepts accessible to new programmers.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const explanation = completion.choices[0].message.content;

    res.json({
      explanation,
      code,
      language: language || "unknown",
    });
  } catch (error) {
    console.error("Code explanation error:", error);

    // Fallback explanation if OpenAI fails
    const fallbackExplanation = `This code snippet contains programming logic that performs specific operations. Each line contributes to the overall functionality of the program. Understanding the purpose of each part helps you learn how different programming concepts work together to solve problems.`;

    res.json({
      explanation: fallbackExplanation,
      code: req.body.code,
      language: req.body.language || "unknown",
    });
  }
});

// Get exercises by difficulty
app.get("/api/exercises/:difficulty", async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }

    const exercises = await Exercise.find({
      difficulty: difficulty.toLowerCase(),
    });

    if (exercises.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercises found for this difficulty" });
    }

    res.json({ exercises });
  } catch (error) {
    console.error("Get exercises error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Submit exercise answer
app.post("/api/exercises/submit", authenticateToken, async (req, res) => {
  try {
    const { exerciseId, answer } = req.body;

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    const isCorrect = answer === exercise.correct;
    const points = isCorrect ? 10 : 0;

    // Update user points if correct
    if (isCorrect) {
      const user = await User.findById(req.user.userId);
      if (user) {
        user.points += points;
        user.rank = calculateRank(user.points);
        await user.save();
      }
    }

    res.json({
      isCorrect,
      points,
      correctAnswer: exercise.correct,
      explanation: exercise.explanation,
    });
  } catch (error) {
    console.error("Submit exercise error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get leaderboard
app.get("/api/leaderboard/:timeframe", async (req, res) => {
  try {
    const { timeframe } = req.params;

    let dateFilter = {};
    const now = new Date();

    switch (timeframe) {
      case "weekly":
        dateFilter = {
          updatedAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "monthly":
        dateFilter = {
          updatedAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        };
        break;
      // 'all' or default - no date filter
    }

    const leaderboard = await Leaderboard.find(dateFilter)
      .sort({ points: -1 })
      .limit(100)
      .populate("userId", "username");

    res.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update leaderboard (called when user completes exercises)
app.post("/api/leaderboard/update", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update or create leaderboard entry
    await Leaderboard.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        username: user.username,
        rank: user.rank,
        points: user.points,
        completedExercises: user.completedExercises.length,
        timeframe: "all",
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    res.json({ message: "Leaderboard updated successfully" });
  } catch (error) {
    console.error("Update leaderboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// File upload for code
app.post(
  "/api/upload-code",
  authenticateToken,
  upload.single("codeFile"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const code = req.file.buffer.toString("utf-8");
      const filename = req.file.originalname;

      res.json({
        message: "File uploaded successfully",
        code,
        filename,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
