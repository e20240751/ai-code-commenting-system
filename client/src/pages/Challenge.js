import React, { useState, useEffect } from "react";
import {
  Zap,
  Trophy,
  Bot,
  User,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Lock,
  Star,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const Challenge = () => {
  const [challengeState, setChallengeState] = useState("start"); // start, playing, completed
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [aiAnswers, setAiAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const { isAuthenticated, updatePoints, completeExercise } = useUser();

  const rounds = [
    { difficulty: "Easy", questions: 10, timePerQuestion: 30 },
    { difficulty: "Medium", questions: 10, timePerQuestion: 25 },
    { difficulty: "Hard", questions: 10, timePerQuestion: 20 },
  ];

  const totalQuestions = 30;
  const pointsPerCorrect = 10;

  // Challenge questions data (30 questions total)
  const challengeQuestions = [
    // Easy Round (Questions 1-10)
    {
      id: 1,
      question: "What does HTML stand for?",
      options: [
        "HyperText Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlink and Text Markup Language",
      ],
      correct: 0,
      explanation: "HTML stands for HyperText Markup Language.",
      difficulty: "Easy",
    },
    {
      id: 2,
      question: "Which CSS property changes text color?",
      options: ["text-color", "color", "font-color", "text-style"],
      correct: 1,
      explanation: "The 'color' property changes text color.",
      difficulty: "Easy",
    },
    {
      id: 3,
      question: "What does console.log() do in JavaScript?",
      options: [
        "Creates a new variable",
        "Prints text to console",
        "Defines a function",
        "Stores data in memory",
      ],
      correct: 1,
      explanation: "console.log() outputs information to the console.",
      difficulty: "Easy",
    },
    {
      id: 4,
      question: "Which symbol is used for comments in Python?",
      options: ["//", "#", "/* */", "--"],
      correct: 1,
      explanation: "The # symbol is used for comments in Python.",
      difficulty: "Easy",
    },
    {
      id: 5,
      question: "What is the result of 5 + 3 in JavaScript?",
      options: ["53", "8", "Error", "undefined"],
      correct: 1,
      explanation: "JavaScript performs arithmetic: 5 + 3 = 8",
      difficulty: "Easy",
    },
    {
      id: 6,
      question: "Which keyword declares a variable in JavaScript?",
      options: ["var", "variable", "declare", "All of the above"],
      correct: 3,
      explanation: "var, let, and const all declare variables.",
      difficulty: "Easy",
    },
    {
      id: 7,
      question: "What does the 'return' statement do?",
      options: [
        "Stops function execution",
        "Returns a value",
        "Both A and B",
        "Continues execution",
      ],
      correct: 2,
      explanation: "return stops execution and returns a value.",
      difficulty: "Easy",
    },
    {
      id: 8,
      question: "Which method adds an element to array end?",
      options: ["push()", "add()", "append()", "insert()"],
      correct: 0,
      explanation: "push() adds elements to the end of an array.",
      difficulty: "Easy",
    },
    {
      id: 9,
      question: "What is a function in programming?",
      options: [
        "A reusable block of code",
        "A variable",
        "A data type",
        "A comment",
      ],
      correct: 0,
      explanation: "A function is a reusable block of code.",
      difficulty: "Easy",
    },
    {
      id: 10,
      question: "Which operator compares equality?",
      options: ["=", "==", "===", "Both B and C"],
      correct: 3,
      explanation: "== and === both compare equality differently.",
      difficulty: "Easy",
    },

    // Medium Round (Questions 11-20)
    {
      id: 11,
      question: "What does typeof null return in JavaScript?",
      options: ["null", "undefined", "object", "string"],
      correct: 2,
      explanation: "typeof null returns 'object' (known quirk).",
      difficulty: "Medium",
    },
    {
      id: 12,
      question: "What does the 'this' keyword refer to?",
      options: [
        "The current function",
        "The current object",
        "The global object",
        "Depends on context",
      ],
      correct: 3,
      explanation: "'this' refers to different objects based on context.",
      difficulty: "Medium",
    },
    {
      id: 13,
      question: "Which method removes the last array element?",
      options: ["remove()", "pop()", "delete()", "splice()"],
      correct: 1,
      explanation: "pop() removes and returns the last element.",
      difficulty: "Medium",
    },
    {
      id: 14,
      question: "What is a closure in JavaScript?",
      options: [
        "Function with access to outer scope",
        "A way to close a function",
        "A type of variable",
        "A method to hide code",
      ],
      correct: 0,
      explanation: "A closure has access to its outer scope variables.",
      difficulty: "Medium",
    },
    {
      id: 15,
      question: "What does the 'async' keyword do?",
      options: [
        "Makes function synchronous",
        "Makes function asynchronous",
        "Creates a new thread",
        "Stops execution",
      ],
      correct: 1,
      explanation: "async makes a function asynchronous.",
      difficulty: "Medium",
    },
    {
      id: 16,
      question: "Which CSS property enables responsive design?",
      options: ["media queries", "@media", "Both A and B", "responsive"],
      correct: 2,
      explanation: "Media queries (@media) enable responsive design.",
      difficulty: "Medium",
    },
    {
      id: 17,
      question: "What's the difference between 'let' and 'var'?",
      options: [
        "let is block-scoped, var is function-scoped",
        "No difference",
        "var is newer than let",
        "let can't be reassigned",
      ],
      correct: 0,
      explanation: "let is block-scoped while var is function-scoped.",
      difficulty: "Medium",
    },
    {
      id: 18,
      question: "What does the 'map()' method do?",
      options: [
        "Creates new array with function results",
        "Creates a map object",
        "Modifies original array",
        "Filters array elements",
      ],
      correct: 0,
      explanation: "map() creates a new array with function results.",
      difficulty: "Medium",
    },
    {
      id: 19,
      question: "Which HTTP method sends data to server?",
      options: ["GET", "POST", "PUT", "Both B and C"],
      correct: 3,
      explanation: "POST and PUT both send data to servers.",
      difficulty: "Medium",
    },
    {
      id: 20,
      question: "What does 'use strict' do?",
      options: [
        "Enables strict mode",
        "Makes code faster",
        "Prevents errors",
        "All of the above",
      ],
      correct: 0,
      explanation: "'use strict' enables strict mode in JavaScript.",
      difficulty: "Medium",
    },

    // Hard Round (Questions 21-30)
    {
      id: 21,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1,
      explanation: "Binary search has O(log n) time complexity.",
      difficulty: "Hard",
    },
    {
      id: 22,
      question: "What's the difference between '==' and '==='?",
      options: [
        "No difference",
        "=== performs type coercion, == doesn't",
        "== performs type coercion, === doesn't",
        "=== is faster than ==",
      ],
      correct: 2,
      explanation: "== performs type coercion, === doesn't.",
      difficulty: "Hard",
    },
    {
      id: 23,
      question: "What is a higher-order function?",
      options: [
        "Takes function as argument",
        "Returns another function",
        "Both A and B",
        "High complexity function",
      ],
      correct: 2,
      explanation: "Higher-order functions take or return functions.",
      difficulty: "Hard",
    },
    {
      id: 24,
      question: "What is the prototype chain?",
      options: [
        "Way to chain methods",
        "Inheritance mechanism",
        "Type of array",
        "Debugging tool",
      ],
      correct: 1,
      explanation: "Prototype chain is JavaScript's inheritance mechanism.",
      difficulty: "Hard",
    },
    {
      id: 25,
      question: "What does the 'bind()' method do?",
      options: [
        "Binds event listener",
        "Creates function with fixed 'this'",
        "Combines functions",
        "Removes function",
      ],
      correct: 1,
      explanation: "bind() creates a function with fixed 'this' value.",
      difficulty: "Hard",
    },
    {
      id: 26,
      question: "What is memoization?",
      options: [
        "Memory optimization technique",
        "Caching function results",
        "Type of data structure",
        "Debugging technique",
      ],
      correct: 1,
      explanation: "Memoization caches results of expensive function calls.",
      difficulty: "Hard",
    },
    {
      id: 27,
      question: "What's the difference between 'null' and 'undefined'?",
      options: [
        "No difference",
        "null is assigned, undefined is not",
        "undefined is assigned, null is not",
        "Different types",
      ],
      correct: 1,
      explanation: "null is assigned, undefined means not assigned.",
      difficulty: "Hard",
    },
    {
      id: 28,
      question: "What is a pure function?",
      options: [
        "No side effects",
        "Same input always gives same output",
        "Both A and B",
        "Easy to read",
      ],
      correct: 2,
      explanation: "Pure functions have no side effects and consistent output.",
      difficulty: "Hard",
    },
    {
      id: 29,
      question: "What is the event loop?",
      options: [
        "Loop that handles events",
        "Mechanism for async operations",
        "Type of for loop",
        "Debugging tool",
      ],
      correct: 1,
      explanation: "Event loop handles asynchronous operations.",
      difficulty: "Hard",
    },
    {
      id: 30,
      question: "What's the difference between deep and shallow copy?",
      options: [
        "No difference",
        "Shallow copies references, deep copies values",
        "Deep copy is faster",
        "Shallow copy is more memory efficient",
      ],
      correct: 1,
      explanation: "Shallow copy copies references, deep copy copies values.",
      difficulty: "Hard",
    },
  ];

  // AI response simulation
  const generateAIAnswer = (question) => {
    // AI gets 85% accuracy with some randomness
    const isCorrect = Math.random() < 0.85;
    if (isCorrect) {
      return question.correct;
    } else {
      // Random wrong answer
      const wrongAnswers = [0, 1, 2, 3].filter((i) => i !== question.correct);
      return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up - auto submit
      handleSubmitAnswer();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const startChallenge = () => {
    setChallengeState("playing");
    setCurrentRound(1);
    setCurrentQuestion(0);
    setUserScore(0);
    setAiScore(0);
    setUserAnswers([]);
    setAiAnswers([]);
    setTimeLeft(rounds[0].timePerQuestion);
    setIsTimerActive(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      // Auto-select random answer if none selected
      setSelectedAnswer(Math.floor(Math.random() * 4));
    }

    const currentQ = challengeQuestions[currentQuestion];
    const userIsCorrect = selectedAnswer === currentQ.correct;
    const aiAnswer = generateAIAnswer(currentQ);
    const aiIsCorrect = aiAnswer === currentQ.correct;

    // Update scores
    setUserScore((prev) => prev + (userIsCorrect ? 1 : 0));
    setAiScore((prev) => prev + (aiIsCorrect ? 1 : 0));

    // Store answers
    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion,
        answer: selectedAnswer,
        correct: userIsCorrect,
      },
    ]);
    setAiAnswers((prev) => [
      ...prev,
      { question: currentQuestion, answer: aiAnswer, correct: aiIsCorrect },
    ]);

    setShowResult(true);
    setIsTimerActive(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);

      // Check if we need to move to next round
      const nextRound = Math.floor((currentQuestion + 1) / 10) + 1;
      if (nextRound !== currentRound) {
        setCurrentRound(nextRound);
      }

      // Set timer for next question
      const roundIndex = Math.floor((currentQuestion + 1) / 10);
      setTimeLeft(rounds[roundIndex].timePerQuestion);
      setIsTimerActive(true);
    } else {
      // Challenge completed
      setChallengeState("completed");

      // Award points based on performance
      const totalPoints = userScore * pointsPerCorrect;
      updatePoints(totalPoints);
      completeExercise(`challenge-${Date.now()}`);
    }
  };

  const resetChallenge = () => {
    setChallengeState("start");
    setCurrentRound(1);
    setCurrentQuestion(0);
    setUserScore(0);
    setAiScore(0);
    setUserAnswers([]);
    setAiAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setIsTimerActive(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "from-green-500 to-emerald-600";
      case "Medium":
        return "from-yellow-500 to-orange-600";
      case "Hard":
        return "from-red-500 to-pink-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Show login prompt for guests
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI Challenge
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compete against AI in a 30-question challenge across 3 rounds of
              increasing difficulty!
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to participate in the AI Challenge.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Don't have an account? You can create one during the login
              process!
            </p>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Demo Account:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  demo
                </span>{" "}
                /{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  demo123
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (challengeState === "start") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI Challenge
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compete against AI in a 30-question challenge across 3 rounds of
              increasing difficulty!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {rounds.map((round, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${getDifficultyColor(
                    round.difficulty
                  )} rounded-lg flex items-center justify-center mb-6 mx-auto`}
                >
                  <span className="text-white font-bold text-xl">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Round {index + 1}
                </h3>
                <div
                  className={`text-lg font-semibold bg-gradient-to-r ${getDifficultyColor(
                    round.difficulty
                  )} bg-clip-text text-transparent mb-4`}
                >
                  {round.difficulty}
                </div>
                <div className="text-gray-600 space-y-2">
                  <p>{round.questions} Questions</p>
                  <p>{round.timePerQuestion}s per question</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Challenge Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Your Challenge
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Answer 30 questions total</li>
                  <li>• 3 rounds: Easy → Medium → Hard</li>
                  <li>• Limited time per question</li>
                  <li>• Earn 10 points per correct answer</li>
                  <li>• Track your progress in real-time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-purple-600" />
                  AI Opponent
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Same 30 questions</li>
                  <li>• 85% accuracy rate</li>
                  <li>• Instant responses</li>
                  <li>• No time pressure</li>
                  <li>• Challenging but fair</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={startChallenge}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Zap className="h-6 w-6" />
                <span>Start Challenge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (challengeState === "completed") {
    const userWon = userScore > aiScore;
    const isTie = userScore === aiScore;
    const totalPoints = userScore * pointsPerCorrect;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Challenge Complete!
            </h1>
            <p className="text-xl text-gray-600">
              {userWon
                ? "🎉 Congratulations! You defeated the AI!"
                : isTie
                ? "🤝 It's a tie! Great performance!"
                : "🤖 The AI won this time. Try again!"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* User Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Your Score</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {userScore}/30
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  {Math.round((userScore / 30) * 100)}% Accuracy
                </div>
                <div className="text-2xl font-bold text-green-600">
                  +{totalPoints} Points
                </div>
              </div>
            </div>

            {/* AI Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Bot className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">AI Score</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {aiScore}/30
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  {Math.round((aiScore / 30) * 100)}% Accuracy
                </div>
                <div className="text-sm text-gray-500">AI Performance</div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={resetChallenge}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Challenge Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Challenge in progress
  const currentQ = challengeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentRoundData = rounds[currentRound - 1];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Challenge</h2>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {userScore}
              </div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {aiScore}
              </div>
              <div className="text-sm text-gray-600">AI Score</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(
                currentRoundData.difficulty
              )} text-white`}
            >
              Round {currentRound}: {currentRoundData.difficulty}
            </div>
            <div className="flex items-center space-x-2 text-red-600">
              <Clock className="h-5 w-5" />
              <span className="font-bold text-xl">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQ.question}
          </h3>

          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  showResult
                    ? index === currentQ.correct
                      ? "border-green-500 bg-green-50 text-green-800"
                      : index === selectedAnswer &&
                        selectedAnswer !== currentQ.correct
                      ? "border-red-500 bg-red-50 text-red-800"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                    : selectedAnswer === index
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  {showResult && index === currentQ.correct && (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  )}
                  {showResult &&
                    index === selectedAnswer &&
                    selectedAnswer !== currentQ.correct && (
                      <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    )}
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{currentQ.explanation}</p>
            </div>
          )}

          <div className="flex justify-between">
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>
                  {currentQuestion < totalQuestions - 1
                    ? "Next Question"
                    : "Finish Challenge"}
                </span>
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
