/**
 * Theory config:
 * - Define las variantes del template Theory segun la guia nueva.
 * - Solo agrega el area `additional` cuando la vista realmente usa ese slot.
 */

const THEORY_VARIANT_BY_TEMPLATE = {
  simpleTheory: "simple",
  explanationTheory: "explanation",
  splitTheory: "split",
  assessmentTheory: "assessment",
};

/**
 * Reutiliza la definicion base de un slot tipografico.
 */
function createTypographySlot(area, contentKey, fallbackVariant, extra = {}) {
  return {
    area,
    block: "Typography",
    props: (payload) => {
      const content = payload?.[contentKey];
      return {
        content,
        variant: content?.variant ?? fallbackVariant,
        color: content?.color,
        align: content?.align,
        component: content?.component,
        className: content?.className,
        containerClassName: content?.containerClassName,
      };
    },
    ...extra,
  };
}

/**
 * Busca un compuesto por nombre dentro de `elements.compound`.
 */
function findCompound(compounds, targetType) {
  if (!Array.isArray(compounds)) return null;
  return compounds.find((item) => (item?.component ?? item?.type) === targetType) ?? null;
}

/**
 * Convierte una lista del documento en contenido tipografico con vietas.
 */
function toListContent(listData) {
  if (!Array.isArray(listData?.items) || listData.items.length === 0) return null;

  return {
    paragraphs: listData.items.map((item) => `* ${item}`),
    variant: listData?.variant ?? "bodySm",
    align: listData?.align ?? "left",
    color: listData?.color ?? "secondary",
  };
}

/**
 * Separa el feedback textual del feedback usado como lista de apoyo.
 */
function normalizeFeedback(feedback) {
  if (!feedback) {
    return {
      feedbackText: null,
      supportList: null,
    };
  }

  if (Array.isArray(feedback?.items)) {
    return {
      feedbackText: feedback?.text ? { ...feedback, items: undefined } : null,
      supportList: feedback,
    };
  }

  return {
    feedbackText: feedback,
    supportList: null,
  };
}

/**
 * Construye el payload unico que consumen las variantes.
 */
function getPayload(view = {}) {
  const compounds = Array.isArray(view?.elements?.compound) ? view.elements.compound : [];
  const rowCard = findCompound(compounds, "rowCard");
  const flipCard = findCompound(compounds, "flipCard");
  const collageCard = findCompound(compounds, "collageCard");
  const chooseOne = findCompound(compounds, "chooseOne");
  const memoryPairs = findCompound(compounds, "memoryPairs");
  const { feedbackText, supportList } = normalizeFeedback(view?.slots?.feedback);

  return {
    title: view?.slots?.title,
    subtitle: view?.slots?.subtitle,
    body: view?.slots?.body,
    media: view?.slots?.media,
    feedbackText,
    supportList,
    supportListTitle: supportList?.title ?? null,
    supportListContent: toListContent(supportList),
    rowItems: rowCard?.items ?? [],
    flipCardData: flipCard ?? null,
    collageCardData: collageCard ?? null,
    chooseOneData: chooseOne ?? null,
    memoryPairsData: memoryPairs ?? null,
  };
}

