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

    // If 401 Unauthorized, it means token is invalid or expired
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Token expired or invalid. Logging out...");
      localStorage.removeItem("adminToken");

      // Use window.location.href to force a clean reset/redirect if necessary
      // or try to clear the zustand store if you can import it without circularity
      // For now, removing the token is enough because the next refresh or state check will fail.
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
