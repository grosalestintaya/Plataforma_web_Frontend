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
  return (
    compounds.find((item) => (item?.component ?? item?.type) === targetType) ??
    null
  );
}

/**
 * Convierte una lista del documento en contenido tipografico con vietas.
 */
function toListContent(listData) {
  if (!Array.isArray(listData?.items) || listData.items.length === 0)
    return null;

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
 * Asegura que las cards simples lleguen con `text` consistente al bloque ShowCard.
 * Algunos contenidos antiguos podian traer la descripcion corta con otra clave.
 */
function normalizeShowCardItems(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...item,
    text:
      item?.text ?? item?.description ?? item?.subtitle ?? item?.label ?? null,
  }));
}

/**
 * Construye el payload unico que consumen las variantes.
 */
function getPayload(view = {}) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];
  const showCard = findCompound(compounds, "showCard");
  const flipCard = findCompound(compounds, "flipCard");
  const collageCard = findCompound(compounds, "collageCard");
  const chooseOne = findCompound(compounds, "chooseOne");
  const memoryPairs = findCompound(compounds, "memoryPairs");
  const { feedbackText, supportList } = normalizeFeedback(
    view?.slots?.feedback,
  );

  return {
    title: view?.slots?.title,
    // Assessment usa `subtitle` como texto guia del ejercicio.
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
  };
}

