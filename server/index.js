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
  // Generate intelligent code analysis that explains what the code does
  let explanation = analyzeCodeIntelligently(originalCode, language, patterns);

  return explanation;
}

// Function to analyze code intelligently and explain what it does
function analyzeCodeIntelligently(code, language, patterns) {
  let analysis = `# ${language.toUpperCase()} Code Analysis\n\n`;

  // Analyze the main purpose of the code
  const mainPurpose = analyzeCodePurpose(patterns, language, code);
  analysis += `## 🎯 What This Code Does\n`;
  analysis += `${mainPurpose}\n\n`;

  // Add step-by-step explanation
  const stepByStep = generateStepByStepExplanation(code, language);
  analysis += `## 📝 Step-by-Step Explanation\n`;
  analysis += `${stepByStep}\n\n`;

  // Add example usage
  const exampleUsage = generateExampleUsage(code, language);
  analysis += `## 💡 Example Usage\n`;
  analysis += `${exampleUsage}\n\n`;

  return analysis;
}

// Function to generate comprehensive step-by-step explanation
function generateStepByStepExplanation(code, language) {
  const lang = language.toLowerCase();
  const lines = code.split("\n");
  let explanation = "";

  // Analyze the code structure
  const functions = [];
  const variables = [];
  const imports = [];
  const mainLogic = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;
    
    if (line === "" || line.startsWith("//")) continue;
    
    // Identify different code elements
    if (/^#include|^import\s+|^from\s+/.test(line)) {
      imports.push({ line, lineNumber });
    } else if (/def\s+\w+|function\s+\w+|class\s+\w+/.test(line)) {
      functions.push({ line, lineNumber });
    } else if (/^\s*(int|char|float|double|string|var|let|const)\s+\w+/.test(line)) {
      variables.push({ line, lineNumber });
    } else if (line.includes("if") || line.includes("for") || line.includes("while") || 
               line.includes("return") || line.includes("print") || line.includes("printf")) {
      mainLogic.push({ line, lineNumber });
    }
  }

  // Build comprehensive explanation
  explanation += `**Code Overview:**\n`;
  explanation += `This ${language} code demonstrates key programming concepts and functionality.\n\n`;

  if (imports.length > 0) {
    explanation += `**Imports and Dependencies:**\n`;
    imports.forEach(({ line, lineNumber }) => {
      explanation += `• Line ${lineNumber}: \`${line}\` - ${explainImport(line, language)}\n`;
    });
    explanation += `\n`;
  }

  if (functions.length > 0) {
    explanation += `**Functions and Classes:**\n`;
    functions.forEach(({ line, lineNumber }) => {
      explanation += `• Line ${lineNumber}: \`${line}\` - ${explainFunction(line, language)}\n`;
    });
    explanation += `\n`;
  }

  if (variables.length > 0) {
    explanation += `**Variables and Data:**\n`;
    variables.forEach(({ line, lineNumber }) => {
      explanation += `• Line ${lineNumber}: \`${line}\` - ${explainVariable(line, language)}\n`;
    });
    explanation += `\n`;
  }

  explanation += `**Step-by-Step Execution:**\n`;
  let stepNumber = 1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith("//")) {
      explanation += `${stepNumber}. Line ${i + 1}: \`${line}\`\n`;
      explanation += `   → ${explainLine(line, language)}\n\n`;
      stepNumber++;
    }
  }

  explanation += `**Key Concepts:**\n`;
  explanation += `• ${getLanguageConcepts(language)}\n\n`;

  explanation += `**How It Works:**\n`;
  explanation += `The code executes from top to bottom, following the logical flow defined by the programming constructs. Each statement contributes to the overall functionality.\n\n`;

  return explanation;
}

// Helper function to explain imports
function explainImport(line, language) {
  const lang = language.toLowerCase();
  if (line.includes("#include")) {
    return "Includes a C/C++ header file for additional functionality";
  } else if (line.includes("import")) {
    return "Imports a module or library for use in the program";
  } else if (line.includes("from")) {
    return "Imports specific functions or classes from a module";
  }
  return "Brings in external code for use in this program";
}

// Helper function to explain functions
function explainFunction(line, language) {
  const lang = language.toLowerCase();
  if (line.includes("def ")) {
    return "Defines a Python function that can be called later";
  } else if (line.includes("function ")) {
    return "Defines a JavaScript function that can be called later";
  } else if (line.includes("class ")) {
    return "Defines a class (object blueprint) for creating objects";
  } else if (line.includes("int main")) {
    return "Main function - the entry point where program execution begins";
  }
  return "Defines a reusable block of code";
}

// Helper function to explain variables
function explainVariable(line, language) {
  const lang = language.toLowerCase();
  if (line.includes("int ")) {
    return "Declares an integer variable to store whole numbers";
  } else if (line.includes("char ")) {
    return "Declares a character variable to store single characters";
  } else if (line.includes("float ") || line.includes("double ")) {
    return "Declares a floating-point variable to store decimal numbers";
  } else if (line.includes("string ")) {
    return "Declares a string variable to store text";
  } else if (line.includes("var ") || line.includes("let ") || line.includes("const ")) {
    return "Declares a JavaScript variable with different scoping rules";
  }
  return "Declares a variable to store data";
}

// Helper function to get language-specific concepts
function getLanguageConcepts(language) {
  const lang = language.toLowerCase();
  if (lang.includes("python")) {
    return "Python uses indentation for code blocks, dynamic typing, and has a rich standard library";
  } else if (lang.includes("javascript")) {
    return "JavaScript is dynamically typed, supports both functional and object-oriented programming";
  } else if (lang.includes("c")) {
    return "C is a compiled language with manual memory management and direct hardware access";
  } else if (lang.includes("c++")) {
    return "C++ extends C with object-oriented programming, templates, and modern features";
  } else if (lang.includes("java")) {
    return "Java is object-oriented, platform-independent, and uses automatic memory management";
  } else if (lang.includes("html")) {
    return "HTML structures web content using tags and elements to create web pages";
  } else if (lang.includes("css")) {
    return "CSS styles HTML elements to control appearance, layout, and visual design";
  }
  return "This language follows standard programming principles and syntax";
}

