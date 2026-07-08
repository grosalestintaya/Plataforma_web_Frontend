// game/data/gameplayItems.js
// Items reciclables del minijuego final. "income" suma puntaje, "expense" resta.
// Los valores estan pensados para que atrapar solo ingresos alcance el
// puntaje maximo (MAX_GAMEPLAY_SCORE) sin necesidad de atrapar absolutamente todo.
export const gameplayItems = [
  { id: "propina", label: "Propina", kind: "income", value: 8, imageKey: "coin_1" },
  { id: "ahorro", label: "Ahorro semanal", kind: "income", value: 10, imageKey: "coin_2" },
  { id: "trabajo", label: "Pago por trabajo", kind: "income", value: 12, imageKey: "coin_3" },
  { id: "gaseosa", label: "Gaseosa", kind: "expense", value: 5, imageKey: "item_gaseosa" },
  { id: "helado", label: "Helado antojo", kind: "expense", value: 5, imageKey: "item_helado" },
  { id: "impulsiva", label: "Compra impulsiva", kind: "expense", value: 8, imageKey: "item_compra_impulsiva" },
];
