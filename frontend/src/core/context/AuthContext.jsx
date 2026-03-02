/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.data.user);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    return data;
  };

  const register = async (name, username, email, password) => {
    const { data } = await api.post("/auth/register", {
      name,
      username,
      email,
      password,
    });
    setUser(data.data.user);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading: false }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
