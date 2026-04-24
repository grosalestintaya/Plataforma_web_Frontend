export const QUIZ_VARIANT_BY_TEMPLATE = {
  simpleQuiz: "simple",
  extendedQuiz: "extended",
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
        className: content?.className,
        containerClassName: content?.containerClassName,
      };
    },
    ...extra,
  };
}

export const QUIZ_CONFIG = {
  layouts: {
    simple: {
      base: {
        cols: "1fr 1fr",
        rows: "auto auto minmax(0,1fr) auto auto",
        areas: [
          "navigation navigation",
          "media media",
          "action action",
          "feedbackLabel feedbackInput",
          "mobileBack mobileNext",
        ],
        gap: "12px",
      },
      md: {
        cols: "minmax(96px,0.12fr) minmax(0,1fr) minmax(0,1fr) minmax(96px,0.12fr)",
        rows: "auto auto minmax(0,1fr) auto",
        areas: [
          "leftNav navigation navigation rightNav",
          "leftNav media media rightNav",
          "leftNav action action rightNav",
          "leftNav feedbackLabel feedbackInput rightNav",
        ],
      },
    },
    extended: {
      base: {
        cols: "1fr 1fr",
        rows: "auto minmax(0,1fr) auto auto",
        areas: [
          "navigation navigation",
          "action action",
          "feedbackLabel feedbackInput",
          "mobileBack mobileNext",
        ],
        gap: "12px",
      },
      md: {
        cols: "minmax(96px,0.12fr) minmax(0,1fr) minmax(0,1fr) minmax(96px,0.12fr)",
        rows: "auto auto minmax(0,1fr) auto",
        areas: [
          "leftNav navigation navigation rightNav",
          "leftNav title title rightNav",
          "leftNav action action rightNav",
          "leftNav feedbackLabel feedbackInput rightNav",
        ],
      },
    },
  },
  variants: {
    simple: [
      {
        area: "navigation",
        block: "QuizProgressHeader",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
        props: (_payload, ctx) => ({
          progress: ctx?.quizState?.progress ?? null,
        }),
      },
      {
        area: "leftNav",
        block: "Button",
        className:
          "hidden md:grid place-items-stretch place-content-stretch overflow-visible p-0",
        props: (_payload, ctx) => ({
          label: "←",
          onClick: ctx?.quizState?.goBack,
          disabled: !ctx?.quizState?.canGoBack,
          className:
            "h-full w-full rounded-[1.25rem] border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.82))] text-5xl font-black shadow-[0_18px_40px_rgba(59,7,100,0.18)] hover:bg-white/10",
        }),
      },
      {
        area: "rightNav",
        block: "Button",
        className:
          "hidden md:grid place-items-stretch place-content-stretch overflow-visible p-0",
        props: (_payload, ctx) => ({
          label: "→",
          onClick: ctx?.quizState?.advance,
          disabled: !ctx?.quizState?.canAdvance,
          className:
            "h-full w-full rounded-[1.25rem] border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.82))] text-5xl font-black shadow-[0_18px_40px_rgba(59,7,100,0.18)] hover:bg-white/10",
        }),
      },
      {
        area: "media",
        when: (payload) => Boolean(payload?.media?.src),
        block: "Image",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen de apoyo",
          mode: "intrinsic",
          zoomable: payload?.media?.zoomable !== false,
          className:
            "flex w-full items-center justify-center rounded-[1.25rem] border border-cyan-300/55 bg-[linear-gradient(135deg,rgba(88,28,135,0.92),rgba(109,40,217,0.88))] p-3 shadow-[0_18px_40px_rgba(76,29,149,0.28)] backdrop-blur-sm min-h-[132px] md:min-h-[156px]",
          imgClassName:
            "block h-auto w-auto max-w-full object-contain max-h-[132px] md:max-h-[156px]",
        }),
      },
      {
        area: "action",
        when: (payload) => Boolean(payload?.formQuestion),
        block: "Form",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
        props: (payload, ctx) => ({
          data: payload?.formQuestion,
          heroApi: ctx?.heroApi,
          view: ctx?.view,
          renderMode: "quizPanel",
          selectedId: ctx?.quizState?.selectedId ?? null,
          onSelect: ctx?.quizState?.setSelectedId,
          hideReasonField: true,
          showQuestion: true,
          optionColumns:
            Array.isArray(payload?.formQuestion?.options) &&
            payload.formQuestion.options.length === 3
              ? 3
              : undefined,
        }),
      },
      createTypographySlot("feedbackLabel", "feedbackPrompt", "helper", {
        when: (payload) => Boolean(payload?.feedbackPrompt),
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
      }),
      {
        area: "feedbackInput",
        when: (payload) => Boolean(payload?.feedbackPrompt),
        block: "Input",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
        props: (payload, ctx) => ({
          variant: "text",
          value: ctx?.quizState?.reason ?? "",
          onChange: ctx?.quizState?.setReason,
          placeholder:
            payload?.feedbackPlaceholder ?? "Escribe tu respuesta...",
          className:
            "w-full border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.86))] md:h-full",
        }),
      },
      {
        area: "mobileBack",
        block: "Button",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:hidden",
        props: (_payload, ctx) => ({
          label: "Atras",
          onClick: ctx?.quizState?.goBack,
          disabled: !ctx?.quizState?.canGoBack,
          className: "w-full",
        }),
      },
      {
        area: "mobileNext",
        block: "Button",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:hidden",
        props: (_payload, ctx) => ({
          label: ctx?.quizState?.advanceLabel ?? "Continuar",
          onClick: ctx?.quizState?.advance,
          disabled: !ctx?.quizState?.canAdvance,
          variant: "secondary",
          className: "w-full",
        }),
      },
    ],
    extended: [
      {
        area: "navigation",
        block: "QuizProgressHeader",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
        props: (_payload, ctx) => ({
          progress: ctx?.quizState?.progress ?? null,
        }),
      },
      {
        area: "leftNav",
        block: "Button",
        className:
          "hidden md:grid place-items-stretch place-content-stretch overflow-visible p-0",
        props: (_payload, ctx) => ({
          label: "←",
          onClick: ctx?.quizState?.goBack,
          disabled: !ctx?.quizState?.canGoBack,
          className:
            "h-full w-full rounded-[1.25rem] border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.82))] text-5xl font-black shadow-[0_18px_40px_rgba(59,7,100,0.18)] hover:bg-white/10",
        }),
      },
      {
        area: "rightNav",
        block: "Button",
        className:
          "hidden md:grid place-items-stretch place-content-stretch overflow-visible p-0",
        props: (_payload, ctx) => ({
          label: "→",
          onClick: ctx?.quizState?.advance,
          disabled: !ctx?.quizState?.canAdvance,
          className:
            "h-full w-full rounded-[1.25rem] border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.82))] text-5xl font-black shadow-[0_18px_40px_rgba(59,7,100,0.18)] hover:bg-white/10",
        }),
      },
      createTypographySlot("title", "questionTitle", "body", {
        when: (payload) => Boolean(payload?.questionTitle),
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible rounded-md border border-white/15 bg-black/10 px-4 py-3 text-center font-bold leading-tight",
      }),
      {
        area: "action",
        when: (payload) => Boolean(payload?.formQuestion),
        block: "Form",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
        props: (payload, ctx) => ({
          data: payload?.formQuestion,
          heroApi: ctx?.heroApi,
          view: ctx?.view,
          renderMode: "quizPanel",
          selectedId: ctx?.quizState?.selectedId ?? null,
          onSelect: ctx?.quizState?.setSelectedId,
          hideReasonField: true,
          showQuestion: false,
          instructionContent: {
            text: "Escoge una opcion",
            variant: "helper",
            align: "center",
          },
          optionColumns:
            Array.isArray(payload?.formQuestion?.options) &&
            payload.formQuestion.options.length >= 4
              ? 2
              : 1,
        }),
      },
      createTypographySlot("feedbackLabel", "feedbackPrompt", "helper", {
        when: (payload) => Boolean(payload?.feedbackPrompt),
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
      }),
      {
        area: "feedbackInput",
        when: (payload) => Boolean(payload?.feedbackPrompt),
        block: "Input",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible",
        props: (payload, ctx) => ({
          variant: "text",
          value: ctx?.quizState?.reason ?? "",
          onChange: ctx?.quizState?.setReason,
          placeholder:
            payload?.feedbackPlaceholder ?? "Escribe tu respuesta...",
          className:
            "w-full border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.86))] md:h-full",
        }),
      },
      {
        area: "mobileBack",
        block: "Button",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:hidden",
        props: (_payload, ctx) => ({
          label: "Atras",
          onClick: ctx?.quizState?.goBack,
          disabled: !ctx?.quizState?.canGoBack,
          className: "w-full",
        }),
      },
      {
        area: "mobileNext",
        block: "Button",
        className:
          "place-items-stretch place-content-stretch overflow-visible p-0 md:hidden",
        props: (_payload, ctx) => ({
          label: ctx?.quizState?.advanceLabel ?? "Continuar",
          onClick: ctx?.quizState?.advance,
          disabled: !ctx?.quizState?.canAdvance,
          variant: "secondary",
          className: "w-full",
        }),
      },
    ],
  },
  fallbackVariant: "simple",
};

