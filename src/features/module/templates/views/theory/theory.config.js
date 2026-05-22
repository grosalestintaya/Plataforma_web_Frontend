/**
 * Theory config:
 * - Define variantes del template Theory.
 * - No contiene clases Tailwind de layout visual.
 * - Solo define estructura, slots, bloques y payload.
 */

const THEORY_VARIANT_BY_TEMPLATE = {
  simpleTheory: "simple",
  explanationTheory: "explanation",
  splitTheory: "split",
  assessmentTheory: "assessment",
};

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
      };
    },
    ...extra,
  };
}

function createImageProps(payload) {
  const media = payload?.media;

  return {
    src: media?.src,
    alt: media?.alt ?? "Imagen de apoyo",
    variant: media?.variant ?? media?.ratio,
    mode: media?.mode,
    zoomable: media?.zoomable !== false,
  };
}

/**
 * Para simple/split:
 * En vez de renderizar Image directamente, renderiza Card con solo media.
 * Así reutilizas el comportamiento responsive y zoom del Card.
 */
function createImageOnlyCardProps(payload) {
  const media = payload?.media;

  return {
    media: {
      src: media?.src,
      alt: media?.alt ?? "Imagen de apoyo",
      variant: media?.variant ?? media?.ratio,
      mode: media?.mode,
    },
    zoomable: media?.zoomable !== false,
    variant: media?.cardVariant ?? "ghost",
  };
}

function findCompound(compounds, targetType) {
  if (!Array.isArray(compounds)) return null;

  return (
    compounds.find((item) => (item?.component ?? item?.type) === targetType) ??
    null
  );
}

function toListContent(listData) {
  if (!Array.isArray(listData?.items) || listData.items.length === 0) {
    return null;
  }

  return {
    paragraphs: listData.items.map((item) => `* ${item}`),
    variant: listData?.variant ?? "bodySm",
    align: listData?.align ?? "left",
    color: listData?.color ?? "secondary",
  };
}

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

function normalizeShowCardItems(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...item,
    text:
      item?.text ?? item?.description ?? item?.subtitle ?? item?.label ?? null,
  }));
}

function getPayload(view = {}) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];

  const showCard = findCompound(compounds, "showCard");
  const flipCard = findCompound(compounds, "flipCard");
  const collageCard = findCompound(compounds, "collageCard");
  const chooseOne = findCompound(compounds, "chooseOne");
  const memoryPairs = findCompound(compounds, "memoryPairs");
  const crossword = findCompound(compounds, "crossword");

  const { feedbackText, supportList } = normalizeFeedback(
    view?.slots?.feedback,
  );

  return {
    title: view?.slots?.title,

    subtitle: view?.slots?.subtitle ?? chooseOne?.instruction ?? null,

    body: view?.slots?.body,
    media: view?.slots?.media,

    feedbackText,
    supportList,
    supportListTitle: supportList?.title ?? null,
    supportListContent: toListContent(supportList),

    rowItems: normalizeShowCardItems(showCard?.items ?? []),
    flipCardData: flipCard ?? null,
    collageCardData: collageCard ?? null,
    chooseOneData: chooseOne ?? null,
    memoryPairsData: memoryPairs ?? null,
    crosswordData: crossword ?? null,
  };
}

