import {
  startActivityAttempt,
  completeAttempt,
} from "../../../services/activityApi";

/**
 * Genera la clave de cache del intento actual.
 */
export function getAttemptCacheKey(activityRef) {
  return `attempt:${activityRef.moduleCode}:${activityRef.activityCode}`;
}

/**
 * Lee un intento guardado en sessionStorage.
 */
export function readCachedAttempt(activityRef) {
  const cacheKey = getAttemptCacheKey(activityRef);
  const cachedRaw = sessionStorage.getItem(cacheKey);

  if (!cachedRaw) return null;

  try {
    const parsed = JSON.parse(cachedRaw);
    if (!parsed?.attemptId || !parsed?.startedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Guarda el intento actual en sessionStorage.
 */
export function writeCachedAttempt(activityRef, attempt) {
  const cacheKey = getAttemptCacheKey(activityRef);
  sessionStorage.setItem(cacheKey, JSON.stringify(attempt));
}

/**
 * Elimina del cache el intento de la actividad actual.
 */
export function clearCachedAttempt(activityRef) {
  const cacheKey = getAttemptCacheKey(activityRef);
  sessionStorage.removeItem(cacheKey);
}

/**
 * Recupera un intento existente o crea uno nuevo en backend.
 */
export async function ensureActivityAttempt(activityRef) {
  const cachedAttempt = readCachedAttempt(activityRef);
  if (cachedAttempt) return cachedAttempt;

  const attempt = await startActivityAttempt(activityRef.backendActivityId);

  if (!attempt?.attemptId || !attempt?.startedAt) {
    throw new Error("Backend no devolvió attemptId/startedAt.");
  }

  writeCachedAttempt(activityRef, attempt);
  return attempt;
}

/**
 * Envía el cierre del intento al backend.
 */
export async function submitActivityAttempt(attemptId, body) {
  return completeAttempt(attemptId, body);
}