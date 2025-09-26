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
      GEMINI_API_KEY = apiKeyMatch[1];
      console.log(
        "✅ Gemini API Key loaded:",
        GEMINI_API_KEY.substring(0, 15) + "..."
      );
    }
  }
} catch (error) {
  console.log("⚠️ Could not load secret.env:", error.message);
}

// Main route - serve the terminal-app.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "terminal-app.html"));
});

// Specific route for terminal-app.html
app.get("/terminal-app.html", (req, res) => {
  res.sendFile(path.join(__dirname, "terminal-app.html"));
});

// Specific route for working-app.html
app.get("/working-app.html", (req, res) => {
  res.sendFile(path.join(__dirname, "working-app.html"));
});

// API endpoint for code explanation
app.post("/api/explain-code", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Support C, Python, JavaScript, HTML, CSS, Java, and C++
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
        // Fall back to simple explanation
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
    } else if (/^\s*(int|char|float|double|string|var|let|const)\s+\w+/.test(line)) {
      variables.push({ line, lineNumber: i + 1 });
    } else if (line.includes("if") || line.includes("for") || line.includes("while") || 
               line.includes("return") || line.includes("print") || line.includes("printf")) {
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
  
  if (line.includes("if")) {
    return "Conditional statement - executes code only if condition is true";
  } else if (line.includes("for") || line.includes("while")) {
    return "Loop statement - repeats code multiple times";
  } else if (line.includes("return")) {
    return "Returns a value from a function";
  } else if (line.includes("print") || line.includes("printf") || line.includes("cout")) {
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(
    `💻 Terminal-style app: http://localhost:${PORT}/terminal-app.html`
  );
  console.log(`📱 Original app: http://localhost:${PORT}/working-app.html`);
  console.log(`🎯 Main page: http://localhost:${PORT}`);
  console.log(`🤖 API endpoint: http://localhost:${PORT}/api/explain-code`);
  console.log("");
  console.log("✅ Programming Learning Platform with AI is ready!");
  console.log("   • Dark theme with neon accents (cyan, green, purple)");
  console.log("   • Fira Code monospace typography");
  console.log("   • IDE-style feature cards with syntax highlighting");
  console.log("   • Glowing hover effects and animations");
  console.log("   • Matrix-style background effect");
  console.log("   • AI-powered code explanations with Gemini API");
  console.log("");
  if (GEMINI_API_KEY) {
    console.log("🔑 Gemini API Key: Loaded and ready!");
  } else {
    console.log("⚠️ Gemini API Key: Not found - using fallback explanations");
  }
  console.log("");
  console.log("Press Ctrl+C to stop the server");
});
