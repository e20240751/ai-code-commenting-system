#!/usr/bin/env node

const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Load API key from secret.env file
let GEMINI_API_KEY = null;
try {
  const secretEnvPath = path.join(__dirname, "secret.env");
  if (fs.existsSync(secretEnvPath)) {
    const secretContent = fs.readFileSync(secretEnvPath, "utf8");
    const apiKeyMatch = secretContent.match(/GEMINI_API_KEY=(.+)/);
    if (apiKeyMatch) {
      GEMINI_API_KEY = apiKeyMatch[1].trim();
      console.log(
        "✅ Gemini API Key loaded:",
        GEMINI_API_KEY.substring(0, 15) + "..."
      );
    }
  }
} catch (error) {
  console.log("⚠️ Could not load secret.env:", error.message);
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "working-app.html"));
});

app.get("/working-app.html", (req, res) => {
  res.sendFile(path.join(__dirname, "working-app.html"));
});

app.get("/terminal-app.html", (req, res) => {
  res.sendFile(path.join(__dirname, "terminal-app.html"));
});

// API endpoint for code explanation
app.post("/api/explain-code", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Support multiple languages
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
          "Only C, Python, JavaScript, HTML, CSS, Java, and C++ languages are supported.",
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

    let explanation = "";
    let source = "";

    // Try Gemini API first
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here") {
      try {
        console.log("Trying Gemini API...");

        const prompt = `You are a coding tutor. Your task is to explain the user's ${language} code in a clear, educational way that helps beginners understand programming concepts.

Original ${language} code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Please provide a comprehensive explanation with the following structure:

## 🎯 What This Code Does
[Brief overview of the code's purpose and main functionality]

## 📝 Step-by-Step Explanation
[Go through each line or section of code and explain what it does, why it's needed, and how it works]

## 💡 Key Programming Concepts
[Explain the important programming concepts used in this code]

## 🔍 Example Walkthrough
[Show how the code would execute with sample data, step by step]

## 💡 Learning Tips
[Provide helpful tips for understanding similar code patterns]

Make the explanation beginner-friendly, clear, and educational. Focus on helping someone learn programming concepts, not just understand this specific code.`;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": GEMINI_API_KEY,
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
        explanation =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No explanation available";
        source = "Google Gemini 2.0 Flash";
        console.log("Gemini API success!");
      } catch (geminiError) {
        console.log("Gemini API failed:", geminiError.message);
        explanation = generateFallbackExplanation(code, language);
        source = "Local Analysis";
      }
    } else {
      console.log("No Gemini API key available, using fallback");
      explanation = generateFallbackExplanation(code, language);
      source = "Local Analysis";
    }

    res.json({
      explanation,
      code,
      language: language,
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Code explanation error:", error);
    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message || "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Function to generate comprehensive fallback explanations
function generateFallbackExplanation(code, language) {
  const lang = language.toLowerCase().trim();
  
  // Use different explanation methods based on language
  if (lang === "html") {
    return generateStepByStepExplanation(code, language);
  } else {
    return generateNormalExplanation(code, language);
  }
}

// Function to generate step-by-step explanation for HTML
function generateStepByStepExplanation(code, language) {
  const lines = code.split("\n");
  let explanation = "";

  // Analyze code structure
  const functions = [];
  const variables = [];
  const imports = [];
  const logic = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("//")) continue;

    if (/^#include|^import\s+|^from\s+/.test(line)) {
      imports.push({ line, lineNumber: i + 1 });
    } else if (/def\s+\w+|function\s+\w+|class\s+\w+/.test(line)) {
      functions.push({ line, lineNumber: i + 1 });
    } else if (
      /^\s*(int|char|float|double|string|var|let|const)\s+\w+/.test(line)
    ) {
      variables.push({ line, lineNumber: i + 1 });
    } else if (
      line.includes("if") ||
      line.includes("for") ||
      line.includes("while") ||
      line.includes("return") ||
      line.includes("print") ||
      line.includes("printf")
    ) {
      logic.push({ line, lineNumber: i + 1 });
    }
  }

  // Build comprehensive explanation
  explanation += `**Code Overview:**\n`;
  explanation += `This ${language} code demonstrates programming concepts and functionality.\n\n`;

  if (imports.length > 0) {
    explanation += `**Dependencies:**\n`;
    imports.forEach(({ line, lineNumber }) => {
      explanation += `• Line ${lineNumber}: \`${line}\` - Brings in external functionality\n`;
    });
    explanation += `\n`;
  }

  if (functions.length > 0) {
    explanation += `**Functions/Classes:**\n`;
    functions.forEach(({ line, lineNumber }) => {
      explanation += `• Line ${lineNumber}: \`${line}\` - Defines reusable code block\n`;
    });
    explanation += `\n`;
  }

  if (variables.length > 0) {
    explanation += `**Variables:**\n`;
    variables.forEach(({ line, lineNumber }) => {
      explanation += `• Line ${lineNumber}: \`${line}\` - Stores data for use in program\n`;
    });
    explanation += `\n`;
  }

  explanation += `**Step-by-Step Execution:**\n`;
  let stepNumber = 1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith("//")) {
      explanation += `${stepNumber}. Line ${i + 1}: \`${line}\`\n`;
      explanation += `   → ${getLineExplanation(line, language)}\n\n`;
      stepNumber++;
    }
  }

  explanation += `**Key Concepts:**\n`;
  explanation += `• ${getLanguageSpecificConcepts(language)}\n\n`;

  explanation += `**How It Works:**\n`;
  explanation += `The program executes sequentially, with each line contributing to the overall functionality. Control structures like loops and conditionals modify the flow of execution.\n\n`;

  return explanation;
}

