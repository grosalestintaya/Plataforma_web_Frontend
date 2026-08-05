import { BadgeCheck, HandCoins, Sparkles, TriangleAlert } from "lucide-react";
import { cn } from "@/shared/libs/utils";
import {
  formatBudgetCurrency,
  resolveBudgetItemImage,
} from "./budgetAdjustment.config";

const STATUS_ICON = {
  idle: Sparkles,
  process: Sparkles,
  balanced: HandCoins,
  good: BadgeCheck,
  risk: TriangleAlert,
};

const BUDGET_PRESENTATION = Object.freeze({
  stage: [
    "mx-auto h-full min-h-0 w-full max-w-[82rem]",
    "overflow-hidden rounded-[2rem] border border-[#ffcf5c]/70 p-3 text-white",
    "bg-[radial-gradient(circle_at_top,rgba(255,229,122,0.95),rgba(255,184,18,0.98)_36%,rgba(236,147,3,0.98)_100%)]",
    "shadow-[0_22px_52px_rgba(103,48,0,0.22)]",
  ].join(" "),
  rootGrid:
    "h-full gap-3 p-0 sm:gap-3 sm:px-0 md:gap-3 md:px-0 lg:px-0 lg:py-0",
  primaryPanel:
    "rounded-[1.7rem] border border-[#d58f00]/65 bg-[linear-gradient(180deg,rgba(255,219,97,0.42),rgba(255,179,42,0.18))] p-3",
  headerAside:
    "gap-0 rounded-[1.7rem] border-[#d58f00]/65 bg-[linear-gradient(180deg,rgba(255,219,97,0.72),rgba(255,179,42,0.34))] p-2 md:h-[clamp(9rem,24vh,12rem)]",
  headerColumn: "h-full min-h-0 overflow-hidden",
  projectCard:
    "h-full border border-[#ffcc6a]/80 bg-[linear-gradient(180deg,#f58017_0%,#d95d06_100%)] px-4 py-2 text-white",
  promptCard:
    "h-full border border-[#d79c16]/75 bg-[linear-gradient(180deg,rgba(255,217,95,0.96),rgba(246,184,29,0.92))] px-4 py-2 text-[#6e3600]",
  emptyCatalog:
    "h-full border border-dashed border-[#c47900]/55 bg-white/12 px-4 text-[#6d3400]",
  catalog:
    "h-full min-h-0 rounded-[1.45rem] border border-[#d18800]/60 bg-[linear-gradient(180deg,rgba(255,214,75,0.4),rgba(255,173,29,0.14))] p-[clamp(0.45rem,1vh,0.65rem)]",
  catalogGrid: "h-full min-h-0 gap-[clamp(0.35rem,1.1vh,0.62rem)] auto-rows-fr",
  catalogSlot: "min-h-0 p-0",
  emptyCatalogSlot:
    "min-h-0 rounded-[clamp(0.8rem,1.5vw,1.15rem)] border-[#d18800]/25 bg-white/5",
  productCard:
    "h-full overflow-visible rounded-[clamp(0.8rem,1.5vw,1.15rem)] border-[clamp(2px,0.28vw,4px)] border-[#0d5f8c] bg-[linear-gradient(180deg,#fff8df_0%,#f8e9c8_100%)] p-[clamp(0.18rem,0.45vw,0.32rem)] shadow-[0_16px_22px_rgba(84,45,0,0.18)]",
  compactProductCard:
    "rounded-[clamp(0.55rem,1.4vw,0.78rem)] border-[clamp(1px,0.2vw,2px)] p-[clamp(0.12rem,0.35vw,0.2rem)] shadow-[0_8px_14px_rgba(0,0,0,0.2)]",
  priceBadge:
    "-right-[clamp(0.35rem,0.8vw,0.55rem)] -top-[clamp(0.35rem,0.8vw,0.55rem)] h-[clamp(2.35rem,5.2vw,3.7rem)] w-[clamp(2.35rem,5.2vw,3.7rem)] bg-[radial-gradient(circle_at_35%_30%,#30d66f_0%,#07933e_72%)] px-0 text-[clamp(0.72rem,1.75vw,1.12rem)]",
  compactPriceBadge:
    "h-[clamp(1.55rem,4vw,2.25rem)] w-[clamp(1.55rem,4vw,2.25rem)] text-[clamp(0.52rem,1.35vw,0.78rem)]",
  revealLabel:
    "z-40 bg-black/42 text-[clamp(0.74rem,1.85vw,1.18rem)] font-black leading-tight backdrop-blur-[1px]",
  compactRevealLabel: "text-[clamp(0.48rem,1.2vw,0.68rem)]",
  guideWrapper: "w-[clamp(4.35rem,25%,7rem)]",
  guideCard:
    "h-full border-0 bg-[radial-gradient(circle_at_top,#fff_0%,#fff_70%,#3b1ca1_100%)]",
  feedbackCard:
    "h-full border border-[#d79c16]/70 bg-[linear-gradient(180deg,rgba(255,216,97,0.98),rgba(245,185,33,0.92))] px-3 py-2 text-[#5f2e00]",
  modal:
    "flex max-h-[min(42rem,88vh)] max-w-[48rem] flex-col overflow-hidden border-[#ffcf5c]/80 bg-[radial-gradient(circle_at_top,#ffe38a_0%,#f7a91c_46%,#d97800_100%)] text-[#552800]",
  modalContent: "min-h-0 flex-1 overflow-y-auto",
  modalCatalog:
    "min-h-0 rounded-[1.15rem] border border-[#bd7400]/45 bg-white/15 p-3",
});

