import { api } from "@/services/apiClient";

export const UserService = {
  me: () => api.get("/api/user/me"),
  editMyData: (payload) => api.put("/api/user/editmydata", payload),
};
