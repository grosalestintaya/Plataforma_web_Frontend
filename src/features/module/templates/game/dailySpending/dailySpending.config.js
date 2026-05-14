// Traduce nombres de template del documento a la variante interna que usa
// el runtime del juego.
const VARIANT_BY_TEMPLATE = {
  decisionDailySpending: "decision",
  shopDailySpending: "shop",
  eventDailySpending: "event",
  assessmentDailySpending: "assessment",
};

// Compatibilidad con configuraciones antiguas que venían desde `engineVariant`.
const ENGINE_TO_VARIANT = {
  commuteDecision: "decision",
  kioskCheckout: "shop",
  recycleDecision: "event",
  summary: "assessment",
};

// Layout principal de DailySpending.
const DAILY_LAYOUTS = {
  decision: {
    base: {
      cols: "1fr",
      rows: "auto auto",
      areas: ["title", "content"],
    },
    lg: {
      cols: "1fr",
      rows: "auto minmax(0,1fr)",
      areas: ["title", "content"],
    },
  },

  event: {
    base: {
      cols: "1fr",
      rows: "auto auto",
      areas: ["title", "content"],
    },
    lg: {
      cols: "1fr",
      rows: "auto minmax(0,1fr)",
      areas: ["title", "content"],
    },
  },

  shop: {
    base: {
      cols: "1fr",
      rows: "auto auto",
      areas: ["title", "content"],
    },
    lg: {
      cols: "1fr",
      rows: "auto minmax(0,1fr)",
      areas: ["title", "content"],
    },
  },
};

// DailyTitle:
// - Situación ocupa 2fr.
// - Monto ocupa 1fr.
const DAILY_TITLE_LAYOUT = {
  base: {
    cols: "1fr",
    rows: "auto auto",
    areas: ["situation", "amount"],
  },
  md: {
    cols: "minmax(0,2fr) minmax(0,1fr)",
    rows: "auto",
    areas: ["situation amount"],
  },
};

const DAILY_TITLE_SLOTS = [
  {
    area: "situation",
    block: "Card",
    props: (payload) => ({
      title: payload?.title,
      text: payload?.situation,
      variant: "ghost",
      size: "normal",
      zoomable: false,
    }),
  },
  {
    area: "amount",
    when: (payload) => Boolean(payload?.displayedAmount),
    block: "Card",
    props: (payload) => ({
      title: {
        text:
          payload?.displayedAmount?.label ??
          payload?.displayedAmount?.text ??
          "Saldo",
        variant: "label",
        align: "center",
      },
      text: {
        text: formatMoney(payload?.displayedAmount?.value ?? 0),
        variant: "h2",
        align: "center",
      },
      variant: "solid",
      size: "normal",
      zoomable: false,
    }),
  },
];

// Decision:
// - simple: sólo opciones.
// - withMedia: opciones + imagen lateral.
const DAILY_DECISION_CONTENT_LAYOUT = {
  simple: {
    base: {
      cols: "1fr",
      rows: "auto",
      areas: ["choice"],
    },
    lg: {
      cols: "1fr",
      rows: "minmax(0,1fr)",
      areas: ["choice"],
    },
  },

  withMedia: {
    base: {
      cols: "1fr",
      rows: "auto auto",
      areas: ["choice", "media"],
    },
    md: {
      cols: "1fr",
      rows: "auto auto",
      areas: ["choice", "media"],
    },
    lg: {
      cols: "minmax(0,1.2fr) minmax(220px,0.8fr)",
      rows: "minmax(0,1fr)",
      areas: ["choice media"],
    },
  },
};

// Event:
// - Imagen/evento a un lado.
// - Elección a otro lado.
const DAILY_EVENT_CONTENT_LAYOUT = {
  base: {
    cols: "1fr",
    rows: "auto auto",
    areas: ["media", "choice"],
  },
  md: {
    cols: "minmax(0,0.75fr) minmax(0,1.25fr)",
    rows: "minmax(0,1fr)",
    areas: ["media choice"],
  },
};

function getSelectedChoiceId(payload) {
  return (
    payload?.selectedDecisionId ??
    payload?.selectedChoiceId ??
    payload?.selectedOptionId ??
    payload?.selectedDecision?.id ??
    payload?.selectedChoice?.id ??
    payload?.selectedOption?.id ??
    null
  );
}

function handleDailyChoiceSelection(payload) {
  return (selectedId, selectedItem) => {
    const item =
      selectedItem ??
      payload?.choiceItems?.find(
        (choice) => String(choice?.id) === String(selectedId),
      ) ??
      null;

    if (!item) return;

    payload?.onDecisionSelection?.(item);
  };
}

