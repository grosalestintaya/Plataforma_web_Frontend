// game/data/storyData.js
// Arbol de nodos de la historia del juego final. Cada nodo tiene un "type":
//   - "dialog"   -> texto + boton "Continuar", avanza a node.next
//   - "decision" -> texto + varias opciones (choices), cada una con su propio "next"
//   - "quiz"     -> pregunta de repaso (ver quizDatabase.js), bifurca segun acierto/error
//   - "ending"   -> cierra la historia y pasa a GameplayScene
//
// Fondos: "market_bg" para transiciones genericas (caminar por el mercado) y un
// fondo ilustrado propio por modulo (m0X_bg) para las decisiones y quizzes.

export const storyNodes = {
  // ---------------------------------------------------------------
  // Intro
  // ---------------------------------------------------------------
  intro_story: {
    id: "intro_story",
    type: "dialog",
    background: "market_bg",
    text: "Llegaste a la tienda con tus ahorros del semestre. Es hora de repasar todo lo que aprendiste sobre el dinero.",
    next: "m01_decision",
  },

  // ---------------------------------------------------------------
  // Modulo 1: El dinero y mis decisiones cotidianas
  // ---------------------------------------------------------------
  m01_decision: {
    id: "m01_decision",
    type: "decision",
    module: "m01",
    background: "m01_bg",
    text: "Antes de comprar algo, ¿qué haces primero?",
    choices: [
      {
        id: "compare",
        label: "Comparar precios antes de comprar",
        next: "m01_good",
        scoreDelta: 10,
      },
      {
        id: "impulse",
        label: "Comprar lo primero que ves",
        next: "m01_bad",
        scoreDelta: -5,
      },
    ],
  },
  m01_good: {
    id: "m01_good",
    type: "dialog",
    background: "m01_bg",
    text: "Comparaste precios y ahorraste algunos Intis. ¡Buena decisión!",
    next: "m01_quiz",
  },
  m01_bad: {
    id: "m01_bad",
    type: "dialog",
    background: "m01_bg",
    text: "Compraste sin pensar y te quedaste sin Intis para el resto del día.",
    next: "m01_quiz",
  },
  m01_quiz: {
    id: "m01_quiz",
    type: "quiz",
    module: "m01",
    background: "m01_bg",
    text: "Repasemos un poco antes de seguir.",
    quizRef: "m01_quiz",
    onCorrectNext: "m02_intro",
    onIncorrectNext: "m02_intro",
  },

  // ---------------------------------------------------------------
  // Modulo 2: Necesidades, deseos y consumo responsable
  // ---------------------------------------------------------------
  m02_intro: {
    id: "m02_intro",
    type: "dialog",
    background: "market_bg",
    text: "Sigues caminando por el mercado y ves algo que todos tus amigos ya tienen.",
    next: "m02_decision",
  },
  m02_decision: {
    id: "m02_decision",
    type: "decision",
    module: "m02",
    background: "m02_bg",
    text: "¿Qué haces?",
    choices: [
      {
        id: "think",
        label: "Pensar si realmente lo necesitas",
        next: "m02_good",
        scoreDelta: 10,
      },
      {
        id: "peer_pressure",
        label: "Comprarlo porque todos lo tienen",
        next: "m02_bad",
        scoreDelta: -5,
      },
    ],
  },
  m02_good: {
    id: "m02_good",
    type: "dialog",
    background: "m02_bg",
    text: "Te diste cuenta de que era solo un deseo, no una necesidad. Guardaste tus Intis.",
    next: "m02_quiz",
  },
  m02_bad: {
    id: "m02_bad",
    type: "dialog",
    background: "m02_bg",
    text: "Compraste por presión social y gastaste Intis que necesitabas para otra cosa.",
    next: "m02_quiz",
  },
  m02_quiz: {
    id: "m02_quiz",
    type: "quiz",
    module: "m02",
    background: "m02_bg",
    text: "Una pregunta rapida antes de seguir.",
    quizRef: "m02_quiz",
    onCorrectNext: "act2_intro",
    onIncorrectNext: "act2_intro",
  },

  // ---------------------------------------------------------------
  // Transicion Acto 2
  // ---------------------------------------------------------------
  act2_intro: {
    id: "act2_intro",
    type: "dialog",
    background: "m03_bg",
    text: "Al final del día, decides organizar todo lo que ganaste y gastaste.",
    next: "m03_decision",
  },

  // ---------------------------------------------------------------
  // Modulo 3: Mi presupuesto en accion
  // ---------------------------------------------------------------
  m03_decision: {
    id: "m03_decision",
    type: "decision",
    module: "m03",
    background: "m03_bg",
    text: "¿Cómo organizas tus Intis del día?",
    choices: [
      {
        id: "budget",
        label: "Anotar cuánto entró y cuánto salió",
        next: "m03_good",
        scoreDelta: 10,
      },
      {
        id: "no_budget",
        label: "No anotar nada, ya lo recordarás",
        next: "m03_bad",
        scoreDelta: -5,
      },
    ],
  },
  m03_good: {
    id: "m03_good",
    type: "dialog",
    background: "m03_bg",
    text: "Anotaste tus ingresos y gastos. Ahora sabes exactamente cuánto te queda.",
    next: "m03_quiz",
  },
  m03_bad: {
    id: "m03_bad",
    type: "dialog",
    background: "m03_bg",
    text: "Sin anotar nada, no recuerdas en qué se te fueron los Intis.",
    next: "m03_quiz",
  },
  m03_quiz: {
    id: "m03_quiz",
    type: "quiz",
    module: "m03",
    background: "m03_bg",
    text: "Repasemos presupuesto.",
    quizRef: "m03_quiz",
    onCorrectNext: "m04_intro",
    onIncorrectNext: "m04_intro",
  },

  // ---------------------------------------------------------------
  // Modulo 4: Planifico metas con ahorro e inversion basica
  // ---------------------------------------------------------------
  m04_intro: {
    id: "m04_intro",
    type: "dialog",
    background: "m04_bg",
    text: "Te queda un poco de dinero extra esta semana. Sueñas con una meta.",
    next: "m04_decision",
  },
  m04_decision: {
    id: "m04_decision",
    type: "decision",
    module: "m04",
    background: "m04_bg",
    text: "¿Qué haces con el dinero extra?",
    choices: [
      {
        id: "save",
        label: "Guardarlo poco a poco para tu meta",
        next: "m04_good",
        scoreDelta: 10,
      },
      {
        id: "risk",
        label: "Usarlo todo en algo arriesgado ahora",
        next: "m04_bad",
        scoreDelta: -5,
      },
    ],
  },
  m04_good: {
    id: "m04_good",
    type: "dialog",
    background: "m04_bg",
    text: "Ahorrando un poco cada semana, te acercas cada vez más a tu meta.",
    next: "m04_quiz",
  },
  m04_bad: {
    id: "m04_bad",
    type: "dialog",
    background: "m04_bg",
    text: "Arriesgaste todo el dinero y ahora tu meta está más lejos.",
    next: "m04_quiz",
  },
  m04_quiz: {
    id: "m04_quiz",
    type: "quiz",
    module: "m04",
    background: "m04_bg",
    text: "Una ultima pregunta sobre metas y ahorro.",
    quizRef: "m04_quiz",
    onCorrectNext: "act3_intro",
    onIncorrectNext: "act3_intro",
  },

  // ---------------------------------------------------------------
  // Transicion Acto 3
  // ---------------------------------------------------------------
  act3_intro: {
    id: "act3_intro",
    type: "dialog",
    background: "m05_bg",
    text: "Justo cuando vas de vuelta a casa, alguien se te acerca con una propuesta.",
    next: "m05_decision",
  },

  // ---------------------------------------------------------------
  // Modulo 5: Decisiones financieras responsables
  // ---------------------------------------------------------------
  m05_decision: {
    id: "m05_decision",
    type: "decision",
    module: "m05",
    background: "m05_bg",
    text: "Un conocido te ofrece prestarte Intis, pero tendrías que devolver mucho más. ¿Qué haces?",
    choices: [
      {
        id: "reject",
        label: "Rechazar el préstamo riesgoso",
        next: "m05_good",
        scoreDelta: 10,
      },
      {
        id: "accept",
        label: "Aceptar el préstamo sin pensarlo",
        next: "m05_bad",
        scoreDelta: -5,
      },
    ],
  },
  m05_good: {
    id: "m05_good",
    type: "dialog",
    background: "m05_bg",
    text: "Rechazaste el préstamo riesgoso. Evitaste una deuda que no podías pagar.",
    next: "m05_quiz",
  },
  m05_bad: {
    id: "m05_bad",
    type: "dialog",
    background: "m05_bg",
    text: "Aceptaste el préstamo y ahora debes devolver mucho más de lo que recibiste.",
    next: "m05_quiz",
  },
  m05_quiz: {
    id: "m05_quiz",
    type: "quiz",
    module: "m05",
    background: "m05_bg",
    text: "Ultima pregunta de repaso.",
    quizRef: "m05_quiz",
    onCorrectNext: "story_ending",
    onIncorrectNext: "story_ending",
  },

  // ---------------------------------------------------------------
  // Cierre de la historia
  // ---------------------------------------------------------------
  story_ending: {
    id: "story_ending",
    type: "ending",
    background: "casa_bg",
    text: "Terminaste tu día en el mercado. Ahora, un último desafío pondrá a prueba todo lo aprendido.",
  },
};
