import axios from "axios";

/* FRONTEND_URL – public base used for QR codes and any client‑side public links */
const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "");

/* BACKEND API URL – used for all Axios requests */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "");
const PUBLIC_URL = "https://click-pilot.vercel.app";
const effectiveFrontend = FRONTEND_URL ? (FRONTEND_URL.includes("localhost") ? PUBLIC_URL : FRONTEND_URL) : PUBLIC_URL;

export const getShortUrl = (shortCode) => `${effectiveFrontend}/s/${shortCode}`;
export { API_BASE_URL, FRONTEND_URL };
// Create a reusable Axios instance for API calls
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  withCredentials: true,
});

// JWT interceptor to attach token to Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clickpilot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
