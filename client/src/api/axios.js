import axios from "axios";

const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

const API_BASE_URL = envUrl || (
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "http://localhost:5000"
);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clickpilot_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { API_BASE_URL };
export default api;
