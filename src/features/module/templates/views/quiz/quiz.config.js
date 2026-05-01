export const QUIZ_VARIANT_BY_TEMPLATE = {
  simpleQuiz: "simple",
  extendedQuiz: "extended",
};

export function isAttitudinalView(view) {
  const id = String(view?.id ?? view?.viewId ?? "");
  return /^m\d+_3_/i.test(id);
}

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

function getNavigationButtonClass(view) {
  if (isAttitudinalView(view)) {
    return "h-24 w-full max-w-[72px] rounded-[1rem] border-0 bg-transparent px-0 text-3xl font-black shadow-none hover:bg-white/5 md:h-28 md:max-w-[84px] md:text-4xl";
  }

  return "h-full w-full rounded-[1.25rem] border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.82))] text-5xl font-black shadow-[0_18px_40px_rgba(59,7,100,0.18)] hover:bg-white/10";
}

function getSlotShellClass(view, area) {
  if (!isAttitudinalView(view)) {
    if (area === "leftNav" || area === "rightNav") {
      return "hidden md:grid place-items-stretch place-content-stretch overflow-visible p-0";
    }

    if (area === "navigation") {
      return "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible";
    }

    return "place-items-stretch place-content-stretch overflow-visible p-0 md:overflow-visible";
  }

  if (area === "leftNav" || area === "rightNav") {
    return "hidden md:grid place-items-center place-content-center overflow-visible rounded-[1.5rem] border border-white/20 bg-black/10 p-2";
  }

  if (area === "navigation") {
    return "place-items-stretch place-content-stretch overflow-visible rounded-[1.5rem] border border-white/20 bg-black/10 p-2 md:p-3";
  }

  return "place-items-stretch place-content-stretch overflow-visible rounded-[1.5rem] border border-white/20 bg-white/5 p-2 md:p-3";
}

function getQuizContentShellClass(view) {
  return isAttitudinalView(view)
    ? "h-full min-h-0 w-full rounded-[1.75rem] bg-black/15 p-3 md:p-4"
    : "h-full min-h-0 w-full px-0 md:px-0";
}

function getProgressBarProps(ctx) {
  if (isAttitudinalView(ctx?.view)) {
    return {
      progress: ctx?.quizState?.progress ?? null,
      className: "border-0 bg-transparent p-1 shadow-none",
      trackClassName: "gap-4 md:gap-6",
    };
  }

  return {
    progress: ctx?.quizState?.progress ?? null,
    className: "bg-black/15",
  };
}

function getMediaClass(view) {
  if (isAttitudinalView(view)) {
    return "flex h-full w-full items-center justify-center rounded-[1rem] border-0 bg-transparent p-0 shadow-none min-h-[180px] md:min-h-[260px]";
  }

  return "flex h-full w-full items-center justify-center rounded-[1.25rem] border border-cyan-300/55 bg-[linear-gradient(135deg,rgba(88,28,135,0.92),rgba(109,40,217,0.88))] p-3 shadow-[0_18px_40px_rgba(76,29,149,0.28)] backdrop-blur-sm min-h-[180px] md:min-h-[260px]";
}

function getFormPanelProps(view) {
  if (!isAttitudinalView(view)) return {};

  const optionTone = ({ index }) => {
    const tones = [
      {
        idle: "border-0 bg-amber-400 hover:bg-amber-400/80",
        selected:
          "border-0 bg-amber-300/95 text-slate-950 shadow-[0_0_0_2px_rgba(255,255,255,0.2)]",
      },
      {
        idle: "border-0 bg-sky-400 hover:bg-sky-400/80",
        selected:
          "border-0 bg-sky-300/95 text-slate-950 shadow-[0_0_0_2px_rgba(255,255,255,0.2)]",
      },
      {
        idle: "border-0 bg-violet-400 hover:bg-violet-400/80",
        selected:
          "border-0 bg-violet-300/95 text-slate-950 shadow-[0_0_0_2px_rgba(255,255,255,0.2)]",
      },
      {
        idle: "border-0 bg-emerald-400/25 hover:bg-emerald-400/35",
        selected:
          "border-0 bg-emerald-300/95 text-slate-950 shadow-[0_0_0_2px_rgba(255,255,255,0.2)]",
      },
    ];

    return tones[index % tones.length];
  };

  return {
    panelClassName: "border-0 bg-transparent p-0 shadow-none md:p-0",
    questionClassName: "border-0 bg-transparent px-0 py-0 text-center",
    instructionClassName: "border-0 bg-transparent px-0 py-0 text-center",
    optionsWrapClassName: "border-0 bg-transparent p-0 shadow-none",
    optionClassName: "border-0 shadow-none",
    optionSelectedClassName: ({ index }) => optionTone({ index }).selected,
    optionIdleClassName: ({ index }) => optionTone({ index }).idle,
  };
}

