// game/services/attemptTracker.js
// Orquesta el ciclo de vida del "attempt" de cada seccion (best-effort): abre
// el intento al empezar, mide la duracion, y lo cierra con el puntaje al
// terminar. Si no hay token o el backend falla, solo se registra en consola —
// el juego nunca se interrumpe. Las secciones son secuenciales, asi que basta
// con recordar el intento activo (para el cierre por beforeunload).
import {
  startActivityAttempt,
  completeAttempt,
  completeAttemptKeepalive,
} from "./attemptApi";

let active = null;

// Abre el intento de una seccion. `startActivityAttempt` corre en segundo plano;
// si falla, el attemptId queda en null y los cierres se saltan silenciosamente.
export function beginSection(activityId) {
  const section = {
    activityId,
    startTime: Date.now(),
    attemptId: null,
    attemptPromise: null,
    score: 0,
    payload: {},
    done: false,
  };

  section.attemptPromise = startActivityAttempt(activityId)
    .then((res) => {
      section.attemptId = res?.attemptId ?? null;
      return res;
    })
    .catch((err) => {
      console.warn(`[finalGame] no se pudo iniciar el intento (activity ${activityId}):`, err.message);
      return null;
    });

  active = section;
}

// Guarda el progreso parcial para que el cierre por beforeunload tenga datos.
export function updateProgress(score, payload) {
  if (!active) return;
  active.score = score;
  if (payload) active.payload = payload;
}

// Cierra el intento activo con el puntaje final de la seccion.
export async function completeSection(score, payload = {}) {
  if (!active || active.done) return;
  const section = active;
  section.done = true;
  section.score = score;
  section.payload = payload;

  const durationMs = Date.now() - section.startTime;

  try {
    await section.attemptPromise;
    if (!section.attemptId) return; // sin token/backend: best-effort
    await completeAttempt(section.attemptId, { score, durationMs, payload });
  } catch (err) {
    console.warn(`[finalGame] no se pudo completar el intento (activity ${section.activityId}):`, err.message);
  } finally {
    if (active === section) active = null;
  }
}

function handleBeforeUnload() {
  if (!active || active.done || !active.attemptId) return;
  const durationMs = Date.now() - active.startTime;
  try {
    completeAttemptKeepalive(active.attemptId, {
      score: active.score,
      durationMs,
      payload: active.payload ?? {},
    });
  } catch {
    // best-effort: no hay nada mas que hacer si el navegador se esta cerrando
  }
}

export function registerUnloadHandler() {
  window.addEventListener("beforeunload", handleBeforeUnload);
}

export function unregisterUnloadHandler() {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  active = null;
}
