const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting Programming Learning Platform Server...");
console.log("");

// Start the simple server
const serverPath = path.join(__dirname, "simple-server.js");
const serverProcess = spawn("node", [serverPath], {
  stdio: "inherit",
  cwd: __dirname,
});

serverProcess.on("error", (error) => {
  console.error("❌ Error starting server:", error.message);
});

serverProcess.on("close", (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping server...");
  serverProcess.kill("SIGINT");
  process.exit(0);
});
