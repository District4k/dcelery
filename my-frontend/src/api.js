// src/api.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8001/";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Adjust if using auth
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        console.error("Unauthorized request. Please log in.");
      } else if (status >= 500) {
        console.error("Server error:", data?.error || "Internal Server Error");
      }
    } else if (error.request) {
      console.error("Network error: No response received from server.");
    } else {
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;