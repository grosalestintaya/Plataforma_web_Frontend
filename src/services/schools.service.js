import { api } from "./apiClient";

export const SchoolsService = {
  create: (payload) => api.post("/api/schools", payload),
  update: (id, payload) => api.put(`/api/schools/${id}`, payload),
};
