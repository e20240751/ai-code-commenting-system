const axios = require("axios");

async function testAIExplanation() {
  try {
    console.log("Testing AI Explanation API...");

    const response = await axios.post(
      "http://localhost:5000/api/explain-code",
      {
        code: `#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
        language: "c",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("✅ API Response:");
    console.log("Source:", response.data.source);
    console.log("API Used:", response.data.apiUsed);
    console.log("Language:", response.data.language);
    console.log("Explanation:", response.data.explanation);
  } catch (error) {
    console.error("❌ Error testing AI explanation:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testAIExplanation();
