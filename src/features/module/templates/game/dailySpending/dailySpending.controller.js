import { useEffect, useMemo, useState } from "react";
import {
  calculateDecisionBalance,
  getDailySpendingModel,
  navigateAfterStateCommit,
  persistDailySpendingResult,
  resolveDailySpendingNextViewId,
} from "./dailySpending.config";
import { getDailySpendingRuntime } from "./dailySpending.runtime";

const INSUFFICIENT_BALANCE_MESSAGE =
  "No te alcanza ese saldo. Quita un producto o elige una opción más económica.";

export function useDailySpendingController({ view, data, heroApi, variant }) {
  const model = useMemo(
    () => getDailySpendingModel({ view, data, heroApi, variant }),
    [data, heroApi, variant, view],
  );
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [shopError, setShopError] = useState(null);

  useEffect(() => {
    setSelectedDecision(null);
    setSelectedProductIds([]);
    setShopError(null);
  }, [model.viewId]);

  const selectedProducts = useMemo(
    () =>
      (model.shopItems ?? []).filter((item) =>
        selectedProductIds.includes(item.id),
      ),
    [model.shopItems, selectedProductIds],
  );
  const totalProducts = selectedProducts.reduce(
    (sum, item) => sum + Number(item?.price ?? 0),
    0,
  );
  const shopBalance = Number(
    (model.currentBalance - totalProducts).toFixed(2),
  );
  const displayedBalance = selectedDecision
    ? calculateDecisionBalance(model.currentBalance, selectedDecision)
    : model.variant === "shop"
      ? shopBalance
      : model.currentBalance;

  function persistResult(result) {
    persistDailySpendingResult(heroApi, model.viewId, {
      completed: true,
      ...result,
    });
  }

  function handleDecisionSelection(item) {
    const balance = calculateDecisionBalance(model.currentBalance, item);
    setSelectedDecision(item);
    persistResult({
      selectedOptionId: item?.id,
      balance,
      cost: Number(item?.cost ?? 0),
      reward: Number(item?.reward ?? 0),
      score: Number(item?.score ?? 100),
    });
  }

  function continueDecisionFlow() {
    if (!selectedDecision) return;
    navigateAfterStateCommit(() => heroApi?.advanceCurrentView?.());
  }

  function toggleProduct(item) {
    if (!item?.id) return;

    setSelectedProductIds((currentIds) => {
      if (currentIds.includes(item.id)) {
        setShopError(null);
        return currentIds.filter((id) => id !== item.id);
      }

      const currentTotal = (model.shopItems ?? [])
        .filter((candidate) => currentIds.includes(candidate.id))
        .reduce((sum, candidate) => sum + Number(candidate?.price ?? 0), 0);

      if (currentTotal + Number(item?.price ?? 0) > model.currentBalance) {
        setShopError(INSUFFICIENT_BALANCE_MESSAGE);
        return currentIds;
      }

      setShopError(null);
      return [...currentIds, item.id];
    });
  }

  function removeProduct(item) {
    setShopError(null);
    setSelectedProductIds((currentIds) =>
      currentIds.filter((id) => id !== item?.id),
    );
  }

  function confirmShopSelection() {
    if (!selectedProducts.length || shopBalance < 0) {
      if (shopBalance < 0) setShopError(INSUFFICIENT_BALANCE_MESSAGE);
      return;
    }

    const result = {
      selectedProductIds,
      total: totalProducts,
      balance: shopBalance,
      score: 100,
    };
    persistResult(result);

    if (heroApi?.isBeforePostGame) {
      navigateAfterStateCommit(() => heroApi?.advanceCurrentView?.());
      return;
    }

    const nextViewId = resolveDailySpendingNextViewId({
      heroApi,
      currentViewId: model.viewId,
      state: result,
    });
    navigateAfterStateCommit(() => {
      if (nextViewId) heroApi?.goToViewId?.(nextViewId);
      else heroApi?.advanceCurrentView?.();
    });
  }

  return {
    ...model,
    selectedDecision,
    selectedProductIds,
    selectedProducts,
    totalProducts,
    shopBalance,
    displayedBalance,
    shopError,
    resolvedFeedback: selectedDecision?.feedback ?? model.feedback,
    shouldReserveFeedback: (model.choiceItems ?? []).some((item) =>
      Boolean(item?.feedback),
    ),
    advanceLabel: heroApi?.advanceLabel ?? "Continuar",
    handleDecisionSelection,
    continueDecisionFlow,
    toggleProduct,
    removeProduct,
    confirmShopSelection,
  };
}

export function DailySpendingMissionController({ renderRuntime, ...props }) {
  const controller = useDailySpendingController(props);
  return renderRuntime(getDailySpendingRuntime(controller));
}
