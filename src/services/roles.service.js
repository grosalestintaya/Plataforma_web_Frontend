import { api } from "./apiClient";

export const RolesService = {
  create: (payload) => api.post("/api/roles", payload),
  update: (id, payload) => api.put(`/api/roles/${id}`, payload),
};
