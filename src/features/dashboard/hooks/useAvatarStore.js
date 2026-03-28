import { useCallback, useEffect, useMemo, useState } from "react";
import { AvatarStoreService } from "../services/avatarStore.service";

function mergeCatalogWithOwned(catalogRes, mineRes) {
  const ownedMap = new Map(
    (mineRes?.data || []).map((item) => [
      item.avatar.id_avatar,
      {
        id_user_avatar: item.id_user_avatar,
        purchased_at: item.purchased_at,
        equipped: Boolean(item.equipped),
      },
    ]),
  );

  return (catalogRes?.data || []).map((avatar) => {
    const ownedInfo = ownedMap.get(avatar.id_avatar);

    return {
      ...avatar,
      owned: Boolean(ownedInfo),
      equipped: Boolean(ownedInfo?.equipped),
      purchased_at: ownedInfo?.purchased_at || null,
      id_user_avatar: ownedInfo?.id_user_avatar || null,
    };
  });
}

function getPayloadError(payload, fallbackMessage) {
  if (!payload?.ok) {
    const err = new Error(payload?.message || fallbackMessage);
    err.data = payload;
    throw err;
  }
  return payload;
}

function getPurchaseErrorMessage(payload) {
  if (
    typeof payload?.current_coins === "number" &&
    typeof payload?.required_coins === "number"
  ) {
    return `${payload.message}. Tienes ${payload.current_coins} y necesitas ${payload.required_coins} monedas.`;
  }

  return payload?.message || "No se pudo comprar el avatar.";
}

export function useAvatarStore() {
  const [avatars, setAvatars] = useState([]);
  const [wallet, setWallet] = useState({ xp_total: 0, coins_total: 0 });
  const [pinnedImg, setPinnedImg] = useState(null);

  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyAvatarId, setBusyAvatarId] = useState(null);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadStoreData = useCallback(async ({ showPageLoader = true } = {}) => {
    if (showPageLoader) setLoading(true);

    setError("");

    try {
      const [catalogRes, mineRes] = await Promise.all([
        AvatarStoreService.getCatalog(),
        AvatarStoreService.getMine(),
      ]);

      getPayloadError(catalogRes, "No se pudo cargar el catálogo de avatares.");
      getPayloadError(mineRes, "No se pudo cargar los avatares del usuario.");

      const merged = mergeCatalogWithOwned(catalogRes, mineRes);

      setAvatars(merged);
      setWallet(catalogRes.wallet || { xp_total: 0, coins_total: 0 });
      setPinnedImg(mineRes.pinned_img || null);
    } catch (err) {
      setError(err.message || "Ocurrió un error cargando la tienda.");
    } finally {
      if (showPageLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  useEffect(() => {
    if (!feedback) return;

    const timeout = setTimeout(() => {
      setFeedback("");
    }, 2600);

    return () => clearTimeout(timeout);
  }, [feedback]);

  const visibleAvatars = useMemo(() => {
    if (filter === "owned") return avatars.filter((avatar) => avatar.owned);
    if (filter === "shop") return avatars.filter((avatar) => !avatar.owned);
    return avatars;
  }, [avatars, filter]);

  const equippedAvatarName = useMemo(() => {
    const equipped = avatars.find((avatar) => avatar.equipped);
    return equipped?.name || pinnedImg || "Sin avatar equipado";
  }, [avatars, pinnedImg]);

  const purchaseAvatar = useCallback(
    async (avatar) => {
      setBusyAvatarId(avatar.id_avatar);
      setError("");
      setFeedback("");

      try {
        const res = await AvatarStoreService.purchase(avatar.id_avatar);

        if (!res?.ok) {
          throw new Error(getPurchaseErrorMessage(res));
        }

        setFeedback(res.message || "Avatar comprado correctamente.");
        await loadStoreData({ showPageLoader: false });
      } catch (err) {
        setError(err.message || "No se pudo comprar el avatar.");
      } finally {
        setBusyAvatarId(null);
      }
    },
    [loadStoreData],
  );

  const equipAvatar = useCallback(
    async (avatar) => {
      setBusyAvatarId(avatar.id_avatar);
      setError("");
      setFeedback("");

      try {
        const res = await AvatarStoreService.equip(avatar.id_avatar);

        if (!res?.ok) {
          throw new Error(res?.message || "No se pudo equipar el avatar.");
        }

        setFeedback(res.message || "Avatar equipado correctamente.");
        await loadStoreData({ showPageLoader: false });
      } catch (err) {
        setError(err.message || "No se pudo equipar el avatar.");
      } finally {
        setBusyAvatarId(null);
      }
    },
    [loadStoreData],
  );

  return {
    avatars: visibleAvatars,
    wallet,
    loading,
    error,
    feedback,
    filter,
    setFilter,
    busyAvatarId,
    purchaseAvatar,
    equipAvatar,
    equippedAvatarName,
  };
}
