const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/codelearning",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: [String],
  correct: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

// Sample exercises data
const exercises = [
  // Easy exercises
  {
    difficulty: "easy",
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
    difficulty: "easy",
    question: "Which symbol is used for comments in Python?",
    options: ["//", "#", "/* */", "--"],
    correct: 1,
    explanation: "In Python, the # symbol is used for single-line comments.",
  },
  {
    difficulty: "easy",
    question: "What is the result of 5 + 3 in JavaScript?",
    options: ["53", "8", "Error", "undefined"],
    correct: 1,
    explanation: "JavaScript performs arithmetic addition: 5 + 3 = 8",
  },
  {
    difficulty: "easy",
    question: "Which keyword is used to declare a variable in JavaScript?",
    options: ["var", "variable", "declare", "All of the above"],
    correct: 3,
    explanation:
      "In JavaScript, you can use 'var', 'let', or 'const' to declare variables.",
  },
  {
    difficulty: "easy",
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
    difficulty: "easy",
    question: "Which CSS property changes the text color?",
    options: ["text-color", "color", "font-color", "text-style"],
    correct: 1,
    explanation:
      "The 'color' property in CSS is used to set the color of text.",
  },
  {
    difficulty: "easy",
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
    difficulty: "easy",
    question: "Which operator is used for equality comparison in JavaScript?",
    options: ["=", "==", "===", "Both B and C"],
    correct: 3,
    explanation:
      "== compares values with type coercion, === compares values without type coercion.",
  },
  {
    difficulty: "easy",
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
    difficulty: "easy",
    question: "Which method adds an element to the end of an array?",
    options: ["push()", "add()", "append()", "insert()"],
    correct: 0,
    explanation:
      "The push() method adds one or more elements to the end of an array.",
  },

  // Medium exercises
  {
    difficulty: "medium",
    question: "What is the output of this code: console.log(typeof null)?",
    options: ["null", "undefined", "object", "string"],
    correct: 2,
    explanation:
      "typeof null returns 'object' in JavaScript, which is a known quirk of the language.",
  },
  {
    difficulty: "medium",
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
    difficulty: "medium",
    question: "Which method is used to remove the last element from an array?",
    options: ["remove()", "pop()", "delete()", "splice()"],
    correct: 1,
    explanation:
      "The pop() method removes and returns the last element from an array.",
  },
  {
    difficulty: "medium",
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
    difficulty: "medium",
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
    difficulty: "medium",
    question: "Which CSS property is used for responsive design?",
    options: ["media queries", "@media", "Both A and B", "responsive"],
    correct: 2,
    explanation:
      "Media queries (@media) are used to apply different styles for different screen sizes.",
  },
  {
    difficulty: "medium",
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
    difficulty: "medium",
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
    difficulty: "medium",
    question: "Which HTTP method is used to send data to a server?",
    options: ["GET", "POST", "PUT", "Both B and C"],
    correct: 3,
    explanation: "POST and PUT are both used to send data to a server.",
  },
  {
    difficulty: "medium",
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

  // Hard exercises
  {
    difficulty: "hard",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1,
    explanation:
      "Binary search has O(log n) time complexity because it eliminates half the search space each iteration.",
  },
  {
    difficulty: "hard",
    question: "What is the difference between '==' and '===' in JavaScript?",
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
    difficulty: "hard",
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
    difficulty: "hard",
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
    difficulty: "hard",
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
    difficulty: "hard",
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
    difficulty: "hard",
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
    difficulty: "hard",
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
    difficulty: "hard",
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
    difficulty: "hard",
    question: "What is the difference between 'deep copy' and 'shallow copy'?",
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
];

async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log("Cleared existing exercises");

    // Insert new exercises
    await Exercise.insertMany(exercises);
    console.log(`Inserted ${exercises.length} exercises`);

    console.log("Database seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