export const THEORY_CONFIG = {
  layouts: {
    simple: {
      base: {
        cols: "1fr",
        rows: "auto auto minmax(0,1fr)",
        areas: ["title", "body1", "media"],
      },
    },
    explanation: {
      base: {
        cols: "1fr",
        rows: "auto minmax(0,1fr)",
        areas: ["title", "media"],
      },
    },
    split: {
      base: {
        cols: "1fr",
        rows: "auto auto minmax(0,1fr)",
        areas: ["title", "body1", "media"],
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto auto minmax(0,1fr)",
        areas: ["title title", "body1 body1", "media media"],
      },
    },
    assessment: {
      base: {
        cols: "1fr",
        rows: "auto minmax(0,1fr)",
        areas: ["title", "assessment"],
      },
    },
  },
  variants: {
    simple: [
      createTypographySlot("title", "title", "h1", {
        // Los bloques solo textuales se anclan arriba para no aparentar
        // que consumen mas alto del que realmente necesita el texto.
        className: "self-start rounded-2xl text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "body1",
        when: (payload) =>
          Boolean(payload?.body) || Boolean(payload?.supportListContent),
        className: "rounded-2xl",
        stackClassName: "gap-10",
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
        area: "media",
        when: (payload) =>
          Boolean(payload?.media) ||
          (Array.isArray(payload?.rowItems) && payload.rowItems.length > 0),
        className: "rounded-2xl place-items-stretch content-start",
        stackClassName: "w-full gap-4",
        items: [
          {
            area: "media",
            when: (payload) =>
              Array.isArray(payload?.rowItems) && payload.rowItems.length > 0,
            // Usa el compuesto real exportado por blocks/index.
            // Aqui no se crea nada extra: solo se entregan items con media,
            // titulo y texto para que ShowCard construya Cards normales.
            block: "ShowCard",
            props: (payload) => ({ items: payload?.rowItems ?? [] }),
          },
          {
            area: "media",
            when: (payload) => Boolean(payload?.media),
            block: "Image",
            props: (payload) => ({
              src: payload?.media?.src,
              alt: payload?.media?.alt ?? "Imagen de apoyo",
              variant: payload?.media?.variant ?? payload?.media?.ratio,
              mode: payload?.media?.mode,
              fitToContent: payload?.media?.fitToContent,
              className: payload?.media?.className ?? "min-h-[220px] w-full",
              imgClassName: payload?.media?.imgClassName,
              zoomable: payload?.media?.zoomable !== false,
            }),
          },
        ],
      },
      {
        area: "feedback",
        reserveSpace: true,
        reserveWhen: (payload) =>
          Boolean(payload?.feedbackText?.hiddenUntilAction),
        placeholderClassName: "min-h-[72px]",
        when: (payload) =>
          Boolean(payload?.feedbackText) &&
          !payload?.feedbackText?.hiddenUntilAction,
        block: "Typography",
        props: (payload) => ({
          content: payload?.feedbackText,
          variant: payload?.feedbackText?.variant ?? "helper",
          align: payload?.feedbackText?.align ?? "center",
          containerClassName:
            "mx-auto flex min-h-[72px] w-full max-w-[760px] items-center justify-center rounded-2xl  p-4",
        }),
      },
    ],
    explanation: [
      createTypographySlot("title", "title", "h1", {
        className: "self-start rounded-2xl text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      createTypographySlot("subtitle", "subtitle", "h3", {
        when: (payload) => Boolean(payload?.subtitle),
        className: "self-start rounded-2xl text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "media",
        // El area visual principal ocupa el espacio disponible del hero.
        className:
          "h-full min-h-0 rounded-2xl place-items-stretch place-content-stretch",
        stackClassName:
          "h-full min-h-0 justify-start gap-4 px-0 sm:px-6 xl:px-20",
        items: [
          {
            area: "media",
            when: (payload) => Boolean(payload?.collageCardData),
            block: "CollageCard",
            props: (payload, ctx) => ({
              items: payload?.collageCardData?.items ?? [],
              columns: payload?.collageCardData?.columns ?? 2,
              rows: payload?.collageCardData?.rows,
              heroApi: ctx?.heroApi,
              view: ctx?.view,
              className: "h-full",
            }),
          },
          {
            area: "media",
            when: (payload) => Boolean(payload?.flipCardData),
            block: "FlipCard",
            props: (payload, ctx) => ({
              data: payload?.flipCardData,
              heroApi: ctx?.heroApi,
              view: ctx?.view,
              containerClassName: "h-full",
            }),
          },
          {
            area: "media",
            when: (payload) =>
              Boolean(payload?.media) &&
              !payload?.flipCardData &&
              !payload?.collageCardData,
            block: "Image",
            props: (payload) => ({
              src: payload?.media?.src,
              alt: payload?.media?.alt ?? "Imagen de apoyo",
              variant: payload?.media?.variant ?? payload?.media?.ratio,
              mode: payload?.media?.mode,
              fitToContent: payload?.media?.fitToContent,
              className: payload?.media?.className ?? "min-h-[220px] w-full",
              imgClassName: payload?.media?.imgClassName,
              zoomable: payload?.media?.zoomable !== false,
            }),
          },
        ],
      },
    ],
    split: [
      createTypographySlot("title", "title", "h1", {
        className: "self-start rounded-2xl text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      createTypographySlot("body1", "body", "h2", {
        when: (payload) => Boolean(payload?.body),
        className: "self-start rounded-2xl font-black",
      }),
      {
        area: "body2",
        when: (payload) =>
          Boolean(payload?.supportListTitle) ||
          Boolean(payload?.supportListContent),
        className: "self-start rounded-2xl text-left",
        stackClassName: "gap-3",
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
        area: "media",
        when: (payload) => Boolean(payload?.media),
        block: "Image",
        className: "rounded-2xl",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen de apoyo",
          variant: payload?.media?.variant ?? payload?.media?.ratio,
          mode: payload?.media?.mode,
          fitToContent: payload?.media?.fitToContent,
          className: payload?.media?.className ?? "min-h-[220px] w-full",
          imgClassName: payload?.media?.imgClassName,
          zoomable: payload?.media?.zoomable !== false,
        }),
      },
    ],
    assessment: [
      createTypographySlot("title", "title", "h1", {
        className: "self-start rounded-2xl text-center",
      }),
      createTypographySlot("subtitle", "subtitle", "h3", {
        when: (payload) => Boolean(payload?.subtitle),
        className: "self-start rounded-2xl text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "assessment",
        className:
          "h-full min-h-0 rounded-2xl place-items-stretch place-content-stretch",
        stackClassName: "h-full min-h-0 justify-start gap-4",
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
 * Inserta una fila opcional en un layout sin romper sus otras areas.
 * Se usa para subtitle/body2/feedback segun la variante de la guia.
 */
function insertLayoutRow(layoutDef, { index, area, rowSize = "auto", mdArea }) {
  if (!layoutDef?.base) return layoutDef;

  const baseRows = String(layoutDef.base.rows).trim().split(/\s+/);
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
    const mdRows = String(layoutDef.md.rows).trim().split(/\s+/);
    const mdAreas = [...layoutDef.md.areas];
    mdRows.splice(index, 0, rowSize);
    mdAreas.splice(index, 0, mdArea ?? `${area} ${area}`);

    next.md = {
      ...layoutDef.md,
      rows: mdRows.join(" "),
      areas: mdAreas,
    };
  }

  return next;
}

/**
 * Resuelve el layout final segun la variante y sus slots opcionales.
 */
function resolveLayoutDef(variant, baseLayout, payload) {
  if (!baseLayout?.base) return baseLayout;

  if (variant === "simple" && payload?.feedbackText) {
    return insertLayoutRow(baseLayout, {
      index: baseLayout.base.areas.length,
      area: "feedback",
      rowSize: "minmax(72px,auto)",
      mdArea: "feedback feedback",
    });
  }

  if (variant === "explanation" && payload?.subtitle) {
    return insertLayoutRow(baseLayout, {
      index: 1,
      area: "subtitle",
    });
  }

  if (
    variant === "split" &&
    (payload?.supportListTitle || payload?.supportListContent)
  ) {
    const next = insertLayoutRow(baseLayout, {
      // En mobile body2 va antes de media; en desktop comparte la fila con media.
      index: 2,
      area: "body2",
      rowSize: "minmax(0,1fr)",
      mdArea: "body2 media",
    });

    if (next?.md?.areas?.length) {
      next.md.areas = next.md.areas.filter(
        (row, index) => !(index === 3 && row === "media media"),
      );
      next.md.rows = String(next.md.rows)
        .trim()
        .split(/\s+/)
        .filter((_, index) => index !== 3)
        .join(" ");
    }

    return next;
  }

  if (variant === "assessment" && payload?.subtitle) {
    return insertLayoutRow(baseLayout, {
      index: 1,
      area: "subtitle",
    });
  }

  return baseLayout;
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
  if (mappedVariant && THEORY_CONFIG.variants[mappedVariant])
    return mappedVariant;
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
    layoutDef: resolveLayoutDef(resolvedVariant, baseLayout, payload),
    slots: THEORY_CONFIG.variants[resolvedVariant],
    payload,
  };
}
