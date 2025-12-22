import axios from "axios";

const candidateApi = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Candidate token interceptor (if you implement candidate auth later)
candidateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("candidateToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default candidateApi;