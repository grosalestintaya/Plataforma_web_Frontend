// game/data/quizDatabase.js
// Banco de preguntas de repaso, una por cada mision de cada modulo.
// Las respuestas correctas suman puntaje de historia; las incorrectas restan poco
// (el piso final del juego es 60/100, asi que nunca castigan de mas).

export const quizDatabase = {
  m01_quiz: {
    id: "m01_quiz",
    module: "m01",
    question: "¿Cuál de estas opciones es un ejemplo de ingreso?",
    options: [
      { id: "a", label: "La propina que te da tu papá el sábado", correct: true, scoreDelta: 10 },
      { id: "b", label: "Comprar un helado", correct: false, scoreDelta: -3 },
      { id: "c", label: "Prestarle dinero a un amigo", correct: false, scoreDelta: -3 },
    ],
  },

  m02_quiz: {
    id: "m02_quiz",
    module: "m02",
    question: "Quieres las zapatillas nuevas de moda, pero las que tienes aún sirven. Esto es...",
    options: [
      { id: "a", label: "Una necesidad", correct: false, scoreDelta: -3 },
      { id: "b", label: "Un deseo", correct: true, scoreDelta: 10 },
      { id: "c", label: "Un ahorro", correct: false, scoreDelta: -3 },
    ],
  },

  m03_quiz: {
    id: "m03_quiz",
    module: "m03",
    question: "¿Qué elementos debe tener un presupuesto personal?",
    options: [
      { id: "a", label: "Solo los gastos", correct: false, scoreDelta: -3 },
      { id: "b", label: "Ingresos, gastos y ahorro", correct: true, scoreDelta: 10 },
      { id: "c", label: "Solo lo que quieres comprar", correct: false, scoreDelta: -3 },
    ],
  },

  m04_quiz: {
    id: "m04_quiz",
    module: "m04",
    question: "Quieres comprar una bicicleta en 3 meses. ¿Qué te ayuda más a lograrlo?",
    options: [
      { id: "a", label: "Ahorrar un poco cada semana", correct: true, scoreDelta: 10 },
      { id: "b", label: "Gastar todo y esperar que sobre algo", correct: false, scoreDelta: -3 },
      { id: "c", label: "Pedir la bicicleta prestada para siempre", correct: false, scoreDelta: -3 },
    ],
  },

  m05_quiz: {
    id: "m05_quiz",
    module: "m05",
    question: "Un amigo te ofrece prestarte dinero y te pide que le devuelvas el doble en una semana. ¿Qué es esto?",
    options: [
      { id: "a", label: "Un préstamo riesgoso, mejor lo evito", correct: true, scoreDelta: 10 },
      { id: "b", label: "Un regalo, no hay problema", correct: false, scoreDelta: -3 },
      { id: "c", label: "Un ahorro seguro", correct: false, scoreDelta: -3 },
    ],
  },
};
