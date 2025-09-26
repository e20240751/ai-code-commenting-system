const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Test API route
app.post("/api/explain-code", (req, res) => {
  res.json({
    message: "API is working!",
    received: req.body,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log("✅ Server started successfully!");
});
