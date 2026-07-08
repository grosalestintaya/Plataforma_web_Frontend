// game/data/runnerGates.js
// Puertas de decision del recorrido: ocupan el carril izquierdo y el derecho
// con una opcion cada una. El carril central siempre es "neutral" (esquivar
// la decision, sin efecto). Se repiten en bucle mientras dure la carrera.
export const runnerGates = [
  {
    id: "gate_ahorrar",
    leftLabel: "Ahorrar",
    leftDelta: 12,
    leftFeedback: "¡Guardaste tus Intis!",
    rightLabel: "Gastar todo",
    rightDelta: -6,
    rightFeedback: "Gastaste sin pensar...",
  },
  {
    id: "gate_comparar",
    leftLabel: "Comparar precios",
    leftDelta: 10,
    leftFeedback: "Buena decisión, ahorraste.",
    rightLabel: "Comprar rápido",
    rightDelta: -5,
    rightFeedback: "Pagaste más de la cuenta.",
  },
  {
    id: "gate_prestamo",
    leftLabel: "Rechazar préstamo",
    leftDelta: 12,
    leftFeedback: "Evitaste una deuda riesgosa.",
    rightLabel: "Aceptar préstamo",
    rightDelta: -8,
    rightFeedback: "Ahora debes devolver el doble.",
  },
  {
    id: "gate_meta",
    leftLabel: "Seguir tu meta",
    leftDelta: 10,
    leftFeedback: "Un paso más cerca de tu meta.",
    rightLabel: "Gastar en un capricho",
    rightDelta: -6,
    rightFeedback: "Te alejaste de tu meta.",
  },
];
