import MissionViewTemplate from "./views/mission/MissionViewTemplate";

import MemoryPairs from "@/features/module/blocks/compounds/iteractive/MemoryPairs";

export const templates = {
  // Todas las vistas declarativas se resuelven dentro de MissionViewTemplate.
  preGameLobby: MissionViewTemplate,
  postGameLobby: MissionViewTemplate,
  waitLobby: MissionViewTemplate,
  simpleTheory: MissionViewTemplate,
  explanationTheory: MissionViewTemplate,
  splitTheory: MissionViewTemplate,
  assessmentTheory: MissionViewTemplate,
  simpleQuiz: MissionViewTemplate,
  extendedQuiz: MissionViewTemplate,

  // Layout/runtime ids resueltos dentro de MissionViewTemplate.
  decisionDailySpending: MissionViewTemplate,
  shopDailySpending: MissionViewTemplate,
  eventDailySpending: MissionViewTemplate,
  assessmentDailySpending: MissionViewTemplate,
  DailySpending: MissionViewTemplate,
  objectClassification: MissionViewTemplate,
  ObjectClassification: MissionViewTemplate,
  budgetAdjustment: MissionViewTemplate,
  BudgetAdjustment: MissionViewTemplate,
  collectObjects: MissionViewTemplate,
  CollectObjects: MissionViewTemplate,
  whatWouldYouDo: MissionViewTemplate,
  WhatWouldYouDo: MissionViewTemplate,

  // Compatibilidad legacy.
  teoria: MissionViewTemplate,
  choiceReveal: MissionViewTemplate,
  memoryGame: MemoryPairs,
  memoryPairs: MemoryPairs,
};
