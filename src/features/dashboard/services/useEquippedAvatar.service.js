// src/features/dashboard/hooks/useEquippedAvatar.js

import { useState, useEffect } from "react";
import { api } from "@/services/apiClient.js";

export function useEquippedAvatar() {
  const [imgAvatar, setImgAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/me/avatars")
      .then((res) => {
        if (!res?.ok)
          throw new Error(res?.message || "Error al cargar avatares.");

        const equipped = (res.data ?? []).find((item) => item.equipped);
        // equipped?.avatar.img_avatar → "avatar_f_base"
        // fallback a pinned_img si ninguno está equipado
        setImgAvatar(equipped?.avatar?.img_avatar ?? res.pinned_img ?? null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { imgAvatar, loading, error };
}
