// src/api/http.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const http = axios.create({
  baseURL,
  timeout: 15000,
});

// =========================
// Request: token automático
// =========================
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// Response: interceptar 401
// =========================
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Limpieza sesión
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // si guardas algo extra

      // Evita loops si ya estás en login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
