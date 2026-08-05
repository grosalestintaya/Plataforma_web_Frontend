import { cn } from "@/shared/libs/utils";
import { WHAT_WOULD_YOU_DO_MISSION } from "./whatWouldYouDo.config";

const PANEL_CLASS =
  "min-h-0 overflow-y-auto rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-3";
const ASIDE_TITLE_CLASS =
  "text-[clamp(1.7rem,1.1rem+1.6vw,2.45rem)] font-black leading-tight";
const ASIDE_METRIC_CLASS =
  "rounded-[1rem] border-white/18 bg-white/10 px-3 py-3";
const ASIDE_SECTION_TITLE_CLASS =
  "rounded-[1rem] border-white/10 bg-white/5 px-3 py-2";
const ASIDE_PRODUCT_CARD_CLASS =
  "h-full min-h-[8.2rem] rounded-[1rem] border-white/18 bg-white/10 p-2";
const ASIDE_PRODUCT_GRID_CLASS = "min-h-0 flex-wrap content-start";
const ASIDE_PRODUCT_SLOT_CLASS =
  "!w-[calc(50%-0.375rem)] min-w-[8.5rem] flex-none";
const ASIDE_DETAIL_GRID_CLASS = "min-h-0 flex-wrap content-start";
const ASIDE_DETAIL_SLOT_CLASS =
  "!w-[calc(50%-0.375rem)] min-w-[8rem] flex-none";
const ASIDE_REVIEW_CLASS =
  "rounded-[1rem] border-white/10 bg-white/5 px-3 py-3";
const ASIDE_ACTION_CLASS =
  "mt-auto min-h-[3.2rem] rounded-[1rem] border-[#ffe07d]/70 bg-[linear-gradient(180deg,#ffd768_0%,#ffc234_52%,#f2a714_100%)] text-[#4b2f00] shadow-[0_14px_28px_rgba(92,52,0,0.28),inset_0_1px_0_rgba(255,249,214,0.72)]";
const OFFER_CARD_CLASS =
  "h-full min-h-[13rem] overflow-hidden rounded-[1.5rem] border-white/18 bg-white/8 p-0";
const OFFER_CARD_SELECTED_CLASS =
  "border-[3px] border-[#ffe24d] shadow-[0_0_0_1px_rgba(255,226,77,0.55),0_18px_34px_rgba(0,0,0,0.2)]";
const OFFER_MEDIA_CLASS =
  "absolute inset-0 h-full max-h-none w-full max-w-none";
const OFFER_MEDIA_IMG_CLASS = "h-full w-full object-cover";
const OFFER_CONTENT_CLASS =
  "absolute inset-x-3 bottom-3 z-20 items-start rounded-[1.1rem] bg-slate-950/58 px-4 py-3 text-left backdrop-blur-[1px]";
const OFFER_TITLE_CLASS =
  "text-left text-[clamp(1.35rem,1rem+1.4vw,2rem)]";
const OFFER_TEXT_CLASS =
  "text-left text-[clamp(0.86rem,0.72rem+0.45vw,1.06rem)]";
const OFFER_BADGE_CLASS =
  "rounded-full px-3 py-1 text-[0.78rem] font-black uppercase leading-tight shadow-[0_8px_14px_rgba(0,0,0,0.18)]";
const OFFER_INFO_BADGE_CLASS =
  "rounded-[0.9rem] bg-slate-950/58 px-3 py-2 text-center text-[0.72rem] font-black uppercase leading-tight text-white shadow-[0_8px_14px_rgba(0,0,0,0.18)]";
const PAYMENT_PANEL_CLASS =
  "min-h-0 rounded-[1.3rem] border border-white/12 bg-white/7 p-3";
const PAYMENT_HEADER_CARD_CLASS =
  "rounded-[1rem] border-white/10 bg-white/8 px-3 py-2";
const PAYMENT_SALE_CARD_CLASS =
  "h-full min-h-[10rem] rounded-[1rem] border-white/18 bg-white/10 p-2";
const PAYMENT_INCOME_CARD_CLASS =
  "h-full min-h-[4.5rem] rounded-[1rem] border-white/14 bg-white/8 px-3 py-2";
const PAYMENT_TOTAL_CLASS =
  "rounded-[1rem] border-white/10 bg-black/10 py-1.5";
