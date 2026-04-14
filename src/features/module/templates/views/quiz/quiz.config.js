/**
 * Quiz config:
 * - Define variantes, layout y slots del template Quiz.
 * - El Template.jsx solo renderiza esta configuracion.
 */

/**
 * Mapea el nombre de template del JSON a una variante interna.
 */
export const QUIZ_VARIANT_BY_TEMPLATE = {
  simpleQuiz: "simple",
  extendedQuiz: "extended",
};

/**
 * Fabrica de slot tipografico para evitar repeticion.
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
 * Config principal del template Quiz.
 * simple: title + action + feedback*
 * extended: title + action + media + feedback*
 */
export const QUIZ_CONFIG = {
  layouts: {
    simple: {
      base: {
        cols: "1fr",
        rows: "auto auto auto",
        areas: ["title", "action", "feedback"],
        gap: "20px",
      },
    },
    extended: {
      base: {
        cols: "1fr",
        rows: "auto auto auto auto",
        areas: ["title", "action", "media", "feedback"],
        gap: "20px",
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto auto auto",
        areas: ["title title", "action media", "feedback feedback"],
      },
    },
  },
  variants: {
    simple: [
      createTypographySlot("title", "title", "h3", {
        className: "rounded-2xl  p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "action",
        block: "Form",
        props: (payload, ctx) => ({
          data: payload?.formQuestion,
          heroApi: ctx?.heroApi,
          view: ctx?.view,
        }),
      },
      createTypographySlot("feedback", "feedback", "helper", {
        when: (payload) => Boolean(payload?.feedback),
        className: "rounded-2xl  p-5",
        containerClassName: "mx-auto max-w-[760px]",
      }),
    ],
    extended: [
      createTypographySlot("title", "title", "h3", {
        className: "rounded-2xl  p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "action",
        block: "Form",
        props: (payload, ctx) => ({
          data: payload?.formQuestion,
          heroApi: ctx?.heroApi,
          view: ctx?.view,
        }),
      },
      {
        area: "media",
        when: (payload) => Boolean(payload?.media),
        block: "Image",
        className: "rounded-2xl  p-5",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen de apoyo",
          variant: payload?.media?.variant ?? payload?.media?.ratio,
          className: "h-full w-full",
        }),
      },
      createTypographySlot("feedback", "feedback", "helper", {
        when: (payload) => Boolean(payload?.feedback),
        className: "rounded-2xl  p-5",
        containerClassName: "mx-auto max-w-[760px]",
      }),
    ],
  },
  fallbackVariant: "simple",
};

/**
 * Obtiene el compuesto `formQuestion` desde la estructura de elementos.
 */
function getFormQuestion(view, data = {}) {
  if (Array.isArray(view?.elements?.compound)) {
    const question = view.elements.compound.find(
      (item) => (item?.component ?? item?.type) === "formQuestion",
    );
    if (question) return question;
  }

  return data?.formQuestion ?? null;
}

/**
 * Resuelve variante con prioridad: variant > template map > fallback.
 */
function resolveVariant(variant, view) {
  if (variant && QUIZ_CONFIG.variants[variant]) return variant;
  const mappedVariant = QUIZ_VARIANT_BY_TEMPLATE[view?.template];
  if (mappedVariant && QUIZ_CONFIG.variants[mappedVariant]) return mappedVariant;
  return QUIZ_CONFIG.fallbackVariant;
}

/**
 * Estandariza el payload para simplificar slots.
 */
function getPayload(data = {}, view) {
  return {
    title: view?.slots?.title ?? data?.title,
    media: view?.slots?.media ?? data?.media,
    feedback: view?.slots?.feedback ?? data?.feedback,
    formQuestion: getFormQuestion(view, data),
  };
}

/**
 * Punto de entrada consumido por QuizTemplate.
 */
export function getQuizRuntime({ variant, data, view }) {
  const resolvedVariant = resolveVariant(variant, view);

  return {
    layoutDef: QUIZ_CONFIG.layouts[resolvedVariant],
    slots: QUIZ_CONFIG.variants[resolvedVariant],
    payload: getPayload(data, view),
  };
}
