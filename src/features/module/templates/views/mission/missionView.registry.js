import { lazy } from "react";
import { getQuizRuntime } from "../general/quizRuntime.js";
import { getTheoryRuntime } from "../general/theoryRuntime.js";
import { getObjectClassificationMissionRuntime } from "../../game/objectClassification/objectClassification.runtime.js";
import { COLLECT_OBJECTS_MISSION } from "../../game/collectObjects/collectObjects.config.js";
import { WHAT_WOULD_YOU_DO_MISSION } from "../../game/whatWouldYouDo/whatWouldYouDo.config.js";

const BudgetAdjustmentMissionController = lazy(() =>
  import("../../game/budgetAdjustment/budgetAdjustment.controller.js").then(
    (module) => ({ default: module.BudgetAdjustmentMissionController }),
  ),
);
const DailySpendingMissionController = lazy(() =>
  import("../../game/dailySpending/dailySpending.controller.js").then(
    (module) => ({ default: module.DailySpendingMissionController }),
  ),
);
const CollectObjectsMissionController = lazy(() =>
  import("../../game/collectObjects/collectObjects.controller.js").then(
    (module) => ({ default: module.CollectObjectsMissionController }),
  ),
);
const WhatWouldYouDoMissionController = lazy(
  () =>
    import("../../game/whatWouldYouDo/whatWouldYouDo.controller.js").then(
      (module) => ({ default: module.WhatWouldYouDoMissionController }),
    ),
);
const LobbyRuntimeController = lazy(() =>
  import("../general/lobbyRuntime.jsx").then((module) => ({
    default: module.LobbyRuntimeController,
  })),
);

const THEORY_LAYOUT_IDS = [
  "simpleTheory",
  "explanationTheory",
  "splitTheory",
  "assessmentTheory",
  "teoria",
];

const QUIZ_LAYOUT_IDS = ["simpleQuiz", "extendedQuiz", "choiceReveal"];
const LOBBY_LAYOUT_IDS = ["preGameLobby", "postGameLobby", "waitLobby"];

const DAILY_SPENDING_LAYOUT_IDS = [
  "decisionDailySpending",
  "shopDailySpending",
  "eventDailySpending",
  "assessmentDailySpending",
  "DailySpending",
];

function runtimeDefinition(createRuntime) {
  return Object.freeze({ createRuntime });
}

const THEORY_DEFINITION = runtimeDefinition(getTheoryRuntime);
const QUIZ_DEFINITION = runtimeDefinition(getQuizRuntime);
const LOBBY_DEFINITION = Object.freeze({ Controller: LobbyRuntimeController });
const DAILY_SPENDING_DEFINITION = Object.freeze({
  Controller: DailySpendingMissionController,
});

export const MISSION_VIEW_REGISTRY = Object.freeze({
  ...Object.fromEntries(
    THEORY_LAYOUT_IDS.map((template) => [template, THEORY_DEFINITION]),
  ),
  ...Object.fromEntries(
    QUIZ_LAYOUT_IDS.map((template) => [template, QUIZ_DEFINITION]),
  ),
  ...Object.fromEntries(
    LOBBY_LAYOUT_IDS.map((template) => [template, LOBBY_DEFINITION]),
  ),
  ...Object.fromEntries(
    DAILY_SPENDING_LAYOUT_IDS.map((template) => [
      template,
      DAILY_SPENDING_DEFINITION,
    ]),
  ),
  objectClassification: runtimeDefinition(
    getObjectClassificationMissionRuntime,
  ),
  ObjectClassification: runtimeDefinition(
    getObjectClassificationMissionRuntime,
  ),
  budgetAdjustment: Object.freeze({
    Controller: BudgetAdjustmentMissionController,
  }),
  BudgetAdjustment: Object.freeze({
    Controller: BudgetAdjustmentMissionController,
  }),
  ...Object.fromEntries(
    COLLECT_OBJECTS_MISSION.templates.map((template) => [
      template,
      Object.freeze({ Controller: CollectObjectsMissionController }),
    ]),
  ),
  ...Object.fromEntries(
    WHAT_WOULD_YOU_DO_MISSION.templates.map((template) => [
      template,
      Object.freeze({ Controller: WhatWouldYouDoMissionController }),
    ]),
  ),
});

export function getMissionViewDefinition(template) {
  return MISSION_VIEW_REGISTRY[template] ?? THEORY_DEFINITION;
}
