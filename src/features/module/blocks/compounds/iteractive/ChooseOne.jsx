import { useEffect, useMemo, useState } from "react";

import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";
import ShowCard from "../grouper/ShowCard";

import { cn } from "@/shared/libs/utils";

/**
 * Convierte strings/numbers a la estructura tipográfica esperada por Typography.
 */
function toContent(value, fallbackVariant = "bodySm") {
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

/**
 * Resuelve la imagen de una opción y la deja en el formato que Card/ShowCard entienden.
 */
function getOptionMedia(option) {
  const media = option?.media ?? option?.image ?? null;
  const src = media?.src ?? media?.img ?? option?.src;

  if (!src) return null;

  return {
    ...media,
    src,
    alt:
      media?.alt ??
      option?.alt ??
      option?.title?.text ??
      option?.label?.text ??
      option?.name ??
      "Opcion",
    variant: media?.variant ?? media?.ratio ?? "horizontal",
    mode: media?.mode ?? "contain",
  };
}

/**
 * Adapta una opción cruda del JSON al contrato visual de ChooseOne.
 */
function normalizeOption(option, index) {
  const id = option?.id ?? `option-${index + 1}`;
  const titleContent = toContent(
    option?.title ??
      option?.label ??
      option?.caption ??
      option?.name ??
      `Opcion ${index + 1}`,
    "label",
  );
  const textContent = toContent(
    option?.text ??
      option?.detail ??
      option?.description ??
      option?.subtitle ??
      option?.amount ??
      null,
    "label",
  );
  const titleText = String(titleContent?.text ?? "").trim();
  const detailText = String(textContent?.text ?? "").trim();
  const shouldHideSecondaryText =
    titleText.length > 0 && titleText === detailText;

  return {
    ...option,
    id,
    title: titleContent,
    text: shouldHideSecondaryText ? null : textContent,
    label: null,
    caption: null,
    name: null,
    description: null,
    subtitle: null,
    amount: null,
    media: getOptionMedia(option),
    interaction: option?.interaction ?? { type: "selectable" },
    zoomable: false,
    correct: Boolean(option?.correct),
    feedback: option?.feedback ?? null,
    score: Number(option?.score ?? (option?.correct ? 100 : 60)),
  };
}

/**
 * Adapta una pregunta con sus opciones para el modo secuencia.
 */
function normalizeQuestion(question, index) {
  return {
    ...question,
    id: question?.id ?? `question-${index + 1}`,
    prompt: toContent(
      question?.prompt ?? question?.question ?? question?.title,
      "h3",
    ),
    options: Array.isArray(question?.options)
      ? question.options.map(normalizeOption)
      : [],
  };
}

/**
 * Detecta si ChooseOne recibe preguntas con options[] o una lista plana de opciones.
 */
function isQuestionSequence(items) {
  return (
    Array.isArray(items) && items.some((item) => Array.isArray(item?.options))
  );
}

/**
 * Genera una firma estable para reiniciar estado cuando cambian preguntas u opciones.
 */
function buildSignature(items, sequenceMode) {
  if (!Array.isArray(items)) return "empty";

  if (sequenceMode) {
    return items
      .map((question, questionIndex) => {
        const questionId = question?.id ?? `question-${questionIndex + 1}`;
        const optionIds = Array.isArray(question?.options)
          ? question.options
              .map(
                (option, optionIndex) => option?.id ?? `option-${optionIndex + 1}`,
              )
              .join(",")
          : "";

        return `${questionId}[${optionIds}]`;
      })
      .join("|");
  }

  return items.map((item, index) => item?.id ?? `option-${index + 1}`).join("|");
}

function hasCorrectChoice(items, sequenceMode) {
  if (!Array.isArray(items) || items.length === 0) return false;

  if (sequenceMode) {
    return items.some(
      (question) =>
        Array.isArray(question?.options) &&
        question.options.some((option) => Boolean(option?.correct)),
    );
  }

  return items.some((option) => Boolean(option?.correct));
}

/**
 * Extrae la configuración pública del componente sin mezclarla con estado interno.
 */
function normalizeChooseOneData(data, items) {
  const sourceItems = data?.items ?? items ?? [];
  const sequenceMode = isQuestionSequence(sourceItems);
  const hasCorrectOption = hasCorrectChoice(sourceItems, sequenceMode);

  return {
    sourceItems,
    sequenceMode,
    prompt: data?.instruction ?? data?.title ?? null,
    actionButton: data?.actionButton ?? null,
    feedbackReserve: Boolean(data?.feedbackReserve),
    scoreOnComplete: Number(data?.score ?? data?.scoreOnComplete ?? 100),
    minimumScore: Number(data?.minimumScore ?? data?.minScore ?? 70),
    requireCorrect: data?.requireCorrect ?? hasCorrectOption,
  };
}

/**
 * Normaliza items una sola vez y separa el modo simple del modo secuencia.
 */
function normalizeChooseOneItems(sourceItems, sequenceMode) {
  if (sequenceMode) {
    return {
      questions: sourceItems.map(normalizeQuestion),
      options: [],
    };
  }

  return {
    questions: [],
    options: sourceItems.map(normalizeOption),
  };
}

/**
 * Prioriza control externo cuando ChooseOne vive dentro de otro componente.
 */
function getControlledSelectedId(selectedId, selectedIds) {
  if (selectedId !== undefined) return selectedId;

  if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    return selectedIds[0];
  }

  return undefined;
}