function getBudgetProductCardProps({
  item,
  onSelect,
  ariaLabel,
  compact = false,
  revealLabel = false,
}) {
  const itemImage = resolveBudgetItemImage(item);
  const interaction = [
    ...(onSelect ? [{ type: "selectable" }] : []),
    {
      type: "badge",
      content: formatBudgetCurrency(item.amount),
      className: cn(
        BUDGET_PRESENTATION.priceBadge,
        compact && BUDGET_PRESENTATION.compactPriceBadge,
      ),
    },
    {
      type: "reveal",
      content: item.label,
      mode: revealLabel ? "hoverFocus" : "always",
      className: cn(
        BUDGET_PRESENTATION.revealLabel,
        compact && BUDGET_PRESENTATION.compactRevealLabel,
      ),
    },
  ];

  return {
    media: itemImage
      ? {
          src: itemImage.src,
          alt: itemImage.alt ?? item.label,
          variant: "square",
          mode: "contain",
        }
      : null,
    interaction,
    zoomable: false,
    onSelect,
    ariaLabel:
      ariaLabel ??
      (onSelect
        ? `Seleccionar ${item.label} por ${formatBudgetCurrency(item.amount)}`
        : `${item.label}, ${formatBudgetCurrency(item.amount)}`),
    variant: "bare",
    className: cn(
      BUDGET_PRESENTATION.productCard,
      compact && BUDGET_PRESENTATION.compactProductCard,
    ),
  };
}

const HEADER_SLOT = {
  area: "heading",
  areaAlign: "stretch",
  block: "InteractiveInfoAside",
  props: () => ({
    variant: "heading",
    className: BUDGET_PRESENTATION.headerAside,
  }),
  child: {
    isStack: false,
    items: [
      {
        block: "ComposeGroup",
        props: (payload) => ({
          direction: "column",
          gap: 2,
          className: BUDGET_PRESENTATION.headerColumn,
          items: [
            {
              block: "Card",
              grow: true,
              props: {
                title: {
                  text:
                    payload.activeSituation.projectName ??
                    payload.resolvedData.eyebrow?.text,
                  variant: "label",
                  align: "center",
                  color: "primary",
                },
                variant: "bare",
                zoomable: false,
                className: BUDGET_PRESENTATION.projectCard,
              },
            },
            {
              block: "Card",
              grow: true,
              props: {
                text: {
                  text:
                    payload.activeSituation.prompt ??
                    payload.resolvedData.subtitle?.text,
                  variant: "h3",
                  align: "left",
                },
                variant: "bare",
                zoomable: false,
                className: BUDGET_PRESENTATION.promptCard,
              },
            },
          ],
        }),
      },
      {
        block: "ComposeGroup",
        props: (payload) => ({
          direction: "row",
          gap: 2,
          className: BUDGET_PRESENTATION.headerColumn,
          items: [
            {
              block: "Card",
              shrink: false,
              wrapperClassName: BUDGET_PRESENTATION.guideWrapper,
              props: {
                media: {
                  src: payload.imageSrc,
                  alt: "Personaje guia del presupuesto",
                  variant: "vertical",
                  mode: "cover",
                },
                variant: "bare",
                zoomable: false,
                className: BUDGET_PRESENTATION.guideCard,
              },
            },
            {
              block: "Card",
              grow: true,
              props: {
                title: {
                  text: payload.coachFeedback.title,
                  variant: "h3",
                  align: "left",
                },
                text: {
                  text: payload.coachFeedback.text,
                  variant: "bodySm",
                  align: "left",
                },
                variant: "bare",
                zoomable: false,
                className: BUDGET_PRESENTATION.feedbackCard,
              },
            },
          ],
        }),
      },
    ],
  },
};