export const THEORY_CONFIG = {
  layouts: {
    simple: {
      base: {
        cols: "1fr",
        rows: "auto auto auto",
        areas: ["title", "content", "media"],
        gap: "20px",
      },
    },
    explanation: {
      base: {
        cols: "1fr",
        rows: "auto auto auto",
        areas: ["title", "subtitle", "interaction"],
        gap: "20px",
      },
    },
    split: {
      base: {
        cols: "1fr",
        rows: "auto auto auto auto",
        areas: ["title", "body", "support", "media"],
        gap: "20px",
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto auto auto",
        areas: ["title title", "body body", "support media"],
      },
    },
    assessment: {
      base: {
        cols: "1fr",
        rows: "auto auto",
        areas: ["title", "assessment"],
        gap: "20px",
      },
    },
  },
  variants: {
    simple: [
      createTypographySlot("title", "title", "h1", {
        className: "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "content",
        when: (payload) =>
          Boolean(payload?.body) ||
          Boolean(payload?.supportListContent) ||
          (Array.isArray(payload?.rowItems) && payload.rowItems.length > 0),
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        stackClassName: "gap-4",
        items: [
          createTypographySlot("content", "body", "body", {
            when: (payload) => Boolean(payload?.body),
          }),
          createTypographySlot("content", "supportListTitle", "label", {
            when: (payload) => Boolean(payload?.supportListTitle),
          }),
          createTypographySlot("content", "supportListContent", "bodySm", {
            when: (payload) => Boolean(payload?.supportListContent),
          }),
          {
            area: "content",
            when: (payload) => Array.isArray(payload?.rowItems) && payload.rowItems.length > 0,
            block: "RowCard",
            props: (payload) => ({ items: payload?.rowItems ?? [] }),
          },
        ],
      },
      {
        area: "media",
        when: (payload) => Boolean(payload?.media),
        block: "Image",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen de apoyo",
          className: "min-h-[220px] w-full",
        }),
      },
      {
        area: "additional",
        reserveSpace: true,
        reserveWhen: (payload) => Boolean(payload?.feedbackText?.hiddenUntilAction),
        placeholderClassName: "min-h-[72px]",
        when: (payload) => Boolean(payload?.feedbackText) && !payload?.feedbackText?.hiddenUntilAction,
        block: "Typography",
        props: (payload) => ({
          content: payload?.feedbackText,
          variant: payload?.feedbackText?.variant ?? "helper",
          align: payload?.feedbackText?.align ?? "center",
          containerClassName:
            "mx-auto flex min-h-[72px] w-full max-w-[760px] items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-4",
        }),
      },
    ],
    explanation: [
      createTypographySlot("title", "title", "h1", {
        className: "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      createTypographySlot("subtitle", "subtitle", "h3", {
        when: (payload) => Boolean(payload?.subtitle),
        className: "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "interaction",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        stackClassName: "gap-4",
        items: [
          {
            area: "interaction",
            when: (payload) => Boolean(payload?.collageCardData),
            block: "CollageCard",
            props: (payload, ctx) => ({
              items: payload?.collageCardData?.items ?? [],
              columns: payload?.collageCardData?.columns ?? 2,
              heroApi: ctx?.heroApi,
              view: ctx?.view,
            }),
          },
          {
            area: "interaction",
            when: (payload) => Boolean(payload?.flipCardData),
            block: "FlipCard",
            props: (payload, ctx) => ({
              data: payload?.flipCardData,
              heroApi: ctx?.heroApi,
              view: ctx?.view,
            }),
          },
          {
            area: "interaction",
            when: (payload) =>
              Boolean(payload?.media) &&
              !payload?.flipCardData &&
              !payload?.collageCardData,
            block: "Image",
            props: (payload) => ({
              src: payload?.media?.src,
              alt: payload?.media?.alt ?? "Imagen de apoyo",
              className: "min-h-[220px] w-full",
            }),
          },
        ],
      },
      {
        area: "additional",
        reserveSpace: true,
        reserveWhen: (payload) => Boolean(payload?.feedbackText?.hiddenUntilAction),
        placeholderClassName: "min-h-[72px]",
        when: (payload) => Boolean(payload?.feedbackText) && !payload?.feedbackText?.hiddenUntilAction,
        block: "Typography",
        props: (payload) => ({
          content: payload?.feedbackText,
          variant: payload?.feedbackText?.variant ?? "helper",
          align: payload?.feedbackText?.align ?? "center",
          containerClassName:
            "mx-auto flex min-h-[72px] w-full max-w-[760px] items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-4",
        }),
      },
    ],
    split: [
      createTypographySlot("title", "title", "h1", {
        className: "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      createTypographySlot("body", "body", "body", {
        when: (payload) => Boolean(payload?.body),
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
      }),
      {
        area: "support",
        when: (payload) => Boolean(payload?.supportListContent),
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        stackClassName: "gap-4",
        items: [
          createTypographySlot("support", "supportListTitle", "label", {
            when: (payload) => Boolean(payload?.supportListTitle),
          }),
          createTypographySlot("support", "supportListContent", "bodySm", {
            when: (payload) => Boolean(payload?.supportListContent),
          }),
        ],
      },
      {
        area: "media",
        when: (payload) => Boolean(payload?.media),
        block: "Image",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen de apoyo",
          className: "min-h-[220px] w-full",
        }),
      },
      {
        area: "additional",
        reserveSpace: true,
        reserveWhen: (payload) => Boolean(payload?.feedbackText?.hiddenUntilAction),
        placeholderClassName: "min-h-[72px]",
        when: (payload) => Boolean(payload?.feedbackText) && !payload?.feedbackText?.hiddenUntilAction,
        block: "Typography",
        props: (payload) => ({
          content: payload?.feedbackText,
          variant: payload?.feedbackText?.variant ?? "helper",
          align: payload?.feedbackText?.align ?? "center",
          containerClassName:
            "mx-auto flex min-h-[72px] w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-4",
        }),
      },
    ],
    assessment: [
      {
        area: "title",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        stackClassName: "gap-3",
        items: [
          createTypographySlot("title", "title", "h1"),
          createTypographySlot("title", "subtitle", "h3", {
            when: (payload) => Boolean(payload?.subtitle),
          }),
        ],
      },
      {
        area: "assessment",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        stackClassName: "gap-4",
        items: [
          {
            area: "assessment",
            when: (payload) => Boolean(payload?.chooseOneData),
            block: "ChooseOne",
            props: (payload, ctx) => ({
              data: payload?.chooseOneData,
              heroApi: ctx?.heroApi,
              view: ctx?.view,
            }),
          },
          {
            area: "assessment",
            when: (payload) => Boolean(payload?.memoryPairsData),
            block: "MemoryPairs",
            props: (payload, ctx) => ({
              data: payload?.memoryPairsData,
              heroApi: ctx?.heroApi,
              view: ctx?.view,
            }),
          },
        ],
      },
    ],
  },
  fallbackVariant: "simple",
};

