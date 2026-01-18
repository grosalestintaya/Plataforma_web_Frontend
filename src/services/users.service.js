import { api } from "./apiClient";

export const UsersService = {
  create: (payload) => api.post("/api/user", payload),
   list: () => api.get("/api/user"),
  getById: (id) => api.get(`/api/user/get_user/${id}`),
  update: (payload) => api.put("/api/user/editUserData", payload),
};

 