const CATALOG_SLOT = {
  area: "primary",
  areaAlign: "stretch",
  areaClassName: BUDGET_PRESENTATION.primaryPanel,
  items: [
    {
      when: (payload) => !payload.availableItems.length,
      block: "Card",
      props: () => ({
        text: {
          text: "Ya colocaste todas las tarjetas en el presupuesto. Revisa si el saldo sigue siendo saludable.",
          variant: "bodySm",
          align: "center",
        },
        variant: "bare",
        zoomable: false,
        className: BUDGET_PRESENTATION.emptyCatalog,
      }),
    },
    {
      when: (payload) => Boolean(payload.availableItems.length),
      block: "CollageCard",
      props: (payload) => ({
        items: payload.availableItems,
        columns: 4,
        rows: 3,
        slotCount: 12,
        className: BUDGET_PRESENTATION.catalog,
        gridClassName: BUDGET_PRESENTATION.catalogGrid,
        slotClassName: BUDGET_PRESENTATION.catalogSlot,
        emptySlotClassName: BUDGET_PRESENTATION.emptyCatalogSlot,
      }),
      renderProps: {
        renderItem: {
          block: "Card",
          props: (payload, context) =>
            getBudgetProductCardProps({
              item: context.renderProp.value.item,
              onSelect: () =>
                payload.toggleSelection(context.renderProp.value.item.id),
              revealLabel: true,
            }),
        },
      },
    },
  ],
  isStack: false,
};

const BALANCE_SLOT = {
  area: "secondary",
  areaAlign: "stretch",
  block: "BalanceScale",
  props: (payload) => ({
    income: payload.income,
    expenses: payload.total,
    balance: payload.balance,
    incomeItems: payload.initialIncomeCard,
    expenseItems: payload.selectedItems.slice(-4).map((item) => ({
      ...item,
      variant: "rose",
    })),
    status: {
      ...payload.budgetState,
      icon: STATUS_ICON[payload.budgetState.key] ?? Sparkles,
    },
    actionModel: payload.actionModel,
    onAction: payload.handleActionButton,
    onOpenExpenseStack: payload.openExpenseStack,
  }),
  renderProps: {
    renderStackItem: {
      block: "Card",
      props: (_payload, context) => {
        const { item, isExpense, onOpenStack } = context.renderProp.value;
        return getBudgetProductCardProps({
          item,
          ariaLabel: isExpense
            ? "Abrir gastos seleccionados"
            : `${item.label} en la balanza`,
          onSelect:
            isExpense && onOpenStack
              ? (event) => {
                  event.stopPropagation();
                  onOpenStack();
                }
              : undefined,
          compact: true,
          revealLabel: true,
        });
      },
    },
  },
};

const BUDGET_SLOTS = [HEADER_SLOT, CATALOG_SLOT, BALANCE_SLOT];

const BUDGET_OVERLAYS = [
  {
    slotId: "expenseStackModal",
    when: (payload) => payload.isExpenseStackOpen,
    block: "Modal",
    props: (payload) => ({
      open: payload.isExpenseStackOpen,
      onClose: payload.closeExpenseStack,
      title: {
        paragraphs: [
          "Gastos seleccionados",
          `Total: ${formatBudgetCurrency(payload.total)}. Haz click en una tarjeta para retirarla.`,
        ],
        variant: "h3",
        align: "left",
      },
      closeLabel: "Cerrar",
      className: BUDGET_PRESENTATION.modal,
      contentClassName: BUDGET_PRESENTATION.modalContent,
    }),
    child: {
      block: "CollageCard",
      props: (payload) => ({
        items: payload.selectedItems,
        columns: 4,
        className: BUDGET_PRESENTATION.modalCatalog,
      }),
      renderProps: {
        renderItem: {
          block: "Card",
          props: (payload, context) =>
            getBudgetProductCardProps({
              item: context.renderProp.value.item,
              ariaLabel: `Retirar ${context.renderProp.value.item.label} de gastos`,
              onSelect: () =>
                payload.toggleSelection(context.renderProp.value.item.id),
            }),
        },
      },
    },
  },
];

export function getBudgetAdjustmentRuntime(controller) {
  return {
    variant: controller.variant,
    layoutVariant: "balanced",
    stageClassName: BUDGET_PRESENTATION.stage,
    gridClassName: BUDGET_PRESENTATION.rootGrid,
    slots: BUDGET_SLOTS,
    overlays: BUDGET_OVERLAYS,
    payload: controller,
  };
}
