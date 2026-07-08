// game/services/storyEngine.js
// Funciones puras para navegar el arbol de storyData.js sin acoplarlas a Phaser,
// asi StoryScene solo se encarga de dibujar lo que este modulo le indica.
import { storyNodes } from "../data/storyData";
import { quizDatabase } from "../data/quizDatabase";

export function getNode(nodeId) {
  const node = storyNodes[nodeId];
  if (!node) throw new Error(`Story node "${nodeId}" no existe`);
  return node;
}

export function getQuiz(quizRef) {
  const quiz = quizDatabase[quizRef];
  if (!quiz) throw new Error(`Quiz "${quizRef}" no existe`);
  return quiz;
}