const DAILY_DECISION_CONTENT_SLOTS = [
  {
    area: "choice",
    block: "ChooseOne",
    props: (payload) => ({
      data: {
        instruction: null,
        items: payload?.choiceItems ?? [],
        feedback: payload?.resolvedFeedback ?? null,
        feedbackReserve: Boolean(payload?.shouldReserveFeedback),
        actionButton: {
          label: payload?.advanceLabel ?? "Continuar",
          onClick: payload?.onContinueDecisionFlow,
          disabled: !payload?.canAdvanceDecision,
        },
      },

      selectedId: getSelectedChoiceId(payload),
      onSelection: handleDailyChoiceSelection(payload),

      /**
       * DailySpending controla cuándo la vista se completa.
       * ChooseOne sólo selecciona la opción.
       */
      reportToHero: false,
    }),
  },
  {
    area: "media",
    when: (payload) => Boolean(payload?.media),
    block: "Card",
    props: (payload) => ({
      media: {
        src: payload?.media?.src,
        alt: payload?.media?.alt ?? "Situación",
        variant: payload?.media?.variant ?? payload?.media?.ratio ?? "horizontal",
        mode: payload?.media?.mode ?? "contain",
      },
      variant: "ghost",

      // No se pasa interaction.
      // Como tiene media, Card activa ZoomableCard por defecto.
      zoomable: payload?.media?.zoomable !== false,
    }),
  },
];

const DAILY_EVENT_CONTENT_SLOTS = [
  {
    area: "media",
    when: (payload) => Boolean(payload?.media),
    block: "Card",
    props: (payload) => ({
      media: {
        src: payload?.media?.src,
        alt: payload?.media?.alt ?? "Situación extra",
        variant: payload?.media?.variant ?? payload?.media?.ratio ?? "vertical",
        mode: payload?.media?.mode ?? "contain",
      },
      variant: "ghost",
      size: "modal",
      zoomable: payload?.media?.zoomable !== false,
    }),
  },
  {
    area: "choice",
    block: "ChooseOne",
    props: (payload) => ({
      data: {
        instruction:
          payload?.instruction ?? {
            text: "Escoge una de las opciones",
            variant: "label",
            align: "center",
          },
        items: payload?.choiceItems ?? [],
        feedback: payload?.resolvedFeedback ?? null,
        feedbackReserve: Boolean(payload?.shouldReserveFeedback),
        actionButton: {
          label: payload?.advanceLabel ?? "Continuar",
          onClick: payload?.onContinueDecisionFlow,
          disabled: !payload?.canAdvanceDecision,
        },
      },

      selectedId: getSelectedChoiceId(payload),
      onSelection: handleDailyChoiceSelection(payload),
      reportToHero: false,
    }),
  },
];

const DAILY_SLOTS = {
  decision: [
    {
      area: "title",
      layoutDef: DAILY_TITLE_LAYOUT,
      slots: DAILY_TITLE_SLOTS,
    },
    {
      area: "content",
      layoutDef: (payload) =>
        payload?.media
          ? DAILY_DECISION_CONTENT_LAYOUT.withMedia
          : DAILY_DECISION_CONTENT_LAYOUT.simple,
      slots: DAILY_DECISION_CONTENT_SLOTS,
    },
  ],

  event: [
    {
      area: "title",
      layoutDef: DAILY_TITLE_LAYOUT,
      slots: DAILY_TITLE_SLOTS,
    },
    {
      area: "content",
      layoutDef: DAILY_EVENT_CONTENT_LAYOUT,
      slots: DAILY_EVENT_CONTENT_SLOTS,
    },
  ],

  shop: [
    {
      area: "title",
      layoutDef: DAILY_TITLE_LAYOUT,
      slots: DAILY_TITLE_SLOTS,
    },
    {
      area: "content",
      block: "Shopping",
      props: (payload) => ({
        items: payload?.shopItems ?? [],
        selectedIds: payload?.selectedProductIds ?? [],
        selectedItems: payload?.selectedProducts ?? [],
        calculatorData: payload?.calculatorData,
        total: payload?.totalProducts ?? 0,
        balance: payload?.nextBalance ?? 0,
        onToggleItem: payload?.onToggleProduct,
        onRemoveItem: payload?.onRemoveSelectedProduct,
        onSubmit: payload?.onConfirmShopSelection,
        disabled: (payload?.selectedProducts?.length ?? 0) === 0,
        columns: payload?.shopColumns ?? 3,
        rows: payload?.shopRows ?? 2,
      }),
    },
  ],
};

