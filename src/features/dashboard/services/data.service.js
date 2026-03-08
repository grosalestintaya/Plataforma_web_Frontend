import { api } from "@/services/apiClient";

export const DataService = {
  roles: () => api.get("/api/data/roles"),
  grades: () => api.get("/api/data/grades"),
  schools: () => api.get("/api/data/schools"),
};
