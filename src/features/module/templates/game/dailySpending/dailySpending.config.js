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

// Helper pequeño para no repetir la definición de slots de Typography.
function createTypographySlot(area, contentKey, fallbackVariant, extra = {}) {
  return {
    area,
    block: "Typography",
    props: (payload) => {
      const content = payload?.[contentKey];
      return {
        content,
        variant: content?.variant ?? fallbackVariant,
        align: content?.align,
        color: content?.color,
        className: content?.className,
        containerClassName: content?.containerClassName,
      };
    },
    ...extra,
  };
}

// Layout principal de DailySpending. Por ahora decisión y tienda comparten
// la misma estructura general: cabecera y contenido.
const DAILY_LAYOUTS = {
  decision: {
    base: {
      cols: "1fr",
      rows: "auto minmax(0,1fr)",
      areas: ["title", "content"],
    },
  },
  shop: {
    base: {
      cols: "1fr",
      rows: "auto minmax(0,1fr)",
      areas: ["title", "content"],
    },
  },
};

// Layout anidado del slot `title`: copia textual a la izquierda y monto/saldo
// a la derecha en desktop.
const DAILY_TITLE_LAYOUT = {
  base: {
    cols: "1fr",
    rows: "auto auto",
    areas: ["copy", "amount"],
  },
  md: {
    cols: "minmax(0,1fr) auto",
    rows: "auto",
    areas: ["copy amount"],
  },
};

// Slots anidados dentro del área `title`.
const DAILY_TITLE_SLOTS = [
  {
    area: "copy",
    className: "p-0 place-items-stretch place-content-stretch",
    stackClassName: "h-full min-h-0 gap-3 rounded-2xl p-3",
    items: [
      {
        ...createTypographySlot("copy", "title", "eyebrow"),
        when: (payload) => Boolean(payload?.title),
      },
      {
        ...createTypographySlot("copy", "situation", "h3"),
        when: (payload) => Boolean(payload?.situation),
      },
    ],
  },
  {
    area: "amount",
    className: "p-0 place-items-stretch place-content-stretch",
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
      className: "justify-center gap-1.5 px-4 py-3",
      }),
  },
];

// Variantes del área principal para pantallas de decisión:
// simple = solo opciones
// withMedia = opciones + imagen de apoyo
const DAILY_DECISION_CONTENT_LAYOUT = {
  simple: {
    base: {
      cols: "1fr",
      rows: "minmax(0,1fr)",
      areas: ["choice"],
    },
  },
  withMedia: {
    base: {
      cols: "1fr",
      rows: "minmax(0,1fr) auto",
      areas: ["choice", "media"],
    },
    md: {
      cols: "minmax(0,1.2fr) minmax(220px,0.8fr)",
      rows: "minmax(0,1fr)",
      areas: ["choice media"],
    },
  },
};

// Slots del área `content` en pantallas de decisión.
const DAILY_DECISION_CONTENT_SLOTS = [
  {
    area: "choice",
    className:
      "h-full min-h-0 w-full p-0 place-items-stretch place-content-stretch",
    block: "ChooseOne",
    props: (payload) => ({
      data: {
        // En DailySpending el encabezado de instrucción se resuelve fuera
        // del compuesto, así que aquí no se repite.
        instruction: null,
        items: payload?.choiceItems ?? [],
        // El feedback de la vista vive dentro del propio ChooseOne.
        feedback: payload?.resolvedFeedback ?? null,
        // Reserva el hueco del feedback desde antes de seleccionar.
        feedbackReserve: Boolean(payload?.shouldReserveFeedback),
        actionButton: {
          label: payload?.advanceLabel ?? "Continuar",
          onClick: payload?.onContinueDecisionFlow,
          disabled: !payload?.canAdvanceDecision,
          className:
            "border-yellow-300 bg-emerald-500 text-white hover:bg-emerald-600",
        },
      },
      onSelection: payload?.onDecisionSelection,
    }),
  },
  {
    // Imagen lateral opcional para variantes que comparan una referencia
    // visual junto a las opciones.
    area: "media",
    when: (payload) => Boolean(payload?.media),
    className:
      "h-full min-h-0 w-full p-0 place-items-stretch place-content-stretch",
    block: "Image",
    props: (payload) => ({
      src: payload?.media?.src,
      alt: payload?.media?.alt ?? "Situacion",
      variant: payload?.media?.variant ?? payload?.media?.ratio,
      mode: payload?.media?.mode ?? "slot",
      fitToContent: payload?.media?.fitToContent,
      className: "flex h-full w-full items-center justify-center rounded-2xl p-2 md:p-3",
      imgClassName:
        "h-auto w-auto max-h-full max-w-full object-contain",
      zoomable: payload?.media?.zoomable !== false,
    }),
  },
];