function getFormQuestion(view, data = {}) {
  if (Array.isArray(view?.elements?.compound)) {
    const question = view.elements.compound.find(
      (item) => (item?.component ?? item?.type) === "formQuestion",
    );
    if (question) return question;
  }

  return data?.formQuestion ?? null;
}

function resolveVariant(variant, view) {
  if (variant && QUIZ_CONFIG.variants[variant]) return variant;
  const mappedVariant = QUIZ_VARIANT_BY_TEMPLATE[view?.template];
  if (mappedVariant && QUIZ_CONFIG.variants[mappedVariant]) {
    return mappedVariant;
  }
  return QUIZ_CONFIG.fallbackVariant;
}

function getPayload(data = {}, view) {
  const formQuestion = getFormQuestion(view, data);

  return {
    media: view?.slots?.media ?? data?.media,
    formQuestion,
    questionTitle: formQuestion?.question ?? null,
    feedbackPrompt: formQuestion?.prompt ?? null,
    feedbackPlaceholder: formQuestion?.placeholder ?? null,
  };
}

export function getQuizRuntime({ variant, data, view }) {
  const resolvedVariant = resolveVariant(variant, view);

  return {
    resolvedVariant,
    layoutDef: QUIZ_CONFIG.layouts[resolvedVariant],
    slots: QUIZ_CONFIG.variants[resolvedVariant],
    payload: getPayload(data, view),
  };
}