function getFeedbackInputClass(view) {
  if (isAttitudinalView(view)) {
    return "w-full border-0 bg-transparent px-0 py-0 text-white placeholder:text-white/45 focus:border-0 md:h-full";
  }

  return "w-full border-white/15 bg-[linear-gradient(135deg,rgba(88,28,135,0.9),rgba(109,40,217,0.86))] md:h-full";
}

function getTextFieldProps(payload, ctx) {
  const attitudinal = isAttitudinalView(ctx?.view);

  return {
    prompt: payload?.feedbackPrompt ?? null,
    value: ctx?.quizState?.reason ?? "",
    onChange: ctx?.quizState?.setReason,
    placeholder: payload?.feedbackPlaceholder ?? "Escribe tu respuesta...",
    variant: "split",
    containerClassName: attitudinal
      ? "border-0 bg-transparent p-0"
      : "bg-black/10",
    labelClassName: attitudinal
      ? "border-0 bg-transparent px-0 py-0"
      : "bg-black/10",
    fieldWrapClassName: attitudinal
      ? "border-0 bg-transparent p-0"
      : "",
    inputClassName: getFeedbackInputClass(ctx?.view),
  };
}

export const QUIZ_CONFIG = {
  layouts: {
    simple: {
      outer: {
        base: {
          cols: "1fr 1fr",
          rows: "auto minmax(0,1fr)",
          areas: ["navigation navigation", "content content"],
          gap: "12px",
        },
        md: {
          cols: "minmax(88px,0.11fr) minmax(0,1fr) minmax(0,1fr) minmax(88px,0.11fr)",
          rows: "auto minmax(0,1fr)",
          areas: [
            "leftNav navigation navigation rightNav",
            "leftNav content content rightNav",
          ],
        },
      },
      inner: {
        base: {
          cols: "1fr 1fr",
          rows: "minmax(240px,3fr) auto minmax(64px,1fr) auto",
          areas: [
            "media media",
            "action action",
            "feedback feedback",
            "mobileBack mobileNext",
          ],
          gap: "12px",
        },
        md: {
          cols: "1fr 1fr",
          rows: "minmax(240px,3fr) auto minmax(64px,1fr)",
          areas: ["media media", "action action", "feedback feedback"],
        },
      },
    },
    extended: {
      outer: {
        base: {
          cols: "1fr 1fr",
          rows: "auto minmax(0,1fr)",
          areas: ["navigation navigation", "content content"],
          gap: "12px",
        },
        md: {
          cols: "minmax(88px,0.11fr) minmax(0,1fr) minmax(0,1fr) minmax(88px,0.11fr)",
          rows: "auto minmax(0,1fr)",
          areas: [
            "leftNav navigation navigation rightNav",
            "leftNav content content rightNav",
          ],
        },
      },
      inner: {
        base: {
          cols: "1fr 1fr",
          rows: "auto minmax(200px,3fr) auto minmax(64px,1fr) auto",
          areas: [
            "title title",
            "media media",
            "action action",
            "feedback feedback",
            "mobileBack mobileNext",
          ],
          gap: "12px",
        },
        md: {
          cols: "minmax(0,1.1fr) minmax(220px,0.7fr)",
          rows: "auto minmax(240px,3fr) minmax(64px,1fr)",
          areas: ["title title", "action media", "feedback feedback"],
        },
      },
    },
  },
  variants: {
    simple: [
      {
        area: "navigation",
        block: "ProgressBar",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "navigation"),
        props: (_payload, ctx) => getProgressBarProps(ctx),
      },
      {
        area: "leftNav",
        block: "Button",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "leftNav"),
        props: (_payload, ctx) => ({
          label: "<",
          onClick: ctx?.quizState?.goBack,
          disabled: !ctx?.quizState?.canGoBack,
          className: getNavigationButtonClass(ctx?.view),
        }),
      },
      {
        area: "rightNav",
        block: "Button",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "rightNav"),
        props: (_payload, ctx) => ({
          label: ">",
          onClick: ctx?.quizState?.advance,
          disabled: !ctx?.quizState?.canAdvance,
          className: getNavigationButtonClass(ctx?.view),
        }),
      },
      {
        area: "media",
        when: (payload) => Boolean(payload?.media?.src),
        block: "Image",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "media"),
        props: (payload, ctx) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen de apoyo",
          mode: "intrinsic",
          zoomable: payload?.media?.zoomable !== false,
          className: getMediaClass(ctx?.view),
          imgClassName:
            "block h-auto w-auto max-w-full object-contain max-h-[180px] md:max-h-[300px]",
        }),
      },
      {
        area: "action",
        when: (payload) => Boolean(payload?.formQuestion),
        block: "Form",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "action"),
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
          ...getFormPanelProps(ctx?.view),
        }),
      },
      {
        area: "feedback",
        when: (payload) => Boolean(payload?.feedbackPrompt),
        block: "TextField",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "feedback"),
        props: (payload, ctx) => getTextFieldProps(payload, ctx),
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
        block: "ProgressBar",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "navigation"),
        props: (_payload, ctx) => getProgressBarProps(ctx),
      },
      {
        area: "leftNav",
        block: "Button",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "leftNav"),
        props: (_payload, ctx) => ({
          label: "<",
          onClick: ctx?.quizState?.goBack,
          disabled: !ctx?.quizState?.canGoBack,
          className: getNavigationButtonClass(ctx?.view),
        }),
      },
      {
        area: "rightNav",
        block: "Button",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "rightNav"),
        props: (_payload, ctx) => ({
          label: ">",
          onClick: ctx?.quizState?.advance,
          disabled: !ctx?.quizState?.canAdvance,
          className: getNavigationButtonClass(ctx?.view),
        }),
      },
      createTypographySlot("title", "questionTitle", "body", {
        when: (payload) => Boolean(payload?.questionTitle),
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "title"),
      }),
      {
        area: "media",
        when: (payload) => Boolean(payload?.media?.src),
        block: "Image",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "media"),
        props: (payload, ctx) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen de apoyo",
          mode: "intrinsic",
          zoomable: payload?.media?.zoomable !== false,
          className: getMediaClass(ctx?.view),
          imgClassName:
            "block h-auto w-auto max-w-full object-contain max-h-[180px] md:max-h-[300px]",
        }),
      },
      {
        area: "action",
        when: (payload) => Boolean(payload?.formQuestion),
        block: "Form",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "action"),
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
          ...getFormPanelProps(ctx?.view),
        }),
      },
      {
        area: "feedback",
        when: (payload) => Boolean(payload?.feedbackPrompt),
        block: "TextField",
        className: (_payload, ctx) => getSlotShellClass(ctx?.view, "feedback"),
        props: (payload, ctx) => getTextFieldProps(payload, ctx),
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
  const variantLayouts = QUIZ_CONFIG.layouts[resolvedVariant];

  return {
    resolvedVariant,
    isAttitudinal: isAttitudinalView(view),
    contentShellClassName: getQuizContentShellClass(view),
    outerLayoutDef: variantLayouts.outer,
    contentLayoutDef: variantLayouts.inner,
    slots: QUIZ_CONFIG.variants[resolvedVariant],
    payload: getPayload(data, view),
  };
}
