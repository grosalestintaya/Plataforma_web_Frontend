import { useEffect, useMemo, useState } from "react";
import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";
import Card from "../container/Card";
import FlipCard from "./FlipCard";
import { getMediaVariant } from "../../base/Media/mediaVariant";
import { cn } from "@/shared/libs/utils";

function normalizeOptionMedia(
  media,
  fallbackAlt = "Opcion",
  variantSource = null,
) {
  return {
    ...(media ?? {}),
    alt: media?.alt ?? fallbackAlt,
    variant:
      getMediaVariant(media) ?? getMediaVariant(variantSource) ?? "horizontal",
  };
}

function getChoiceMedia(itemOrOption) {
  return (
    itemOrOption?.media ??
    itemOrOption?.image ?? { src: itemOrOption?.src, alt: itemOrOption?.alt }
  );
}

function getChoiceMediaVariant(itemOrOption) {
  return (
    getMediaVariant(getChoiceMedia(itemOrOption)) ??
    getMediaVariant(itemOrOption) ??
    "horizontal"
  );
}

const OPTION_SLOT_CLASS = "module-card-grid-slot";

const CARD_OPTION_CLASS =
  "min-h-0 min-w-0 max-h-full max-w-full gap-1 p-2 md:gap-1.5 md:p-2";

function normalizeQuestionOption(option, index) {
  const rawLabel = option?.label ?? option?.text ?? `Opcion ${index + 1}`;

  return {
    id: option?.id ?? `option-${index + 1}`,
    label:
      typeof rawLabel === "object"
        ? rawLabel
        : { text: rawLabel, variant: "bodySm", align: "center" },
    correct: Boolean(option?.correct),
    feedback: option?.feedback,
    score: Number(option?.score ?? (option?.correct ? 100 : 60)),
    media: {
      ...(option?.media ?? option?.image ?? {}),
      src: option?.media?.src ?? option?.image?.src ?? option?.src,
      alt: option?.media?.alt ?? option?.image?.alt ?? option?.alt,
      variant:
        getMediaVariant(option?.media) ??
        getMediaVariant(option?.image) ??
        getMediaVariant(option),
    },
  };
}

function renderPromptWithHighlight(prompt) {
  const rawText = String(prompt?.text ?? "");
  const match = rawText.match(/\b(INGRESO|GASTO)\b/i);

  if (!match) {
    return <Typography content={prompt} />;
  }

  const keyword = match[0];
  const start = match.index ?? 0;
  const end = start + keyword.length;

  return (
    <Typography content={prompt} className="font-bold">
      {rawText.slice(0, start)}
      <span className="font-black text-amber-300">{keyword.toUpperCase()}</span>
      {rawText.slice(end)}
    </Typography>
  );
}

function buildQuestionFeedback(option) {
  const explanation =
    option?.feedback?.text ??
    (option?.correct ? "¡Excelente!!" : "Vuelve a intentarlo.");

  return {
    text: `${option?.correct ? "CORRECTO" : "INCORRECTO"}: ${explanation}`,
    variant: option?.feedback?.variant ?? "helper",
    align: option?.feedback?.align ?? "center",
    color: option?.correct ? "accent" : "danger",
  };
}

function summarizeAnswers(answers) {
  let correctCount = 0;
  let totalScore = 0;

  for (const item of answers) {
    if (item.correct) correctCount += 1;
    totalScore += Number(item?.score ?? 0);
  }

  return { correctCount, totalScore };
}

