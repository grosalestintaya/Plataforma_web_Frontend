const QUIZ_VARIANT_BY_TEMPLATE = {
  simpleQuiz: "simple",
  extendedQuiz: "extended",
  choiceReveal: "simple",
};

function getFormQuestionNodes(view, data = {}) {
  if (Array.isArray(view?.elements?.compound)) {
    const questions = view.elements.compound.filter(
      (item) => (item?.component ?? item?.type) === "formQuestion",
    );

    if (questions.length > 0) return questions;
  }

  if (data?.formQuestion) {
    return [data.formQuestion];
  }

  if (Array.isArray(data?.questions)) {
    return [
      {
        ...data,
        id: data?.id ?? "form-group",
      },
    ];
  }

  return data ? [data] : [];
}

function getFallbackMedia(view, data = {}) {
  return view?.slots?.media ?? view?.media ?? data?.media ?? data?.image ?? null;
}

function getFallbackExtraSlot(view, data = {}) {
  return (
    view?.slots?.extra ??
    view?.slots?.extraSlot ??
    data?.extraSlot ??
    data?.extra ??
    null
  );
}

function getFormData(view, data = {}) {
  const fallbackMedia = getFallbackMedia(view, data);
  const fallbackExtraSlot = getFallbackExtraSlot(view, data);
  const nodes = getFormQuestionNodes(view, data);

  if (nodes.length === 0) return null;

  if (nodes.length === 1) {
    const node = nodes[0];

    return {
      ...node,
      media: node?.media ?? fallbackMedia,
      extraSlot: node?.extraSlot ?? node?.extra ?? fallbackExtraSlot,
    };
  }

  return {
    id: data?.id ?? view?.id ?? view?.viewId ?? "form-group",
    media: fallbackMedia,
    extraSlot: fallbackExtraSlot,
    questions: nodes.map((node, index) => ({
      ...node,
      id: node?.id ?? `question-${index + 1}`,
      media: node?.media ?? fallbackMedia,
      extraSlot: node?.extraSlot ?? node?.extra ?? fallbackExtraSlot,
    })),
  };
}

const FORM_SLOT = {
  slotId: "form",
  area: "form",
  when: (payload) => Boolean(payload?.formData),
  block: "Form",
  props: (payload, ctx) => ({
    data: payload?.formData,
    heroApi: ctx?.heroApi,
    view: ctx?.view,
    variant: ctx?.quizVariant,
  }),
};

export const QUIZ_CONFIG = {
  layouts: {
    simple: {
      base: {
        cols: "1fr",
        rows: "minmax(0,1fr)",
        areas: ["form"],
      },
    },

    extended: {
      base: {
        cols: "1fr",
        rows: "minmax(0,1fr)",
        areas: ["form"],
      },
    },
  },

  variants: {
    simple: [FORM_SLOT],
    extended: [FORM_SLOT],
  },

  fallbackVariant: "simple",
};

function resolveVariant(variant, view) {
  const explicitVariant = variant ?? view?.variant;

  if (explicitVariant && QUIZ_CONFIG.variants[explicitVariant]) {
    return explicitVariant;
  }

  const mappedVariant = QUIZ_VARIANT_BY_TEMPLATE[view?.template];

  if (mappedVariant && QUIZ_CONFIG.variants[mappedVariant]) {
    return mappedVariant;
  }

  return QUIZ_CONFIG.fallbackVariant;
}

function getPayload(view, data = {}) {
  return {
    formData: getFormData(view, data),
  };
}

export function getQuizRuntime({ variant, data, view }) {
  const resolvedVariant = resolveVariant(variant, view);

  return {
    variant: resolvedVariant,
    layoutDef: QUIZ_CONFIG.layouts[resolvedVariant],
    slots: QUIZ_CONFIG.variants[resolvedVariant],
    payload: getPayload(view, data),
  };
}