/**
 * Busca la opción actualmente seleccionada dentro de las opciones visibles.
 */
function findOptionById(options, selectedId) {
  if (!selectedId) return null;
  return (
    options.find((option) => String(option?.id) === String(selectedId)) ?? null
  );
}

/**
 * ShowCard consume un arreglo de ids seleccionados, aunque aquí solo elegimos uno.
 */
function getSelectedIds(selectedId) {
  return selectedId ? [selectedId] : [];
}

function getQuestionKey(sequenceMode, currentQuestion) {
  if (!sequenceMode) return "normal";
  return currentQuestion?.id ?? "question";
}

function calculateFinalScore(questionScores, fallbackScore) {
  const scores = Object.values(questionScores ?? {}).filter((value) =>
    Number.isFinite(Number(value)),
  );

  if (!scores.length) return fallbackScore;

  return Math.round(
    scores.reduce((sum, value) => sum + Number(value), 0),
  );
}

function hasRetryAttempt(attemptsByQuestionId) {
  return Object.values(attemptsByQuestionId ?? {}).some(
    (value) => Number(value) > 1,
  );
}

function getAwardedScore({
  selectedItem,
  attemptCount = 1,
  totalQuestions = 1,
  minimumScore = 70,
  maximumScore = 100,
}) {
  if (!selectedItem?.correct) return 0;

  const safeQuestionCount = Math.max(1, Number(totalQuestions) || 1);
  const safeMinimumScore = Math.max(0, Number(minimumScore) || 0);
  const safeMaximumScore = Math.max(
    safeMinimumScore,
    Number(maximumScore) || safeMinimumScore,
  );
  const minimumPerQuestion = safeMinimumScore / safeQuestionCount;
  const bonusPerQuestion =
    (safeMaximumScore - safeMinimumScore) / safeQuestionCount;

  return attemptCount > 1
    ? minimumPerQuestion
    : minimumPerQuestion + bonusPerQuestion;
}

/**
 * Construye el payload único que usan selección, completitud y persistencia.
 */
function buildChooseOnePayload({
  sequenceMode,
  selectedId,
  selectedItem,
  selectedIndex,
  currentQuestion,
  currentQuestionIndex,
  completedQuestionIds = [],
  totalQuestions = 1,
  completed = false,
  score,
  attemptCount = 0,
  firstTryCorrect = false,
  questionScores = {},
  attemptsByQuestionId = {},
}) {
  return {
    type: "chooseOne",
    mode: sequenceMode ? "question" : "normal",
    selectedId,
    selectedItem,
    selectedIndex,
    question: sequenceMode ? currentQuestion : null,
    questionId: sequenceMode ? currentQuestion?.id ?? null : null,
    questionIndex: sequenceMode ? currentQuestionIndex : 0,
    completedQuestionIds,
    completedCount: completedQuestionIds.length,
    totalQuestions,
    completed,
    correct: Boolean(selectedItem?.correct),
    score: Number(score ?? 0),
    attemptCount,
    firstTryCorrect,
    questionScores,
    attemptsByQuestionId,
    countsTowardScore: completed,
  };
}

/**
 * Feedback por defecto cuando se completa una secuencia y no se configuró otro.
 */
function getDefaultCompleteFeedback() {
  return {
    text: "COMPLETADO",
    variant: "label",
    align: "center",
  };
}