// Slots de primer nivel consumidos por el template.
const DAILY_SLOTS = {
  decision: [
    {
      area: "title",
      className: "p-0 place-items-stretch place-content-stretch",
      layoutDef: DAILY_TITLE_LAYOUT,
      slots: DAILY_TITLE_SLOTS,
    },
    {
      area: "content",
      className:
        "h-full min-h-0 w-full p-0 place-items-stretch place-content-stretch",
      layoutDef: (payload) =>
        payload?.media
          ? DAILY_DECISION_CONTENT_LAYOUT.withMedia
          : DAILY_DECISION_CONTENT_LAYOUT.simple,
      slots: DAILY_DECISION_CONTENT_SLOTS,
    },
  ],
  shop: [
    {
      area: "title",
      className: "p-0 place-items-stretch place-content-stretch",
      layoutDef: DAILY_TITLE_LAYOUT,
      slots: DAILY_TITLE_SLOTS,
    },
    {
      area: "content",
      className:
        "h-full min-h-0 w-full p-0 place-items-stretch place-content-stretch",
      // La tienda completa vive en un compuesto aparte para no inflar
      // el template principal.
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

// Busca un compound específico dentro de la vista del documento.
export function findCompound(view, targetType) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];
  return (
    compounds.find((item) => (item?.component ?? item?.type) === targetType) ??
    null
  );
}

// Compatibilidad con documentos viejos donde DailySpending estaba guardado
// directamente en `data.dailySpending`.
export function getLegacyDailyElement(view, data) {
  if (Array.isArray(view?.elements?.compound)) {
    const fromDoc = view.elements.compound.find(
      (item) => (item?.component ?? item?.type) === "dailySpending",
    );
    if (fromDoc) return fromDoc;
  }

  return data?.dailySpending ?? null;
}

// Formato monetario uniforme para todo el template.
export function formatMoney(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

// Toma como base el primer monto explícito definido en la misión.
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

// Hereda el último saldo persistido de vistas anteriores de la misma misión.
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

// Normaliza strings simples a un nodo tipográfico consistente.
export function normalizeTextNode(value, fallbackVariant = "label") {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    return { text: String(value), variant: fallbackVariant, align: "center" };
  }
  return value;
}

// Resuelve la variante final del template tomando en cuenta template actual,
// compatibilidad heredada y override manual.
export function resolveVariant(view, variant, legacyElement) {
  if (variant) return variant;
  const fromEngine = ENGINE_TO_VARIANT[legacyElement?.engineVariant];
  if (fromEngine) return fromEngine;
  return VARIANT_BY_TEMPLATE[view?.template] ?? "decision";
}

// Convierte una opción del documento al shape que consume ChooseOne.
export function normalizeChoiceItem(option, index) {
  const amountValue =
    option?.detail ??
    (option?.cost !== undefined
      ? `- ${formatMoney(option.cost)}`
      : option?.reward !== undefined
        ? `+ ${formatMoney(option.reward)}`
        : "");

  return {
    id: option?.id ?? `choice-${index + 1}`,
    title: normalizeTextNode(option?.title ?? option?.label, "label"),
    detail:
      typeof amountValue === "string"
        ? { text: amountValue, variant: "label" }
        : amountValue,
    media:
      option?.media ??
      option?.image ?? { src: option?.src, alt: option?.alt ?? "Opcion" },
    feedback:
      option?.feedback ??
      (option?.reveal?.text
        ? { text: option.reveal.text, variant: "helper", align: "center" }
        : null),
    score: Number(option?.score ?? 100),
    nextBalance: option?.nextBalance,
    cost: option?.cost !== undefined ? Number(option.cost) : undefined,
    reward: option?.reward !== undefined ? Number(option.reward) : undefined,
    correct: option?.correct,
  };
}

// En la tienda permite resolver el siguiente salto condicional; por ejemplo,
// si se compró Gaseosa/Agua se puede abrir una vista extra de reciclaje.
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

// Obtiene las opciones de decisión desde el compound moderno o desde el
// formato heredado.
export function getChoiceItems(view, legacyElement) {
  const chooseOne = findCompound(view, "chooseOne");
  if (Array.isArray(chooseOne?.items) && chooseOne.items.length > 0) {
    return chooseOne.items.map(normalizeChoiceItem);
  }

  return Array.isArray(legacyElement?.options)
    ? legacyElement.options.map(normalizeChoiceItem)
    : [];
}

// Obtiene productos para la tienda desde CollageCard o desde el formato
// antiguo del documento.
export function getShopItems(view, legacyElement) {
  const collageCard = findCompound(view, "collageCard");
  if (Array.isArray(collageCard?.items) && collageCard.items.length > 0) {
    return collageCard.items.map((item, index) => ({
      id: item?.id ?? `product-${index + 1}`,
      title: item?.title ?? item?.label,
      text: item?.text,
      media: item?.media ?? item?.image ?? { src: item?.src, alt: item?.alt },
      price: Number(item?.price ?? item?.value ?? 0),
    }));
  }

  return Array.isArray(legacyElement?.products)
    ? legacyElement.products.map((item, index) => ({
        id: item?.id ?? `product-${index + 1}`,
        title: { text: item?.name, variant: "label", align: "center" },
        text: {
          text: formatMoney(item?.price),
          variant: "label",
          align: "center",
        },
        media:
          item?.media ??
          item?.image ?? { src: item?.src, alt: item?.alt ?? item?.name },
        price: Number(item?.price ?? 0),
      }))
    : [];
}

// Guarda el resultado interactivo de la vista actual en heroApi.
export function emitDailyResult(heroApi, view, payload) {
  heroApi?.setInteractiveState?.(view?.id ?? view?.viewId, {
    completed: true,
    type: "dailySpending",
    ...payload,
  });
}

// Aplaza la navegación un frame para asegurar que el estado previo quede
// asentado antes de cambiar de vista.
export function navigateAfterStateCommit(navigate) {
  if (typeof window === "undefined") {
    navigate?.();
    return;
  }

  window.requestAnimationFrame(() => {
    navigate?.();
  });
}

// Construye el runtime base del template a partir de la vista, heredando
// saldos, media y compounds relevantes.
export function getDailySpendingRuntime({ view, data, heroApi, variant }) {
  const legacyElement = getLegacyDailyElement(view, data);
  const resolvedVariant = resolveVariant(view, variant, legacyElement);
  const templateVariant = resolvedVariant === "shop" ? "shop" : "decision";
  const viewId = view?.id ?? view?.viewId;

  const title = view?.slots?.title ?? data?.title;
  const amount =
    view?.slots?.amount ??
    data?.amount ?? { label: "Saldo", value: legacyElement?.balance ?? 0 };
  const assessment = view?.slots?.assessment ?? data?.assessment;
  const situation = view?.slots?.situation ?? data?.situation ?? assessment;
  const feedback = view?.slots?.feedback ?? data?.feedback;
  const media = view?.slots?.media ?? data?.media;
  const choiceItems = getChoiceItems(view, legacyElement);
  const shopItems = getShopItems(view, legacyElement);
  const calculatorData =
    findCompound(view, "calculator") ?? data?.calculator ?? {};
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
    feedback,
    media,
    choiceItems,
    shopItems,
    calculatorData,
    currentBalance,
  };
}

// Combina runtime, interacción y handlers en el payload final que van a leer
// los slots declarados arriba.
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

  return {
    // El template solo necesita conocer layout + slots + payload.
    layoutDef: DAILY_LAYOUTS[runtime?.templateVariant ?? "decision"],
    slots: DAILY_SLOTS[runtime?.templateVariant ?? "decision"],
    payload: {
      ...runtime,
      ...interaction,
      ...handlers,
      displayedAmount,
      advanceLabel: heroApi?.advanceLabel ?? "Continuar",
      shopColumns: 3,
      shopRows: 2,
    },
    shellClassName:
      runtime?.templateVariant === "shop"
        ? "mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 overflow-hidden px-4 py-3 text-white md:px-5 md:py-4"
        : "mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 overflow-hidden px-4 py-2 text-white md:gap-3 md:px-5 md:py-4",
    gridClassName: "h-full min-h-0 w-full",
  };
}
