import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Add token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
//Any call api.post('/login') → goes to http://localhost:8080/login Token automatically included