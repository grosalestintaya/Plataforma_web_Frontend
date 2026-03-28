import { api } from "@/services/apiClient.js";

export const AvatarStoreService = {
  getCatalog() {
    return api.get("/api/avatars");
  },

  getMine() {
    return api.get("/api/me/avatars");
  },

  purchase(idAvatar) {
    return api.post(`/api/avatars/${idAvatar}/purchase`);
  },

  equip(idAvatar) {
    return api.patch("/api/me/avatar/equip", {
      id_avatar: idAvatar,
    });
  },
};