// Function to generate example usage
function generateExampleUsage(code, language) {
  const lang = language.toLowerCase();
  let examples = "";

  if (lang.includes("python")) {
    if (/def\s+(\w+)\s*\([^)]*\):/.test(code)) {
      const funcMatch = code.match(/def\s+(\w+)\s*\(([^)]*)\):/);
      const funcName = funcMatch ? funcMatch[1] : "function";
      const params = funcMatch ? funcMatch[2] : "";

      examples += `\`\`\`python\n`;

      if (funcName.toLowerCase().includes("greet")) {
        examples += `print(${funcName}("Alice"))\n`;
        examples += `# Output: Hello, Alice!\n\n`;
        examples += `print(${funcName}("Bob"))\n`;
        examples += `# Output: Hello, Bob!\n`;
      } else if (funcName.toLowerCase().includes("fib")) {
        examples += `print(${funcName}(5))\n`;
        examples += `# Output: 5\n\n`;
        examples += `print(${funcName}(10))\n`;
        examples += `# Output: 55\n`;
      } else if (
        funcName.toLowerCase().includes("sum") ||
        funcName.toLowerCase().includes("add")
      ) {
        if (params.includes("*")) {
          examples += `print(${funcName}(1, 2, 3, 4))\n`;
          examples += `# Output: 10\n\n`;
          examples += `print(${funcName}(5, 10))\n`;
          examples += `# Output: 15\n\n`;
          examples += `print(${funcName}())\n`;
          examples += `# Output: 0 (no arguments)\n`;
        } else {
          examples += `print(${funcName}(5, 3))\n`;
          examples += `# Output: 8\n\n`;
          examples += `print(${funcName}(10, 20))\n`;
          examples += `# Output: 30\n`;
        }
      } else {
        examples += `print(${funcName}())\n`;
        examples += `# Output: [function result]\n`;
      }

      examples += `\`\`\`\n`;
    } else {
      examples += `\`\`\`python\n`;
      examples += `# Run this code directly\n`;
      examples += `${code}\n`;
      examples += `\`\`\`\n`;
    }
  } else if (lang.includes("javascript")) {
    if (/function\s+(\w+)\s*\([^)]*\)\s*\{/.test(code)) {
      const funcMatch = code.match(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      const funcName = funcMatch ? funcMatch[1] : "function";

      examples += `\`\`\`javascript\n`;

      if (funcName.toLowerCase().includes("greet")) {
        examples += `console.log(${funcName}("Alice"));\n`;
        examples += `// Output: Hello, Alice!\n\n`;
        examples += `console.log(${funcName}("Bob"));\n`;
        examples += `// Output: Hello, Bob!\n`;
      } else if (
        funcName.toLowerCase().includes("calc") ||
        funcName.toLowerCase().includes("add")
      ) {
        examples += `console.log(${funcName}(5, 3));\n`;
        examples += `// Output: 8\n\n`;
        examples += `console.log(${funcName}(10, 20));\n`;
        examples += `// Output: 30\n`;
      } else {
        examples += `console.log(${funcName}());\n`;
        examples += `// Output: [function result]\n`;
      }

      examples += `\`\`\`\n`;
    } else {
      examples += `\`\`\`javascript\n`;
      examples += `// Run this code directly\n`;
      examples += `${code}\n`;
      examples += `\`\`\`\n`;
    }
  } else if (lang.includes("react")) {
    examples += `\`\`\`jsx\n`;
    examples += `// Use this component in your React app\n`;
    examples += `<Counter />\n`;
    examples += `\`\`\`\n`;
  } else if (lang.includes("c")) {
    examples += `\`\`\`c\n`;
    examples += `// Compile and run this program\n`;
    examples += `gcc program.c -o program\n`;
    examples += `./program\n`;
    examples += `\`\`\`\n`;
  } else {
    examples += `\`\`\`${lang}\n`;
    examples += `// Example usage\n`;
    examples += `${code}\n`;
    examples += `\`\`\`\n`;
  }

  return examples;
}

