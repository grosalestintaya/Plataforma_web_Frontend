import { useEffect, useMemo, useState } from "react";
import * as Blocks from "@/features/module/blocks";
import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { renderSlot } from "../../_core/SlotRenderer";
import { normalizeLayout } from "../../_core/layouts.helpers";
import {
  emitDailyResult,
  getDailySpendingRuntime,
  getDailySpendingTemplateRuntime,
  navigateAfterStateCommit,
  resolveShopNextViewId,
} from "./dailySpending.config";

function resolveDecisionBalance(currentBalance, item) {
  if (!item) return currentBalance;

  if (item?.nextBalance !== undefined && item?.nextBalance !== null) {
    return Number(item.nextBalance);
  }

  const cost = Number(item?.cost ?? 0);
  const reward = Number(item?.reward ?? 0);

  return Number((currentBalance - cost + reward).toFixed(2));
}

function getShellClassName(templateVariant) {
  const base = [
    "mx-auto flex min-h-full w-full max-w-6xl flex-col",
    "overflow-visible text-white",
    "px-4 py-1.5 md:px-5 md:py-2",
    "lg:h-full lg:min-h-0 lg:overflow-hidden",
  ];

  if (templateVariant === "shop") {
    return base.join(" ");
  }

  return base.join(" ");
}

const INSUFFICIENT_BALANCE_MESSAGE =
  "No te alcanza ese saldo. Quita un producto o elige una opcion mas economica.";

export default function DailySpendingTemplate({
  view,
  data,
  heroApi,
  variant,
}) {
  const baseRuntime = getDailySpendingRuntime({
    view,
    data,
    heroApi,
    variant,
  });

  const {
    templateVariant,
    viewId,
    feedback,
    choiceItems,
    shopItems,
    currentBalance,
  } = baseRuntime;

  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [shopError, setShopError] = useState(null);

  const resolvedFeedback = selectedDecision?.feedback ?? feedback;
  const shouldReserveFeedback =
    templateVariant !== "shop" &&
    choiceItems.some((item) => Boolean(item?.feedback));
  const canAdvanceDecision = Boolean(selectedDecision);

  const selectedProducts = useMemo(
    () => shopItems.filter((item) => selectedProductIds.includes(item.id)),
    [selectedProductIds, shopItems],
  );

  const totalProducts = selectedProducts.reduce(
    (sum, item) => sum + Number(item?.price ?? 0),
    0,
  );

  const nextBalance = currentBalance - totalProducts;

  const decisionBalance = selectedDecision
    ? resolveDecisionBalance(currentBalance, selectedDecision)
    : currentBalance;

  const displayedBalance =
    templateVariant === "shop" ? nextBalance : decisionBalance;

  useEffect(() => {
    setSelectedDecision(null);
    setSelectedProductIds([]);
    setShopError(null);
  }, [viewId]);

  function handleDecisionSelection(item) {
    const resolvedBalance = resolveDecisionBalance(currentBalance, item);

    setSelectedDecision({
      ...item,
      resolvedBalance,
    });

    emitDailyResult(heroApi, view, {
      selectedOptionId: item?.id,
      balance: resolvedBalance,
      cost: Number(item?.cost ?? 0),
      reward: Number(item?.reward ?? 0),
      score: Number(item?.score ?? 100),
    });
  }

  function continueDecisionFlow() {
    if (!selectedDecision) return;

    navigateAfterStateCommit(() => {
      heroApi?.advanceCurrentView?.();
    });
  }

  function toggleProduct(item) {
    if (!item?.id) return;

    let nextError = null;

    setSelectedProductIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      }

      const selectedTotal = prev.reduce((sum, selectedId) => {
        const selectedItem = shopItems.find(
          (candidate) => candidate?.id === selectedId,
        );

        return sum + Number(selectedItem?.price ?? 0);
      }, 0);

      const nextTotal = Number((selectedTotal + Number(item?.price ?? 0)).toFixed(2));

      if (nextTotal > currentBalance) {
        nextError = INSUFFICIENT_BALANCE_MESSAGE;
        return prev;
      }

      return [...prev, item.id];
    });

    setShopError(nextError);
  }

  function removeSelectedProduct(item) {
    if (!item?.id) return;

    setShopError(null);
    setSelectedProductIds((prev) => prev.filter((id) => id !== item.id));
  }

  function confirmShopSelection() {
    if (nextBalance < 0) {
      setShopError(INSUFFICIENT_BALANCE_MESSAGE);
      return;
    }

    setShopError(null);

    const resultPayload = {
      selectedProductIds,
      total: totalProducts,
      balance: nextBalance,
      score: nextBalance >= 0 ? 100 : 60,
    };

    emitDailyResult(heroApi, view, resultPayload);

    const nextViewId = resolveShopNextViewId(
      heroApi,
      viewId,
      selectedProductIds,
    );

    if (heroApi?.isBeforePostGame) {
      navigateAfterStateCommit(() => {
        heroApi?.advanceCurrentView?.();
      });
      return;
    }

    if (nextViewId) {
      navigateAfterStateCommit(() => {
        heroApi?.goToViewId?.(nextViewId);
      });
      return;
    }

    navigateAfterStateCommit(() => {
      heroApi?.advanceCurrentView?.();
    });
  }

  const runtime = getDailySpendingTemplateRuntime({
    runtime: baseRuntime,
    interaction: {
      selectedDecision,
      selectedProductIds,
      selectedProducts,
      resolvedFeedback,
      shouldReserveFeedback,
      canAdvanceDecision,
      totalProducts,
      nextBalance,
      displayedBalance,
      shopError,
    },
    handlers: {
      onDecisionSelection: handleDecisionSelection,
      onContinueDecisionFlow: continueDecisionFlow,
      onToggleProduct: toggleProduct,
      onRemoveSelectedProduct: removeSelectedProduct,
      onConfirmShopSelection: confirmShopSelection,
    },
    heroApi,
  });

  const layout = normalizeLayout(runtime?.layoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  if (!layout || !slots.length) {
    return (
      <div className="grid h-full min-h-0 w-full place-items-center text-white/80">
        Config inválida para DailySpendingTemplate
      </div>
    );
  }

  return (
    <section className={getShellClassName(templateVariant)}>
      <HeroGrid
        layout={layout}
        className="min-h-full w-full gap-2 overflow-visible lg:h-full lg:min-h-0 lg:overflow-hidden"
      >
        {slots.map((slot, index) => {
          const renderedSlot = renderSlot(slot, payload, Blocks, {
            heroApi,
            view,
          });

          if (!renderedSlot) return null;

          return (
            <HeroArea
              key={`${slot.area}-${slot.slotId ?? index}`}
              area={slot.area}
              className="overflow-visible lg:overflow-hidden"
            >
              {renderedSlot}
            </HeroArea>
          );
        })}
      </HeroGrid>
    </section>
  );
}
