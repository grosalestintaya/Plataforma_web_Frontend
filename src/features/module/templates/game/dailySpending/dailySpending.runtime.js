const DAILY_SPENDING_PRESENTATION = Object.freeze({
  stage:
    "mx-auto h-full min-h-0 w-full max-w-6xl overflow-hidden px-4 py-2 text-white md:px-5",
  grid: "h-full min-h-0 gap-3",
  aside:
    "border-white/15 bg-white/5 p-3 md:max-h-[clamp(9rem,24vh,12rem)]",
  asideColumn: "h-full min-h-0",
  informationCard: "h-full border-white/12 bg-white/5",
  amountCard: "h-full border-white/12 bg-white/8",
  interaction: "min-h-0 overflow-visible",
});

function formatMoney(value, currencySymbol) {
  return `${currencySymbol} ${Number(value ?? 0).toFixed(2)}`;
}

function getSelectedChoiceId(payload) {
  return payload.selectedDecision?.id ?? null;
}

const INFORMATION_SLOT = {
  area: "heading",
  areaAlign: "stretch",
  block: "InteractiveInfoAside",
  props: () => ({
    variant: "heading",
    className: DAILY_SPENDING_PRESENTATION.aside,
  }),
  child: {
    isStack: false,
    items: [
      {
        block: "ComposeGroup",
        props: (payload) => ({
          direction: "column",
          gap: 2,
          className: DAILY_SPENDING_PRESENTATION.asideColumn,
          items: [
            {
              block: "Card",
              grow: true,
              props: {
                title: payload.title,
                text: payload.situation ?? payload.assessment,
                variant: "bare",
                zoomable: false,
                className: DAILY_SPENDING_PRESENTATION.informationCard,
              },
            },
          ],
        }),
      },
      {
        block: "Card",
        props: (payload) => ({
          title: {
            text:
              payload.amount?.label ?? payload.amount?.text ?? "Saldo disponible",
            variant: "h3",
            align: "center",
          },
          text: {
            text: formatMoney(
              payload.displayedBalance,
              payload.currencySymbol,
            ),
            variant: "h2",
            align: "center",
          },
          variant: "bare",
          zoomable: false,
          className: DAILY_SPENDING_PRESENTATION.amountCard,
        }),
      },
    ],
  },
};

const DECISION_SLOT = {
  area: "primary",
  areaAlign: "stretch",
  areaClassName: DAILY_SPENDING_PRESENTATION.interaction,
  block: "ChooseOne",
  props: (payload) => ({
    data: {
      instruction: payload.instruction ?? payload.assessment,
      items: payload.choiceItems ?? [],
      feedback: payload.resolvedFeedback,
      feedbackReserve: payload.shouldReserveFeedback,
      actionButton: {
        label: payload.advanceLabel,
        onClick: payload.continueDecisionFlow,
        disabled: !payload.selectedDecision,
      },
    },
    selectedId: getSelectedChoiceId(payload),
    onSelection: (_selectedId, selectedItem) =>
      payload.handleDecisionSelection(selectedItem),
    reportToHero: false,
  }),
};

const SHOP_SLOT = {
  area: "primary",
  areaAlign: "stretch",
  areaClassName: DAILY_SPENDING_PRESENTATION.interaction,
  block: "Shopping",
  props: (payload) => ({
    items: payload.shopItems ?? [],
    selectedIds: payload.selectedProductIds,
    selectedItems: payload.selectedProducts,
    calculatorData: payload.calculatorData,
    initialBalance: payload.currentBalance,
    total: payload.totalProducts,
    balance: payload.shopBalance,
    errorMessage: payload.shopError,
    onToggleItem: payload.toggleProduct,
    onRemoveItem: payload.removeProduct,
    onSubmit: payload.confirmShopSelection,
    disabled: !payload.selectedProducts.length,
    columns: 3,
    rows: 2,
    layout: "balanced",
  }),
};

const DAILY_SPENDING_VARIANTS = Object.freeze({
  decision: Object.freeze({ slots: [INFORMATION_SLOT, DECISION_SLOT] }),
  event: Object.freeze({ slots: [INFORMATION_SLOT, DECISION_SLOT] }),
  assessment: Object.freeze({ slots: [INFORMATION_SLOT, DECISION_SLOT] }),
  shop: Object.freeze({ slots: [INFORMATION_SLOT, SHOP_SLOT] }),
});

export function getDailySpendingRuntime(controller) {
  const variant = DAILY_SPENDING_VARIANTS[controller.variant];
  const definition = variant ?? DAILY_SPENDING_VARIANTS.decision;

  return {
    variant: `dailySpending.${controller.variant}`,
    layoutVariant: "primaryEmphasis",
    stageClassName: DAILY_SPENDING_PRESENTATION.stage,
    gridClassName: DAILY_SPENDING_PRESENTATION.grid,
    slots: definition.slots,
    payload: controller,
  };
}
