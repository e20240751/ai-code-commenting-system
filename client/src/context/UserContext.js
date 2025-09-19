import React, { createContext, useContext, useReducer, useEffect } from "react";

const UserContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  rank: "beginner",
  points: 0,
  completedExercises: [],
  loading: false,
  error: null,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        rank: action.payload.rank || "beginner",
        points: action.payload.points || 0,
        completedExercises: action.payload.completedExercises || [],
        loading: false,
        error: null,
      };
    case "LOGOUT":
      return {
        ...initialState,
        loading: false,
        error: null,
      };
    case "UPDATE_POINTS":
      const newPoints = state.points + action.payload;
      const newRank = calculateRank(newPoints);
      return {
        ...state,
        points: newPoints,
        rank: newRank,
      };
    case "COMPLETE_EXERCISE":
      return {
        ...state,
        completedExercises: [...state.completedExercises, action.payload],
      };
    case "UPDATE_USERNAME":
      const updatedUser = { ...state.user, username: action.payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
      };
    default:
      return state;
  }
};

const calculateRank = (points) => {
  if (points >= 1000) return "legend";
  if (points >= 800) return "epic";
  if (points >= 600) return "advance";
  if (points >= 300) return "expert";
  return "beginner";
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    // Initialize demo user if no users exist
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    if (existingUsers.length === 0) {
      const demoUser = {
        id: 1,
        username: "demo",
        email: "demo@example.com",
        password: "demo123",
        rank: "beginner",
        points: 0,
        completedExercises: [],
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("users", JSON.stringify([demoUser]));
    }

    // Check for existing user session
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: userData,
        });
      } catch (error) {
        localStorage.removeItem("user");
      }
    }

    // Global function to update username
    window.updateUserName = (newName) => {
      dispatch({
        type: "UPDATE_USERNAME",
        payload: newName,
      });
    };
  }, []);

  const login = async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Save to localStorage for demo purposes
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: userData,
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const updatePoints = (points) => {
    dispatch({ type: "UPDATE_POINTS", payload: points });
    // Update localStorage
    if (state.user) {
      const updatedUser = {
        ...state.user,
        points: state.points + points,
        rank: calculateRank(state.points + points),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const completeExercise = (exerciseId) => {
    dispatch({ type: "COMPLETE_EXERCISE", payload: exerciseId });
  };

  const value = {
    ...state,
    login,
    logout,
    updatePoints,
    completeExercise,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