export function findCompound(view, targetType) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];

  return (
    compounds.find((item) => (item?.component ?? item?.type) === targetType) ??
    null
  );
}

export function getLegacyDailyElement(view, data) {
  if (Array.isArray(view?.elements?.compound)) {
    const fromDoc = view.elements.compound.find(
      (item) => (item?.component ?? item?.type) === "dailySpending",
    );

    if (fromDoc) return fromDoc;
  }

  return data?.dailySpending ?? null;
}

export function formatMoney(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

export function getInitialMissionBalance(heroApi, fallbackBalance) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];

  for (const item of missionViews) {
    const amountValue = Number(item?.slots?.amount?.value);

    if (Number.isFinite(amountValue)) {
      return amountValue;
    }
  }

  return fallbackBalance;
}

export function getInheritedBalance(heroApi, viewId, fallbackBalance) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];
  const currentIndex = missionViews.findIndex(
    (item) => (item?.id ?? item?.viewId) === viewId,
  );

  if (currentIndex <= 0) return fallbackBalance;

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const candidateViewId =
      missionViews[index]?.id ?? missionViews[index]?.viewId;

    if (!candidateViewId) continue;

    const candidateState = heroApi?.getInteractiveState?.(candidateViewId);
    const candidateBalance = Number(candidateState?.balance);

    if (Number.isFinite(candidateBalance)) {
      return candidateBalance;
    }
  }

  return fallbackBalance;
}

export function normalizeTextNode(value, fallbackVariant = "label") {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return {
      text: String(value),
      variant: fallbackVariant,
      align: "center",
    };
  }

  return value;
}

export function resolveVariant(view, variant, legacyElement) {
  /**
   * 1. La plantilla real de la vista tiene prioridad.
   * Si view.template dice eventDailySpending, debe ser event sí o sí.
   */
  const fromTemplate = VARIANT_BY_TEMPLATE[view?.template];

  if (fromTemplate) {
    return fromTemplate;
  }

  /**
   * 2. Luego se respeta variant si viene explícito.
   */
  if (variant) {
    return variant;
  }

  /**
   * 3. Luego compatibilidad antigua por engineVariant.
   */
  const fromEngine = ENGINE_TO_VARIANT[legacyElement?.engineVariant];

  if (fromEngine) {
    return fromEngine;
  }

  return "decision";
}

export function normalizeChoiceItem(option, index) {
  const cost =
    option?.cost !== undefined && option?.cost !== null
      ? Number(option.cost)
      : undefined;

  const reward =
    option?.reward !== undefined && option?.reward !== null
      ? Number(option.reward)
      : undefined;

  const amountText =
    option?.detail ??
    (cost !== undefined
      ? cost > 0
        ? `S/ ${cost.toFixed(2)}`
        : "S/ 0.00"
      : reward !== undefined
        ? `+ S/ ${reward.toFixed(2)}`
        : "");

  const detail =
    typeof amountText === "string" && amountText.length > 0
      ? {
          text: amountText,
          variant: "label",
          align: "center",
        }
      : null;

  return {
    id: option?.id ?? `choice-${index + 1}`,

    title: normalizeTextNode(option?.title ?? option?.label, "label"),

    text: detail,
    detail,

    media:
      option?.media ??
      option?.image ?? {
        src: option?.src,
        alt: option?.alt ?? "Opción",
      },

    interaction: option?.interaction ?? { type: "selectable" },

    feedback:
      option?.feedback ??
      (option?.reveal?.text
        ? {
            text: option.reveal.text,
            variant: "helper",
            align: "center",
          }
        : null),

    score: Number(option?.score ?? 100),

    nextBalance:
      option?.nextBalance !== undefined && option?.nextBalance !== null
        ? Number(option.nextBalance)
        : undefined,

    cost,
    reward,

    correct: option?.correct,
  };
}

export function resolveShopNextViewId(heroApi, currentViewId, selectedIds) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];
  const currentIndex = missionViews.findIndex(
    (item) => (item?.id ?? item?.viewId) === currentViewId,
  );

  if (currentIndex < 0) return null;

  const hasPlasticBottle = selectedIds.some(
    (item) => item === "gaseosa" || item === "agua",
  );

  for (let index = currentIndex + 1; index < missionViews.length; index += 1) {
    const candidate = missionViews[index];
    const candidateId = candidate?.id ?? candidate?.viewId;
    const branchRule = candidate?.availability?.dependsOn ?? candidate?.when;

    if (
      branchRule?.viewId === currentViewId &&
      branchRule?.stateKey === "selectedProductIds"
    ) {
      if (hasPlasticBottle) return candidateId;
      continue;
    }

    return candidateId;
  }

  return null;
}