export const THEORY_CONFIG = {
  layouts: {
    simple: {
      base: {
        cols: "1fr",
        rows: "auto auto auto",
        areas: ["title", "body1", "media"],
      },
      fit: {
        rows: "auto auto minmax(0,1fr)",
        areas: ["title", "body1", "media"],
      },
    },

    explanation: {
      base: {
        cols: "1fr",
        rows: "auto auto",
        areas: ["title", "media"],
      },
      fit: {
        rows: "auto minmax(0,1fr)",
        areas: ["title", "media"],
      },
    },

    split: {
      base: {
        cols: "1fr",
        rows: "auto auto auto",
        areas: ["title", "body1", "media"],
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto auto auto",
        areas: ["title title", "body1 body1", "media media"],
      },
      fit: {
        rows: "auto auto minmax(0,1fr)",
        areas: ["title title", "body1 body1", "media media"],
      },
    },

    assessment: {
      base: {
        cols: "1fr",
        rows: "auto auto",
        areas: ["title", "assessment"],
      },
      fit: {
        rows: "auto minmax(0,1fr)",
        areas: ["title", "assessment"],
      },
    },
  },

  variants: {
    simple: [
      createTypographySlot("title", "title", "h1", {
        slotId: "title",
      }),

      {
        slotId: "bodyGroup",
        area: "body1",
        isStack: true,
        when: (payload) =>
          Boolean(payload?.body) || Boolean(payload?.supportListContent),
        items: [
          createTypographySlot("body1", "body", "body", {
            when: (payload) => Boolean(payload?.body),
          }),
          createTypographySlot("body1", "supportListTitle", "label", {
            when: (payload) => Boolean(payload?.supportListTitle),
          }),
          createTypographySlot("body1", "supportListContent", "bodySm", {
            when: (payload) => Boolean(payload?.supportListContent),
          }),
        ],
      },

      {
        slotId: "mediaGroup",
        area: "media",
        isStack: true,
        when: (payload) =>
          Boolean(payload?.media) ||
          (Array.isArray(payload?.rowItems) && payload.rowItems.length > 0),
        items: [
          {
            slotId: "showCard",
            area: "media",
            when: (payload) =>
              Array.isArray(payload?.rowItems) && payload.rowItems.length > 0,
            block: "ShowCard",
            props: (payload) => ({
              items: payload?.rowItems ?? [],
            }),
          },
          {
            slotId: "mediaImageCard",
            area: "media",
            when: (payload) => Boolean(payload?.media),
            block: "Card",
            props: createImageOnlyCardProps,
          },
        ],
      },

      {
        slotId: "feedback",
        area: "feedback",
        reserveSpace: true,
        reserveWhen: (payload) =>
          Boolean(payload?.feedbackText?.hiddenUntilAction),
        when: (payload) =>
          Boolean(payload?.feedbackText) &&
          !payload?.feedbackText?.hiddenUntilAction,
        block: "Typography",
        props: (payload) => ({
          content: payload?.feedbackText,
          variant: payload?.feedbackText?.variant ?? "helper",
          align: payload?.feedbackText?.align ?? "center",
          color: payload?.feedbackText?.color,
        }),
      },
    ],

    explanation: [
      createTypographySlot("title", "title", "h1", {
        slotId: "title",
      }),

      createTypographySlot("subtitle", "subtitle", "h3", {
        slotId: "subtitle",
        when: (payload) => Boolean(payload?.subtitle),
      }),

      {
        slotId: "examplesComplete",
        area: "media",
        when: (payload) => Boolean(payload?.collageCardData),
        block: "IteractionComplete",
        props: (payload, ctx) => ({
          view: ctx?.view,
          heroApi: ctx?.heroApi,
          type: "collageCard",
          countsTowardScore: false,
        }),
        child: {
          slotId: "examplesCollage",
          block: "CollageCard",
          props: (payload) => ({
            items: payload?.collageCardData?.items ?? [],
            columns: payload?.collageCardData?.columns ?? 4,
            rows: payload?.collageCardData?.rows,
          }),
        },
      },
    ],

    split: [
      createTypographySlot("title", "title", "h1", {
        slotId: "title",
      }),

      createTypographySlot("body1", "body", "h2", {
        slotId: "bodyTitle",
        when: (payload) => Boolean(payload?.body),
      }),

      {
        slotId: "supportGroup",
        area: "body2",
        isStack: true,
        when: (payload) =>
          Boolean(payload?.supportListTitle) ||
          Boolean(payload?.supportListContent),
        items: [
          createTypographySlot("body2", "supportListTitle", "label", {
            when: (payload) => Boolean(payload?.supportListTitle),
          }),
          createTypographySlot("body2", "supportListContent", "bodySm", {
            when: (payload) => Boolean(payload?.supportListContent),
          }),
        ],
      },

      {
        slotId: "mediaImageCard",
        area: "media",
        when: (payload) => Boolean(payload?.media),
        block: "Card",
        props: createImageOnlyCardProps,
      },
    ],

    assessment: [
      createTypographySlot("title", "title", "h1", {
        slotId: "title",
      }),

      createTypographySlot("subtitle", "subtitle", "h3", {
        slotId: "subtitle",
        when: (payload) => Boolean(payload?.subtitle),
      }),

      {
        slotId: "assessmentGroup",
        area: "assessment",
        isStack: true,
        items: [
          {
            slotId: "chooseOne",
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
            slotId: "memoryPairs",
            area: "assessment",
            when: (payload) => Boolean(payload?.memoryPairsData),
            block: "MemoryPairs",
            props: (payload, ctx) => ({
              data: payload?.memoryPairsData,
              heroApi: ctx?.heroApi,
              view: ctx?.view,
            }),
          },
          {
            slotId: "crossword",
            area: "assessment",
            when: (payload) => Boolean(payload?.crosswordData),
            block: "Crossword",
            props: (payload, ctx) => ({
              data: payload?.crosswordData,
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

function splitRows(rows) {
  return String(rows ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function insertLayoutRow(layoutDef, { index, area, rowSize = "auto", mdArea }) {
  if (!layoutDef?.base) return layoutDef;

  const baseRows = splitRows(layoutDef.base.rows);
  const baseAreas = [...layoutDef.base.areas];

  baseRows.splice(index, 0, rowSize);
  baseAreas.splice(index, 0, area);

  const next = {
    ...layoutDef,
    base: {
      ...layoutDef.base,
      rows: baseRows.join(" "),
      areas: baseAreas,
    },
  };

  if (layoutDef.md) {
    const mdRows = splitRows(layoutDef.md.rows);
    const mdAreas = [...layoutDef.md.areas];

    mdRows.splice(index, 0, rowSize);
    mdAreas.splice(index, 0, mdArea ?? `${area} ${area}`);

    next.md = {
      ...layoutDef.md,
      rows: mdRows.join(" "),
      areas: mdAreas,
    };
  }

  if (layoutDef.fit) {
    const fitRows = splitRows(layoutDef.fit.rows);
    const fitAreas = [...layoutDef.fit.areas];

    fitRows.splice(index, 0, rowSize);
    fitAreas.splice(index, 0, mdArea ?? area);

    next.fit = {
      ...layoutDef.fit,
      rows: fitRows.join(" "),
      areas: fitAreas,
    };
  }

  return next;
}

function removeLayoutRow(layoutDef, targetArea) {
  if (!layoutDef?.base) return layoutDef;

  function removeFromSection(section) {
    if (!section?.areas?.length) return section;

    const index = section.areas.findIndex((row) => row.includes(targetArea));

    if (index < 0) return section;

    const rows = splitRows(section.rows).filter((_, rowIndex) => {
      return rowIndex !== index;
    });

    const areas = section.areas.filter((_, rowIndex) => {
      return rowIndex !== index;
    });

    return {
      ...section,
      rows: rows.join(" "),
      areas,
    };
  }

  return {
    ...layoutDef,
    base: removeFromSection(layoutDef.base),
    ...(layoutDef.md ? { md: removeFromSection(layoutDef.md) } : {}),
    ...(layoutDef.fit ? { fit: removeFromSection(layoutDef.fit) } : {}),
  };
}

function resolveLayoutDef(variant, baseLayout, payload) {
  if (!baseLayout?.base) return baseLayout;

  if (variant === "simple" && payload?.feedbackText) {
    return insertLayoutRow(baseLayout, {
      index: baseLayout.base.areas.length,
      area: "feedback",
      rowSize: "auto",
      mdArea: "feedback feedback",
    });
  }

  if (variant === "explanation" && payload?.subtitle) {
    return insertLayoutRow(baseLayout, {
      index: 1,
      area: "subtitle",
      rowSize: "auto",
      mdArea: "subtitle",
    });
  }

  if (
    variant === "split" &&
    (payload?.supportListTitle || payload?.supportListContent)
  ) {
    const next = insertLayoutRow(baseLayout, {
      index: 2,
      area: "body2",
      rowSize: "auto",
      mdArea: "body2 media",
    });

    return removeLayoutRow(next, "media media");
  }

  if (variant === "assessment" && payload?.subtitle) {
    return insertLayoutRow(baseLayout, {
      index: 1,
      area: "subtitle",
      rowSize: "auto",
    });
  }

  return baseLayout;
}

function resolveVariant(variant, view) {
  if (variant && THEORY_CONFIG.variants[variant]) return variant;

  const mappedVariant = THEORY_VARIANT_BY_TEMPLATE[view?.template];

  if (mappedVariant && THEORY_CONFIG.variants[mappedVariant]) {
    return mappedVariant;
  }

  return THEORY_CONFIG.fallbackVariant;
}

export function getTheoryRuntime({ variant = "simple", view }) {
  const resolvedVariant = resolveVariant(variant, view);
  const payload = getPayload(view);
  const baseLayout = THEORY_CONFIG.layouts[resolvedVariant];

  return {
    variant: resolvedVariant,
    layoutDef: resolveLayoutDef(resolvedVariant, baseLayout, payload),
    slots: THEORY_CONFIG.variants[resolvedVariant],
    payload,
  };
}
