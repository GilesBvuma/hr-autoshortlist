// src/api/adminApi.js
// CHANGED: Fixed baseURL - was "/api/admin" but backend endpoints are at "/api"
import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080", // Changed to use environment variable
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add logging to see what's being called
  console.log("🔵 API Request:", config.method.toUpperCase(), config.url);

  return config;
});

adminApi.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default adminApi;