/**
 * Resuelve el feedback visible priorizando opción, luego config y al final fallback.
 */
function getFeedback({ data, selectedItem, sequenceMode, completed }) {
  if (selectedItem?.feedback) return selectedItem.feedback;
  if (data?.feedback) return data.feedback;
  if (data?.generalFeedback) return data.generalFeedback;
  if (data?.feedbackOnSelect) return data.feedbackOnSelect;
  if (sequenceMode && completed) return getDefaultCompleteFeedback();

  return null;
}

/**
 * Traduce el payload interno al shape que espera heroApi.setInteractiveState.
 */
function getReportedHeroState(payload) {
  return {
    completed: Boolean(payload?.completed),
    type: "chooseOne",
    mode: payload?.mode,
    selectedId: payload?.selectedId ?? null,
    selectedOptionId: payload?.selectedId ?? null,
    selectedOptionLabel: payload?.selectedItem?.title?.text ?? null,
    selectedItem: payload?.selectedItem ?? null,
    questionId: payload?.questionId ?? null,
    questionIndex: payload?.questionIndex ?? 0,
    completedQuestionIds: payload?.completedQuestionIds ?? [],
    completedCount: payload?.completedCount ?? 0,
    totalQuestions: payload?.totalQuestions ?? 1,
    correct: payload?.correct,
    score: payload?.score ?? 0,
    attemptCount: payload?.attemptCount ?? 0,
    firstTryCorrect: Boolean(payload?.firstTryCorrect),
    questionScores: payload?.questionScores ?? {},
    attemptsByQuestionId: payload?.attemptsByQuestionId ?? {},
    payload,
    countsTowardScore: Boolean(payload?.countsTowardScore),
  };
}

