// src/services/grades.service.js
import { api } from "./apiClient";

export const GradesService = {
  list: () => api.get("/api/data/grades"),
   create: (payload) => api.post("/api/grades", payload),
  update: (id, payload) => api.put(`/api/grades/${id}`, payload),
};
