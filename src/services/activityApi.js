const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// POST /api/activities/:id/attempts -> { attemptId, startedAt }
export async function startActivityAttempt(activityId) {
  const res = await fetch(`${API_BASE}/api/activities/${activityId}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
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
