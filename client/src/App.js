import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PhoneAd from "./components/PhoneAd";
import AdminPanel from "./components/AdminPanel";
import Home from "./pages/Home";
import SmartExplanation from "./pages/SmartExplanation";
import InteractiveLearning from "./pages/InteractiveLearning";
import Challenge from "./pages/Challenge";
import Leaderboard from "./pages/Leaderboard";
import { UserProvider } from "./context/UserContext";
import "./index.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explain" element={<SmartExplanation />} />
            <Route path="/exercises" element={<InteractiveLearning />} />
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
          <PhoneAd />
          <AdminPanel />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
