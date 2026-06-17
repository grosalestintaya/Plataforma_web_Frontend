import { useEffect, useMemo, useState } from "react";

import Typography from "../../base/Typography";
import TextField from "../container/TextField";
import Button from "../../base/Action/Button";
import ProgressBar from "../../base/Media/ProgressBar";
import Card from "../container/Card";
import ChooseOne from "./ChooseOne";

import { cn } from "@/shared/libs/utils";

const QUIZ_VARIANT_BY_TEMPLATE = {
  simpleQuiz: "simple",
  extendedQuiz: "extended",
};

const FORM_OPTION_COLOR_CLASSES = [
  "border-[var(--color-green-100)] bg-[var(--color-green-400)] text-white hover:bg-[var(--color-green-500)] [&_*]:!text-white",
  "border-[var(--color-purple-100)] bg-[var(--color-purple-400)] text-white hover:bg-[var(--color-purple-500)] [&_*]:!text-white",
  "border-[var(--color-lila-100)] bg-[var(--color-lila-400)] text-white hover:bg-[var(--color-lila-500)] [&_*]:!text-white",
  "border-[var(--color-orange-100)] bg-[var(--color-orange-400)] text-white hover:bg-[var(--color-orange-500)] [&_*]:!text-white",
  "border-[var(--color-blue-100)] bg-[var(--color-blue-400)] text-white hover:bg-[var(--color-blue-500)] [&_*]:!text-white",
  "border-[var(--color-green-100)] bg-[var(--color-green-400)] text-white hover:bg-[var(--color-green-500)] [&_*]:!text-white",
  "border-[var(--color-orange-100)] bg-[var(--color-orange-400)] text-white hover:bg-[var(--color-orange-500)] [&_*]:!text-white",
  "border-[var(--color-purple-100)] bg-[var(--color-purple-400)] text-white hover:bg-[var(--color-purple-500)] [&_*]:!text-white",
  "border-[var(--color-gold-100)] bg-[var(--color-gold-400)] text-white hover:bg-[var(--color-gold-500)] [&_*]:!text-white",
];

function getFormOptionColorClass(index) {
  return FORM_OPTION_COLOR_CLASSES[index % FORM_OPTION_COLOR_CLASSES.length];
}

function getFormOptionInteraction(option, index) {
  const interaction =
    option?.interaction && typeof option.interaction === "object"
      ? option.interaction
      : {};

  return {
    ...interaction,
    type: option?.interaction?.type ?? option?.interaction ?? "selectable",
    className: cn(getFormOptionColorClass(index), interaction.className),
  };
}

function toTextNode(value, fallbackVariant = "bodySm") {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return {
      text: String(value),
      variant: fallbackVariant,
      align: "center",
    };
  }

  return {
    ...value,
    variant: value?.variant ?? fallbackVariant,
    align: value?.align ?? "center",
  };
}

function normalizeOptionForChooseOne(option, index) {
  const rawTitle =
    option?.title ??
    option?.label ??
    option?.caption ??
    option?.name ??
    option?.text ??
    `Opcion ${index + 1}`;

  const rawDetail =
    option?.detail ??
    option?.description ??
    option?.subtitle ??
    option?.amount ??
    null;

  return {
    ...option,
    id: option?.id ?? `option-${index + 1}`,
    title: toTextNode(rawTitle, "bodySm"),
    text: rawDetail ? toTextNode(rawDetail, "label") : null,
    label: null,
    caption: null,
    name: null,
    interaction: getFormOptionInteraction(option, index),
    zoomable: false,
  };
}

