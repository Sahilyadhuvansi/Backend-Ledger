import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? `http://${window.location.hostname}:3002/api`
    : "https://backend-ledger-ijt0.onrender.com/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Re-throw the original Axios error so callers can access error.response
    return Promise.reject(error);
  },
);

export default api;
