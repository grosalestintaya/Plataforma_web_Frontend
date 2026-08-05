import { useMemo, useReducer, useState } from "react";
import { useEquippedAvatar } from "@/features/dashboard/services/useEquippedAvatar.service";
import { useMissionStatePersistence } from "../shared/useMissionStatePersistence";
import {
  budgetAdjustmentReducer,
  createBudgetInitialState,
  createBudgetSnapshot,
  evaluateBudget,
  getAverageBudgetScore,
  getBudgetAction,
  getBudgetAdjustmentModel,
  getBudgetSituations,
  getBudgetViewId,
} from "./budgetAdjustment.config";
import { getBudgetAdjustmentRuntime } from "./budgetAdjustment.runtime";

export function useBudgetAdjustmentController({ view, heroApi, data }) {
  const { imgAvatar } = useEquippedAvatar();
  const model = useMemo(() => getBudgetAdjustmentModel(data), [data]);
  const situations = getBudgetSituations(model);
  const viewId = getBudgetViewId(view);
  const [state, dispatch] = useReducer(
    budgetAdjustmentReducer,
    { heroApi, viewId, situations },
    createBudgetInitialState,
  );
  const [isExpenseStackOpen, setIsExpenseStackOpen] = useState(false);

  const activeSituation = situations[state.situationIndex] ?? situations[0];
  const evaluation = useMemo(
    () =>
      evaluateBudget(activeSituation, state.selectedIds, model.coach.feedback),
    [activeSituation, model.coach.feedback, state.selectedIds],
  );
  const signature = [...state.selectedIds].sort().join("|");
  const isLastSituation = state.situationIndex >= situations.length - 1;
  const currentResult = {
    situationId: activeSituation.id,
    income: evaluation.income,
    total: evaluation.total,
    balance: evaluation.balance,
    score: evaluation.status.score,
    status: evaluation.status.key,
    selectedProductIds: state.selectedIds,
  };
  const missionScore = state.isFinalized
    ? getAverageBudgetScore(state.results)
    : evaluation.status.score;
  const actionModel = getBudgetAction({
    state,
    evaluation,
    signature,
    isLastSituation,
  });
  const snapshot = useMemo(
    () =>
      createBudgetSnapshot({
        state,
        evaluation,
        situation: activeSituation,
        signature,
        missionScore,
      }),
    [activeSituation, evaluation, missionScore, signature, state],
  );

  useMissionStatePersistence({ heroApi, viewId, snapshot });

  function toggleSelection(itemId) {
    const removesLastItem =
      state.selectedIds.length === 1 && state.selectedIds[0] === itemId;
    dispatch({ type: "toggleItem", itemId });
    if (removesLastItem) setIsExpenseStackOpen(false);
  }

  function handleActionButton() {
    const commonEvent = {
      signature,
      outcome: evaluation.status.key,
      result: currentResult,
    };

    if (actionModel.action === "review") {
      dispatch({ type: "review", ...commonEvent });
    } else if (actionModel.action === "adjust") {
      dispatch({ type: "adjust" });
    } else if (actionModel.action === "nextSituation") {
      dispatch({
        type: "nextSituation",
        ...commonEvent,
        maxIndex: situations.length - 1,
      });
      setIsExpenseStackOpen(false);
    } else if (actionModel.action === "finalize") {
      dispatch({ type: "finalize", ...commonEvent });
    }
  }

  return {
    variant: "budgetAdjustment.schoolProject",
    viewId,
    imageSrc: `/activity/avatars/${imgAvatar}.webp`,
    resolvedData: model,
    activeSituation,
    situationIndex: state.situationIndex,
    situationCount: situations.length,
    availableItems: evaluation.availableItems,
    selectedItems: evaluation.selectedItems,
    initialIncomeCard: [
      {
        id: "ingreso-base",
        label: "Ingreso inicial",
        amount: evaluation.income,
        variant: "forest",
        image: { src: "1/recibir-dinero.webp", alt: "Ingreso inicial" },
      },
    ],
    income: evaluation.income,
    total: evaluation.total,
    balance: evaluation.balance,
    budgetState: evaluation.status,
    actionModel,
    coachFeedback: evaluation.feedback,
    missionScore,
    isExpenseStackOpen,
    toggleSelection,
    handleActionButton,
    openExpenseStack: () => setIsExpenseStackOpen(true),
    closeExpenseStack: () => setIsExpenseStackOpen(false),
  };
}

export function BudgetAdjustmentMissionController({ renderRuntime, ...props }) {
  const controller = useBudgetAdjustmentController(props);
  return renderRuntime(getBudgetAdjustmentRuntime(controller));
}
