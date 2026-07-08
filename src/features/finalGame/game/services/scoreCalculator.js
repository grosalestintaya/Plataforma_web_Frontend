// game/services/scoreCalculator.js
// Cada seccion produce un puntaje crudo (0..max) que se normaliza a un rango
// 60-100. Al ser un juego educativo, el piso de 60 evita castigar de mas y
// motiva a seguir aprendiendo. Las 3 secciones se puntuan de forma
// independiente y al final se muestran por separado (mas un promedio).
export const MIN_SECTION_SCORE = 60;
export const MAX_SECTION_SCORE = 100;
export const MAX_STORY_SCORE = 50;
export const MAX_BANKER_SCORE = 25;
export const MAX_GAMEPLAY_SCORE = 25;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Convierte un puntaje crudo (0..maxRaw) al rango 60-100 de una seccion.
export function toSectionScore(raw, maxRaw) {
  const normalized = clamp(raw, 0, maxRaw) / maxRaw;
  return Math.round(MIN_SECTION_SCORE + normalized * (MAX_SECTION_SCORE - MIN_SECTION_SCORE));
}

// Promedio de los puntajes 60-100 de las tres secciones.
export function averageSectionScores(scores) {
  const valid = scores.filter((s) => typeof s === "number");
  if (!valid.length) return MIN_SECTION_SCORE;
  return Math.round(valid.reduce((sum, s) => sum + s, 0) / valid.length);
}
