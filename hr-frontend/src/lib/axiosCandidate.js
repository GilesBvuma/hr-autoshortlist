import axios from "axios";
import { useCandidateAuthStore } from "../stores/useCandidateAuthStore";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = useCandidateAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
