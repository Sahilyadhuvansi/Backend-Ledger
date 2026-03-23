import axios from "axios";

const BASE_URL = import.meta.env.DEV
  ? `http://${window.location.hostname}:3002/api`
  : import.meta.env.VITE_API_URL || "https://backend-ledger-ijt0.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15s timeout to handle slow cold starts on Render
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler — redirects to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data and redirect only if not already on auth pages
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
