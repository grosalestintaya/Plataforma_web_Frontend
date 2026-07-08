// game/services/attemptApi.js
// Cliente de los endpoints de "attempts". Cada seccion del juego final abre un
// intento al empezar y lo cierra con su puntaje al terminar.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"; // sin /api

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// POST /api/activities/:id/attempts -> { attemptId, startedAt }
export async function startActivityAttempt(activityId) {
  const url = `${API_BASE}/api/activities/${encodeURIComponent(activityId)}/attempts`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({}),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

// POST /api/attempts/:attemptId/complete  body: { score, durationMs, payload }
export async function completeAttempt(attemptId, body) {
  const res = await fetch(`${API_BASE}/api/attempts/${attemptId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Cierre best-effort durante beforeunload. `keepalive` permite que el navegador
// intente completar la solicitud aunque la pagina se este cerrando o recargando.
export function completeAttemptKeepalive(attemptId, body) {
  return fetch(`${API_BASE}/api/attempts/${attemptId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
    keepalive: true,
  });
}
