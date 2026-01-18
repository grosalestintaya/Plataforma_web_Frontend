// src/services/AuthService.js
import { api } from "./apiClient";

export const AuthService = {
  login: (payload) => api.post("/api/user/login", payload, { extra: { auth: false } }),
  me: () => api.get("/api/user/me"),
  checkSession: () => api.get("/api/user/check-session"),
};
