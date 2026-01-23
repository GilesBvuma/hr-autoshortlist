import axios from "axios";

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  return url.endsWith("/api") ? url : `${url}/api`;
};

const candidateApi = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json"
  }
});

candidateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("candidateToken"); // Ensure this matches what we save
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("🔵 Candidate API Request:", config.method.toUpperCase(), config.baseURL + config.url);

  return config;
});

candidateApi.interceptors.response.use(
  (response) => {
    console.log("✅ Candidate API Response:", response.status, response.data);
    return response;
  },
  async (error) => {
    console.error("❌ Candidate API Error:", error.response?.status, error.response?.data);

    // Auto-logout on 401 (stale/invalid token)
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Candidate Token expired. Logging out...");
      localStorage.removeItem("candidateToken");
      localStorage.removeItem("userData");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default candidateApi;