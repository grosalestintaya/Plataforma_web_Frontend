import TheoryTemplate from "./views/theory/TheoryTemplate";
import QuizTemplate from "./views/quiz/QuizTemplate";
import LobbyTemplate from "./views/lobby/LobbyTemplate";

import DailySpendingTemplate from "./game/dailySpending/DailySpendingTemplate";
import ObjectClassificationTemplate from "./game/objectClassification/ObjectClassificationTemplate";
import BudgetAdjustmentTemplate from "./game/budgetAdjustment/BudgetAdjustmentTemplate";
import CollectObjectsTemplate from "./game/collectObjects/CollectObjectsTemplate";
import WhatWouldYouDoTemplate from "./game/whatWouldYouDo/WhatWouldYouDoTemplate";

import MemoryPairs from "@/features/module/blocks/compounds/Iterative/MemoryPairs";

export const templates = {
  // Views (guia nueva)
  preGameLobby: LobbyTemplate,
  postGameLobby: LobbyTemplate,
  waitLobby: LobbyTemplate,
  simpleTheory: TheoryTemplate,
  explanationTheory: TheoryTemplate,
  splitTheory: TheoryTemplate,
  assessmentTheory: TheoryTemplate,
  simpleQuiz: QuizTemplate,
  extendedQuiz: QuizTemplate,

  // Game templates (guia nueva)
  decisionDailySpending: DailySpendingTemplate,
  shopDailySpending: DailySpendingTemplate,
  eventDailySpending: DailySpendingTemplate,
  assessmentDailySpending: DailySpendingTemplate,
  DailySpending: DailySpendingTemplate,
  objectClassification: ObjectClassificationTemplate,
  ObjectClassification: ObjectClassificationTemplate,
  budgetAdjustment: BudgetAdjustmentTemplate,
  BudgetAdjustment: BudgetAdjustmentTemplate,
  collectObjects: CollectObjectsTemplate,
  CollectObjects: CollectObjectsTemplate,
  whatWouldYouDo: WhatWouldYouDoTemplate,
  WhatWouldYouDo: WhatWouldYouDoTemplate,

  // Compatibilidad legacy
  teoria: TheoryTemplate,
  choiceReveal: QuizTemplate,
  memoryGame: MemoryPairs,
  memoryPairs: MemoryPairs,
};
