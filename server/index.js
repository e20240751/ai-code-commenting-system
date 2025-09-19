const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();

// Load API key from secret.env file
const fs = require("fs");
const path = require("path");
try {
  const secretEnvPath = path.join(__dirname, "..", "secret.env");
  if (fs.existsSync(secretEnvPath)) {
    const secretContent = fs.readFileSync(secretEnvPath, "utf8");
    const apiKeyMatch = secretContent.match(/GEMINI_API_KEY=(.+)/);
    if (apiKeyMatch) {
      process.env.GEMINI_API_KEY = apiKeyMatch[1];
      console.log(
        "✅ API Key loaded from secret.env:",
        process.env.GEMINI_API_KEY.substring(0, 15) + "..."
      );
    }
  }
} catch (error) {
  console.log("⚠️ Could not load secret.env:", error.message);
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize Google Gemini AI (Free)
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "your-gemini-api-key-here"
);

// Available APIs for code explanation
const AVAILABLE_APIS = {
  GEMINI: "gemini",
  DEEPSEEK: "deepseek",
  HUGGINGFACE: "huggingface",
  FALLBACK: "fallback",
};

// Pattern storage for code patterns and explanations
const codePatterns = {
  python: {
    functions: new Map(),
    loops: new Map(),
    conditionals: new Map(),
    dataStructures: new Map(),
    imports: new Map(),
  },
  c: {
    functions: new Map(),
    pointers: new Map(),
    memory: new Map(),
    conditionals: new Map(),
    includes: new Map(),
  },
  javascript: {
    functions: new Map(),
    objects: new Map(),
    arrays: new Map(),
    async: new Map(),
    dom: new Map(),
  },
  react: {
    components: new Map(),
    hooks: new Map(),
    props: new Map(),
    state: new Map(),
    jsx: new Map(),
  },
};

// Function to recognize and store code patterns
function recognizeAndStorePattern(code, language) {
  const patterns = [];
  const lang = language.toLowerCase().trim();

  if (lang === "python" || lang.startsWith("python ")) {
    patterns.push(...recognizePythonPatterns(code));
  } else if (lang === "c" || lang.startsWith("c ")) {
    patterns.push(...recognizeCPatterns(code));
  } else if (lang === "javascript" || lang.startsWith("javascript ")) {
    patterns.push(...recognizeJavaScriptPatterns(code));
  } else if (lang === "react" || lang.startsWith("react ")) {
    patterns.push(...recognizeReactPatterns(code));
  }

  return patterns;
}

