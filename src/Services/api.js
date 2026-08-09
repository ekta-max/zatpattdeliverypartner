// src/Services/api.js
import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8002";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    const isAuthApi =
      config.url.includes("request-otp") ||
      config.url.includes("verify-otp");

    if (accessToken && !isAuthApi) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired");

      const isLoginRequest =
        error.config.url.includes("request-otp") ||
        error.config.url.includes("verify-otp");

      if (!isLoginRequest) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;