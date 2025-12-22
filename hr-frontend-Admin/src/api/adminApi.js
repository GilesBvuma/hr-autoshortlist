// src/api/adminApi.js
// CHANGED: Fixed baseURL - was "/api/admin" but backend endpoints are at "/api"
import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:8080/api",
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
