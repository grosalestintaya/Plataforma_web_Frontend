// game/config/activities.js
// activityId de backend para cada seccion del juego final. Cada seccion abre su
// propio "attempt" (POST /api/activities/:id/attempts) al empezar y lo cierra
// (POST /api/attempts/:attemptId/complete) al terminar, con su puntaje 60-100.
export const ACTIVITY_IDS = {
  story: 16,
  banker: 17,
  runner: 18,
};
