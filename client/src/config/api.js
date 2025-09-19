// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,

  // User Profile
  PROFILE: `${API_BASE_URL}/api/user/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/user/profile`,

  // Code Explanation
  EXPLAIN_CODE: `${API_BASE_URL}/api/explain-code`,

  // Exercises
  EXERCISES: `${API_BASE_URL}/api/exercises`,
  SUBMIT_EXERCISE: `${API_BASE_URL}/api/exercises/submit`,

  // Leaderboard
  LEADERBOARD: `${API_BASE_URL}/api/leaderboard`,

  // Health Check
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