export default function ChooseOne({
  data,
  items,
  selectedId,
  selectedIds,
  onSelection,
  onSelect,
  onComplete,
  heroApi,
  view,
  reportToHero = true,
  className = "",
}) {
  /**
   * 1. Normalización de entrada:
   * aquí convertimos la data pública del componente a una forma predecible.
   */
  const {
    sourceItems,
    sequenceMode,
    prompt,
    actionButton,
    feedbackReserve,
    requireCorrect,
    scoreOnComplete,
    minimumScore,
  } =
    normalizeChooseOneData(data, items);

  const signature = useMemo(
    () => buildSignature(sourceItems, sequenceMode),
    [sourceItems, sequenceMode],
  );

  /**
   * 2. Normalización de contenido:
   * questions se usa en modo secuencia; options en modo simple.
   */
  const { questions, options } = useMemo(
    () => normalizeChooseOneItems(sourceItems, sequenceMode),
    [signature, sourceItems, sequenceMode],
  );

  const viewId = view?.id ?? view?.viewId;
  const controlledSelectedId = getControlledSelectedId(selectedId, selectedIds);
  const isControlled = controlledSelectedId !== undefined;

  /**
   * 3. Estado local:
   * solo se usa cuando el padre no controla la selección actual.
   */
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [internalSelectedId, setInternalSelectedId] = useState(null);
  const [completedQuestionIds, setCompletedQuestionIds] = useState([]);
  const [attemptsByQuestionId, setAttemptsByQuestionId] = useState({});
  const [questionScores, setQuestionScores] = useState({});

  /**
   * 4. Estado derivado:
   * a partir del modo actual resolvemos prompt, opciones visibles y progreso.
   */
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const currentOptions = sequenceMode ? currentQuestion?.options ?? [] : options;
  const currentPrompt = sequenceMode ? currentQuestion?.prompt : prompt;
  const currentSelectedId = isControlled
    ? controlledSelectedId
    : internalSelectedId;
  const selectedItem = findOptionById(currentOptions, currentSelectedId);
  const currentQuestionKey = getQuestionKey(sequenceMode, currentQuestion);
  const currentAttemptCount = attemptsByQuestionId[currentQuestionKey] ?? 0;
  const hasSelection = Boolean(currentSelectedId && selectedItem);
  const selectedIsCorrect = Boolean(selectedItem?.correct);

  const questionCount = sequenceMode ? questions.length : 1;
  const isLastQuestion =
    sequenceMode && currentQuestionIndex >= questions.length - 1;
  const completed = sequenceMode
    ? completedQuestionIds.length >= questions.length && questions.length > 0
    : requireCorrect
      ? selectedIsCorrect
      : hasSelection;
  const canAdvanceCurrentQuestion = requireCorrect
    ? selectedIsCorrect
    : hasSelection;
  const feedback = getFeedback({
    data,
    selectedItem,
    sequenceMode,
    completed,
  });

  const showFeedback = Boolean(feedback) || feedbackReserve;
  const showCompletedBadge = sequenceMode && completed;
  const showActionButton =
    Boolean(actionButton) ||
    (sequenceMode && canAdvanceCurrentQuestion && !isLastQuestion);
  const actionLabel = actionButton?.label ?? "Continuar";
  const actionDisabled =
    actionButton?.disabled !== undefined
      ? actionButton.disabled
      : !canAdvanceCurrentQuestion;

  /**
   * Reinicia el flujo cuando cambia el set de preguntas/opciones.
   */
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setInternalSelectedId(null);
    setCompletedQuestionIds([]);
    setAttemptsByQuestionId({});
    setQuestionScores({});
  }, [signature]);

  /**
   * Notifica completitud al padre y, si corresponde, persiste en heroApi.
   */
  function reportCompletion(payload) {
    onComplete?.(payload);

    if (!reportToHero || !viewId) return;

    heroApi?.setInteractiveState?.(viewId, getReportedHeroState(payload));
  }

  /**
   * Emite la selección actual sin marcar todavía la interacción como completada.
   */
  function emitSelection(nextItem, nextIndex) {
    const nextAttemptCount = currentAttemptCount + 1;
    const payload = buildChooseOnePayload({
      sequenceMode,
      selectedId: nextItem.id,
      selectedItem: nextItem,
      selectedIndex: nextIndex,
      currentQuestion,
      currentQuestionIndex,
      completedQuestionIds,
      totalQuestions: questionCount,
      completed: false,
      score: getAwardedScore({
        selectedItem: nextItem,
        attemptCount: nextAttemptCount,
        totalQuestions: questionCount,
        minimumScore,
        maximumScore: scoreOnComplete,
      }),
      attemptCount: nextAttemptCount,
      firstTryCorrect: Boolean(nextItem.correct) && nextAttemptCount === 1,
      questionScores,
      attemptsByQuestionId: {
        ...attemptsByQuestionId,
        [currentQuestionKey]: nextAttemptCount,
      },
    });

    onSelection?.(nextItem.id, nextItem, nextIndex, payload);
    onSelect?.(nextItem.id, nextItem, nextIndex, payload);
  }

  /**
   * Centraliza el cierre de una respuesta completa usando el mismo payload.
   */
  function completeSelection({
    nextItem,
    nextIndex,
    nextCompletedQuestionIds,
    nextAttemptCount,
    nextQuestionScores,
    nextAttemptsByQuestionId,
  }) {
    const awardedScore = nextQuestionScores[currentQuestionKey] ?? 0;
    const finalScore = calculateFinalScore(nextQuestionScores, awardedScore);

    reportCompletion(
      buildChooseOnePayload({
        sequenceMode,
        selectedId: nextItem.id,
        selectedItem: nextItem,
        selectedIndex: nextIndex,
        currentQuestion,
        currentQuestionIndex,
        completedQuestionIds: nextCompletedQuestionIds,
        totalQuestions: questionCount,
        completed: true,
        score: finalScore,
        attemptCount: nextAttemptCount,
        firstTryCorrect: !hasRetryAttempt(nextAttemptsByQuestionId),
        questionScores: nextQuestionScores,
        attemptsByQuestionId: nextAttemptsByQuestionId,
      }),
    );
  }

  /**
   * Maneja la selección de una tarjeta:
   * - actualiza estado local si no está controlado
   * - emite el evento de selección
   * - completa inmediatamente en modo simple
   * - marca avance por pregunta en modo secuencia
   */
  function handleSelect(nextItem, nextIndex) {
    if (!nextItem?.id) return;
    const nextAttemptCount = currentAttemptCount + 1;
    const isCorrectSelection = Boolean(nextItem.correct);
    const nextAttemptsByQuestionId = {
      ...attemptsByQuestionId,
      [currentQuestionKey]: nextAttemptCount,
    };

    if (!isControlled) {
      setInternalSelectedId(nextItem.id);
    }

    setAttemptsByQuestionId(nextAttemptsByQuestionId);
    emitSelection(nextItem, nextIndex);

    if (requireCorrect && !isCorrectSelection) {
      return;
    }

    const awardedScore = getAwardedScore({
      selectedItem: nextItem,
      attemptCount: nextAttemptCount,
      totalQuestions: questionCount,
      minimumScore,
      maximumScore: scoreOnComplete,
    });
    const nextQuestionScores = {
      ...questionScores,
      [currentQuestionKey]: awardedScore,
    };

    setQuestionScores(nextQuestionScores);

    if (!sequenceMode) {
      completeSelection({
        nextItem,
        nextIndex,
        nextCompletedQuestionIds: nextItem.id ? ["normal"] : [],
        nextAttemptCount,
        nextQuestionScores,
        nextAttemptsByQuestionId,
      });
      return;
    }

    if (!currentQuestion?.id) return;

    const nextCompletedQuestionIds = completedQuestionIds.includes(
      currentQuestion.id,
    )
      ? completedQuestionIds
      : [...completedQuestionIds, currentQuestion.id];

    setCompletedQuestionIds(nextCompletedQuestionIds);

    if (nextCompletedQuestionIds.length >= questions.length) {
      completeSelection({
        nextItem,
        nextIndex,
        nextCompletedQuestionIds,
        nextAttemptCount,
        nextQuestionScores,
        nextAttemptsByQuestionId,
      });
    }
  }

  /**
   * Avanza entre preguntas cuando ChooseOne opera como secuencia interna.
   */
  function handleContinue() {
    if (actionButton?.onClick) {
      actionButton.onClick();
      return;
    }

    if (!sequenceMode || !canAdvanceCurrentQuestion) return;

    if (!isLastQuestion) {
      setCurrentQuestionIndex((current) => current + 1);

      if (!isControlled) {
        setInternalSelectedId(null);
      }

      return;
    }

    if (!completed || !selectedItem) return;

    const selectedIndex = currentOptions.findIndex(
      (item) => String(item?.id) === String(currentSelectedId),
    );

    completeSelection({
      nextItem: selectedItem,
      nextIndex: selectedIndex,
      nextCompletedQuestionIds: completedQuestionIds,
      nextAttemptCount: currentAttemptCount,
      nextQuestionScores: questionScores,
      nextAttemptsByQuestionId: attemptsByQuestionId,
    });
  }

  return (
    <section
      className={cn(
        "grid min-h-full w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-visible text-white",
        "lg:h-full lg:min-h-0 lg:overflow-hidden",
        className,
      )}
    >
      <header className="min-w-0">
        {currentPrompt ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
            <Typography
              content={currentPrompt}
              variant={currentPrompt?.variant ?? "h3"}
              align={currentPrompt?.align ?? "center"}
              color={currentPrompt?.color}
            />
          </div>
        ) : null}
      </header>

      <main className="min-h-0 min-w-0 overflow-visible lg:overflow-hidden">
        <ShowCard
          items={currentOptions}
          selectedIds={getSelectedIds(currentSelectedId)}
          onSelect={handleSelect}
        />
      </main>

      <footer
        className={cn(
          "grid min-w-0 gap-3",
          showFeedback || showCompletedBadge || showActionButton
            ? "md:grid-cols-[minmax(0,1fr)_auto]"
            : "",
        )}
      >
        {showFeedback ? (
          <div
            className={cn(
              "min-h-[2.75rem] rounded-2xl border px-4 py-3 text-center",
              selectedItem && requireCorrect && !selectedIsCorrect
                ? "border-rose-300/30 bg-rose-500/10"
                : "border-white/10 bg-white/5",
            )}
          >
            {feedback ? (
              <Typography
                content={feedback}
                variant={feedback?.variant ?? "helper"}
                align={feedback?.align ?? "center"}
                color={feedback?.color}
              />
            ) : null}
          </div>
        ) : null}

        {!showFeedback && feedbackReserve ? (
          <div
            className="min-h-[2.75rem] rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            aria-hidden="true"
          />
        ) : null}

        {showCompletedBadge && !showActionButton ? (
          <div className="min-h-[2.75rem] rounded-2xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-3 text-center font-bold text-emerald-100">
            COMPLETADO
          </div>
        ) : null}

        {showActionButton ? (
          <Button
            variant={actionButton?.variant ?? "primary"}
            label={actionLabel}
            onClick={handleContinue}
            disabled={actionDisabled}
            className={cn(
              "min-h-[2.75rem] min-w-[10rem]",
              actionButton?.className,
            )}
          />
        ) : null}
      </footer>
    </section>
  );
}
