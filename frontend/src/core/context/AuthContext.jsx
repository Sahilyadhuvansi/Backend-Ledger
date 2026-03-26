/* eslint-disable react-refresh/only-export-components */
// ─── Commit: React Context & State Hooks ───
// What this does: Loads core React functions like 'createContext' (for global state) and 'useState' (for local state).
import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/api";

// ─── Commit: Auth Global Store Initialization ───
// What this does: Creates a "Store" that holds the login information for the entire website.
// Why it exists: So every component in the app (Sidebar, Dashboard, Profile) knows who is logged in without re-fetching from the database.
const AuthContext = createContext(null);

// ─── Commit: LocalStorage Persistence Logic ───
// Why it exists: If you refresh your browser, React's memory resets to 0. This code "Hydrates" (restores) the user session from the browser's hard drive so you don't have to log in every 5 minutes.
const parseStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("user"); // Cleanup if the saved data is corrupted
    return null;
  }
};

/**
 * Authentication Provider Component
 */
// ─── Commit: Provider Implementation (Context Pattern) ───
// How it works: This component "Wraps" the entire app. It's like the "Battery" of the application — it provides energy (Account info) to every sub-component.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(parseStoredUser); // The current logged-in user object
  const [loading, setLoading] = useState(false); // UI Spinner state

  // ─── Commit: Session Persistence Routine ───
  // What this does: Synchronizes the React state with the Browser hard drive.
  const persistUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) localStorage.setItem("token", token);
  };

  /**
   * Action: Login
   */
  // ─── Commit: Async Login Workflow ───
  // Interview insight: Why 'useCallback'? To prevent the login function from being "Re-created" every time the App re-renders. This saves memory and prevents bugs in sub-components.
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // Calls our Backend Node.js server
      const { data } = await api.post("/auth/login", { email, password });
      persistUser(data.data.user, data.data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Action: Register
   */
  const register = useCallback(async (name, username, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, username, email, password });
      persistUser(data.data.user, data.data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Action: Logout
   */
  // ─── Commit: Secure Session Termination ───
  // What this does: 1. Hits the backend to blacklist the token. 2. Clears the browser. 3. Resets React state.
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err.message);
    } finally {
      // Step: Radical State Reset
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  return (
    // We export these functions and values so 'useAuth()' can use them later.
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Commit: Custom Consumer Hook (Facade Pattern) ───
// What this does: Makes it super easy to get the user info.
// Usage: const { user } = useAuth();
// Interview insight: This is a "Facade" or "Abstraction" over the standard useContext(AuthContext).
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