// Python pattern recognition
function recognizePythonPatterns(code) {
  const patterns = [];

  // Function definitions
  if (/def\s+\w+\s*\(/.test(code)) {
    patterns.push({
      type: "function",
      pattern: "def function_name():",
      explanation:
        "Function definition in Python - creates a reusable block of code",
      example: "def greet(name): return f'Hello, {name}!'",
    });
  }

  // List comprehensions
  if (/\[.*for.*in.*\]/.test(code)) {
    patterns.push({
      type: "dataStructures",
      pattern: "list comprehension",
      explanation:
        "List comprehension - creates a new list by applying an expression to each item",
      example: "[x*2 for x in range(5)]",
    });
  }

  // Lambda functions
  if (/lambda\s+.*:/.test(code)) {
    patterns.push({
      type: "functions",
      pattern: "lambda function",
      explanation: "Lambda function - anonymous function for simple operations",
      example: "lambda x: x * 2",
    });
  }

  // F-strings (formatted string literals)
  if (/f\"/.test(code) || /f'/.test(code)) {
    patterns.push({
      type: "strings",
      pattern: "f-string formatting",
      explanation:
        "F-string - formatted string literal for string interpolation",
      example: "f'Hello {name}, you are {age} years old'",
    });
  }

  // Try-except blocks
  if (/try:/.test(code) && /except/.test(code)) {
    patterns.push({
      type: "conditionals",
      pattern: "try-except block",
      explanation: "Exception handling - catches and handles errors gracefully",
      example: "try: risky_operation()\nexcept ValueError: handle_error()",
    });
  }

  // For loops
  if (/for\s+\w+\s+in/.test(code)) {
    patterns.push({
      type: "loops",
      pattern: "for loop",
      explanation:
        "For loop - iterates over a sequence (list, tuple, string, etc.)",
      example: "for item in my_list: print(item)",
    });
  }

  // While loops
  if (/while\s+.*:/.test(code)) {
    patterns.push({
      type: "loops",
      pattern: "while loop",
      explanation: "While loop - repeats code while a condition is true",
      example: "while count < 10: count += 1",
    });
  }

  // Class definitions
  if (/class\s+\w+/.test(code)) {
    patterns.push({
      type: "classes",
      pattern: "class definition",
      explanation:
        "Class definition - blueprint for creating objects with attributes and methods",
      example: "class Person:\n    def __init__(self, name): self.name = name",
    });
  }

  return patterns;
}

// C pattern recognition
function recognizeCPatterns(code) {
  const patterns = [];

  // Function definitions
  if (/\w+\s+\w+\s*\(.*\)\s*\{/.test(code)) {
    patterns.push({
      type: "function",
      pattern: "function definition",
      explanation:
        "Function definition in C - specifies return type, name, and parameters",
      example: "int add(int a, int b) { return a + b; }",
    });
  }

  // Pointer usage
  if (/\*/.test(code)) {
    patterns.push({
      type: "pointers",
      pattern: "pointer usage",
      explanation:
        "Pointer - stores memory address, allows direct memory access",
      example: "int *ptr = &variable;",
    });
  }

  // Memory allocation
  if (/malloc|calloc|free/.test(code)) {
    patterns.push({
      type: "memory",
      pattern: "memory management",
      explanation:
        "Dynamic memory allocation - allocate/free memory at runtime",
      example: "int *arr = malloc(10 * sizeof(int));",
    });
  }

  return patterns;
}

// JavaScript pattern recognition
function recognizeJavaScriptPatterns(code) {
  const patterns = [];

  // Arrow functions
  if (/=>/.test(code)) {
    patterns.push({
      type: "functions",
      pattern: "arrow function",
      explanation:
        "Arrow function - concise function syntax with lexical 'this' binding",
      example: "const add = (a, b) => a + b;",
    });
  }

  // Object destructuring
  if (/\{[^}]*\}/.test(code) && /=/.test(code)) {
    patterns.push({
      type: "objects",
      pattern: "object destructuring",
      explanation:
        "Object destructuring - extract values from objects into variables",
      example: "const {name, age} = person;",
    });
  }

  // Array methods
  if (/\.map\(|\.filter\(|\.reduce\(/.test(code)) {
    patterns.push({
      type: "arrays",
      pattern: "array methods",
      explanation:
        "Array methods - functional programming operations on arrays",
      example: "arr.map(x => x * 2)",
    });
  }

  // Template literals
  if (/\`.*\$\{.*\}.*\`/.test(code)) {
    patterns.push({
      type: "strings",
      pattern: "template literals",
      explanation:
        "Template literals - strings with embedded expressions using backticks",
      example: "`Hello ${name}, you are ${age} years old`",
    });
  }

  // Async/await
  if (/async\s+function|await\s+/.test(code)) {
    patterns.push({
      type: "async",
      pattern: "async/await",
      explanation:
        "Async/await - handles asynchronous operations in a synchronous style",
      example: "async function fetchData() { const data = await api.get(); }",
    });
  }

  // Promises
  if (/\.then\(|\.catch\(|Promise\./.test(code)) {
    patterns.push({
      type: "async",
      pattern: "promises",
      explanation:
        "Promises - handle asynchronous operations and their results",
      example:
        "fetch(url).then(response => response.json()).catch(error => console.log(error))",
    });
  }

  // Function declarations
  if (/function\s+\w+\s*\(/.test(code)) {
    patterns.push({
      type: "functions",
      pattern: "function declaration",
      explanation:
        "Function declaration - creates a named function that can be called",
      example: "function greet(name) { return `Hello, ${name}!`; }",
    });
  }

  // Const/let declarations
  if (/\bconst\s+\w+|\blet\s+\w+/.test(code)) {
    patterns.push({
      type: "variables",
      pattern: "const/let declarations",
      explanation:
        "Block-scoped variable declarations - const for constants, let for variables",
      example: "const name = 'John'; let age = 25;",
    });
  }

  return patterns;
}

// React pattern recognition
function recognizeReactPatterns(code) {
  const patterns = [];

  // React hooks
  if (
    /useState|useEffect|useContext|useReducer|useMemo|useCallback/.test(code)
  ) {
    patterns.push({
      type: "hooks",
      pattern: "React hooks",
      explanation:
        "React hooks - functions that let you use state and lifecycle features in functional components",
      example: "const [count, setCount] = useState(0);",
    });
  }

  // JSX elements
  if (/<[A-Z]\w*/.test(code)) {
    patterns.push({
      type: "jsx",
      pattern: "JSX component",
      explanation: "JSX - JavaScript XML syntax for writing React components",
      example: "<Button onClick={handleClick}>Click me</Button>",
    });
  }

  // Props destructuring
  if (/\{.*\}/.test(code) && /function|const.*=.*\(/.test(code)) {
    patterns.push({
      type: "props",
      pattern: "props destructuring",
      explanation:
        "Props destructuring - extract props from component parameters",
      example: "function Component({ title, content }) { ... }",
    });
  }

  // Component definition
  if (/function\s+\w+\s*\(.*\)\s*{|const\s+\w+\s*=\s*\(.*\)\s*=>/.test(code)) {
    patterns.push({
      type: "components",
      pattern: "component definition",
      explanation: "Component definition - creates a reusable piece of UI",
      example: "function MyComponent() { return <div>Hello</div>; }",
    });
  }

  // Event handlers
  if (/onClick|onChange|onSubmit|onKeyDown/.test(code)) {
    patterns.push({
      type: "events",
      pattern: "event handlers",
      explanation:
        "Event handlers - functions that respond to user interactions",
      example: "<button onClick={handleClick}>Click me</button>",
    });
  }

  // Conditional rendering
  if (/\{\s*.*\s*\?\s*.*\s*:\s*.*\s*\}/.test(code)) {
    patterns.push({
      type: "jsx",
      pattern: "conditional rendering",
      explanation:
        "Conditional rendering - displays different content based on conditions",
      example: "{isLoggedIn ? <Welcome /> : <Login />}",
    });
  }

  // Import statements
  if (/import.*from\s+['\"]react['\"]/.test(code)) {
    patterns.push({
      type: "imports",
      pattern: "React imports",
      explanation: "React imports - brings React features into your component",
      example: "import React, { useState } from 'react';",
    });
  }

  // State management
  if (/useState|useReducer/.test(code)) {
    patterns.push({
      type: "state",
      pattern: "state management",
      explanation:
        "State management - manages component data that can change over time",
      example: "const [user, setUser] = useState(null);",
    });
  }

  return patterns;
}

// Function to generate explanation from stored patterns
function generateExplanationFromPatterns(
  patterns,
  language,
  originalCode = ""
) {
  let explanation = "🤖 **Intelligent Code Analysis:**\n\n";

  if (patterns.length === 0) {
    explanation += "**Code Overview:**\n";
    explanation +=
      "This code demonstrates fundamental programming concepts. Let's break it down:\n\n";
    explanation += "**Key Learning Points:**\n";
    explanation +=
      "• **Sequential Execution**: Code runs line by line from top to bottom\n";
    explanation += "• **Data Processing**: Each line transforms or uses data\n";
    explanation +=
      "• **Problem Solving**: Programming breaks complex tasks into simple steps\n\n";
    explanation += "**Next Steps:**\n";
    explanation += "• Try adding variables to store data\n";
    explanation += "• Experiment with different operations\n";
    explanation += "• Practice writing your own functions\n";
    return explanation;
  }

  explanation += "**Detected Programming Patterns:**\n\n";

  patterns.forEach((pattern, index) => {
    explanation += `${index + 1}. **${pattern.pattern}**\n`;
    explanation += `   📚 **What it does**: ${pattern.explanation}\n`;
    explanation += `   💡 **Example**: \`${pattern.example}\`\n\n`;
  });

  explanation += "**🎓 Learning Insights:**\n";
  explanation += `• These patterns are fundamental to ${language} programming\n`;
  explanation += "• Recognizing patterns helps you understand existing code\n";
  explanation += "• Practice these patterns to improve your coding skills\n";
  explanation += "• Each pattern solves a specific programming problem\n\n";

  explanation += "**🚀 Practice Suggestions:**\n";
  explanation += "• Try modifying the code to use different values\n";
  explanation += "• Add new functions using similar patterns\n";
  explanation += "• Experiment with different data types\n\n";

  // Add code analysis section
  explanation += "**🔍 Code Analysis:**\n";
  explanation +=
    "This code demonstrates several important programming concepts:\n\n";

  // Analyze the code structure
  const lines = originalCode.split("\n").filter((line) => line.trim());
  explanation += `• **Code Structure**: ${lines.length} lines of executable code\n`;
  explanation += `• **Complexity Level**: ${
    patterns.length > 3
      ? "Intermediate"
      : patterns.length > 1
      ? "Beginner-Intermediate"
      : "Beginner"
  }\n`;
  explanation += `• **Main Purpose**: ${analyzeCodePurpose(
    patterns,
    language
  )}\n\n`;

  // Add commented code section
  explanation += "**📝 Commented Code Version:**\n";
  explanation += "```" + language.toLowerCase() + "\n";
  explanation += addCommentsToCode(patterns, language, originalCode);
  explanation += "\n```\n";

  return explanation;
}

// Function to add comments to actual code based on detected patterns
function addCommentsToCode(patterns, language, originalCode) {
  let commentedCode = originalCode;

  // Add comments based on detected patterns
  if (language.toLowerCase().includes("python")) {
    // Add Python comments
    commentedCode = commentedCode
      .replace(
        /(def\s+\w+\s*\([^)]*\):)/g,
        "# Function definition - creates a reusable block of code\n$1"
      )
      .replace(
        /(print\s*\([^)]*\))/g,
        "# Print statement - displays text to the console\n    $1"
      )
      .replace(
        /(for\s+\w+\s+in\s+[^:]+:)/g,
        "# For loop - iterates over a sequence\n$1"
      )
      .replace(/(if\s+[^:]+:)/g, "# If statement - conditional execution\n$1")
      .replace(
        /(while\s+[^:]+:)/g,
        "# While loop - repeats while condition is true\n$1"
      )
      .replace(
        /(\w+\s*=\s*[^#\n]+)/g,
        "# Variable assignment - stores a value\n$1"
      )
      .replace(
        /(return\s+[^#\n]+)/g,
        "# Return statement - sends value back to caller\n    $1"
      );
  } else if (language.toLowerCase().includes("javascript")) {
    // Add JavaScript comments
    commentedCode = commentedCode
      .replace(
        /(function\s+\w+\s*\([^)]*\)\s*\{)/g,
        "// Function declaration - creates a named function\n$1"
      )
      .replace(
        /(const\s+\w+\s*=)/g,
        "// Constant declaration - creates an immutable variable\n$1"
      )
      .replace(
        /(let\s+\w+\s*=)/g,
        "// Variable declaration - creates a mutable variable\n$1"
      )
      .replace(
        /(console\.log\s*\([^)]*\))/g,
        "// Console output - displays text in browser console\n    $1"
      )
      .replace(
        /(\w+\.map\s*\([^)]*\))/g,
        "// Array map method - transforms each element\n$1"
      )
      .replace(
        /(\w+\.filter\s*\([^)]*\))/g,
        "// Array filter method - selects elements based on condition\n$1"
      )
      .replace(
        /(=>\s*)/g,
        "// Arrow function - concise function syntax\n    $1"
      );
  } else if (language.toLowerCase().includes("react")) {
    // Add React comments
    commentedCode = commentedCode
      .replace(
        /(import\s+React[^;]+;)/g,
        "// Import React and hooks for component functionality\n$1"
      )
      .replace(
        /(function\s+\w+\s*\([^)]*\)\s*\{)/g,
        "// React functional component definition\n$1"
      )
      .replace(
        /(const\s*\[\w+,\s*\w+\]\s*=\s*useState[^;]+;)/g,
        "// useState hook - manages component state\n    $1"
      )
      .replace(
        /(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/g,
        "// Event handler function - responds to user interactions\n    $1"
      )
      .replace(
        /(return\s*\()/g,
        "// JSX return - renders the component UI\n    $1"
      )
      .replace(/(<[A-Z]\w*[^>]*>)/g, "// React component element\n        $1")
      .replace(
        /(onClick=\{[\w.]+\})/g,
        "// Click event handler\n            $1"
      );
  } else if (language.toLowerCase().includes("c")) {
    // Add C comments
    commentedCode = commentedCode
      .replace(
        /(#include\s*<[^>]+>)/g,
        "// Include standard library for input/output\n$1"
      )
      .replace(
        /(int\s+main\s*\([^)]*\)\s*\{)/g,
        "// Main function - entry point of the program\n$1"
      )
      .replace(
        /(printf\s*\([^)]*\);)/g,
        "// Print formatted text to console\n    $1"
      )
      .replace(/(int\s+\w+[^;]+;)/g, "// Integer variable declaration\n    $1")
      .replace(
        /(return\s+\d+;)/g,
        "// Return value to indicate program status\n    $1"
      );
  }

  return commentedCode;
}

// Function to analyze the main purpose of the code
function analyzeCodePurpose(patterns, language) {
  const patternTypes = patterns.map((p) => p.type);

  if (patternTypes.includes("function")) {
    return "Defines and uses functions to organize code into reusable blocks";
  } else if (patternTypes.includes("loops")) {
    return "Uses loops to repeat operations or iterate through data";
  } else if (patternTypes.includes("conditionals")) {
    return "Implements conditional logic to make decisions based on conditions";
  } else if (patternTypes.includes("dataStructures")) {
    return "Works with data structures like arrays or lists to organize information";
  } else if (patternTypes.includes("hooks") || patternTypes.includes("state")) {
    return "Manages component state and lifecycle in a React application";
  } else if (
    patternTypes.includes("pointers") ||
    patternTypes.includes("memory")
  ) {
    return "Demonstrates low-level memory management and pointer operations";
  } else {
    return "Performs basic operations and demonstrates fundamental programming concepts";
  }
}

// Function to get explanation from Google Gemini AI using REST API
async function getGeminiExplanation(code, language) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      throw new Error("Gemini API key not available");
    }

    const prompt = `You are a coding assistant. Your task is to read the user's ${language} code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original ${language} code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`${language.toLowerCase()}
[code with comments]
\`\`\`

Focus on:
- Explaining what each function does
- Describing variable purposes
- Clarifying complex logic
- Adding context for ${language}-specific concepts
- Making it educational for beginners`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No explanation available";

    return explanation;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

// Legacy function (kept for compatibility but not used)
async function getGeminiExplanationLegacy(code, language) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt;
    const lang = language.toLowerCase();

    if (lang.includes("c")) {
      prompt = `You are a coding assistant. Your task is to read the user's C code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original C code:
\`\`\`c
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`c
[code with comments]
\`\`\`

Focus on:
- Explaining what each function does
- Describing variable purposes
- Clarifying complex logic
- Adding context for C-specific concepts like pointers, memory management, etc.
- Making it educational for beginners`;
    } else if (lang.includes("python")) {
      prompt = `You are a coding assistant. Your task is to read the user's Python code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original Python code:
\`\`\`python
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`python
[code with comments]
\`\`\`

Focus on:
- Explaining what each function does
- Describing variable purposes
- Clarifying complex logic
- Adding context for Python-specific concepts like list comprehensions, decorators, etc.
- Making it educational for beginners`;
    } else if (lang.includes("javascript")) {
      prompt = `You are a coding assistant. Your task is to read the user's JavaScript code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original JavaScript code:
\`\`\`javascript
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`javascript
[code with comments]
\`\`\`

Focus on:
- Explaining what each function does
- Describing variable purposes
- Clarifying complex logic
- Adding context for JavaScript-specific concepts like closures, promises, async/await, etc.
- Making it educational for beginners`;
    } else if (lang.includes("react")) {
      prompt = `You are a coding assistant. Your task is to read the user's React code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original React code:
\`\`\`jsx
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`jsx
[code with comments]
\`\`\`

Focus on:
- Explaining what each component does
- Describing state and props usage
- Clarifying React hooks and their purposes
- Adding context for React-specific concepts like JSX, virtual DOM, lifecycle, etc.
- Making it educational for beginners`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw error;
  }
}

// Function to get explanation from DeepSeek API (Free)
async function getDeepSeekExplanation(code, language) {
  try {
    let prompt;
    const lang = language.toLowerCase();

    if (lang.includes("c")) {
      prompt = `You are a coding assistant. Your task is to read the user's C code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original C code:
\`\`\`c
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`c
[code with comments]
\`\`\`

Focus on:
- Explaining what each function does
- Describing variable purposes
- Clarifying complex logic
- Adding context for C-specific concepts like pointers, memory management, etc.
- Making it educational for beginners`;
    } else if (lang.includes("python")) {
      prompt = `You are a coding assistant. Your task is to read the user's Python code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original Python code:
\`\`\`python
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`python
[code with comments]
\`\`\`

Focus on:
- Explaining what each function does
- Describing variable purposes
- Clarifying complex logic
- Adding context for Python-specific concepts like list comprehensions, decorators, etc.
- Making it educational for beginners`;
    } else if (lang.includes("javascript")) {
      prompt = `You are a coding assistant. Your task is to read the user's JavaScript code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original JavaScript code:
\`\`\`javascript
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`javascript
[code with comments]
\`\`\`

Focus on:
- Explaining what each function does
- Describing variable purposes
- Clarifying complex logic
- Adding context for JavaScript-specific concepts like closures, promises, async/await, etc.
- Making it educational for beginners`;
    } else if (lang.includes("react")) {
      prompt = `You are a coding assistant. Your task is to read the user's React code and add clear, beginner-friendly comments. For each function, variable, or important line, explain what it does and why it is used. The comments should be concise, easy to understand, and written in plain English so that a new programmer can follow along. Do not change the logic of the code — only add helpful comments.

Original React code:
\`\`\`jsx
${code}
\`\`\`

Please return the same code with detailed comments added. Format your response as:

COMMENTED CODE:
\`\`\`jsx
[code with comments]
\`\`\`

Focus on:
- Explaining what each component does
- Describing state and props usage
- Clarifying React hooks and their purposes
- Adding context for React-specific concepts like JSX, virtual DOM, lifecycle, etc.
- Making it educational for beginners`;
    }

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are a helpful programming tutor specializing in ${
              language.toLowerCase().includes("c")
                ? "C"
                : language.toLowerCase().includes("python")
                ? "Python"
                : language.toLowerCase().includes("javascript")
                ? "JavaScript"
                : language.toLowerCase().includes("react")
                ? "React"
                : "programming"
            } programming. Explain code in simple, beginner-friendly language with practical examples and learning tips.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${
            process.env.DEEPSEEK_API_KEY || "sk-your-deepseek-key"
          }`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    }
    throw new Error("No explanation generated");
  } catch (error) {
    console.error("DeepSeek API error:", error.message);
    throw error;
  }
}

// Function to get explanation from Hugging Face API (free)
async function getHuggingFaceExplanation(code, language) {
  try {
    // Using Hugging Face's CodeT5 model for code summarization
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/Salesforce/codet5-base",
      {
        inputs: `Explain this ${language} code: ${code}`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${
            process.env.HUGGINGFACE_API_KEY || "hf_your_token_here"
          }`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text;
    }
    throw new Error("No explanation generated");
  } catch (error) {
    console.error("Hugging Face API error:", error.message);
    throw error;
  }
}

// MongoDB connection (optional for AI explanation feature)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(
        "⚠️ MongoDB not available, running in AI-only mode:",
        err.message
      );
    });
} else {
  console.log("ℹ️ Running in AI-only mode (no MongoDB)");
}

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

