export default {
  id: "a03a",
  kind: "actitudinal",
  title: "Actividad Actitudinal: Hábitos con el dinero",
  xp: 50,
  screens: [
    {
      id: "s1",
      type: "intro",
      title: "Tu actitud importa",
      body:
        "Las finanzas personales también son hábitos y decisiones.\n\n" +
        "Meta: reconocer un hábito que quieras mejorar esta semana.",
    },

    {
      id: "s2",
      type: "microstory",
      title: "Dilema",
      paragraphs: [
        "Marco quiere ahorrar para un juego, pero cada día compra algo pequeño.",
        "Cuando llega el fin de semana, no le alcanza para su meta.",
      ],
      character: "Marco",
      setting: "Semana escolar",
    },

    {
      id: "s3",
      type: "reflection",
      variant: "scale",
      prompt: "¿Qué tan seguido gastas en cosas pequeñas sin planearlo?",
      scale: { min: 1, max: 5, labels: ["Nunca", "Rara vez", "A veces", "Casi siempre", "Siempre"] },
    },

    {
      id: "s4",
      type: "simulation",
      title: "Decisión con consecuencias",
      scenario:
        "Tienes S/10.\n" +
        "Opción A: gastas S/3 en snacks hoy.\n" +
        "Opción B: guardas esos S/3 para tu meta.\n\n" +
        "¿Qué eliges?",
      choices: [
        {
          id: "a",
          label: "Gasto hoy (snacks)",
          delta: { xp: 5, coins: 2 },
          resultText: "Satisfacción inmediata, pero tu meta avanza más lento.",
        },
        {
          id: "b",
          label: "Ahorro para mi meta",
          delta: { xp: 20, coins: 10 },
          resultText: "Gran decisión: priorizaste tu objetivo.",
        },
      ],
    },

    {
      id: "s5",
      type: "reflection",
      variant: "text",
      prompt:
        "Escribe una acción concreta para mejorar tu hábito esta semana.\n" +
        "Ejemplo: “Guardaré S/2 los lunes, miércoles y viernes”.",
    },

    {
      id: "s6",
      type: "checkpoint",
      title: "Checkpoint",
      earned: { xp: 50, coins: 10, badgeId: "m01-a03a" },
      message:
        "Excelente. Identificaste un hábito y definiste una acción.\n" +
        "Continúa al siguiente módulo cuando estés listo.",
    },
  ],
};