// Helper function to explain individual lines
function getLineExplanation(line, language) {
  const lang = language.toLowerCase();

  if (lang.includes("html")) {
    if (/<!DOCTYPE\s+html/i.test(line)) {
      return "Declares the document type as HTML5";
    } else if (/<html/.test(line)) {
      return "Starts the HTML document structure";
    } else if (/<head/.test(line)) {
      return "Starts the head section for page metadata";
    } else if (/<body/.test(line)) {
      return "Starts the body section for main content";
    } else if (/<h[1-6]/.test(line)) {
      return "Creates a heading for titles and subtitles";
    } else if (/<p/.test(line)) {
      return "Creates a paragraph of text";
    } else if (/<div/.test(line)) {
      return "Creates a container for other elements";
    } else if (/<img/.test(line)) {
      return "Displays an image on the webpage";
    } else if (/<a\s+href/.test(line)) {
      return "Creates a clickable link";
    } else if (/<ul/.test(line)) {
      return "Creates an unordered list (bullet points)";
    } else if (/<ol/.test(line)) {
      return "Creates an ordered list (numbered items)";
    } else if (/<li/.test(line)) {
      return "Creates a list item";
    } else if (/<table/.test(line)) {
      return "Creates a table for data display";
    } else if (/<form/.test(line)) {
      return "Creates a form for user input";
    } else if (/<input/.test(line)) {
      return "Creates an input field for user data";
    } else if (/<button/.test(line)) {
      return "Creates a clickable button";
    } else if (/<script/.test(line)) {
      return "Starts JavaScript code section";
    } else if (/<style/.test(line)) {
      return "Starts CSS styling section";
    } else if (/<!--/.test(line)) {
      return "HTML comment (not displayed)";
    }
  } else if (lang.includes("css")) {
    if (/\.[\w-]+\s*\{/.test(line)) {
      return "CSS rule for elements with a specific class";
    } else if (/#[\w-]+\s*\{/.test(line)) {
      return "CSS rule for an element with a specific ID";
    } else if (/\w+\s*:\s*[^;]+;/.test(line)) {
      return "CSS property setting a style value";
    }
  } else if (line.includes("if")) {
    return "Conditional statement - executes code only if condition is true";
  } else if (line.includes("for") || line.includes("while")) {
    return "Loop statement - repeats code multiple times";
  } else if (line.includes("return")) {
    return "Returns a value from a function";
  } else if (
    line.includes("print") ||
    line.includes("printf") ||
    line.includes("cout")
  ) {
    return "Outputs text or data to the console/screen";
  } else if (line.includes("=")) {
    return "Assignment - stores a value in a variable";
  } else if (line.includes("def ") || line.includes("function ")) {
    return "Function definition - creates a reusable code block";
  } else if (line.includes("class ")) {
    return "Class definition - creates a blueprint for objects";
  }

  return "Executes a programming instruction";
}

// Helper function for language-specific concepts
function getLanguageSpecificConcepts(language) {
  const lang = language.toLowerCase();
  if (lang.includes("python")) {
    return "Python uses indentation, dynamic typing, and has extensive libraries";
  } else if (lang.includes("javascript")) {
    return "JavaScript is versatile, supports multiple programming paradigms";
  } else if (lang.includes("c")) {
    return "C provides low-level control and direct memory management";
  } else if (lang.includes("c++")) {
    return "C++ combines C's efficiency with object-oriented features";
  } else if (lang.includes("java")) {
    return "Java is platform-independent and strongly object-oriented";
  } else if (lang.includes("html")) {
    return "HTML structures content using semantic tags and elements";
  } else if (lang.includes("css")) {
    return "CSS controls visual presentation and layout of web content";
  }
  return "Follows standard programming principles and best practices";
}

// Function to generate normal explanation for non-HTML languages
function generateNormalExplanation(code, language) {
  const lang = language.toLowerCase();
  let explanation = `# ${language.toUpperCase()} Code Explanation\n\n`;

  // Analyze the main purpose
  explanation += `## 🎯 What This Code Does\n`;
  explanation += `This ${language} code performs specific programming tasks. `;
  
  // Add language-specific overview
  if (lang.includes("python")) {
    explanation += `Python is known for its readability and extensive libraries. This code likely uses Python's clean syntax to solve a problem efficiently.\n\n`;
  } else if (lang.includes("javascript")) {
    explanation += `JavaScript is versatile and can run in browsers and servers. This code demonstrates JavaScript's dynamic nature and modern features.\n\n`;
  } else if (lang.includes("c")) {
    explanation += `C provides low-level control and direct memory management. This code showcases C's efficiency and system-level programming capabilities.\n\n`;
  } else if (lang.includes("c++")) {
    explanation += `C++ combines C's efficiency with object-oriented programming. This code demonstrates C++'s powerful features for complex applications.\n\n`;
  } else if (lang.includes("java")) {
    explanation += `Java is platform-independent and strongly object-oriented. This code showcases Java's robust architecture and cross-platform capabilities.\n\n`;
  } else if (lang.includes("css")) {
    explanation += `CSS controls the visual presentation of web content. This code defines how elements should look and behave on a webpage.\n\n`;
  } else {
    explanation += `This code demonstrates key programming concepts and best practices.\n\n`;
  }

  // Add key concepts
  explanation += `## 💡 Key Programming Concepts\n`;
  explanation += `• **Syntax**: The rules and structure of ${language} code\n`;
  explanation += `• **Logic**: How the code processes data and makes decisions\n`;
  explanation += `• **Functions**: Reusable blocks of code that perform specific tasks\n`;
  explanation += `• **Variables**: Containers that store data for processing\n`;
  explanation += `• **Control Flow**: How the program decides which code to execute\n\n`;

  // Add how it works
  explanation += `## 🔍 How It Works\n`;
  explanation += `The code follows a logical sequence:\n`;
  explanation += `1. **Initialization**: Sets up variables and initial values\n`;
  explanation += `2. **Processing**: Performs calculations or operations on data\n`;
  explanation += `3. **Output**: Displays results or returns values\n`;
  explanation += `4. **Control**: Uses conditions and loops to control program flow\n\n`;

  // Add example usage
  explanation += `## 💡 Example Usage\n`;
  explanation += `To use this code:\n`;
  explanation += `1. Copy the code into a ${language} development environment\n`;
  explanation += `2. Run the code to see the output\n`;
  explanation += `3. Modify variables to test different scenarios\n`;
  explanation += `4. Study the output to understand the behavior\n\n`;

  // Add learning points
  explanation += `## 📚 Learning Points\n`;
  explanation += `• Understanding ${language} syntax and structure\n`;
  explanation += `• Learning programming logic and problem-solving\n`;
  explanation += `• Practicing code analysis and debugging\n`;
  explanation += `• Building foundation for more complex programs\n`;

  return explanation;
}

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Main app: http://localhost:${PORT}/working-app.html`);
  console.log(`💻 Terminal app: http://localhost:${PORT}/terminal-app.html`);
  console.log(`🤖 API endpoint: http://localhost:${PORT}/api/explain-code`);
  console.log("");
  console.log("✅ Programming Learning Platform with AI is ready!");
  console.log("   • Dark theme with neon accents");
  console.log("   • AI-powered code explanations");
  console.log("");
  if (GEMINI_API_KEY) {
    console.log("🔑 Gemini API Key: Loaded and ready!");
  } else {
    console.log("⚠️ Gemini API Key: Not found - using fallback explanations");
  }
  console.log("");
  console.log("Press Ctrl+C to stop the server");
});