export default function ChooseOne({ data, heroApi, view, onSelection }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const isQuestionSequence = items.every((item) =>
    Array.isArray(item?.options),
  );
  const viewId = view?.id ?? view?.viewId;
  const instruction = data?.instruction ?? null;
  const cardInstruction = instruction ?? {
    text: "Escoge una de las 2 opciones",
    variant: "body",
    align: "center",
  };

  const [selectedId, setSelectedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pendingQuestionResult, setPendingQuestionResult] = useState(null);
  const [questionAttempts, setQuestionAttempts] = useState(0);
  const [resolvedCardQuestionResult, setResolvedCardQuestionResult] =
    useState(null);

  const currentQuestion = items[currentIndex] ?? null;
  const currentOptions = useMemo(
    () => (currentQuestion?.options ?? []).map(normalizeQuestionOption),
    [currentQuestion?.options],
  );
  const useCardOptions = currentOptions.some(
    (option) =>
      option?.media?.src !== undefined || option?.media?.alt !== undefined,
  );
  const activeQuestionResult = isQuestionSequence
    ? useCardOptions
      ? resolvedCardQuestionResult
      : pendingQuestionResult
    : null;
  const isLastQuestion =
    isQuestionSequence && items.length > 0 && currentIndex === items.length - 1;

  const selectedCard = items.find((item) => item?.id === selectedId) ?? null;

  useEffect(() => {
    if (!isQuestionSequence) return;
    if (answers.length !== items.length || items.length === 0) return;

    const { correctCount, totalScore } = summarizeAnswers(answers);
    const score = Math.round(totalScore / items.length);

    heroApi?.setInteractiveState?.(viewId, {
      completed: true,
      type: "chooseOne",
      answers,
      totalQuestions: items.length,
      correctCount,
      score,
    });
  }, [answers, heroApi, isQuestionSequence, items.length, viewId]);

  useEffect(() => {
    if (
      !isQuestionSequence ||
      !isLastQuestion ||
      !activeQuestionResult?.correct
    ) {
      return;
    }

    const finalAnswers = [...answers, activeQuestionResult];
    const { correctCount, totalScore } = summarizeAnswers(finalAnswers);
    const score = Math.round(totalScore / finalAnswers.length);

    heroApi?.setInteractiveState?.(viewId, {
      completed: true,
      type: "chooseOne",
      answers: finalAnswers,
      totalQuestions: items.length,
      correctCount,
      score,
    });
  }, [
    activeQuestionResult,
    answers,
    heroApi,
    isLastQuestion,
    isQuestionSequence,
    items.length,
    viewId,
  ]);

  useEffect(() => {
    setPendingQuestionResult(null);
    setQuestionAttempts(0);
    setResolvedCardQuestionResult(null);
  }, [currentIndex]);

  useEffect(() => {
    if (isQuestionSequence || !selectedCard) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: true,
      type: "chooseOne",
      selectedId: selectedCard.id,
      correct: selectedCard?.correct,
      score: Number(selectedCard?.score ?? (selectedCard?.correct ? 100 : 60)),
    });
  }, [heroApi, isQuestionSequence, selectedCard, viewId]);

  function answerQuestion(option) {
    if (!currentQuestion || !option) return;

    setPendingQuestionResult({
      questionId: currentQuestion?.id ?? `question-${currentIndex + 1}`,
      selectedOptionId: option.id,
      correct: option.correct,
      score: option.score,
      feedback:
        option?.feedback ??
        currentQuestion?.feedback ??
        buildQuestionFeedback(option),
    });
  }

  function resolveCardQuestion(option, attemptsUsed) {
    if (!currentQuestion || !option) return;

    const awardedScore = attemptsUsed <= 1 ? 100 : 50;
    setResolvedCardQuestionResult({
      questionId: currentQuestion?.id ?? `question-${currentIndex + 1}`,
      selectedOptionId: option.id,
      correct: true,
      attempts: attemptsUsed,
      score: awardedScore,
      feedback: buildQuestionFeedback(option),
    });
  }

  function answerCardQuestion(option) {
    if (!currentQuestion || !option) return;
    if (resolvedCardQuestionResult) return;

    const attemptsUsed = questionAttempts + 1;
    setQuestionAttempts(attemptsUsed);
    setPendingQuestionResult({
      questionId: currentQuestion?.id ?? `question-${currentIndex + 1}`,
      selectedOptionId: option.id,
      correct: option.correct,
      attempts: attemptsUsed,
      score: 0,
      feedback: buildQuestionFeedback(option),
    });

    if (!option.correct) return;
    resolveCardQuestion(option, attemptsUsed);
  }

  function goToNextQuestion() {
    const result = useCardOptions
      ? resolvedCardQuestionResult
      : pendingQuestionResult;
    if (!result) return;
    if (currentIndex >= items.length - 1) return;

    setAnswers((prev) => [...prev, result]);
    setPendingQuestionResult(null);
    setResolvedCardQuestionResult(null);

    setCurrentIndex((prev) => prev + 1);
  }

  function selectCard(item) {
    if (!item) return;
    setSelectedId(item.id);
    onSelection?.(item);
  }

  if (!data || items.length === 0) return null;

  if (isQuestionSequence) {
    const currentQuestionResult = activeQuestionResult;
    const feedbackMessage =
      currentQuestionResult?.feedback ??
      pendingQuestionResult?.feedback ??
      null;
    const canContinue = Boolean(currentQuestionResult);
    const canAdvance = canContinue && !isLastQuestion;
    const isCompleted =
      isLastQuestion && Boolean(currentQuestionResult?.correct);
    const optionGridRowsClass =
      currentOptions.length > 2
        ? "grid-rows-[repeat(2,minmax(0,1fr))]"
        : "grid-rows-1";

    return (
      <section
        className={cn(
          "mx-auto flex min-h-full w-full flex-col justify-between gap-2 overflow-visible rounded-2xl p-2 md:h-full md:min-h-0",
          useCardOptions ? "max-w-[1020px]" : "max-w-[760px]",
        )}
      >
        <div className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2">
          {currentQuestion?.prompt
            ? renderPromptWithHighlight(currentQuestion.prompt)
            : null}
        </div>

        {useCardOptions ? (
          <div
            className={cn(
              "mx-auto grid min-h-0 w-full max-w-[1020px] flex-1 grid-cols-2 items-stretch justify-items-stretch gap-4 overflow-hidden p-1",
              optionGridRowsClass,
            )}
          >
            {currentOptions.map((option) => {
              const selectedOptionId =
                pendingQuestionResult?.selectedOptionId ??
                currentQuestionResult?.selectedOptionId;
              const isSelectedOption = selectedOptionId === option.id;

              return (
                <div key={option.id} className={OPTION_SLOT_CLASS}>
                  <FlipCard
                    compact
                    fillContainer
                    allowFlipBack
                    reportToHeroApi={false}
                    data={{
                      mode: "singleChoice",
                      columns: 1,
                      countsTowardScore: false,
                      items: [
                        {
                          id: option.id,
                          image: {
                            ...option.media,
                            variant: getChoiceMediaVariant(option),
                          },
                          label: option.label,
                          correct: option.correct,
                          reveal: {
                            text:
                              option?.feedback?.tone === "income"
                                ? "Ingreso"
                                : option?.feedback?.tone === "expense"
                                  ? "Gasto"
                                  : option.correct
                                    ? "Correcto"
                                    : "Incorrecto",
                            variant: option?.feedback?.variant ?? "subtitle1",
                            align: option?.feedback?.align ?? "center",
                            tone:
                              option?.feedback?.tone ??
                              (option.correct ? "success" : "error"),
                            className:
                              "font-black uppercase tracking-[0.08em] text-amber-200",
                          },
                        },
                      ],
                    }}
                    selectedId={isSelectedOption ? option.id : null}
                    containerClassName="max-h-full max-w-full"
                    gridContainerClassName="grid-cols-1"
                    onItemClick={() => answerCardQuestion(option)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={cn(
              "grid min-h-0 flex-1 gap-4 overflow-hidden md:grid-cols-2",
              optionGridRowsClass,
            )}
          >
            {currentOptions.map((option) => (
              <div key={option.id} className={OPTION_SLOT_CLASS}>
                <button
                  type="button"
                  disabled={Boolean(currentQuestionResult)}
                  onClick={() => answerQuestion(option)}
                  className={cn(
                    "w-full rounded-xl border border-white/20 bg-black/10 px-4 py-3 text-left transition",
                    "hover:-translate-y-0.5 hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60",
                    pendingQuestionResult?.selectedOptionId === option.id
                      ? option.correct
                        ? "border-emerald-200/80 bg-emerald-500/20 shadow-[0_0_22px_rgba(52,211,153,0.28)] ring-2 ring-emerald-300/80"
                        : "border-rose-200/80 bg-rose-500/20 shadow-[0_0_22px_rgba(244,63,94,0.28)] ring-2 ring-rose-300/80"
                      : "",
                  )}
                >
                  <Typography content={option.label} align="center" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid min-h-[72px] shrink-0 grid-cols-[minmax(7rem,1fr)_minmax(0,2.6fr)_minmax(7rem,1fr)] items-center gap-3">
          <div className="justify-self-start rounded-xl border border-white/15 bg-white/5 px-3 py-2">
            <Typography
              content={{
                text: `Pregunta ${Math.min(currentIndex + 1, items.length)}/${items.length}`,
                variant: "label",
                align: "left",
              }}
              className="whitespace-nowrap font-bold"
            />
          </div>

          <div className="min-w-0">
            {feedbackMessage ? (
              <div
                className={cn(
                  "rounded-xl p-3",
                  feedbackMessage?.color === "danger"
                    ? "border border-rose-300/25 bg-rose-500/10"
                    : "border border-amber-300/25 bg-amber-500/10",
                )}
              >
                <Typography content={feedbackMessage} />
              </div>
            ) : null}
          </div>

          <div className="justify-self-end">
            {isCompleted ? (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2.5">
                <Typography
                  content={{
                    text: "Completado",
                    variant: "label",
                    color: "success",
                    align: "center",
                  }}
                  className="whitespace-nowrap font-bold"
                />
              </div>
            ) : (
              <Button
                variant="primary"
                label="Continuar"
                disabled={!canAdvance}
                className={cn(
                  "whitespace-nowrap",
                  !canAdvance ? "invisible pointer-events-none" : "",
                )}
                onClick={goToNextQuestion}
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  const choiceGridRowsClass =
    items.length > 2 ? "grid-rows-[repeat(2,minmax(0,1fr))]" : "grid-rows-1";

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 md:gap-2">
      {cardInstruction ? (
        <div className="shrink-0 rounded-xl border border-white/15 p-1">
          <Typography
            content={cardInstruction}
            variant={cardInstruction?.variant ?? "body"}
            align={cardInstruction?.align ?? "center"}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "grid min-h-0 min-w-0 w-full flex-1 grid-cols-2 items-stretch justify-items-stretch gap-3 overflow-hidden p-1",
          choiceGridRowsClass,
        )}
      >
        {items.map((item, index) => (
          <div key={item?.id ?? index} className={OPTION_SLOT_CLASS}>
            <Card
              as="button"
              fillContainer
              onClick={() => selectCard(item)}
              selected={selectedId === item?.id}
              className={cn(
                CARD_OPTION_CLASS,
                selectedId === item?.id
                  ? "border-emerald-200/90 bg-emerald-500/15 shadow-[0_0_26px_rgba(52,211,153,0.32)] ring-4 ring-inset ring-emerald-300/80"
                  : "",
              )}
              media={normalizeOptionMedia(
                getChoiceMedia(item),
                item?.alt ?? item?.caption ?? "Opcion",
                item,
              )}
              title={
                item?.title ??
                item?.label ?? { text: item?.caption, variant: "label" }
              }
              text={
                item?.text ??
                (!item?.text && item?.detail
                  ? typeof item.detail === "string"
                    ? { text: item.detail, variant: "label", align: "center" }
                    : item.detail
                  : null)
              }
              footer={
                item?.detail && item?.text ? (
                  <Typography
                    content={
                      typeof item.detail === "string"
                        ? { text: item.detail, variant: "label" }
                        : item.detail
                    }
                    align="center"
                  />
                ) : null
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