/**
 * Identifica si la vista realmente usa un slot adicional.
 */
function hasAdditionalSlot(payload) {
  return Boolean(payload?.feedbackText);
}

/**
 * Extiende el layout solo cuando esa vista necesita el area adicional.
 */
function appendAdditionalArea(layoutDef) {
  if (!layoutDef?.base) return layoutDef;

  return {
    ...layoutDef,
    base: {
      ...layoutDef.base,
      rows: `${layoutDef.base.rows} minmax(72px,auto)`,
      areas: [...layoutDef.base.areas, "additional"],
    },
    ...(layoutDef.md
      ? {
          md: {
            ...layoutDef.md,
            rows: `${layoutDef.md.rows} minmax(72px,auto)`,
            areas: [...layoutDef.md.areas, "additional additional"],
          },
        }
      : {}),
  };
}

/**
 * Resuelve variante con prioridad:
 * 1) variant explicita
 * 2) nombre de template
 * 3) fallback
 */
function resolveVariant(variant, view) {
  if (variant && THEORY_CONFIG.variants[variant]) return variant;
  const mappedVariant = THEORY_VARIANT_BY_TEMPLATE[view?.template];
  if (mappedVariant && THEORY_CONFIG.variants[mappedVariant]) return mappedVariant;
  return THEORY_CONFIG.fallbackVariant;
}

/**
 * Punto de entrada consumido por TheoryTemplate.
 */
export function getTheoryRuntime({ variant = "simple", view }) {
  const resolvedVariant = resolveVariant(variant, view);
  const payload = getPayload(view);
  const baseLayout = THEORY_CONFIG.layouts[resolvedVariant];

  return {
    layoutDef: hasAdditionalSlot(payload) ? appendAdditionalArea(baseLayout) : baseLayout,
    slots: THEORY_CONFIG.variants[resolvedVariant],
    payload,
  };
}