function normalizeQuestion(rawQuestion, index, defaults = {}) {
  const question = {
    ...defaults,
    ...rawQuestion,
  };

  return {
    ...question,
    id: question?.id ?? `question-${index + 1}`,
    question: toTextNode(question?.question, "body"),
    prompt: toTextNode(question?.prompt, "helper"),
    placeholder: question?.placeholder ?? "Escribe aqui tu razon...",
    reasonRequired: Boolean(
      question?.reasonRequired ??
      question?.inputRequired ??
      question?.requireReason ??
      false,
    ),
    minReasonLength: Number(question?.minReasonLength ?? 8),
    media: question?.media ?? null,
    extraSlot: question?.extraSlot ?? question?.extra ?? null,
    options: Array.isArray(question?.options)
      ? question.options.map(normalizeOptionForChooseOne)
      : [],
  };
}

function getQuizViews(heroApi) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];

  return missionViews.filter((item) =>
    /quiz/i.test(String(item?.template ?? "")),
  );
}

function getViewProgress(view, heroApi) {
  const viewId = view?.id ?? view?.viewId;
  const quizViews = getQuizViews(heroApi);

  const currentIndex = quizViews.findIndex(
    (item) => String(item?.id ?? item?.viewId) === String(viewId),
  );

  return {
    current: currentIndex >= 0 ? currentIndex + 1 : 1,
    total: Math.max(quizViews.length, 1),
  };
}

function buildQuestions(data = {}, view, heroApi) {
  const fallbackMedia = data?.media ?? null;
  const fallbackExtraSlot = data?.extraSlot ?? data?.extra ?? null;

  if (Array.isArray(data?.questions) && data.questions.length > 0) {
    const defaults = {
      prompt: data?.prompt,
      placeholder: data?.placeholder,
      reasonRequired:
        data?.reasonRequired ?? data?.inputRequired ?? data?.requireReason,
      minReasonLength: data?.minReasonLength,
      media: fallbackMedia,
      extraSlot: fallbackExtraSlot,
    };

    return {
      viewProgress: getViewProgress(view, heroApi),
      questions: data.questions.map((question, index) =>
        normalizeQuestion(
          {
            ...question,
            media: question?.media ?? fallbackMedia,
            extraSlot:
              question?.extraSlot ?? question?.extra ?? fallbackExtraSlot,
          },
          index,
          defaults,
        ),
      ),
    };
  }

  return {
    viewProgress: getViewProgress(view, heroApi),
    questions: [
      normalizeQuestion(
        {
          ...data,
          media: data?.media ?? fallbackMedia,
          extraSlot: data?.extraSlot ?? data?.extra ?? fallbackExtraSlot,
        },
        0,
      ),
    ],
  };
}

function findQuestionOption(question, selectedOptionId) {
  if (!question || !selectedOptionId) return null;

  return (
    question.options.find(
      (option, index) =>
        String(option?.id ?? `option-${index + 1}`) ===
        String(selectedOptionId),
    ) ?? null
  );
}

function getResolvedSelectedOption(question, answer) {
  return (
    answer?.selectedOption ??
    findQuestionOption(question, answer?.selectedOptionId)
  );
}

function getSelectedOptionLabel(option) {
  const label = option?.title ?? option?.label ?? option?.text;

  if (typeof label === "string" || typeof label === "number") {
    return String(label);
  }

  return label?.text ?? null;
}

function hasFeedbackPrompt(question) {
  return Boolean(question?.prompt || question?.placeholder);
}

function hasAnsweredFeedback(question, answer) {
  if (!hasFeedbackPrompt(question)) return false;
  return String(answer?.reason ?? "").trim().length > 0;
}

function isQuestionComplete(question, answer) {
  if (!question || !answer?.selectedOptionId) return false;

  if (!question.reasonRequired) return true;

  return String(answer?.reason ?? "").trim().length >= question.minReasonLength;
}

function resolveQuizVariant(variant, view) {
  return (
    variant ??
    view?.variant ??
    QUIZ_VARIANT_BY_TEMPLATE[view?.template] ??
    "simple"
  );
}

function getMediaVariant(media) {
  const variant = media?.variant ?? media?.ratio;

  if (variant === "vertical") return "vertical";
  if (variant === "square") return "square";

  return "horizontal";
}

