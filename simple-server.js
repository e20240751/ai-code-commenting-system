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

// Function to generate fallback explanations
function generateFallbackExplanation(code, language) {
  if (language.toLowerCase().includes("c")) {
    return `**C Code Analysis:**

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
    return `**Python Code Analysis:**

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
    return `**Code Analysis:**

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
