import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in cookie or session storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.data.user);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      setUser(data.data.user);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still logout locally anyway
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
