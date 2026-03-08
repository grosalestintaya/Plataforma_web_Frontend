// Catálogo simple: (moduleKey -> type -> textos)
// Puedes afinar textos cuando tengas el contenido final.
export const ACTIVITY_LEARN = {
  m01: {
    conceptual: {
      learn: [
        "Qué son las finanzas personales y por qué importan",
        "Ingresos, gastos, ahorro y metas en una sola idea",
      ],
      outcome: "Tendrás claridad para ordenar tu dinero.",
    },
    procedimental: {
      learn: [
        "Diferenciar ingresos vs. gastos",
        "Clasificar gastos fijos, variables y hormiga",
      ],
      outcome: "Podrás registrar y entender tus gastos reales.",
    },
    actitudinal: {
      learn: [
        "Distinguir necesidad vs. deseo",
        "Tomar decisiones de compra con intención",
      ],
      outcome: "Tomarás mejores decisiones al gastar.",
    },
  },

  m02: {
    conceptual: {
      learn: ["Qué es un presupuesto", "Categorías básicas para presupuestar"],
      outcome: "Entenderás cómo se arma un presupuesto.",
    },
    procedimental: {
      learn: ["Armar un presupuesto mensual", "Asignar límites por categoría"],
      outcome: "Podrás crear tu presupuesto y hacerlo realista.",
    },
    actitudinal: {
      learn: ["Hábitos para gastar con intención", "Control sin frustración"],
      outcome: "Crearás hábitos sostenibles.",
    },
  },

  // agrega m03..m06 cuando quieras
};

export function getLearnFor(moduleKey, activityType) {
  return ACTIVITY_LEARN?.[moduleKey]?.[activityType] || null;
}
