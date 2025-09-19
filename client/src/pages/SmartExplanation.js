import React, { useState } from "react";
import {
  Code,
  Copy,
  Download,
  Sparkles,
  Loader2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { API_ENDPOINTS } from "../config/api";

const SmartExplanation = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationSource, setExplanationSource] = useState("");
  const [apiUsed, setApiUsed] = useState("");
  const [error, setError] = useState("");
  const { isAuthenticated } = useUser();

  const handleExplain = async () => {
    if (!code.trim()) {
      setError("Please enter some code to explain");
      return;
    }

    // Validate language selection - strict validation to match backend
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
      setError(
        "Please select C, Python, JavaScript, or React from the dropdown."
      );
      return;
    }

    setLoading(true);
    setShowExplanation(true);
    setError("");

    try {
      // Call the AI explanation API endpoint
      const response = await fetch(API_ENDPOINTS.EXPLAIN_CODE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get explanation");
      }

      const data = await response.json();
      setExplanation(data.explanation || "No explanation available");
      setExplanationSource(data.source || "Unknown");
      setApiUsed(data.apiUsed || "Unknown");
    } catch (error) {
      console.error("Error generating explanation:", error);

      // Show error message - NO FALLBACK
      const errorMessage =
        error.message.includes("Only") && error.message.includes("supported")
          ? error.message
          : "AI APIs are currently unavailable. Please try again later.";

      setError(errorMessage);
      setExplanation("");
      setExplanationSource("");
      setApiUsed("");
    } finally {
      setLoading(false);
    }
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
              AI Code Commenting Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Paste your code below and get AI-generated beginner-friendly
              comments
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
            AI Code Commenting Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Paste your C, Python, JavaScript, or React code below and get
            AI-generated beginner-friendly comments
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Using Google Gemini 2.0 Flash with intelligent pattern analysis
            fallback
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

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="javascript">JavaScript</option>
                <option value="react">React</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Currently supporting C, Python, JavaScript, and React
              </p>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={
                language === "python"
                  ? "Paste your Python code here...\n\nExample:\ndef greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('World'))"
                  : language === "c"
                  ? 'Paste your C code here...\n\nExample:\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
                  : language === "javascript"
                  ? "Paste your JavaScript code here...\n\nExample:\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World'));"
                  : "Paste your React code here...\n\nExample:\nimport React from 'react';\n\nfunction Greeting({ name }) {\n    return <h1>Hello, {name}!</h1>;\n}\n\nexport default Greeting;"
              }
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
                  <span>Adding Comments...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Add Comments to Code</span>
                </>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Explanation Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                Commented Code
              </div>
              {explanationSource && (
                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      explanationSource.includes("Gemini")
                        ? "bg-purple-100 text-purple-800"
                        : explanationSource.includes("Pattern Analysis")
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {explanationSource}
                  </span>
                  {apiUsed && (
                    <span className="text-xs text-gray-500">
                      API: {apiUsed}
                    </span>
                  )}
                </div>
              )}
            </h2>

            {!showExplanation ? (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Code className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">
                    Your commented code will appear here
                  </p>
                  <p className="text-sm">
                    Paste some code and click "Add Comments to Code" to get
                    started
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
                        Adding comments to your code...
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
