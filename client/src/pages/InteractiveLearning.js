import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Trophy,
  Star,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Lock,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const InteractiveLearning = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { updatePoints, completeExercise, isAuthenticated } = useUser();

  const difficulties = ["Easy", "Medium", "Hard"];
  const pointsPerCorrect = 10;

  // Mock questions data - replace with actual API calls
  const questionsData = {
    Easy: [
      {
        id: 1,
        question: "What does the 'console.log()' function do in JavaScript?",
        options: [
          "Prints text to the console",
          "Creates a new variable",
          "Defines a function",
          "Stores data in memory",
        ],
        correct: 0,
        explanation:
          "console.log() is used to output information to the browser's console for debugging purposes.",
      },
      {
        id: 2,
        question: "Which symbol is used for comments in Python?",
        options: ["//", "#", "/* */", "--"],
        correct: 1,
        explanation:
          "In Python, the # symbol is used for single-line comments.",
      },
      {
        id: 3,
        question: "What is the result of 5 + 3 in JavaScript?",
        options: ["53", "8", "Error", "undefined"],
        correct: 1,
        explanation: "JavaScript performs arithmetic addition: 5 + 3 = 8",
      },
      {
        id: 4,
        question: "Which keyword is used to declare a variable in JavaScript?",
        options: ["var", "variable", "declare", "All of the above"],
        correct: 3,
        explanation:
          "In JavaScript, you can use 'var', 'let', or 'const' to declare variables.",
      },
      {
        id: 5,
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "High Tech Modern Language",
          "Home Tool Markup Language",
          "Hyperlink and Text Markup Language",
        ],
        correct: 0,
        explanation:
          "HTML stands for HyperText Markup Language, the standard markup language for web pages.",
      },
      {
        id: 6,
        question: "Which CSS property changes the text color?",
        options: ["text-color", "color", "font-color", "text-style"],
        correct: 1,
        explanation:
          "The 'color' property in CSS is used to set the color of text.",
      },
      {
        id: 7,
        question: "What is the correct way to create an array in JavaScript?",
        options: [
          "var arr = new Array();",
          "var arr = [];",
          "Both A and B",
          "None of the above",
        ],
        correct: 2,
        explanation:
          "Both 'new Array()' and '[]' are valid ways to create an array in JavaScript.",
      },
      {
        id: 8,
        question:
          "Which operator is used for equality comparison in JavaScript?",
        options: ["=", "==", "===", "Both B and C"],
        correct: 3,
        explanation:
          "== compares values with type coercion, === compares values without type coercion.",
      },
      {
        id: 9,
        question: "What does the 'return' statement do in a function?",
        options: [
          "Stops the function execution",
          "Returns a value from the function",
          "Both A and B",
          "Continues the function execution",
        ],
        correct: 2,
        explanation:
          "The 'return' statement both stops the function and returns a value.",
      },
      {
        id: 10,
        question: "Which method adds an element to the end of an array?",
        options: ["push()", "add()", "append()", "insert()"],
        correct: 0,
        explanation:
          "The push() method adds one or more elements to the end of an array.",
      },
    ],
    Medium: [
      {
        id: 11,
        question: "What is the output of this code: console.log(typeof null)?",
        options: ["null", "undefined", "object", "string"],
        correct: 2,
        explanation:
          "typeof null returns 'object' in JavaScript, which is a known quirk of the language.",
      },
      {
        id: 12,
        question: "What does the 'this' keyword refer to in JavaScript?",
        options: [
          "The current function",
          "The current object",
          "The global object",
          "Depends on the context",
        ],
        correct: 3,
        explanation:
          "The 'this' keyword refers to different objects depending on how it's used.",
      },
      {
        id: 13,
        question:
          "Which method is used to remove the last element from an array?",
        options: ["remove()", "pop()", "delete()", "splice()"],
        correct: 1,
        explanation:
          "The pop() method removes and returns the last element from an array.",
      },
      {
        id: 14,
        question: "What is a closure in JavaScript?",
        options: [
          "A function that has access to variables in its outer scope",
          "A way to close a function",
          "A type of variable",
          "A method to hide code",
        ],
        correct: 0,
        explanation:
          "A closure is a function that has access to variables in its outer (enclosing) scope.",
      },
      {
        id: 15,
        question: "What does the 'async' keyword do in JavaScript?",
        options: [
          "Makes a function synchronous",
          "Makes a function asynchronous",
          "Creates a new thread",
          "Stops execution",
        ],
        correct: 1,
        explanation:
          "The 'async' keyword makes a function asynchronous, allowing it to use 'await'.",
      },
      {
        id: 16,
        question: "Which CSS property is used for responsive design?",
        options: ["media queries", "@media", "Both A and B", "responsive"],
        correct: 2,
        explanation:
          "Media queries (@media) are used to apply different styles for different screen sizes.",
      },
      {
        id: 17,
        question: "What is the difference between 'let' and 'var'?",
        options: [
          "let is block-scoped, var is function-scoped",
          "No difference",
          "var is newer than let",
          "let can't be reassigned",
        ],
        correct: 0,
        explanation: "let is block-scoped while var is function-scoped.",
      },
      {
        id: 18,
        question: "What does the 'map()' method do in JavaScript?",
        options: [
          "Creates a new array with results of calling a function",
          "Creates a map object",
          "Modifies the original array",
          "Filters array elements",
        ],
        correct: 0,
        explanation:
          "map() creates a new array with the results of calling a function for every array element.",
      },
      {
        id: 19,
        question: "Which HTTP method is used to send data to a server?",
        options: ["GET", "POST", "PUT", "Both B and C"],
        correct: 3,
        explanation: "POST and PUT are both used to send data to a server.",
      },
      {
        id: 20,
        question: "What is the purpose of the 'use strict' directive?",
        options: [
          "Enables strict mode",
          "Makes code run faster",
          "Prevents errors",
          "All of the above",
        ],
        correct: 0,
        explanation:
          "'use strict' enables strict mode, which helps catch common coding mistakes.",
      },
    ],
    Hard: [
      {
        id: 21,
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct: 1,
        explanation:
          "Binary search has O(log n) time complexity because it eliminates half the search space each iteration.",
      },
      {
        id: 22,
        question:
          "What is the difference between '==' and '===' in JavaScript?",
        options: [
          "No difference",
          "=== performs type coercion, == doesn't",
          "== performs type coercion, === doesn't",
          "=== is faster than ==",
        ],
        correct: 2,
        explanation:
          "== performs type coercion while === doesn't, making === more strict.",
      },
      {
        id: 23,
        question: "What is a higher-order function?",
        options: [
          "A function that takes another function as an argument",
          "A function that returns another function",
          "Both A and B",
          "A function with high complexity",
        ],
        correct: 2,
        explanation:
          "A higher-order function either takes functions as arguments or returns functions.",
      },
      {
        id: 24,
        question: "What is the prototype chain in JavaScript?",
        options: [
          "A way to chain methods",
          "A mechanism for inheritance",
          "A type of array",
          "A debugging tool",
        ],
        correct: 1,
        explanation:
          "The prototype chain is JavaScript's mechanism for inheritance.",
      },
      {
        id: 25,
        question: "What does the 'bind()' method do?",
        options: [
          "Binds an event listener",
          "Creates a new function with a fixed 'this' value",
          "Combines two functions",
          "Removes a function",
        ],
        correct: 1,
        explanation:
          "bind() creates a new function with the 'this' value set to the provided value.",
      },
      {
        id: 26,
        question: "What is memoization?",
        options: [
          "A memory optimization technique",
          "Caching results of expensive function calls",
          "A type of data structure",
          "A debugging technique",
        ],
        correct: 1,
        explanation:
          "Memoization is an optimization technique that caches results of expensive function calls.",
      },
      {
        id: 27,
        question: "What is the difference between 'null' and 'undefined'?",
        options: [
          "No difference",
          "null is assigned, undefined is not",
          "undefined is assigned, null is not",
          "They're different types",
        ],
        correct: 1,
        explanation:
          "null is an assigned value meaning 'no value', undefined means a variable hasn't been assigned.",
      },
      {
        id: 28,
        question: "What is a pure function?",
        options: [
          "A function with no side effects",
          "A function that always returns the same output for the same input",
          "Both A and B",
          "A function that's easy to read",
        ],
        correct: 2,
        explanation:
          "A pure function has no side effects and always returns the same output for the same input.",
      },
      {
        id: 29,
        question: "What is the event loop in JavaScript?",
        options: [
          "A loop that handles events",
          "The mechanism that handles asynchronous operations",
          "A type of for loop",
          "A debugging tool",
        ],
        correct: 1,
        explanation:
          "The event loop is the mechanism that handles asynchronous operations in JavaScript.",
      },
      {
        id: 30,
        question:
          "What is the difference between 'deep copy' and 'shallow copy'?",
        options: [
          "No difference",
          "Shallow copy copies references, deep copy copies values",
          "Deep copy is faster",
          "Shallow copy is more memory efficient",
        ],
        correct: 1,
        explanation:
          "Shallow copy copies object references, deep copy creates new objects with copied values.",
      },
    ],
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQ = questionsData[selectedDifficulty][currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct;

    setShowResult(true);
    setCompletedQuestions([
      ...completedQuestions,
      { ...currentQ, userAnswer: selectedAnswer, isCorrect },
    ]);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questionsData[selectedDifficulty].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
      // Award points based on score
      const totalPoints = score * pointsPerCorrect;
      updatePoints(totalPoints);
      completeExercise(`${selectedDifficulty}-quiz-${Date.now()}`);
    }
  };

  const handleRestart = () => {
    setSelectedDifficulty(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompletedQuestions([]);
    setQuizCompleted(false);
  };

  const getRankColor = (difficulty) => {
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
              Interactive Learning
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Test your programming knowledge with our QCM exercises. Choose
              your difficulty level and earn points for each correct answer!
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
              You need to be logged in to access the interactive learning
              exercises and track your progress.
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

  if (!selectedDifficulty) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interactive Learning
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Test your programming knowledge with our QCM exercises. Choose
              your difficulty level and earn points for each correct answer!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {difficulties.map((difficulty, index) => (
              <div
                key={difficulty}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${getRankColor(
                    difficulty
                  )} rounded-lg flex items-center justify-center mb-6 mx-auto`}
                >
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {difficulty}
                </h3>
                <p className="text-gray-600 mb-6">
                  {difficulty === "Easy" &&
                    "Perfect for beginners - basic programming concepts"}
                  {difficulty === "Medium" &&
                    "Intermediate level - more complex concepts"}
                  {difficulty === "Hard" &&
                    "Advanced level - challenging programming topics"}
                </p>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">
                    10 Questions • {pointsPerCorrect} points each
                  </div>
                  <div className="text-lg font-semibold text-primary-600">
                    Start {difficulty} Quiz
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / 10) * 100);
    const totalPoints = score * pointsPerCorrect;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-8">
              <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Completed!
              </h1>
              <p className="text-xl text-gray-600">
                {selectedDifficulty} Level
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {score}/10
                </div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {percentage}%
                </div>
                <div className="text-sm text-blue-700">Score</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {totalPoints}
                </div>
                <div className="text-sm text-purple-700">Points Earned</div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleRestart}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Try Another Quiz</span>
              </button>
              <button
                onClick={() => setSelectedDifficulty(null)}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                Choose Different Difficulty
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questionsData[selectedDifficulty][currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of{" "}
              {questionsData[selectedDifficulty].length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              Score: {score}/{currentQuestion}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    questionsData[selectedDifficulty].length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 bg-gradient-to-r ${getRankColor(
                selectedDifficulty
              )} text-white`}
            >
              {selectedDifficulty}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQ.question}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && handleAnswerSelect(index)}
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
                    ? "border-primary-500 bg-primary-50 text-primary-800"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
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
                className="bg-primary-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>
                  {currentQuestion <
                  questionsData[selectedDifficulty].length - 1
                    ? "Next Question"
                    : "Finish Quiz"}
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

export default InteractiveLearning;
