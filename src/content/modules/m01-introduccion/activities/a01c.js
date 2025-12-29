export default {
  id: "a01c",
  kind: "conceptual",
  title: "Actividad Conceptual: ¿Qué son las finanzas personales?",
  xp: 60,
  screens: [
    {
      id: "s1",
      type: "intro",
      title: "Arrancamos",
      body:
        "Hoy entenderás qué son las finanzas personales y por qué importan.\n\n" +
        "Meta: terminarás pudiendo explicar el concepto con tus propias palabras.",
      ctaLabel: "Empezar",
    },

    {
      id: "s2",
      type: "microstory",
      title: "Historia corta",
      paragraphs: [
        "Ariana recibe S/20 a la semana. Un día compra snacks y se queda sin dinero para imprimir una tarea.",
        "Se da cuenta de que no es solo ‘tener dinero’, sino saber usarlo.",
      ],
      character: "Ariana",
      setting: "Colegio / semana de clases",
    },

    {
      id: "s3",
      type: "content",
      variant: "split",
      title: "Definición simple",
      body:
        "Las finanzas personales son la forma en la que administras tu dinero:\n" +
        "- lo que ganas (ingresos)\n" +
        "- lo que gastas (gastos)\n" +
        "- lo que guardas (ahorro)\n" +
        "- lo que planificas (metas)\n\n" +
        "No se trata de ser ‘rico’, sino de tomar buenas decisiones.",
      highlights: ["ingresos", "gastos", "ahorro", "metas"],
      media: {
        img: "/modules/m01/img/finanzas-def.png", // opcional: si usas public/
      },
    },

    {
      id: "s4",
      type: "truefalse",
      statement: "Las finanzas personales solo importan cuando eres adulto.",
      answer: false,
      feedback: {
        ok: "Correcto. Desde ahora ya tomas decisiones de gasto y ahorro.",
        fail: "No exactamente. Las decisiones empiezan desde joven (gastos, ahorros, objetivos).",
      },
    },

    {
      id: "s5",
      type: "quiz",
      variant: "single",
      question: "¿Cuál ejemplo es una decisión de finanzas personales?",
      options: [
        "Elegir ahorrar S/5 para una meta",
        "Cambiar el color del cuaderno",
        "Ver una serie",
        "Dormir temprano",
      ],
      answerIndex: 0,
      feedback: {
        ok: "Bien. Ahorrar para una meta es administrar recursos.",
        fail: "Pista: finanzas personales se relaciona con decisiones sobre dinero.",
      },
    },

    {
      id: "s6",
      type: "match",
      prompt: "Empareja cada concepto con su ejemplo:",
      pairs: [
        { left: "Ingreso", right: "Propina / pago por ayudar" },
        { left: "Gasto", right: "Comprar snacks o pasaje" },
        { left: "Ahorro", right: "Guardar una parte cada semana" },
        { left: "Meta", right: "Comprar un libro o audífonos" },
      ],
      feedback: {
        ok: "Excelente. Ya manejas los conceptos base.",
        fail: "Vuelve a intentarlo: piensa en qué entra, qué sale y qué se guarda.",
      },
    },

    {
      id: "s7",
      type: "checkpoint",
      title: "Checkpoint",
      earned: { xp: 60, coins: 10, badgeId: "m01-a01c" },
      message:
        "Listo. Ya tienes la base.\n" +
        "En la siguiente actividad lo aplicarás en un caso real.",
    },
  ],
};
