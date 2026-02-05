// src/api/adminApi.js
// CHANGED: Fixed baseURL - was "/api/admin" but backend endpoints are at "/api"
import axios from "axios";

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // First remove any trailing slashes
  while (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  // Then remove /api if present at the end
  if (url.endsWith("/api")) {
    url = url.slice(0, -4);
  }

  return url;
};

const adminApi = axios.create({
  baseURL: getBaseUrl(),
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔐 Token attached:", token.substring(0, 20) + "...");
  } else {
    console.warn("⚠️ No adminToken found in localStorage!");
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
  async (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data);

    const status = error.response?.status;

    // If 401 Unauthorized or 403 Forbidden, it means token is invalid/expired or user lacks permission
    if (status === 401 || status === 403) {
      console.warn(`⚠️ Authentication error (${status}). Token may be invalid or user not authorized.`);

      // For 401, the token is definitely invalid - clear it
      if (status === 401) {
        localStorage.removeItem("adminToken");
        console.warn("🗑️ Cleared invalid adminToken from localStorage");
      }

      // For 403, it could be a token issue or truly unauthorized access
      // Let individual components handle the redirect to avoid interrupting valid sessions
      // Only auto-redirect for 401
      if (status === 401 && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