// Function to describe the detailed purpose of the code
function describeCodePurpose(code, language, patterns) {
  const lang = language.toLowerCase();
  let purpose = "";

  // Analyze the code content to determine its specific purpose
  if (lang.includes("python")) {
    if (/def\s+(\w+)\s*\([^)]*\):/.test(code)) {
      const funcMatch = code.match(/def\s+(\w+)\s*\([^)]*\):/);
      const funcName = funcMatch ? funcMatch[1].toLowerCase() : "";

      if (funcName.includes("greet")) {
        purpose =
          "This greeting function is designed to create personalized welcome messages for users. It's commonly used in applications where you need to welcome users by name, such as login systems, chat applications, or user dashboards. The function takes a name parameter and returns a friendly greeting that can be displayed to the user.";
      } else if (
        funcName.includes("calc") ||
        funcName.includes("add") ||
        funcName.includes("multiply") ||
        funcName.includes("sum")
      ) {
        purpose =
          "This calculation function is designed to perform mathematical operations and return computed results. It's useful in applications that need to process numerical data, such as calculators, financial software, scientific applications, or any system that requires mathematical computations. The function takes input values and processes them through mathematical formulas.";
      } else if (funcName.includes("fib")) {
        purpose =
          "This Fibonacci function demonstrates recursive programming by calculating Fibonacci numbers. It's often used as a teaching example to show how recursion works, where a function calls itself with smaller inputs until it reaches a base case. This pattern is useful in algorithms that can be broken down into smaller, similar subproblems.";
      } else if (/print\s*\(/.test(code)) {
        purpose =
          "This function combines computation with output display, making it useful for interactive programs or debugging. It performs calculations and immediately shows the results to the user, which is helpful in educational programs, interactive calculators, or when you want to see intermediate results during development.";
      } else if (/return\s+/.test(code)) {
        purpose =
          "This function is designed to be a utility that other parts of your program can call. It processes input data and returns a result that can be used by other functions or stored in variables. This modular approach makes your code more organized and reusable.";
      } else {
        purpose =
          "This function encapsulates a specific behavior or operation that can be reused throughout your program. By organizing code into functions, you make your program more modular, easier to test, and simpler to maintain.";
      }
    } else if (/for\s+\w+\s+in\s+/.test(code)) {
      purpose =
        "This code uses iteration to process collections of data efficiently. It's designed to handle multiple items without writing repetitive code, making it perfect for data processing, filtering, or transforming lists of information.";
    } else if (/if\s+/.test(code)) {
      purpose =
        "This code implements conditional logic to make decisions based on different scenarios. It's designed to handle various cases and respond appropriately, making your program more intelligent and adaptable to different situations.";
    } else if (/print\s*\(/.test(code)) {
      purpose =
        "This code is designed to communicate with users by displaying information. It's commonly used for showing results, providing feedback, or creating interactive experiences where users need to see what's happening in the program.";
    } else {
      purpose =
        "This code performs a specific operation designed to accomplish a particular task. It demonstrates how programming can solve real-world problems by breaking them down into logical steps.";
    }
  } else if (lang.includes("javascript")) {
    if (/function\s+(\w+)\s*\([^)]*\)\s*\{/.test(code)) {
      const funcMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
      const funcName = funcMatch ? funcMatch[1].toLowerCase() : "";

      if (funcName.includes("greet")) {
        purpose =
          "This JavaScript greeting function is designed for web applications where you need to create dynamic, personalized content. It's commonly used in user interfaces, welcome messages on websites, or interactive applications that need to address users by name.";
      } else if (funcName.includes("calc") || funcName.includes("add")) {
        purpose =
          "This JavaScript calculation function is designed for web-based applications that need to perform mathematical operations in real-time. It's useful for interactive calculators, form validations, dynamic content generation, or any web application that requires client-side computations.";
      } else {
        purpose =
          "This JavaScript function is designed to be reusable across different parts of a web application. It helps organize client-side logic and makes web pages more interactive and dynamic.";
      }
    } else if (/console\.log\s*\(/.test(code)) {
      purpose =
        "This code is designed for debugging and development purposes. It helps developers understand what's happening in their code by displaying information in the browser's developer console, making it easier to identify and fix issues.";
    } else if (/const\s+\w+\s*=/.test(code) || /let\s+\w+\s*=/.test(code)) {
      purpose =
        "This code is designed to store and manage data in your program. Variables act as containers that hold information, allowing your program to remember and work with data throughout its execution.";
    } else {
      purpose =
        "This JavaScript code is designed to add interactivity and functionality to web pages, making them more dynamic and responsive to user actions.";
    }
  } else if (lang.includes("react")) {
    purpose =
      "This React code is designed to create interactive user interface components for web applications. React components are reusable pieces of UI that can display data, respond to user interactions, and update dynamically based on state changes.";
  } else if (lang.includes("c")) {
    if (/int\s+main\s*\([^)]*\)\s*\{/.test(code)) {
      purpose =
        "This C code defines the main entry point of a program. Every C program must have a main function where execution begins, making this the foundation that starts your entire application.";
    } else if (/printf\s*\(/.test(code)) {
      purpose =
        "This C code is designed to display formatted output to the console. It's commonly used for showing results, debugging information, or creating command-line interfaces that communicate with users.";
    } else {
      purpose =
        "This C code is designed to perform low-level operations with direct control over memory and system resources, making it suitable for system programming, embedded systems, or performance-critical applications.";
    }
  } else {
    purpose =
      "This code is designed to solve a specific problem using programming logic and concepts. It demonstrates how to break down complex tasks into manageable, executable steps.";
  }

  // Add context about why this code might be useful
  purpose += "\n\n**Why this is useful:** ";
  if (patterns.some((p) => p.type === "function")) {
    purpose +=
      "Functions make code reusable and easier to maintain. You can call this function from different parts of your program.";
  } else if (patterns.some((p) => p.type === "loops")) {
    purpose +=
      "Loops help you process multiple items efficiently without writing repetitive code.";
  } else if (patterns.some((p) => p.type === "conditionals")) {
    purpose +=
      "Conditional statements allow your program to make decisions and respond differently to different situations.";
  } else {
    purpose +=
      "This code demonstrates fundamental programming concepts that are building blocks for more complex programs.";
  }

  return purpose;
}

// Function to explain what a specific line of code does
function explainLine(line, language) {
  const lang = language.toLowerCase();

  if (lang.includes("python")) {
    if (/def\s+(\w+)\s*\(([^)]*)\):/.test(line)) {
      const match = line.match(/def\s+(\w+)\s*\(([^)]*)\):/);
      const funcName = match[1];
      const params = match[2];

      // Provide specific explanations based on function name and context
      if (funcName.toLowerCase().includes("greet")) {
        return `This creates a personalized greeting system. When someone calls this function with a name, it will welcome them personally instead of using generic messages.`;
      } else if (
        funcName.toLowerCase().includes("calc") ||
        funcName.toLowerCase().includes("add") ||
        funcName.toLowerCase().includes("multiply") ||
        funcName.toLowerCase().includes("sum")
      ) {
        return `This sets up a math helper that can solve problems with numbers. Instead of doing calculations manually each time, you can use this function to get answers quickly.`;
      } else if (funcName.toLowerCase().includes("fib")) {
        return `This creates a number sequence generator. It's like having a calculator that knows how to create the famous Fibonacci pattern where each number is the sum of the two before it.`;
      } else if (funcName.toLowerCase().includes("sort")) {
        return `This organizes messy data into neat order. Whether you have a list of names, numbers, or anything else, this function will arrange them from smallest to largest or alphabetically.`;
      } else if (
        funcName.toLowerCase().includes("search") ||
        funcName.toLowerCase().includes("find")
      ) {
        return `This acts like a detective that hunts through data to find what you're looking for. Instead of manually checking every item, it does the searching for you.`;
      } else if (
        funcName.toLowerCase().includes("validate") ||
        funcName.toLowerCase().includes("check")
      ) {
        return `This acts as a quality checker that makes sure data meets certain rules. It's like having a bouncer that only lets valid information through.`;
      } else if (
        funcName.toLowerCase().includes("format") ||
        funcName.toLowerCase().includes("display")
      ) {
        return `This takes raw data and makes it look nice and readable. It's like having a personal assistant that organizes information in a way that's easy to understand.`;
      } else {
        if (params) {
          const paramCount = params.split(",").length;
          return `This creates a reusable tool that takes ${paramCount} piece(s) of information and does something useful with them. Think of it as a specialized worker that knows how to handle specific tasks.`;
        } else {
          return `This creates a simple tool that does one specific job without needing any input. It's like a button you can press to get a predictable result.`;
        }
      }
    } else if (/return\s+(.+)/.test(line)) {
      const match = line.match(/return\s+(.+)/);
      const returnValue = match[1];

      // Provide specific explanations based on return value content
      if (returnValue.includes('f"') || returnValue.includes("f'")) {
        return `This creates a custom message by filling in the blanks with actual values. Instead of showing "Hello, {name}!", it will show "Hello, Alice!" when Alice uses the function.`;
      } else if (returnValue.includes("sum(")) {
        return `This adds up all the numbers you give it and gives you the total. It's like having a calculator that can add as many numbers as you want at once.`;
      } else if (returnValue.includes("len(")) {
        return `This counts how many items are in a list or how many characters are in text. It's like having a counter that tells you the size of things.`;
      } else if (returnValue.includes("+") && returnValue.includes('"')) {
        return `This combines pieces of text together to make a longer message. It's like gluing words together to create sentences.`;
      } else if (
        returnValue.includes("+") ||
        returnValue.includes("-") ||
        returnValue.includes("*") ||
        returnValue.includes("/")
      ) {
        return `This does math and gives you the answer. Instead of you calculating manually, the computer does the work and gives you the result.`;
      } else if (
        returnValue.includes("True") ||
        returnValue.includes("False")
      ) {
        return `This gives you a simple yes or no answer. It's like asking "Is this true?" and getting back either "Yes" or "No".`;
      } else if (returnValue.includes("[") && returnValue.includes("]")) {
        return `This creates a list of items that can be used later. It's like making a shopping list that the program can check and use.`;
      } else if (returnValue.includes("{")) {
        return `This creates a collection of paired information. It's like having a phone book where you can look up names to find numbers.`;
      } else {
        return `This gives back the result of the function's work. It's like getting the answer after asking the function to do something for you.`;
      }
    } else if (/print\s*\((.+)\)/.test(line)) {
      const match = line.match(/print\s*\((.+)\)/);
      const printValue = match[1];
      return `This shows information on the screen so people can see it. It's like writing something on a piece of paper and holding it up for others to read.`;
    } else if (/for\s+(\w+)\s+in\s+(.+):/.test(line)) {
      const match = line.match(/for\s+(\w+)\s+in\s+(.+):/);
      const varName = match[1];
      const iterable = match[2];

      if (iterable.includes("range(")) {
        const rangeMatch = iterable.match(/range\(([^)]+)\)/);
        if (rangeMatch) {
          const rangeValue = rangeMatch[1];
          return `This creates a loop that repeats ${rangeValue} times, using '${varName}' as a counter that goes from 0 to ${
            rangeValue - 1
          }. It's like counting from 0 to ${
            rangeValue - 1
          } and doing something each time.`;
        }
      } else if (iterable.includes("[")) {
        return `This creates a loop that goes through each item in the list '${iterable}', assigning each item to the variable '${varName}' one by one. It's like going through a shopping list item by item.`;
      } else if (iterable.includes("(")) {
        return `This creates a loop that goes through each item returned by the function '${iterable}', assigning each item to the variable '${varName}'. It's like processing each result from a function call.`;
      } else {
        return `This creates a loop that goes through each item in '${iterable}', assigning each item to the variable '${varName}'. It's like having a robot that picks up each item one by one and does something with it.`;
      }
    } else if (/if\s+(.+):/.test(line)) {
      const match = line.match(/if\s+(.+):/);
      const condition = match[1];

      if (condition.includes("==")) {
        const parts = condition.split("==");
        return `This checks if '${parts[0].trim()}' is exactly equal to '${parts[1].trim()}'. If they match, the code inside will run. It's like asking "Are these two things the same?"`;
      } else if (condition.includes("!=")) {
        const parts = condition.split("!=");
        return `This checks if '${parts[0].trim()}' is NOT equal to '${parts[1].trim()}'. If they're different, the code inside will run. It's like asking "Are these two things different?"`;
      } else if (condition.includes(">=")) {
        const parts = condition.split(">=");
        return `This checks if '${parts[0].trim()}' is greater than or equal to '${parts[1].trim()}'. If it is, the code inside will run. It's like asking "Is the first number bigger than or the same as the second?"`;
      } else if (condition.includes("<=")) {
        const parts = condition.split("<=");
        return `This checks if '${parts[0].trim()}' is less than or equal to '${parts[1].trim()}'. If it is, the code inside will run. It's like asking "Is the first number smaller than or the same as the second?"`;
      } else if (condition.includes(">")) {
        const parts = condition.split(">");
        return `This checks if '${parts[0].trim()}' is greater than '${parts[1].trim()}'. If it is, the code inside will run. It's like asking "Is the first number bigger than the second?"`;
      } else if (condition.includes("<")) {
        const parts = condition.split("<");
        return `This checks if '${parts[0].trim()}' is less than '${parts[1].trim()}'. If it is, the code inside will run. It's like asking "Is the first number smaller than the second?"`;
      } else if (condition.includes("in ")) {
        const parts = condition.split("in ");
        return `This checks if '${parts[0].trim()}' exists inside '${parts[1].trim()}'. If it's found, the code inside will run. It's like asking "Is this item in the list?"`;
      } else {
        return `This checks if the condition '${condition}' is true. If it is, the code inside will run. It's like having a fork in the road where you decide which path to take.`;
      }
    } else if (/elif\s+(.+):/.test(line)) {
      const match = line.match(/elif\s+(.+):/);
      const condition = match[1];
      return `This provides an alternative path if the first condition wasn't met. It's like saying "If the first option doesn't work, try this instead."`;
    } else if (/else:/.test(line)) {
      return `This sets up a backup plan for when none of the other conditions are met. It's like having a default option that always works when everything else fails.`;
    } else if (
      /(\w+)\s*=\s*(.+)/.test(line) &&
      !line.includes("def") &&
      !line.includes("if") &&
      !line.includes("for")
    ) {
      const match = line.match(/(\w+)\s*=\s*(.+)/);
      const varName = match[1];
      const value = match[2];

      if (value.includes("input(")) {
        return `This asks the user to type something and saves their answer in the variable '${varName}'. It's like having a conversation where you ask a question and remember the person's response.`;
      } else if (value.includes("int(") || value.includes("float(")) {
        const convertType = value.includes("int(")
          ? "whole number"
          : "decimal number";
        return `This converts the value to a ${convertType} and saves it in the variable '${varName}'. It's like translating text into numbers that the computer can do math with.`;
      } else if (value.includes("str(")) {
        return `This converts the value to text and saves it in the variable '${varName}'. It's like turning numbers or other data into words that can be displayed.`;
      } else if (value.includes("list(") || value.includes("[]")) {
        return `This creates a list (a container for multiple items) and saves it in the variable '${varName}'. It's like making a shopping basket that can hold many different things.`;
      } else if (value.includes("len(")) {
        return `This counts how many items are in something and saves the count in the variable '${varName}'. It's like counting how many items are in a box.`;
      } else if (value.includes("sum(")) {
        return `This adds up all the numbers and saves the total in the variable '${varName}'. It's like using a calculator to add many numbers at once.`;
      } else if (value.includes("+") && value.includes('"')) {
        return `This combines pieces of text together and saves the result in the variable '${varName}'. It's like gluing words together to make a longer message.`;
      } else if (
        value.includes("+") ||
        value.includes("-") ||
        value.includes("*") ||
        value.includes("/")
      ) {
        return `This does a math calculation and saves the answer in the variable '${varName}'. It's like using a calculator and writing down the result.`;
      } else {
        return `This saves the value '${value}' in the variable '${varName}' for later use. It's like putting something in a labeled box so you can find it again.`;
      }
    }
  } else if (lang.includes("javascript")) {
    if (/function\s+(\w+)\s*\(([^)]*)\)\s*\{/.test(line)) {
      const match = line.match(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      const funcName = match[1];
      const params = match[2];

      // Provide specific explanations based on function name
      if (funcName.toLowerCase().includes("greet")) {
        return `This creates a personalized greeting system for websites. When someone visits your page, this function can welcome them by name instead of showing generic messages.`;
      } else if (
        funcName.toLowerCase().includes("calc") ||
        funcName.toLowerCase().includes("add")
      ) {
        return `This sets up a math helper that can solve problems with numbers on web pages. Instead of doing calculations manually, users can get instant answers.`;
      } else if (
        funcName.toLowerCase().includes("validate") ||
        funcName.toLowerCase().includes("check")
      ) {
        return `This acts as a quality checker that makes sure users enter the right information in forms. It's like having a bouncer that only lets correct data through.`;
      } else if (
        funcName.toLowerCase().includes("render") ||
        funcName.toLowerCase().includes("display")
      ) {
        return `This creates or updates visual elements on web pages. It's like having a painter that knows how to show information in the right places.`;
      } else if (
        funcName.toLowerCase().includes("fetch") ||
        funcName.toLowerCase().includes("get")
      ) {
        return `This acts like a messenger that goes to other websites to get information. It's like having a delivery person that brings data from far away places.`;
      } else {
        if (params) {
          const paramCount = params.split(",").length;
          return `This creates a reusable tool for web pages that takes ${paramCount} piece(s) of information and does something useful with them. Think of it as a specialized worker for your website.`;
        } else {
          return `This creates a simple tool that adds functionality to web pages without needing any input. It's like a button that does one specific job.`;
        }
      }
    } else if (/const\s+(\w+)\s*=\s*(.+)/.test(line)) {
      const match = line.match(/const\s+(\w+)\s*=\s*(.+)/);
      const varName = match[1];
      const value = match[2];

      if (value.includes("document.")) {
        return `This creates a permanent reference to a webpage element and saves it in '${varName}'. It's like putting a bookmark on a specific part of a webpage so you can find it easily.`;
      } else if (value.includes("() =>")) {
        return `This creates a permanent function and saves it in '${varName}'. It's like writing down instructions that can be followed later, but the instructions can't be changed.`;
      } else if (value.includes("[]")) {
        return `This creates a permanent list and saves it in '${varName}'. You can add or remove items from the list, but you can't replace the entire list. It's like having a permanent shopping basket.`;
      } else if (value.includes("{}")) {
        return `This creates a permanent object (like a dictionary) and saves it in '${varName}'. You can add or change properties, but you can't replace the entire object. It's like having a permanent notebook.`;
      } else if (value.includes("querySelector")) {
        return `This finds a specific element on the webpage and saves a reference to it in '${varName}'. It's like pointing to a specific item on a page and saying "remember this one."`;
      } else {
        return `This creates a permanent value '${value}' and saves it in '${varName}'. This value cannot be changed later. It's like writing something in permanent ink.`;
      }
    } else if (/let\s+(\w+)\s*=\s*(.+)/.test(line)) {
      const match = line.match(/let\s+(\w+)\s*=\s*(.+)/);
      const varName = match[1];
      const value = match[2];
      return `Declares a mutable variable '${varName}' with block scope and assigns it the value '${value}'.`;
    } else if (/var\s+(\w+)\s*=\s*(.+)/.test(line)) {
      const match = line.match(/var\s+(\w+)\s*=\s*(.+)/);
      const varName = match[1];
      const value = match[2];
      return `Declares a variable '${varName}' with function scope and assigns it the value '${value}'.`;
    } else if (/return\s+(.+)/.test(line)) {
      const match = line.match(/return\s+(.+)/);
      const returnValue = match[1];

      if (returnValue.includes("`")) {
        return `This creates a custom message by filling in the blanks with actual values. Instead of showing "Hello, ${name}!", it will show "Hello, Alice!" when Alice uses the function.`;
      } else if (returnValue.includes("+")) {
        return `This combines pieces of text together to make a longer message. It's like gluing words together to create sentences.`;
      } else if (returnValue.includes("JSON.stringify")) {
        return `This converts data into a format that can be sent over the internet. It's like packaging information so it can be delivered to other programs.`;
      } else {
        return `This gives back the result of the function's work. It's like getting the answer after asking the function to do something for you.`;
      }
    } else if (/console\.log\s*\((.+)\)/.test(line)) {
      const match = line.match(/console\.log\s*\((.+)\)/);
      const logValue = match[1];
      return `Outputs the value '${logValue}' to the browser's developer console for debugging purposes.`;
    } else if (/document\.getElementById\s*\((.+)\)/.test(line)) {
      const match = line.match(/document\.getElementById\s*\((.+)\)/);
      const elementId = match[1];
      return `Retrieves a DOM element by its ID '${elementId}' for manipulation or event handling.`;
    } else if (/addEventListener\s*\((.+)\)/.test(line)) {
      return `Attaches an event listener to a DOM element to respond to user interactions like clicks or key presses.`;
    }
  } else if (lang.includes("c")) {
    if (/int\s+main\s*\([^)]*\)\s*\{/.test(line)) {
      return `This is the entry point of the program where execution begins. Every C program must have a main function.`;
    } else if (/printf\s*\((.+)\)/.test(line)) {
      const match = line.match(/printf\s*\((.+)\)/);
      const formatString = match[1];
      return `This displays formatted output to the screen. It's like having a printer that shows information to the user.`;
    } else if (/scanf\s*\((.+)\)/.test(line)) {
      const match = line.match(/scanf\s*\((.+)\)/);
      const formatString = match[1];
      return `This reads input from the user and stores it in variables. It's like having a form that collects information from people.`;
    } else if (/int\s+(\w+)\s*=/.test(line)) {
      const match = line.match(/int\s+(\w+)\s*=\s*(.+)/);
      const varName = match[1];
      const value = match[2];

      if (value.includes("0")) {
        return `This creates an integer variable called '${varName}' and sets it to ${value}. It's like creating a labeled box to store whole numbers, starting with ${value}.`;
      } else if (value.includes("scanf")) {
        return `This creates an integer variable called '${varName}' and prepares it to receive input from the user. It's like creating a labeled box that will be filled when the user types a number.`;
      } else {
        return `This creates an integer variable called '${varName}' and sets it to ${value}. It's like creating a labeled box to store the whole number ${value}.`;
      }
    } else if (/int\s+(\w+)\[\]\s*=/.test(line)) {
      const match = line.match(/int\s+(\w+)\[\]\s*=/);
      const varName = match[1];
      return `This creates an array (a list of numbers) called '${varName}'. It's like having multiple boxes arranged in a row to store related data.`;
    } else if (/for\s*\([^)]*\)\s*\{/.test(line)) {
      return `This creates a loop that repeats code multiple times. It's like having a robot that does the same task over and over until it's finished.`;
    } else if (/if\s*\([^)]*\)\s*\{/.test(line)) {
      return `This creates a decision point where the program chooses what to do next. It's like having a fork in the road where you pick which path to take.`;
    } else if (/return\s+(\d+)/.test(line)) {
      const match = line.match(/return\s+(\d+)/);
      const returnCode = match[1];
      return `This ends the program and tells the system whether it ran successfully (0 means success, other numbers mean there was a problem).`;
    } else if (/#include\s*<(.+)>/.test(line)) {
      const match = line.match(/#include\s*<(.+)>/);
      const library = match[1];
      return `This includes a library that provides useful functions. It's like borrowing tools from a toolbox so you can use them in your program.`;
    } else if (/(\w+)\s*\+=\s*(.+)/.test(line)) {
      const match = line.match(/(\w+)\s*\+=\s*(.+)/);
      const varName = match[1];
      const value = match[2];
      return `This adds a value to the variable '${varName}' and stores the result back in the same variable. It's like adding money to a piggy bank.`;
    } else if (/(\w+)\s*=\s*(.+)/.test(line)) {
      const match = line.match(/(\w+)\s*=\s*(.+)/);
      const varName = match[1];
      const value = match[2];
      return `This stores a value in the variable '${varName}'. It's like putting something in a labeled box for later use.`;
    }
  } else if (lang.includes("cpp") || lang.includes("c++")) {
    if (/int\s+main\s*\([^)]*\)\s*\{/.test(line)) {
      return `This is the entry point of the program where execution begins. Every C++ program must have a main function.`;
    } else if (/cout\s*<</.test(line)) {
      return `This displays output to the screen using C++'s output stream. It's like having a printer that shows information to the user.`;
    } else if (/cin\s*>>/.test(line)) {
      return `This reads input from the user using C++'s input stream. It's like having a form that collects information from people.`;
    } else if (/#include\s*<(.+)>/.test(line)) {
      const match = line.match(/#include\s*<(.+)>/);
      const library = match[1];
      return `This includes a C++ library that provides useful functions. It's like borrowing tools from a toolbox so you can use them in your program.`;
    } else if (/using\s+namespace\s+std/.test(line)) {
      return `This tells the program to use the standard namespace, which allows you to use common functions without typing 'std::' every time.`;
    }
  } else if (lang.includes("java")) {
    if (/public\s+static\s+void\s+main\s*\([^)]*\)/.test(line)) {
      return `This is the entry point of the Java program where execution begins. Every Java application must have a main method.`;
    } else if (/System\.out\.print/.test(line)) {
      return `This displays output to the console. It's like having a printer that shows information to the user.`;
    } else if (/System\.in/.test(line)) {
      return `This reads input from the user. It's like having a form that collects information from people.`;
    } else if (/import\s+(.+)/.test(line)) {
      const match = line.match(/import\s+(.+)/);
      const library = match[1];
      return `This imports a Java library that provides useful classes and methods. It's like borrowing tools from a toolbox so you can use them in your program.`;
    } else if (/class\s+(\w+)/.test(line)) {
      const match = line.match(/class\s+(\w+)/);
      const className = match[1];
      return `This defines a new class called '${className}'. A class is like a blueprint for creating objects.`;
    }
  } else if (lang.includes("html")) {
    // Document structure
    if (/<!DOCTYPE\s+html/i.test(line)) {
      return `This declares the document type as HTML5, telling the browser how to interpret the page. It's like putting a label on a package.`;
    } else if (/<html/.test(line)) {
      return `This starts the HTML document structure. It tells the browser that everything inside is HTML content.`;
    } else if (/<\/html/.test(line)) {
      return `This ends the HTML document structure, closing the main container.`;
    }
    // Head section
    else if (/<head/.test(line)) {
      return `This starts the head section where you put information about the page (like title, styles, scripts) that users don't see directly.`;
    } else if (/<\/head/.test(line)) {
      return `This ends the head section, closing the area where page information is stored.`;
    } else if (/<title/.test(line)) {
      return `This sets the page title that appears in the browser tab. It's like giving your webpage a name tag.`;
    } else if (/<meta/.test(line)) {
      return `This provides metadata about the webpage (like character encoding, description) that helps browsers and search engines understand the page.`;
    } else if (/<link/.test(line)) {
      return `This links external resources like CSS files or icons to the webpage. It's like connecting your page to other files.`;
    } else if (/<style/.test(line)) {
      return `This starts a section for CSS styles that will be applied to the webpage. It's like having a style guide for your page.`;
    } else if (/<\/style/.test(line)) {
      return `This ends the CSS style section.`;
    } else if (/<script/.test(line)) {
      return `This starts a section for JavaScript code that adds interactivity to the webpage. It's like adding smart features to your page.`;
    } else if (/<\/script/.test(line)) {
      return `This ends the JavaScript code section.`;
    }
    // Body section
    else if (/<body/.test(line)) {
      return `This starts the body section where you put the main content that users will see on the webpage.`;
    } else if (/<\/body/.test(line)) {
      return `This ends the body section, closing the main content area.`;
    }
    // Text elements
    else if (/<h[1-6]/.test(line)) {
      const match = line.match(/<h([1-6])/);
      const level = match ? match[1] : '1';
      return `This creates a heading level ${level} that makes text larger and more prominent. It's like creating a title or subtitle for a section.`;
    } else if (/<\/h[1-6]/.test(line)) {
      return `This ends a heading, closing the title or subtitle section.`;
    } else if (/<p/.test(line)) {
      return `This creates a paragraph of text. It's like writing a normal sentence or paragraph in a document.`;
    } else if (/<\/p/.test(line)) {
      return `This ends a paragraph, closing the text section.`;
    } else if (/<span/.test(line)) {
      return `This creates an inline container for styling or scripting small pieces of text. It's like highlighting a few words in a sentence.`;
    } else if (/<\/span/.test(line)) {
      return `This ends an inline text container.`;
    } else if (/<strong/.test(line) || /<b/.test(line)) {
      return `This makes text bold and emphasizes its importance. It's like making words stand out in a sentence.`;
    } else if (/<\/strong/.test(line) || /<\/b/.test(line)) {
      return `This ends the bold text formatting.`;
    } else if (/<em/.test(line) || /<i/.test(line)) {
      return `This makes text italic and emphasizes it. It's like adding emphasis to words in a sentence.`;
    } else if (/<\/em/.test(line) || /<\/i/.test(line)) {
      return `This ends the italic text formatting.`;
    }
    // Container elements
    else if (/<div/.test(line)) {
      return `This creates a container that can hold other elements. It's like having a box that you can put other things inside.`;
    } else if (/<\/div/.test(line)) {
      return `This ends a container, closing the box that held other elements.`;
    } else if (/<section/.test(line)) {
      return `This creates a semantic section of content. It's like dividing a document into logical parts.`;
    } else if (/<\/section/.test(line)) {
      return `This ends a semantic section.`;
    } else if (/<article/.test(line)) {
      return `This creates a self-contained piece of content like a blog post or news article.`;
    } else if (/<\/article/.test(line)) {
      return `This ends an article section.`;
    } else if (/<header/.test(line)) {
      return `This creates a header section typically containing navigation or introductory content.`;
    } else if (/<\/header/.test(line)) {
      return `This ends a header section.`;
    } else if (/<footer/.test(line)) {
      return `This creates a footer section typically containing copyright or contact information.`;
    } else if (/<\/footer/.test(line)) {
      return `This ends a footer section.`;
    } else if (/<nav/.test(line)) {
      return `This creates a navigation section containing links to other pages or sections.`;
    } else if (/<\/nav/.test(line)) {
      return `This ends a navigation section.`;
    }
    // Lists
    else if (/<ul/.test(line)) {
      return `This creates an unordered list (bullet points). It's like making a list with dots or bullets.`;
    } else if (/<\/ul/.test(line)) {
      return `This ends an unordered list.`;
    } else if (/<ol/.test(line)) {
      return `This creates an ordered list (numbered items). It's like making a numbered list.`;
    } else if (/<\/ol/.test(line)) {
      return `This ends an ordered list.`;
    } else if (/<li/.test(line)) {
      return `This creates a list item. It's like adding one item to a list.`;
    } else if (/<\/li/.test(line)) {
      return `This ends a list item.`;
    }
    // Media elements
    else if (/<img/.test(line)) {
      return `This displays an image on the webpage. It's like putting a picture in a document.`;
    } else if (/<\/img/.test(line)) {
      return `This ends an image element.`;
    } else if (/<video/.test(line)) {
      return `This embeds a video player on the webpage. It's like adding a movie to your page.`;
    } else if (/<\/video/.test(line)) {
      return `This ends a video element.`;
    } else if (/<audio/.test(line)) {
      return `This embeds an audio player on the webpage. It's like adding music or sound to your page.`;
    } else if (/<\/audio/.test(line)) {
      return `This ends an audio element.`;
    }
    // Interactive elements
    else if (/<a\s+href/.test(line)) {
      return `This creates a clickable link that takes users to another webpage or location. It's like having a door that opens to another room.`;
    } else if (/<\/a/.test(line)) {
      return `This ends a link, closing the clickable element.`;
    } else if (/<button/.test(line)) {
      return `This creates a clickable button that users can interact with. It's like having a switch or control on your page.`;
    } else if (/<\/button/.test(line)) {
      return `This ends a button element.`;
    } else if (/<input/.test(line)) {
      return `This creates an input field where users can type text, numbers, or other data. It's like having a form field for user input.`;
    } else if (/<textarea/.test(line)) {
      return `This creates a larger text input area for longer text. It's like having a big text box for writing.`;
    } else if (/<\/textarea/.test(line)) {
      return `This ends a textarea element.`;
    } else if (/<form/.test(line)) {
      return `This creates a form that collects user input and can send it to a server. It's like having a questionnaire on your page.`;
    } else if (/<\/form/.test(line)) {
      return `This ends a form element.`;
    }
    // Table elements
    else if (/<table/.test(line)) {
      return `This creates a table for displaying data in rows and columns. It's like making a spreadsheet on your webpage.`;
    } else if (/<\/table/.test(line)) {
      return `This ends a table element.`;
    } else if (/<tr/.test(line)) {
      return `This creates a table row. It's like adding one horizontal line to a table.`;
    } else if (/<\/tr/.test(line)) {
      return `This ends a table row.`;
    } else if (/<td/.test(line)) {
      return `This creates a table cell for data. It's like adding one box to a table.`;
    } else if (/<\/td/.test(line)) {
      return `This ends a table cell.`;
    } else if (/<th/.test(line)) {
      return `This creates a table header cell. It's like adding a title to a column in a table.`;
    } else if (/<\/th/.test(line)) {
      return `This ends a table header cell.`;
    }
    // Comments
    else if (/<!--/.test(line)) {
      return `This starts an HTML comment that won't be displayed on the webpage. It's like leaving a note for other developers.`;
    } else if (/-->/.test(line)) {
      return `This ends an HTML comment.`;
    }
  } else if (lang.includes("css")) {
    if (/\.[\w-]+\s*\{/.test(line)) {
      return `This starts a CSS rule that applies styles to elements with a specific class. It's like giving instructions on how something should look.`;
    } else if (/#[\w-]+\s*\{/.test(line)) {
      return `This starts a CSS rule that applies styles to an element with a specific ID. It's like giving instructions on how one specific thing should look.`;
    } else if (/\w+\s*:\s*[^;]+;/.test(line)) {
      const match = line.match(/(\w+)\s*:\s*([^;]+);/);
      const property = match[1];
      const value = match[2];
      return `This sets the '${property}' style to '${value}'. It's like telling the element how it should appear (color, size, position, etc.).`;
    }
  }

  // Fallback for unrecognized patterns - now more helpful
  if (line.trim() === "") {
    return `This is an empty line used to make the code more readable and organized.`;
  } else if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
    return `This is a comment that explains what the code does. Comments help other programmers (and yourself) understand the code better.`;
  } else if (line.trim().startsWith("#")) {
    return `This is a preprocessor directive that gives instructions to the compiler before the code is compiled.`;
  } else if (
    line.includes("=") &&
    !line.includes("==") &&
    !line.includes("!=")
  ) {
    return `This assigns a value to a variable, storing information for later use.`;
  } else if (line.includes("(") && line.includes(")")) {
    return `This calls a function or method to perform a specific task.`;
  } else if (line.includes("{") || line.includes("}")) {
    return `This creates or ends a block of code that groups related statements together.`;
  } else {
    return `This line performs a specific operation that contributes to the overall functionality of the program.`;
  }
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
function analyzeCodePurpose(patterns, language, code) {
  const lang = language.toLowerCase();

  if (lang.includes("python")) {
    if (/def\s+(\w+)\s*\([^)]*\):/.test(code)) {
      const funcMatch = code.match(/def\s+(\w+)\s*\([^)]*\):/);
      const funcName = funcMatch ? funcMatch[1].toLowerCase() : "";

      if (funcName.includes("greet")) {
        return "Creates personalized greeting messages using user names";
      } else if (
        funcName.includes("calc") ||
        funcName.includes("add") ||
        funcName.includes("multiply") ||
        funcName.includes("sum")
      ) {
        return "Performs mathematical calculations and returns computed results";
      } else if (funcName.includes("fib")) {
        return "Calculates Fibonacci numbers using recursive programming";
      } else if (/print\s*\(/.test(code)) {
        return "Executes operations and displays output to the user";
      } else if (/return\s+/.test(code)) {
        return "Processes input data and returns a result for other functions to use";
      } else {
        return "Defines a reusable function that performs a specific task";
      }
    } else if (/for\s+\w+\s+in\s+/.test(code)) {
      return "Iterates through collections of data to process multiple items";
    } else if (/if\s+/.test(code)) {
      return "Makes conditional decisions based on different scenarios";
    } else if (/print\s*\(/.test(code)) {
      return "Displays information and communicates with the user";
    } else {
      return "Performs a specific operation using programming logic";
    }
  } else if (lang.includes("javascript")) {
    if (/function\s+(\w+)\s*\([^)]*\)\s*\{/.test(code)) {
      const funcMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
      const funcName = funcMatch ? funcMatch[1].toLowerCase() : "";

      if (funcName.includes("greet")) {
        return "Creates dynamic greeting messages for web applications";
      } else if (funcName.includes("calc") || funcName.includes("add")) {
        return "Performs real-time calculations in web applications";
      } else {
        return "Defines a reusable JavaScript function for web interactivity";
      }
    } else if (/console\.log\s*\(/.test(code)) {
      return "Outputs debugging information to the browser console";
    } else if (/const\s+\w+\s*=/.test(code) || /let\s+\w+\s*=/.test(code)) {
      return "Stores and manages data using variables";
    } else {
      return "Adds interactivity and functionality to web pages";
    }
  } else if (lang.includes("react")) {
    return "Creates interactive UI components for web applications";
  } else if (lang.includes("c")) {
    if (/int\s+main\s*\([^)]*\)\s*\{/.test(code)) {
      return "Defines the main entry point where program execution begins";
    } else if (/printf\s*\(/.test(code)) {
      return "Displays formatted output to the console";
    } else {
      return "Performs low-level operations with direct system control";
    }
  } else {
    return "Solves a specific problem using programming logic";
  }
}

// Function to get explanation from Google Gemini AI using REST API
async function getGeminiExplanation(code, language) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      throw new Error("Gemini API key not available");
    }

    const prompt = `You are an expert coding instructor. Your task is to analyze the user's ${language} code and provide a comprehensive, educational explanation that helps them understand how the code works step-by-step.

Original ${language} code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Please provide a detailed explanation in this format:

**Code Overview:**
[Brief summary of what this code does overall]

**Step-by-Step Breakdown:**
[Go through the code line by line or section by section, explaining what each part does and why it's needed]

**Key Concepts Explained:**
[Explain important programming concepts used in this code, specific to ${language}]

**How It Works (Functionally):**
[Explain the flow of execution and how different parts interact]

**Example Usage:**
[Show how this code would be used with sample input/output if applicable]

**Learning Points:**
[Highlight what the user should learn from this code]

Focus on making it educational and easy to understand. Explain both the "what" and the "why" behind the code. Use clear, beginner-friendly language while being thorough.`;

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

    // Support C, Python, JavaScript, HTML, CSS, Java, and C++ - strict validation
    const normalizedLanguage = language.toLowerCase().trim();
    const isValidLanguage =
      normalizedLanguage === "c" ||
      normalizedLanguage === "python" ||
      normalizedLanguage === "javascript" ||
      normalizedLanguage === "html" ||
      normalizedLanguage === "css" ||
      normalizedLanguage === "java" ||
      normalizedLanguage === "c++" ||
      normalizedLanguage === "cpp" ||
      normalizedLanguage.startsWith("c ") ||
      normalizedLanguage.startsWith("python ") ||
      normalizedLanguage.startsWith("javascript ") ||
      normalizedLanguage.startsWith("html ") ||
      normalizedLanguage.startsWith("css ") ||
      normalizedLanguage.startsWith("java ") ||
      normalizedLanguage.startsWith("c++ ") ||
      normalizedLanguage.startsWith("cpp ");

    if (!language || !isValidLanguage) {
      return res.status(400).json({
        message:
          "Only C, Python, JavaScript, HTML, CSS, Java, and C++ languages are supported. React/JSX is not currently supported. Please select one of the supported languages.",
        supportedLanguages: [
          "C",
          "Python",
          "JavaScript",
          "HTML",
          "CSS",
          "Java",
          "C++",
        ],
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
