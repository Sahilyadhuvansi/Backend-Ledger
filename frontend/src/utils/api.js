import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Re-throw the original Axios error so callers can access error.response
    return Promise.reject(error);
  },
);

export default api;