export function getChoiceItems(view, legacyElement) {
  const chooseOne = findCompound(view, "chooseOne");

  if (Array.isArray(chooseOne?.items) && chooseOne.items.length > 0) {
    return chooseOne.items.map(normalizeChoiceItem);
  }

  return Array.isArray(legacyElement?.options)
    ? legacyElement.options.map(normalizeChoiceItem)
    : [];
}

export function getShopItems(view, legacyElement) {
  const collageCard = findCompound(view, "collageCard");

  if (Array.isArray(collageCard?.items) && collageCard.items.length > 0) {
    return collageCard.items.map((item, index) => ({
      id: item?.id ?? `product-${index + 1}`,
      title: item?.title ?? item?.label,
      text: item?.text,
      media:
        item?.media ??
        item?.image ?? {
          src: item?.src,
          alt: item?.alt,
        },
      interaction: item?.interaction,
      zoomable: item?.zoomable,
      price: Number(item?.price ?? item?.value ?? 0),
    }));
  }

  return Array.isArray(legacyElement?.products)
    ? legacyElement.products.map((item, index) => ({
        id: item?.id ?? `product-${index + 1}`,
        title: {
          text: item?.name,
          variant: "label",
          align: "center",
        },
        text: {
          text: formatMoney(item?.price),
          variant: "label",
          align: "center",
        },
        media:
          item?.media ??
          item?.image ?? {
            src: item?.src,
            alt: item?.alt ?? item?.name,
          },
        interaction: item?.interaction,
        zoomable: item?.zoomable,
        price: Number(item?.price ?? 0),
      }))
    : [];
}

export function emitDailyResult(heroApi, view, payload) {
  heroApi?.setInteractiveState?.(view?.id ?? view?.viewId, {
    completed: true,
    type: "dailySpending",
    ...payload,
  });
}

export function navigateAfterStateCommit(navigate) {
  if (typeof window === "undefined") {
    navigate?.();
    return;
  }

  window.requestAnimationFrame(() => {
    navigate?.();
  });
}

export function getDailySpendingRuntime({ view, data, heroApi, variant }) {
  const legacyElement = getLegacyDailyElement(view, data);
  const resolvedVariant = resolveVariant(view, variant, legacyElement);

  const templateVariant =
    resolvedVariant === "shop"
      ? "shop"
      : resolvedVariant === "event"
        ? "event"
        : "decision";

  const viewId = view?.id ?? view?.viewId;

  const title = view?.slots?.title ?? data?.title;

  const amount =
    view?.slots?.amount ??
    data?.amount ?? {
      label: "Saldo",
      value: legacyElement?.balance ?? 0,
    };

  const assessment = view?.slots?.assessment ?? data?.assessment;
  const situation = view?.slots?.situation ?? data?.situation ?? assessment;
  const instruction = view?.slots?.instruction ?? data?.instruction;
  const feedback = view?.slots?.feedback ?? data?.feedback;
  const media = view?.slots?.media ?? data?.media;

  const choiceItems = getChoiceItems(view, legacyElement);
  const shopItems = getShopItems(view, legacyElement);
  const calculatorData = findCompound(view, "calculator") ?? data?.calculator ?? {};

  const initialBalance = getInitialMissionBalance(
    heroApi,
    Number(legacyElement?.balance ?? amount?.value ?? 0),
  );

  const baseBalance = Number.isFinite(initialBalance) ? initialBalance : 0;
  const currentBalance = getInheritedBalance(heroApi, viewId, baseBalance);

  return {
    templateVariant,
    viewId,
    title,
    amount,
    situation,
    instruction,
    feedback,
    media,
    choiceItems,
    shopItems,
    calculatorData,
    currentBalance,
  };
}

export function getDailySpendingTemplateRuntime({
  runtime,
  interaction,
  handlers,
  heroApi,
}) {
  const displayedAmount = {
    ...(runtime?.amount ?? {}),
    value: interaction?.displayedBalance,
  };

  const templateVariant = runtime?.templateVariant ?? "decision";

  return {
    layoutDef: DAILY_LAYOUTS[templateVariant] ?? DAILY_LAYOUTS.decision,
    slots: DAILY_SLOTS[templateVariant] ?? DAILY_SLOTS.decision,
    payload: {
      ...runtime,
      ...interaction,
      ...handlers,
      displayedAmount,
      advanceLabel: heroApi?.advanceLabel ?? "Continuar",
      shopColumns: 3,
      shopRows: 2,
    },
  };
}