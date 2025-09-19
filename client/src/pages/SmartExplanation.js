import React, { useState } from "react";
import {
  Code,
  Send,
  Copy,
  Download,
  Sparkles,
  Loader2,
  Lock,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { API_ENDPOINTS } from "../config/api";

const SmartExplanation = () => {
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { isAuthenticated } = useUser();

  const handleExplain = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setShowExplanation(true);

    try {
      // Call the actual API endpoint
      const response = await fetch(API_ENDPOINTS.EXPLAIN_CODE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }

      const data = await response.json();
      setExplanation(data.explanation || "No explanation available");
    } catch (error) {
      console.error("Error generating explanation:", error);

      // Fallback to mock explanation if API fails
      const mockExplanation = generateMockExplanation(code);
      setExplanation(mockExplanation);
    } finally {
      setLoading(false);
    }
  };

  const generateMockExplanation = (codeInput) => {
    // Enhanced mock explanation based on common patterns
    let explanation = "🤖 **Smart Code Analysis:**\n\n";

    if (codeInput.includes("function") || codeInput.includes("def")) {
      explanation += `**Function Definition:** This code defines a reusable function that performs a specific task.\n\n`;
      explanation += `**Key Concepts:**\n`;
      explanation += `• Functions help organize code and avoid repetition\n`;
      explanation += `• They take input parameters and can return results\n`;
      explanation += `• Makes code more modular and maintainable\n\n`;
      explanation += `**Learning Tip:** Functions are building blocks of programming - master them to write cleaner, more efficient code!`;
    } else if (codeInput.includes("for") || codeInput.includes("while")) {
      explanation += `**Loop Structure:** This code uses iteration to repeat operations multiple times.\n\n`;
      explanation += `**Key Concepts:**\n`;
      explanation += `• Loops automate repetitive tasks efficiently\n`;
      explanation += `• Continue until a specific condition is met\n`;
      explanation += `• Essential for processing data and automation\n\n`;
      explanation += `**Learning Tip:** Loops are powerful - they let you handle large amounts of data with just a few lines of code!`;
    } else if (codeInput.includes("if") || codeInput.includes("else")) {
      explanation += `**Conditional Logic:** This code makes decisions based on different conditions.\n\n`;
      explanation += `**Key Concepts:**\n`;
      explanation += `• 'if' checks whether a condition is true\n`;
      explanation += `• 'else' provides alternative actions\n`;
      explanation += `• Adds intelligence and flexibility to programs\n\n`;
      explanation += `**Learning Tip:** Conditionals make your programs smart - they can adapt and respond to different situations!`;
    } else if (
      codeInput.includes("console.log") ||
      codeInput.includes("print")
    ) {
      explanation += `**Output Statement:** This code displays information to the user or console.\n\n`;
      explanation += `**Key Concepts:**\n`;
      explanation += `• Essential for debugging and showing results\n`;
      explanation += `• Helps verify your program is working correctly\n`;
      explanation += `• Provides feedback and communication\n\n`;
      explanation += `**Learning Tip:** Output statements are your window into what your program is doing - use them liberally while learning!`;
    } else if (
      codeInput.includes("var") ||
      codeInput.includes("let") ||
      codeInput.includes("const")
    ) {
      explanation += `**Variable Declaration:** This code creates containers to store and manage data.\n\n`;
      explanation += `**Key Concepts:**\n`;
      explanation += `• Variables hold information your program can use\n`;
      explanation += `• Different types (var/let/const) have different scopes\n`;
      explanation += `• Makes code flexible and dynamic\n\n`;
      explanation += `**Learning Tip:** Good variable names make your code self-documenting and easier to understand!`;
    } else {
      explanation += `**General Code Analysis:** This code contains programming instructions that work together to solve a problem.\n\n`;
      explanation += `**Key Concepts:**\n`;
      explanation += `• Each line contributes to the overall functionality\n`;
      explanation += `• Programming is about breaking problems into steps\n`;
      explanation += `• Practice makes complex concepts clearer\n\n`;
      explanation += `**Learning Tip:** Every expert was once a beginner - keep coding and you'll master these concepts!`;
    }

    return explanation;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "code.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sampleCodes = [
    {
      title: "JavaScript Function",
      code: `function calculateArea(length, width) {
    return length * width;
}

const area = calculateArea(5, 3);
console.log("Area:", area);`,
    },
    {
      title: "Python Loop",
      code: `numbers = [1, 2, 3, 4, 5]
sum = 0

for num in numbers:
    sum += num

print(f"Sum: {sum}")`,
    },
    {
      title: "React Component",
      code: `function Welcome({ name }) {
    return (
        <div>
            <h1>Hello, {name}!</h1>
            <p>Welcome to our app!</p>
        </div>
    );
}`,
    },
  ];

  // Show login prompt for guests
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart Code Explanation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Paste your code below and get AI-powered explanations in simple,
              beginner-friendly language
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
              You need to be logged in to access the Smart Code Explanation
              feature.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Smart Code Explanation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Paste your code below and get AI-powered explanations in simple,
            beginner-friendly language
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Your Code
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copy code"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={downloadCode}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download code"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here...&#10;&#10;Example:&#10;function greet(name) {&#10;    return `Hello, ${name}!`;&#10;}"
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />

            <button
              onClick={handleExplain}
              disabled={!code.trim() || loading}
              className="w-full mt-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Explanation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Explain the Code</span>
                </>
              )}
            </button>
          </div>

          {/* Explanation Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              AI Explanation
            </h2>

            {!showExplanation ? (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Code className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Your explanation will appear here</p>
                  <p className="text-sm">
                    Paste some code and click "Explain the Code" to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary-600" />
                      <p className="text-lg text-gray-600">
                        Analyzing your code...
                      </p>
                      <p className="text-sm text-gray-500">
                        This may take a few moments
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="explanation-box">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-white leading-relaxed">
                        {explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sample Codes */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Try These Sample Codes
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {sampleCodes.map((sample, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {sample.title}
                </h4>
                <pre className="code-block text-sm mb-4 overflow-x-auto">
                  {sample.code}
                </pre>
                <button
                  onClick={() => setCode(sample.code)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Use This Code
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartExplanation;
