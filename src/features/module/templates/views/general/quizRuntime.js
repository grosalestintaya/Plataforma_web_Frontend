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
  return (
    view?.slots?.media ?? view?.media ?? data?.media ?? data?.image ?? null
  );
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

const FORM_SLOT = Object.freeze({
  slotId: "form",
  area: "primary",
  when: (payload) => Boolean(payload?.formData),
  block: "Form",
  props: (payload, ctx) => ({
    data: payload?.formData,
    heroApi: ctx?.heroApi,
    view: ctx?.view,
    variant: ctx?.quizVariant,
  }),
});

const QUIZ_VARIANT_SLOTS = Object.freeze({
  simple: Object.freeze([FORM_SLOT]),
  extended: Object.freeze([FORM_SLOT]),
});

const QUIZ_FALLBACK_VARIANT = "simple";

function resolveVariant(variant, view) {
  const explicitVariant = variant ?? view?.variant;

  if (explicitVariant && QUIZ_VARIANT_SLOTS[explicitVariant]) {
    return explicitVariant;
  }

  const mappedVariant = QUIZ_VARIANT_BY_TEMPLATE[view?.template];

  if (mappedVariant && QUIZ_VARIANT_SLOTS[mappedVariant]) {
    return mappedVariant;
  }

  return QUIZ_FALLBACK_VARIANT;
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
    layoutVariant: "focus",
    slots: QUIZ_VARIANT_SLOTS[resolvedVariant].map((slot) => ({
      ...slot,
      areaClassName: [
        slot?.areaClassName,
        "w-full min-w-0 max-w-full justify-start overflow-visible",
      ]
        .filter(Boolean)
        .join(" "),
    })),
    payload: getPayload(view, data),
    gridClassName:
      "mx-0 w-[calc(100vw-2rem)] min-w-0 max-w-[calc(100vw-2rem)] overflow-visible px-0 sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] sm:px-0 md:w-full md:max-w-full md:px-0 lg:px-12",
  };
}
