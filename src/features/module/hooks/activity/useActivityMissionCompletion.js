import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Extrae un numero valido desde un valor potencialmente vacio.
 * Se usa para normalizar la respuesta del backend antes de guardarla en runtime.
 */
function pickRewardNumber(...values) {
  // Acepta varias formas de respuesta para tolerar cambios pequenos del backend.
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

/**
 * Resume XP e Intis ganados para que postGame use datos reales.
 * El backend de `completeAttempt` responde con:
 * - `awarded.xp`
 * - `awarded.coins`
 * `wallet` trae acumulados totales y no sirve para esta vista.
 */
function extractMissionCompletionSummary(result) {
  const source = result ?? {};
  const awarded = source?.awarded ?? {};

  const xp = pickRewardNumber(
    awarded?.xp,
    source?.awardedXp,
    source?.xpAward,
  );

  const coins = pickRewardNumber(
    awarded?.coins,
    source?.awardedCoins,
    source?.coinsAward,
  );

  // Si el backend responde `alreadyCompleted`, ya no existe delta de recompensa.
  if (xp === null && coins === null) return null;

  return {
    xp: xp ?? 0,
    coins: coins ?? 0,
    raw: source,
  };
}

function getOrderedMissionKeys(moduleData) {
  const entries = Object.entries(moduleData?.missions ?? {});

  // Si el contenido declara `order`, lo respetamos; si no, conservamos el
  // orden de insercion actual para no cambiar misiones existentes.
  return entries
    .map(([key, mission], index) => ({
      key,
      index,
      order: Number(mission?.order),
    }))
    .sort((a, b) => {
      const aHasOrder = Number.isFinite(a.order);
      const bHasOrder = Number.isFinite(b.order);

      if (aHasOrder && bHasOrder && a.order !== b.order) {
        return a.order - b.order;
      }

      if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;

      return a.index - b.index;
    })
    .map((entry) => entry.key);
}

/**
 * Resuelve la siguiente mision del modulo para volver al menu ya preseleccionado.
 */
function getNextMissionKey(moduleData, missionKey) {
  const missionKeys = getOrderedMissionKeys(moduleData);
  const currentIndex = missionKeys.indexOf(missionKey);

  if (currentIndex < 0) return null;
  return missionKeys[currentIndex + 1] ?? null;
}

/**
 * Guarda el resumen final que luego consume Lobby postGame.
 */
export function useActivityMissionCompletion(moduleData, missionKey) {
  const [missionCompletion, setMissionCompletion] = useState(null);

  useEffect(() => {
    // Cada nueva mision limpia el resumen final de recompensas.
    setMissionCompletion(null);
  }, [missionKey]);

  const nextMissionKey = useMemo(
    () => getNextMissionKey(moduleData, missionKey),
    [moduleData, missionKey],
  );

  const registerMissionCompletion = useCallback((result) => {
    setMissionCompletion(extractMissionCompletionSummary(result));
  }, []);

  return {
    missionCompletion,
    nextMissionKey,
    registerMissionCompletion,
  };
}
