import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Extrae un numero valido desde un valor potencialmente vacio.
 * Se usa para normalizar la respuesta del backend antes de guardarla en runtime.
 */
function pickRewardNumber(...values) {
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

  const xp = pickRewardNumber(awarded?.xp, source?.awardedXp, source?.xpAward);

  const coins = pickRewardNumber(
    awarded?.coins,
    source?.awardedCoins,
    source?.coinsAward,
  );

  // Si el backend responde `alreadyCompleted`, ya no existe delta de recompensa.
  if (xp === null && coins === null)
    return {
      xp: xp ?? 0,
      coins: coins ?? 0,
      raw: source,
    };

  return {
    xp: xp ?? 0,
    coins: coins ?? 0,
    raw: source,
  };
}

/**
 * Resuelve la siguiente mision del modulo para volver al menu ya preseleccionado.
 */
function getNextMissionKey(moduleData, missionKey) {
  const missionKeys = Object.keys(moduleData?.missions ?? {});
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
