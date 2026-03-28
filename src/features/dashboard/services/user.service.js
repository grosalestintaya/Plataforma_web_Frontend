import { api } from "@/services/apiClient";

export const UserService = {
  me() {
    return api.get("/api/user/me");
  },

  editMyData(payload) {
    return api.put("/api/user/editmydata", payload);
  },

  getMyAvatars() {
    return api.get("/api/me/avatars");
  },

  equipMyAvatar(idAvatar) {
    return api.patch("/api/me/avatar/equip", {
      id_avatar: idAvatar,
    });
  },
};