// Endpoint to view stored patterns
app.get("/api/patterns", (req, res) => {
  try {
    const { language } = req.query;

    if (language) {
      const lang = language.toLowerCase();
      if (codePatterns[lang]) {
        const patterns = {};
        for (const [category, map] of Object.entries(codePatterns[lang])) {
          patterns[category] = Array.from(map.entries()).map(
            ([key, value]) => ({
              pattern: key,
              ...value,
            })
          );
        }
        res.json({
          language: lang,
          patterns,
          totalPatterns: Object.values(patterns).flat().length,
        });
      } else {
        res.status(400).json({
          message: "Unsupported language",
          supportedLanguages: Object.keys(codePatterns),
        });
      }
    } else {
      // Return all patterns
      const allPatterns = {};
      for (const [lang, categories] of Object.entries(codePatterns)) {
        allPatterns[lang] = {};
        for (const [category, map] of Object.entries(categories)) {
          allPatterns[lang][category] = Array.from(map.entries()).map(
            ([key, value]) => ({
              pattern: key,
              ...value,
            })
          );
        }
      }
      res.json({
        allPatterns,
        totalLanguages: Object.keys(allPatterns).length,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve patterns",
      error: error.message,
    });
  }
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

// AI Code Explanation - C and Python only with multiple API support
app.post("/api/explain-code", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Support C, Python, JavaScript, and React - strict validation
    const normalizedLanguage = language.toLowerCase().trim();
    const isValidLanguage =
      normalizedLanguage === "c" ||
      normalizedLanguage === "python" ||
      normalizedLanguage === "javascript" ||
      normalizedLanguage === "react" ||
      normalizedLanguage.startsWith("c ") ||
      normalizedLanguage.startsWith("python ") ||
      normalizedLanguage.startsWith("javascript ") ||
      normalizedLanguage.startsWith("react ");

    if (!language || !isValidLanguage) {
      return res.status(400).json({
        message:
          "Only C, Python, JavaScript, and React languages are supported. Please select one of these languages.",
        supportedLanguages: ["C", "Python", "JavaScript", "React"],
      });
    }

    // Try Gemini API first, then fall back to pattern analysis
    let explanation = "";
    let source = "";
    let apiUsed = "";

    try {
      // Try Google Gemini API first
      console.log(
        "API Key check:",
        process.env.GEMINI_API_KEY ? "Present" : "Missing"
      );
      console.log(
        "API Key value:",
        process.env.GEMINI_API_KEY?.substring(0, 10) + "..."
      );

      if (
        process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== "your-gemini-api-key-here"
      ) {
        console.log("Trying Gemini API...");
        explanation = await getGeminiExplanation(code, language);
        source = "Google Gemini 2.0 Flash";
        apiUsed = AVAILABLE_APIS.GEMINI;
        console.log("Gemini API success!");
      } else {
        throw new Error("Gemini API key not available");
      }
    } catch (geminiError) {
      console.log(
        "Gemini API failed, using pattern-based explanation:",
        geminiError.message
      );

      // Fall back to pattern-based explanation
      const patterns = recognizeAndStorePattern(code, language);
      explanation = generateExplanationFromPatterns(patterns, language, code);
      source = "Pattern Analysis";
      apiUsed = AVAILABLE_APIS.FALLBACK;
    }

    // Determine the proper language name for response
    let responseLanguage;
    const lang = language.toLowerCase().trim();
    if (lang === "c" || lang.startsWith("c ")) {
      responseLanguage = "C";
    } else if (lang === "python" || lang.startsWith("python ")) {
      responseLanguage = "Python";
    } else if (lang === "javascript" || lang.startsWith("javascript ")) {
      responseLanguage = "JavaScript";
    } else if (lang === "react" || lang.startsWith("react ")) {
      responseLanguage = "React";
    } else {
      responseLanguage = language;
    }

    res.json({
      explanation,
      code,
      language: responseLanguage,
      source,
      apiUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Code explanation error:", error);

    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message || "Pattern analysis failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// Function to generate fallback explanations
function generateFallbackExplanation(code, language) {
  if (language.toLowerCase().includes("c")) {
    return `**C Code Analysis (Local Mode):**

This C code contains programming instructions that perform specific operations.

**Key C Concepts:**
• C is a compiled language that runs directly on the hardware
• Variables must be declared with specific data types (int, char, float, etc.)
• Manual memory management with malloc/free
• Functions are the building blocks of C programs
• Pointers provide direct memory access
• #include directives import libraries
• main() function is the entry point

**Common C Patterns:**
• Variable declarations: \`int x = 5;\`
• Function calls: \`printf("Hello");\`
• Loops: \`for(int i=0; i<10; i++)\`
• Conditionals: \`if (condition) { ... }\`

**Learning Tip:** C teaches low-level programming concepts and memory management - great for understanding how computers work!`;
  } else if (language.toLowerCase().includes("python")) {
    return `**Python Code Analysis (Local Mode):**

This Python code contains programming instructions that perform specific operations.

**Key Python Concepts:**
• Python uses indentation for code blocks (no braces needed)
• Variables are dynamically typed (no type declarations)
• Rich standard library and third-party packages
• Readable and beginner-friendly syntax
• Object-oriented and functional programming support
• Interactive interpreter for quick testing

**Common Python Patterns:**
• Function definition: \`def function_name():\`
• Variable assignment: \`x = 5\`
• Loops: \`for item in list:\` or \`while condition:\`
• Conditionals: \`if condition:\`
• String formatting: \`f"Hello {name}"\`

**Learning Tip:** Python's simple syntax makes it perfect for beginners - focus on understanding logic and flow!`;
  } else {
    return `**Code Analysis (Local Mode):**

This code contains programming logic that performs specific operations. Each line contributes to the overall functionality of the program.

**General Programming Concepts:**
• Variables store data for later use
• Functions group related code together
• Loops repeat operations efficiently
• Conditionals make decisions based on data
• Comments explain what the code does

**Learning Tip:** Practice reading and understanding code step by step - this builds your programming intuition!`;
  }
}

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