function getComposition(question, fallbackVariant = "simple") {
  const mediaVariant = getMediaVariant(question?.media);

  if (mediaVariant === "vertical" || mediaVariant === "square") {
    return "extended";
  }

  if (mediaVariant === "horizontal") {
    return "simple";
  }

  return fallbackVariant;
}

function clampIndex(value, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(value, total - 1));
}

function normalizeInputValue(valueOrEvent) {
  return valueOrEvent?.target?.value ?? valueOrEvent ?? "";
}

function getInitialAnswers(viewId, heroApi, questions) {
  const persisted = heroApi?.getInteractiveState?.(viewId);

  if (persisted?.answers && typeof persisted.answers === "object") {
    return persisted.answers;
  }

  if (!persisted?.selectedOptionId || questions.length !== 1) {
    return {};
  }

  const firstQuestion = questions[0];

  if (!firstQuestion?.id) return {};

  return {
    [firstQuestion.id]: {
      selectedOptionId: persisted.selectedOptionId,
      selectedOption: null,
      reason: persisted.reasonText ?? "",
    },
  };
}

function areAnswersEqual(previous, next) {
  return JSON.stringify(previous ?? {}) === JSON.stringify(next ?? {});
}

function renderExtraSlot(extraSlot) {
  if (!extraSlot) return null;

  if (extraSlot.type === "card") {
    return (
      <Card
        title={extraSlot.title}
        text={extraSlot.text}
        media={extraSlot.media}
        variant={extraSlot.variant ?? "ghost"}
        zoomable={extraSlot.zoomable ?? false}
      />
    );
  }

  if (extraSlot.type === "image") {
    return (
      <Card
        media={extraSlot.media}
        variant={extraSlot.variant ?? "ghost"}
        zoomable={extraSlot.zoomable !== false}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
      <Typography
        content={extraSlot.content ?? extraSlot.text}
        variant={
          extraSlot?.content?.variant ?? extraSlot?.text?.variant ?? "helper"
        }
        align={extraSlot?.content?.align ?? extraSlot?.text?.align ?? "center"}
        className="font-semibold leading-tight"
      />
    </div>
  );
}

function getOuterClass(className = "") {
  return cn(
    "min-h-full w-full min-w-0 max-w-full overflow-x-hidden overflow-y-visible px-1 py-2 text-white",
    "lg:mx-auto lg:grid lg:h-full lg:min-h-0 lg:max-w-6xl",
    "lg:grid-cols-[4.5rem_minmax(0,1fr)_4.5rem]",
    "lg:items-center lg:gap-4 lg:overflow-visible lg:px-3",
    className,
  );
}

function getPanelClass(composition, hasExtraSlot) {
  const mobileBase = cn(
    "mx-auto flex w-full min-w-0 max-w-full flex-col gap-2 rounded-3xl bg-black/15 p-2",
    "overflow-visible",
  );

  const desktopBase = cn(
    "lg:grid lg:h-full lg:min-h-0 lg:max-w-5xl lg:overflow-hidden lg:p-3",
  );

  if (composition === "extended") {
    return cn(
      mobileBase,
      desktopBase,
      "lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.85fr)]",
      hasExtraSlot
        ? "lg:grid-rows-[auto_minmax(0,1fr)_auto_auto_auto]"
        : "lg:grid-rows-[auto_minmax(0,1fr)_auto_auto]",
    );
  }

  return cn(
    mobileBase,
    desktopBase,
    "lg:grid-cols-1",
    hasExtraSlot
      ? "lg:grid-rows-[auto_minmax(0,1fr)_auto_auto_auto]"
      : "lg:grid-rows-[auto_minmax(0,1fr)_auto_auto]",
  );
}

function getProgressClass(composition) {
  return cn("min-w-0", composition === "extended" && "lg:col-span-2");
}

function getMediaClass(composition) {
  const base = cn(
    "grid w-full min-w-0 place-items-center overflow-visible",
    "min-h-0 py-1",
    "lg:overflow-hidden lg:py-0",
  );

  if (composition === "extended") {
    return cn(base, "lg:col-start-2 lg:row-start-2");
  }

  return base;
}

function getChooseClass(composition) {
  const base = cn(
    "h-auto min-h-0 w-full min-w-0 max-w-full overflow-visible",
    "lg:h-full lg:min-h-0 lg:overflow-hidden",
  );

  if (composition === "extended") {
    return cn(base, "lg:col-start-1 lg:row-start-2");
  }

  return base;
}

function getExtraClass(composition) {
  if (composition === "extended") {
    return cn(
      "w-full min-w-0 overflow-visible",
      "lg:col-start-1 lg:row-start-3 lg:min-h-0 lg:overflow-hidden",
    );
  }

  return "w-full min-w-0 overflow-visible lg:min-h-0 lg:overflow-hidden";
}

function getReasonClass(composition, hasExtraSlot) {
  const base = cn("w-full min-w-0 overflow-visible");

  if (composition === "extended") {
    return cn(base, "lg:col-span-2", hasExtraSlot && "lg:row-start-4");
  }

  return base;
}

function getMobileNavClass(composition) {
  return cn(
    "grid w-full min-w-0 grid-cols-1 gap-2",
    "min-[380px]:grid-cols-2",
    "lg:hidden",
    composition === "extended" && "lg:col-span-2",
  );
}

function getSideNavClass(side) {
  return cn(
    "hidden lg:inline-flex lg:shrink-0",
    "h-36 w-14 items-center justify-center self-center rounded-[1.7rem]",
    "border border-white/10 bg-white/10 text-[3rem] font-black text-white/80",
    "transition hover:bg-white/15",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    side === "left" ? "justify-self-start" : "justify-self-end",
  );
}

export default function Form({ variant, data, heroApi, view, className = "" }) {
  const viewId = view?.id ?? view?.viewId;
  const resolvedVariant = resolveQuizVariant(variant, view);

  const runtime = useMemo(
    () => buildQuestions(data, view, heroApi),
    [data, view, heroApi],
  );

  const questions = runtime.questions;
  const questionSignature = useMemo(
    () => questions.map((question) => question.id).join("|"),
    [questions],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = questions[currentIndex] ?? null;
  const currentAnswer = answers[currentQuestion?.id] ?? {
    selectedOptionId: null,
    selectedOption: null,
    reason: "",
  };

  const selectedOption = getResolvedSelectedOption(
    currentQuestion,
    currentAnswer,
  );
  const isCurrentComplete = isQuestionComplete(currentQuestion, currentAnswer);

  const allComplete = questions.every((question) =>
    isQuestionComplete(question, answers[question.id]),
  );
  const completionScore = Number(
    data?.score ?? view?.score ?? view?.rewardXp ?? 100,
  );
  const feedbackBonusCoins = Number(
    data?.feedbackCoinsBonus ?? data?.awardedCoins ?? data?.coinsAward ?? 5,
  );
  const canEarnFeedbackCoins = questions.some(hasFeedbackPrompt);
  const earnedFeedbackCoins = questions.some((question) =>
    hasAnsweredFeedback(question, answers[question.id]),
  );
  const awardedCoins =
    allComplete && canEarnFeedbackCoins && earnedFeedbackCoins
      ? feedbackBonusCoins
      : 0;

  const hasPreviousQuestion = currentIndex > 0;
  const hasNextQuestion = currentIndex < questions.length - 1;

  const canGoBack = hasPreviousQuestion || Boolean(heroApi?.canGoBack ?? true);
  const canAdvance =
    Boolean(heroApi?.canAdvance ?? true) &&
    isCurrentComplete &&
    (hasNextQuestion || allComplete);

  const progress =
    questions.length > 1
      ? {
          current: currentIndex + 1,
          total: questions.length,
        }
      : (runtime.viewProgress ?? { current: 1, total: 1 });

  const composition = getComposition(currentQuestion, resolvedVariant);
  const hasExtraSlot = Boolean(currentQuestion?.extraSlot);

  useEffect(() => {
    const persisted = heroApi?.getInteractiveState?.(viewId);
    const nextIndex = clampIndex(
      Number(persisted?.currentQuestionIndex ?? 0),
      questions.length,
    );
    const nextAnswers = getInitialAnswers(viewId, heroApi, questions);

    setCurrentIndex((previous) =>
      previous === nextIndex ? previous : nextIndex,
    );

    setAnswers((previous) =>
      areAnswersEqual(previous, nextAnswers) ? previous : nextAnswers,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionSignature, questions.length, viewId]);

  useEffect(() => {
    if (!currentQuestion) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: allComplete,
      type: "reflectionQuestion",
      variant: resolvedVariant,
      composition,
      currentQuestionId: currentQuestion.id,
      currentQuestionIndex: currentIndex,
      questionCount: questions.length,
      selectedOptionId: currentAnswer.selectedOptionId ?? null,
      selectedOptionLabel: getSelectedOptionLabel(selectedOption),
      reasonText: currentAnswer.reason ?? "",
      reasonLength: String(currentAnswer.reason ?? "").trim().length,
      reasonRequired: currentQuestion.reasonRequired,
      answers,
      score: allComplete ? completionScore : 0,
      awardedCoins,
      feedbackBonusEligible: canEarnFeedbackCoins,
      feedbackBonusEarned: earnedFeedbackCoins,
      countsTowardScore: allComplete,
    });
  }, [
    allComplete,
    answers,
    awardedCoins,
    canEarnFeedbackCoins,
    composition,
    completionScore,
    currentAnswer.reason,
    currentAnswer.selectedOptionId,
    currentIndex,
    currentQuestion,
    earnedFeedbackCoins,
    heroApi,
    questions.length,
    resolvedVariant,
    selectedOption,
    viewId,
  ]);

  function updateCurrentAnswer(partial) {
    if (!currentQuestion?.id) return;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        ...(previous[currentQuestion.id] ?? {
          selectedOptionId: null,
          selectedOption: null,
          reason: "",
        }),
        ...partial,
      },
    }));
  }

  function handleSelection(nextSelectedId, nextSelectedOption) {
    if (!nextSelectedId) return;

    updateCurrentAnswer({
      selectedOptionId: nextSelectedId,
      selectedOption: nextSelectedOption ?? null,
    });
  }

  function handleReasonChange(nextReason) {
    updateCurrentAnswer({
      reason: normalizeInputValue(nextReason),
    });
  }

  function handleBack() {
    if (hasPreviousQuestion) {
      setCurrentIndex((current) => Math.max(0, current - 1));
      return;
    }

    heroApi?.goBackCurrentView?.();
  }

  function handleNext() {
    if (!isCurrentComplete) return;

    if (hasNextQuestion) {
      setCurrentIndex((current) => Math.min(questions.length - 1, current + 1));
      return;
    }

    if (!allComplete) return;

    heroApi?.advanceCurrentView?.();
  }

  if (!currentQuestion) {
    return (
      <div className={getOuterClass(className)}>
        <div className="grid min-h-full w-full place-items-center text-white/80 lg:h-full lg:min-h-0">
          Config invalida para Form
        </div>
      </div>
    );
  }

  return (
    <section className={getOuterClass(className)}>
      <button
        type="button"
        onClick={handleBack}
        disabled={!canGoBack}
        aria-label="Pregunta anterior"
        className={cn(
          getSideNavClass("left"),
          !canGoBack && "cursor-not-allowed opacity-40",
        )}>
        {"<"}
      </button>

      <div className={getPanelClass(composition, hasExtraSlot)}>
        <div className={getProgressClass(composition)}>
          <ProgressBar progress={progress} />
        </div>

        {currentQuestion.media?.src ? (
          <div className={getMediaClass(composition)}>
            <div className="w-full min-w-0 max-w-[min(100%,20rem)] sm:max-w-[min(100%,22rem)] lg:flex lg:h-full lg:min-h-0 lg:items-center lg:justify-center lg:max-w-[min(100%,19rem)] xl:max-w-[min(100%,21rem)]">
              <Card
                media={{
                  src: currentQuestion.media.src,
                  alt: currentQuestion.media.alt ?? "Imagen de apoyo",
                  variant:
                    currentQuestion.media.variant ??
                    currentQuestion.media.ratio ??
                    "horizontal",
                  mode: currentQuestion.media.mode ?? "contain",
                }}
                variant="ghost"
                size="normal"
                zoomable={currentQuestion.media.zoomable !== false}
              />
            </div>
          </div>
        ) : null}

        <div className={getChooseClass(composition)}>
          <ChooseOne
            key={currentQuestion.id}
            data={{
              instruction: currentQuestion.question,
              items: currentQuestion.options,
              feedbackReserve: false,
            }}
            selectedId={currentAnswer.selectedOptionId}
            onSelection={(nextSelectedId, nextSelectedOption) => {
              handleSelection(nextSelectedId, nextSelectedOption);
            }}
            onComplete={(payload) => {
              if (payload?.selectedId) {
                updateCurrentAnswer({
                  selectedOptionId: payload.selectedId,
                  selectedOption: payload.selectedItem ?? null,
                });
              }
            }}
            reportToHero={false}
            className={cn(
              "h-auto min-h-0 w-full min-w-0 max-w-full overflow-x-hidden",
              "[&>header]:w-full [&>header]:min-w-0 [&>header]:max-w-full [&>header]:shrink-0",
              "[&>header>*]:w-full [&>header>*]:min-w-0 [&>header>*]:max-w-full",
              "[&>header_*]:min-w-0 [&>header_*]:max-w-full",
              "[&>main]:min-h-0 [&>main]:overflow-visible",
              "[&>main_*]:min-w-0 [&>main_*]:max-w-full",
              "[&>footer]:w-full [&>footer]:min-w-0 [&>footer]:max-w-full [&>footer]:shrink-0",
              "[&>footer_*]:min-w-0 [&>footer_*]:max-w-full",
              "lg:h-full lg:min-h-0",
              "lg:[&>main]:overflow-hidden",
            )}
          />
        </div>

        {hasExtraSlot ? (
          <div className={getExtraClass(composition)}>
            {renderExtraSlot(currentQuestion.extraSlot)}
          </div>
        ) : null}

        {currentQuestion.prompt || currentQuestion.placeholder ? (
          <div className={getReasonClass(composition, hasExtraSlot)}>
            <TextField
              prompt={currentQuestion.prompt}
              value={currentAnswer.reason ?? ""}
              onChange={handleReasonChange}
              placeholder={currentQuestion.placeholder}
              variant="split"
              containerClassName="h-auto min-h-0"
              labelClassName="text-center"
              fieldWrapClassName="min-w-0"
              inputClassName="w-full"
            />
          </div>
        ) : null}

        <div className={getMobileNavClass(composition)}>
          <Button
            variant="secondary"
            label="Atras"
            onClick={handleBack}
            disabled={!canGoBack}
            fullWidth
          />

          <Button
            variant="primary"
            label="Siguiente"
            onClick={handleNext}
            disabled={!canAdvance}
            fullWidth
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canAdvance}
        aria-label="Siguiente pregunta"
        className={cn(
          getSideNavClass("right"),
          !canAdvance && "cursor-not-allowed opacity-40",
        )}>
        {">"}
      </button>
    </section>
  );
}