const PAYMENT_SUMMARY_CLASS =
  "min-h-0 rounded-[1.3rem] border border-white/12 bg-white/7 p-3";
const PAYMENT_NOTICE_CLASS =
  "rounded-[1.2rem] border border-[#f8c766]/70 bg-[linear-gradient(180deg,rgba(120,69,92,0.62),rgba(90,45,100,0.5))] px-3 py-3";

function money(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function content(text, variant = "body", align = "left", color) {
  if (text && typeof text === "object") return text;
  return { text: String(text ?? ""), variant, align, color };
}

function offerTermLabel(offer) {
  if (offer?.termLabel) return offer.termLabel;
  if (Number.isFinite(Number(offer?.termWeeks))) {
    return `${offer.termWeeks} semanas`;
  }
  return offer?.conditions === "Poco claras" ? "Poco claro" : "? semanas";
}

function offerRiskToneClass(offer) {
  const risk = String(offer?.risk ?? "").toLowerCase();
  if (risk.includes("alto")) return "bg-[#ff6a45] text-white";
  if (risk.includes("medio")) return "bg-[#ffb21f] text-[#623600]";
  return "bg-[#2fca87] text-white";
}

function offerInteractions(offer) {
  return [
    { type: "selectable" },
    {
      type: "badge",
      content: `RIESGO ${offer?.risk ?? "-"}`.toUpperCase(),
      className: cn(
        "left-4 right-auto top-4",
        OFFER_BADGE_CLASS,
        offerRiskToneClass(offer),
      ),
    },
    {
      type: "badge",
      content: `MONTO\n${money(offer?.amount)}`,
      className: cn(
        "right-[9.2rem] top-4 whitespace-pre-line",
        OFFER_INFO_BADGE_CLASS,
      ),
    },
    {
      type: "badge",
      content: `PLAZO\n${offerTermLabel(offer)}`,
      className: cn(
        "right-4 top-4 whitespace-pre-line",
        OFFER_INFO_BADGE_CLASS,
      ),
    },
  ];
}

function createAsideItems(controller) {
  const aside = controller.aside;

  if (controller.gameState.step === 1) {
    const ownMoneyMetric = aside.metrics?.[0];

    return [
      {
        id: "aside-title",
        block: "Typography",
        shrink: false,
        props: {
          content: content(aside.title, "h2"),
          className: ASIDE_TITLE_CLASS,
        },
      },
      ...(ownMoneyMetric
        ? [
            {
              id: "aside-own-money",
              block: "Card",
              shrink: false,
              props: {
                title: content(ownMoneyMetric.label, "helper", "left", "secondary"),
                text: content(ownMoneyMetric.value, "h3", "left"),
                variant: "solid",
                className: ASIDE_METRIC_CLASS,
              },
            },
          ]
        : []),
      {
        id: "aside-products-title",
        block: "Card",
        shrink: false,
        props: {
          title: content(aside.sectionTitle ?? "Productos a vender", "h3", "left"),
          variant: "ghost",
          zoomable: false,
          className: ASIDE_SECTION_TITLE_CLASS,
        },
      },
      {
        id: "aside-products",
        block: "ComposeGroup",
        grow: true,
        props: {
          direction: "row",
          gap: 2,
          className: ASIDE_PRODUCT_GRID_CLASS,
          items: (aside.cards ?? []).map((item) => ({
            id: item.id,
            block: "Card",
            wrapperClassName: ASIDE_PRODUCT_SLOT_CLASS,
            props: {
              title: content(item.title, "helper", "center"),
              text: content(item.text, "bodySm", "center"),
              media: item.media,
              variant: "solid",
              zoomable: false,
              className: ASIDE_PRODUCT_CARD_CLASS,
            },
          })),
        },
      },
      ...(aside.message?.text
        ? [
            {
              id: "aside-message",
              block: "Card",
              shrink: false,
              props: {
                title: aside.message.title
                  ? content(aside.message.title, "h3")
                  : null,
                text: content(aside.message.text, "bodySm"),
                variant: "ghost",
                className:
                  aside.message.tone === "success"
                    ? "border-emerald-300/35 bg-emerald-500/10"
                    : "border-amber-300/35 bg-amber-500/10",
              },
            },
          ]
        : []),
    ];
  }

  if (controller.gameState.step === 2) {
    const neededMoneyMetric = aside.metrics?.[0];

    return [
      {
        id: "aside-title",
        block: "Typography",
        shrink: false,
        props: {
          content: content(aside.title, "h2"),
          className: ASIDE_TITLE_CLASS,
        },
      },
      ...(neededMoneyMetric
        ? [
            {
              id: "aside-needed-money",
              block: "Card",
              shrink: false,
              props: {
                title: content(
                  neededMoneyMetric.label,
                  "helper",
                  "left",
                  "secondary",
                ),
                text: content(neededMoneyMetric.value, "h3", "left"),
                variant: "solid",
                className: ASIDE_METRIC_CLASS,
              },
            },
          ]
        : []),
      {
        id: "aside-offer-title",
        block: "Card",
        shrink: false,
        props: {
          title: content(
            aside.offerName ?? "Selecciona una oferta",
            "h3",
            "left",
          ),
          variant: "ghost",
          zoomable: false,
          className: ASIDE_SECTION_TITLE_CLASS,
        },
      },
      {
        id: "aside-offer-details",
        block: "ComposeGroup",
        shrink: false,
        props: {
          direction: "row",
          gap: 2,
          className: ASIDE_DETAIL_GRID_CLASS,
          items: (aside.detailMetrics ?? []).map((metric, index) => ({
            id: `aside-detail-${index}`,
            block: "Card",
            wrapperClassName: ASIDE_DETAIL_SLOT_CLASS,
            props: {
              title: content(metric.label, "helper", "left", "secondary"),
              text: content(metric.value, "h3", "left"),
              variant: "solid",
              className: ASIDE_METRIC_CLASS,
            },
          })),
        },
      },
      ...(aside.review?.text
        ? [
            {
              id: "aside-review",
              block: "Card",
              shrink: false,
              props: {
                title: content(aside.review.title, "h3", "left"),
                text: content(aside.review.text, "bodySm", "left"),
                variant: "ghost",
                className: ASIDE_REVIEW_CLASS,
              },
            },
          ]
        : []),
      ...(aside.message?.text
        ? [
            {
              id: "aside-message",
              block: "Card",
              shrink: false,
              props: {
                title: aside.message.title
                  ? content(aside.message.title, "h3")
                  : null,
                text: content(aside.message.text, "bodySm"),
                variant: "ghost",
                className:
                  aside.message.tone === "success"
                    ? "border-emerald-300/35 bg-emerald-500/10"
                    : "border-amber-300/35 bg-amber-500/10",
              },
            },
          ]
        : []),
      ...(aside.action
        ? [
            {
              id: "aside-action",
              block: "Button",
              shrink: false,
              props: {
                label: aside.action.label,
                disabled: aside.action.disabled,
                onClick: () =>
                  controller.handleChooseOffer(controller.activeOffer?.id),
                fullWidth: true,
                variant: "primary",
                className: ASIDE_ACTION_CLASS,
              },
            },
          ]
        : []),
    ];
  }

  if (controller.gameState.step === 3) {
    return [
      {
        id: "aside-title",
        block: "Typography",
        shrink: false,
        props: {
          content: content(aside.title, "h2"),
          className: ASIDE_TITLE_CLASS,
        },
      },
      {
        id: "aside-payment-info-title",
        block: "Card",
        shrink: false,
        props: {
          title: content(aside.sectionTitle ?? "Información previa", "h3", "left"),
          variant: "ghost",
          zoomable: false,
          className: ASIDE_SECTION_TITLE_CLASS,
        },
      },
      {
        id: "aside-payment-details",
        block: "ComposeGroup",
        shrink: false,
        props: {
          direction: "row",
          gap: 2,
          className: ASIDE_DETAIL_GRID_CLASS,
          items: (aside.detailMetrics ?? []).map((metric, index) => ({
            id: `aside-payment-detail-${index}`,
            block: "Card",
            wrapperClassName: ASIDE_DETAIL_SLOT_CLASS,
            props: {
              title: content(metric.label, "helper", "left", "secondary"),
              text: content(metric.value, "h3", "left"),
              variant: "solid",
              className: ASIDE_METRIC_CLASS,
            },
          })),
        },
      },
      ...(aside.review?.text
        ? [
            {
              id: "aside-payment-review",
              block: "Card",
              shrink: false,
              props: {
                title: content(aside.review.title, "h3", "left"),
                text: content(aside.review.text, "bodySm", "left"),
                variant: "ghost",
                className: ASIDE_REVIEW_CLASS,
              },
            },
          ]
        : []),
      ...(aside.message?.text
        ? [
            {
              id: "aside-message",
              block: "Card",
              shrink: false,
              props: {
                title: aside.message.title
                  ? content(aside.message.title, "h3")
                  : null,
                text: content(aside.message.text, "bodySm"),
                variant: "ghost",
                className:
                  aside.message.tone === "success"
                    ? "border-emerald-300/35 bg-emerald-500/10"
                    : "border-amber-300/35 bg-amber-500/10",
              },
            },
          ]
        : []),
    ];
  }

  return [
    {
      id: "aside-title",
      block: "Typography",
      props: { content: content(aside.title, "h2") },
    },
    ...(aside.cards?.length
      ? [
          {
            id: "aside-cards",
            block: "ComposeGroup",
            props: {
              gap: 2,
              items: aside.cards.map((item) => ({
                id: item.id,
                block: "Card",
                props: {
                  title: content(item.title, "helper", "center"),
                  text: content(item.text, "bodySm", "center"),
                  media: item.media,
                  variant: "solid",
                  zoomable: false,
                },
              })),
            },
          },
        ]
      : []),
    ...(aside.metrics ?? []).map((metric, index) => ({
      id: `aside-metric-${index}`,
      block: "Card",
      props: {
        title: content(metric.label, "helper", "left", "secondary"),
        text: content(metric.value, "h3", "left"),
        variant: "solid",
        className: "rounded-[1rem] p-2.5",
      },
    })),
    ...(aside.message?.text
      ? [
          {
            id: "aside-message",
            block: "Card",
            props: {
              title: aside.message.title
                ? content(aside.message.title, "h3")
                : null,
              text: content(aside.message.text, "bodySm"),
              variant: "ghost",
              className:
                aside.message.tone === "success"
                  ? "border-emerald-300/35 bg-emerald-500/10"
                  : "border-amber-300/35 bg-amber-500/10",
            },
          },
        ]
      : []),
    ...(aside.action
      ? [
          {
            id: "aside-action",
            block: "Button",
            props: {
              label: aside.action.label,
              disabled: aside.action.disabled,
              onClick: () =>
                controller.handleChooseOffer(controller.activeOffer?.id),
              fullWidth: true,
            },
          },
        ]
      : []),
  ];
}

function createStepHeader(title, subtitle) {
  return [
    { block: "Typography", props: { content: content(title, "h2") } },
    {
      block: "Typography",
      props: { content: content(subtitle, "body", "left", "secondary") },
    },
  ];
}

function createMaterialsSlot(model) {
  const copy = model.content.copy.step1;
  return {
    slotId: "loanMaterials",
    area: "primary",
    areaClassName: PANEL_CLASS,
    items: [
      ...createStepHeader(copy.mainTitle, copy.mainSubtitle),
      {
        block: "Shopping",
        grow: true,
        props: () => ({
          items: model.materialShopItems,
          selectedIds: model.gameState.selectedMaterials,
          selectedItems: model.selectedMaterialItems,
          calculatorData: model.materialsCalculatorData,
          initialBalance: model.materialsTotal,
          total: model.content.ownMoney,
          balance: Math.max(0, model.materialsTotal - model.content.ownMoney),
          errorMessage:
            model.materialsMessage?.tone === "warning"
              ? model.materialsMessage.text
              : null,
          onToggleItem: (item) => model.toggleMaterial(item?.id),
          onRemoveItem: model.gameState.materialsValidated
            ? null
            : model.removeMaterial,
          onSubmit: model.gameState.materialsValidated
            ? () => model.goToStep(2)
            : model.handleReviewMaterials,
          disabled:
            !model.gameState.materialsValidated &&
            model.selectedMaterialItems.length === 0,
          columns: 3,
          rows: 3,
          layout: "balanced",
        }),
      },
    ],
  };
}

function createOffersSlot(model) {
  const copy = model.content.copy.step2;
  return {
    slotId: "loanOffers",
    area: "primary",
    areaClassName: PANEL_CLASS,
    items: [
      ...createStepHeader(copy.mainTitle, copy.mainSubtitle),
      {
        block: "CollageCard",
        props: () => ({
          items: model.content.loanOffers,
          columns: 2,
          rows: 2,
          className: "min-h-[28rem]",
        }),
        renderProps: {
          renderItem: {
            block: "Card",
            props: (_payload, context) => {
              const offer = context.renderProp.value.item;
              const selected =
                model.activeOffer?.id === offer.id ||
                model.gameState.selectedOfferId === offer.id;
              return {
                _legacyTitle: content(offer.name, "h3", "center"),
                _legacyText: content(
                  `${money(offer.amount)} · ${offer.termWeeks ?? "?"} semanas · Riesgo ${offer.risk}`,
                  "bodySm",
                  "center",
                ),
                _legacyMedia: offer.media,
                _legacySelected:
                  model.activeOffer?.id === offer.id ||
                  model.gameState.selectedOfferId === offer.id,
                _legacyInteraction: { type: "selectable" },
                onSelect: () => model.handleOpenOffer(offer.id),
                zoomable: false,
                variant: "ghost",
                _legacyClassName: "h-full min-h-[13rem] border-white/18 bg-white/8",
                title: content(offer.name, "h3", "left"),
                text: content(offer.summary ?? offer.detailMessage, "bodySm", "left"),
                media: {
                  ...offer.media,
                  mode: "cover",
                  className: OFFER_MEDIA_CLASS,
                  imgClassName: OFFER_MEDIA_IMG_CLASS,
                },
                selected,
                interaction: offerInteractions(offer),
                contentClassName: OFFER_CONTENT_CLASS,
                titleClassName: OFFER_TITLE_CLASS,
                textClassName: OFFER_TEXT_CLASS,
                className: cn(
                  OFFER_CARD_CLASS,
                  selected && OFFER_CARD_SELECTED_CLASS,
                ),
              };
            },
          },
        },
      },
    ],
  };
}

function createStrategySlot(model) {
  const copy = model.content.copy.step3;
  return {
    slotId: "paymentStrategy",
    area: "primary",
    areaClassName: PANEL_CLASS,
    items: [
      ...createStepHeader(copy.planTitle, copy.planSubtitle),
      {
        block: "CollageCard",
        props: () => ({
          items: model.content.paymentStrategies,
          columns: 3,
          rows: 1,
        }),
        renderProps: {
          renderItem: {
            block: "Card",
            props: (_payload, context) => {
              const strategy = context.renderProp.value.item;
              return {
                title: content(strategy.title, "h3", "center"),
                text: content(strategy.description, "bodySm", "center"),
                media: strategy.media,
                selected:
                  model.selectedPaymentStrategy?.id === strategy.id,
                interaction: { type: "selectable" },
                onSelect: () => model.handleOpenPaymentStrategy(strategy.id),
                zoomable: false,
              };
            },
          },
        },
      },
      {
        block: "Button",
        props: () => ({
          label: copy.strategyContinueButton,
          onClick: () =>
            model.handleConfirmPaymentStrategy(
              model.selectedPaymentStrategy?.id ?? "regulated",
            ),
          disabled: !model.selectedPaymentStrategy,
        }),
      },
    ],
  };
}

function createSalesItems(model) {
  return model.currentWeek.sales.map((sale, index) => {
    const product = model.content.products.find(
      (item) =>
        item.sidebarLabel?.toLowerCase() === sale.product?.toLowerCase() ||
        item.label?.toLowerCase() === sale.product?.toLowerCase(),
    );

    return {
      id: `sale-${index}`,
      block: "Card",
      wrapperClassName: "flex-1",
      props: {
        title: content(product?.label ?? sale.product, "h3", "center"),
        text: content(money(sale.unitPrice), "cardText", "center"),
        media: product?.media,
        variant: "solid",
        zoomable: false,
        className: PAYMENT_SALE_CARD_CLASS,
      },
    };
  });
}

function createIncomeItems(model) {
  return model.currentWeek.sales.map((sale, index) => ({
    id: `income-${index}`,
    block: "Card",
    wrapperClassName: "flex-1",
    props: {
      title: content(`Vendiste x${sale.quantity}`, "helper", "center"),
      text: content(money(sale.income), "h3", "center"),
      variant: "solid",
      zoomable: false,
      className: PAYMENT_INCOME_CARD_CLASS,
    },
  }));
}

function createPaymentSlot(model) {
  const copy = model.content.copy.step3;
  const automatic = model.strategyExecutionConfig?.mode !== "regulated";
  const currentWeekPaid = Boolean(
    model.gameState.weeklyStates[model.currentWeekIndex],
  );
  const continueLabel =
    model.currentWeekIndex < model.content.weeks.length - 1
      ? copy.continueButton
      : copy.reviewResultButton;

  return {
    slotId: "weeklyPayment",
    area: "primary",
    areaClassName: PANEL_CLASS,
    items: [
      {
        block: "ComposeGroup",
        grow: true,
        props: () => ({
          direction: "row",
          gap: 4,
          className: "items-stretch",
          items: [
            {
              id: "week-sales",
              block: "ComposeGroup",
              grow: true,
              wrapperClassName: "basis-[64%]",
              props: {
                gap: 3,
                className: PAYMENT_PANEL_CLASS,
                items: [
                  {
                    id: "week-sales-title",
                    block: "Card",
                    shrink: false,
                    props: {
                      title: content(
                        `Semana ${model.currentWeek.week}: ${model.currentWeek.title}`,
                        "h2",
                        "left",
                      ),
                      variant: "ghost",
                      zoomable: false,
                      className: PAYMENT_HEADER_CARD_CLASS,
                    },
                  },
                  {
                    id: "week-sale-products",
                    block: "ComposeGroup",
                    shrink: false,
                    props: {
                      direction: "row",
                      gap: 3,
                      items: createSalesItems(model),
                    },
                  },
                  {
                    id: "week-sale-income",
                    block: "ComposeGroup",
                    shrink: false,
                    props: {
                      direction: "row",
                      gap: 3,
                      items: createIncomeItems(model),
                    },
                  },
                  {
                    id: "week-total",
                    block: "Card",
                    shrink: false,
                    props: {
                      title: content(
                        `Total: ${money(model.currentWeek.income)}`,
                        "h2",
                        "center",
                      ),
                      variant: "ghost",
                      zoomable: false,
                      className: PAYMENT_TOTAL_CLASS,
                    },
                  },
                ],
              },
            },
            {
              id: "week-summary",
              block: "ComposeGroup",
              grow: true,
              wrapperClassName: "basis-[34%]",
              props: {
                gap: 3,
                className: PAYMENT_SUMMARY_CLASS,
                items: [
                  {
                    id: "summary-title",
                    block: "Typography",
                    shrink: false,
                    props: {
                      content: content("Resumen", "h3", "center"),
                    },
                  },
                  {
                    id: "summary-week",
                    block: "Card",
                    shrink: false,
                    props: {
                      title: content(`Semana ${model.currentWeek.week}`, "helper", "center"),
                      variant: "solid",
                      zoomable: false,
                      className: "rounded-[1rem] border-white/14 bg-white/10",
                    },
                  },
                  {
                    id: "summary-income",
                    block: "Card",
                    shrink: false,
                    props: {
                      title: content("Ingresos Totales", "helper", "left"),
                      text: content(money(model.currentWeek.income), "h3", "right"),
                      variant: "ghost",
                      zoomable: false,
                      className: "rounded-[1rem] border-white/10 bg-white/8 px-3 py-2",
                    },
                  },
                  {
                    id: "summary-cash",
                    block: "Card",
                    shrink: false,
                    props: {
                      title: content("Dinero en caja", "helper", "left"),
                      text: content(money(model.availableThisWeek), "h3", "right"),
                      variant: "ghost",
                      zoomable: false,
                      className: "rounded-[1rem] border-white/10 bg-white/8 px-3 py-2",
                    },
                  },
                  {
                    id: "payment-notice",
                    block: "ComposeGroup",
                    grow: true,
                    props: {
                      gap: 3,
                      className: PAYMENT_NOTICE_CLASS,
                      items: [
                        {
                          id: "payment-title",
                          block: "Typography",
                          shrink: false,
                          props: {
                            content: content("Pago correspondiente", "h3"),
                          },
                        },
                        {
                          id: "payment-debt",
                          block: "Typography",
                          shrink: false,
                          props: {
                            content: content(
                              `Tienes aun una deuda de ${money(model.debtPending)}`,
                              "bodySm",
                            ),
                          },
                        },
                        {
                          id: "payment-row",
                          block: "ComposeGroup",
                          shrink: false,
                          props: {
                            direction: "row",
                            gap: 2,
                            items: [
                              {
                                id: "currency-prefix",
                                block: "Card",
                                wrapperClassName: "w-16 shrink-0",
                                props: {
                                  title: content("S/", "h3", "center"),
                                  variant: "ghost",
                                  zoomable: false,
                                  className: "min-h-12 rounded-[1rem] border-[#f8c766]/70 bg-black/10",
                                },
                              },
                              {
                                id: "payment-input",
                                block: "Input",
                                grow: true,
                                props: {
                                  value: automatic
                                    ? String(
                                        model.strategyExecutionConfig
                                          ?.suggestedPayment ?? 0,
                                      )
                                    : model.draftPayment,
                                  onChange: model.updateDraftPayment,
                                  placeholder: "0",
                                  disabled: automatic,
                                  className:
                                    "min-h-12 border-[#f8c766]/70 bg-black/10 text-center text-lg font-black text-white placeholder:text-white/45",
                                },
                              },
                              {
                                id: "payment-submit",
                                block: "Button",
                                wrapperClassName: "w-32 shrink-0",
                                props: {
                                  label: "Pagar",
                                  variant: "secondary",
                                  onClick: automatic
                                    ? () =>
                                        model.handleApplySuggestedPayment(
                                          model.strategyExecutionConfig
                                            ?.suggestedPayment ?? 0,
                                        )
                                    : model.handleConfirmWeekPayment,
                                  disabled: currentWeekPaid,
                                  fullWidth: true,
                                  className: "min-h-12 rounded-[1rem]",
                                },
                              },
                            ],
                          },
                        },
                        {
                          id: "week-continue",
                          block: "Button",
                          shrink: false,
                          props: {
                            label: continueLabel,
                            onClick: model.handleContinueAfterWeek,
                            disabled: !currentWeekPaid && model.debtPending > 0,
                            fullWidth: true,
                            variant: "primary",
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }),
      },
    ],
  };
}

function createFinalSlot(model) {
  const copy = model.content.copy.step4;
  const summaries = [
    [copy.productionTitle, `${model.gameState.selectedMaterials.length} materiales seleccionados.`],
    [copy.ventureSalesTitle, `Ingresos totales: ${money(model.content.weeks.reduce((sum, week) => sum + Number(week.income ?? 0), 0))}.`],
    [copy.journeyTitle, `Pagaste ${money(model.gameState.totalPaid)} del préstamo.`],
    [copy.closingTitle, `Caja final: ${money(model.finalAvailableMoney)}. Ganancia neta: ${money(model.netProfit)}.`],
  ];
  return {
    slotId: "loanResult",
    area: "primary",
    areaClassName: PANEL_CLASS,
    items: [
      ...createStepHeader(copy.mainTitle, copy.mainSubtitle),
      {
        block: "ComposeGroup",
        props: () => ({
          direction: "row",
          className: "flex-wrap",
          items: summaries.map(([title, description], index) => ({
            id: `summary-${index}`,
            block: "Card",
            props: {
              title: content(title, "h3"),
              text: content(description, "bodySm"),
              variant: "ghost",
              className: "h-full border-white/16 bg-white/8",
            },
          })),
        }),
      },
    ],
  };
}

function createPrimarySlot(model) {
  if (model.gameState.step === 1) return createMaterialsSlot(model);
  if (model.gameState.step === 2) return createOffersSlot(model);
  if (model.gameState.step === 3) {
    return model.gameState.paymentPlanConfirmed
      ? createPaymentSlot(model)
      : createStrategySlot(model);
  }
  return createFinalSlot(model);
}

export function getWhatWouldYouDoRuntime(controller) {
  const asideItems = createAsideItems(controller);
  return {
    ...WHAT_WOULD_YOU_DO_MISSION.runtime,
    slots: [
      {
        slotId: "whatWouldYouDoInformation",
        area: "heading",
        areaAlign: "stretch",
        block: "InteractiveInfoAside",
        props: () => ({
          className: WHAT_WOULD_YOU_DO_MISSION.runtime.asideClassName,
        }),
        child: {
          block: "ComposeGroup",
          props: () => ({ items: asideItems, gap: 2, className: "overflow-y-auto" }),
        },
      },
      createPrimarySlot(controller),
    ],
    payload: controller,
  };
}
