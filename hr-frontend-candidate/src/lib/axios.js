import axios from "axios";

const candidateApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api", // Changed to use environment variable
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
  (error) => {
    console.error("❌ Candidate API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default candidateApi;