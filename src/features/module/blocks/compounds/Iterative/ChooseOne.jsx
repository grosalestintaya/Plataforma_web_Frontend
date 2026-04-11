import { useEffect, useMemo, useState } from "react";
import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";
import Card from "../container/Card";
import FlipCard from "./FlipCard";
import { cn } from "@/shared/libs/utils";

/**
 * Normaliza una opcion corta para preguntas secuenciales.
 */
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
    media: option?.media ?? option?.image ?? { src: option?.src, alt: option?.alt },
  };
}

/**
 * Resalta la palabra clave del reto para que el estudiante identifique rapido
 * si esta buscando INGRESO o GASTO.
 */
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
    <Typography
      content={prompt}
      className="font-bold"
    >
      {rawText.slice(0, start)}
      <span className="font-black text-amber-300">{keyword.toUpperCase()}</span>
      {rawText.slice(end)}
    </Typography>
  );
}

/**
 * Construye el feedback explicativo que acompana el intento actual.
 * Si la respuesta fue incorrecta se explica el error, y si fue correcta
 * se confirma el concepto sin tocar el puntaje ya calculado.
 */
function buildQuestionFeedback(option) {
  const explanation =
    option?.feedback?.text ??
    (option?.correct
      ? "Elegiste la opcion correcta."
      : "La opcion elegida no correspondia al concepto solicitado.");

  return {
    text: `${option?.correct ? "CORRECTO" : "INCORRECTO"}: ${explanation}`,
    variant: option?.feedback?.variant ?? "helper",
    align: option?.feedback?.align ?? "center",
    color: option?.correct ? "accent" : "danger",
  };
}

/**
 * ChooseOne:
 * - Modo "cards": elige una tarjeta entre varias opciones visuales.
 * - Modo "questions": recorre una secuencia de preguntas de opcion unica.
 */
export default function ChooseOne({
  data,
  heroApi,
  view,
  onSelection,
}) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const isQuestionSequence = items.every((item) => Array.isArray(item?.options));
  const viewId = view?.id ?? view?.viewId;
  const instruction = data?.instruction ?? null;

  const [selectedId, setSelectedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pendingQuestionResult, setPendingQuestionResult] = useState(null);
  const [questionAttempts, setQuestionAttempts] = useState(0);
  const [resolvedCardQuestionResult, setResolvedCardQuestionResult] = useState(null);

  const currentQuestion = items[currentIndex] ?? null;
  const currentOptions = useMemo(
    () => (currentQuestion?.options ?? []).map(normalizeQuestionOption),
    [currentQuestion?.options],
  );
  const useCardOptions = useMemo(
    () =>
      currentOptions.some(
        (option) => option?.media?.src !== undefined || option?.media?.alt !== undefined,
      ),
    [currentOptions],
  );

  const selectedCard = useMemo(
    () => items.find((item) => item?.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (!isQuestionSequence) return;
    if (answers.length !== items.length || items.length === 0) return;

    const correctCount = answers.filter((item) => item.correct).length;
    const totalScore = answers.reduce(
      (sum, item) => sum + Number(item?.score ?? 0),
      0,
    );
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

  /**
   * Al cambiar de pregunta limpiamos su estado local.
   * Asi cada reto empieza con sus cards cerradas y sin resultado congelado.
   */
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

  /**
   * Avanza a la siguiente pregunta guardando la respuesta actual.
   */
  function answerQuestion(option) {
    if (!currentQuestion || !option) return;

    setPendingQuestionResult({
      questionId: currentQuestion?.id ?? `question-${currentIndex + 1}`,
      selectedOptionId: option.id,
      correct: option.correct,
      score: option.score,
      feedback:
        option?.feedback ?? currentQuestion?.feedback ?? buildQuestionFeedback(option),
    });
  }

  /**
   * Congela el resultado de la pregunta visual actual.
   * Desde aqui el puntaje ya no cambia, aunque el usuario siga girando cards.
   */
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

  /**
   * Modo assessment visual:
   * - permite girar las cards libremente
   * - congela el puntaje cuando la correcta fue descubierta
   * - deja el avance en manos del boton Continuar
   */
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

  /**
   * Guarda la respuesta actual y continua la secuencia.
   */
  function goToNextQuestion() {
    const result = useCardOptions ? resolvedCardQuestionResult : pendingQuestionResult;
    if (!result) return;

    setAnswers((prev) => [...prev, result]);
    setPendingQuestionResult(null);
    setResolvedCardQuestionResult(null);

    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    setCurrentIndex(items.length);
  }

  /**
   * Marca una tarjeta como seleccionada y reporta el resultado al template.
   */
  function selectCard(item) {
    if (!item) return;
    setSelectedId(item.id);
    onSelection?.(item);
  }

  if (!data || items.length === 0) return null;

  if (isQuestionSequence) {
    const isFinished = currentIndex >= items.length;

    const currentQuestionResult = useCardOptions ? resolvedCardQuestionResult : pendingQuestionResult;
    const feedbackMessage =
      currentQuestionResult?.feedback ?? pendingQuestionResult?.feedback ?? null;
    const canContinue = Boolean(currentQuestionResult);

    return (
      <section
        className={cn(
          "mx-auto flex h-full min-h-0 w-full flex-col justify-between gap-3 rounded-2xl p-2",
          useCardOptions ? "max-w-[1020px]" : "max-w-[760px]",
        )}
      >
        {isFinished ? (
          <div className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 p-4">
            <Typography
              content={{
                text: `Completaste ${answers.length} preguntas.`,
                variant: "body",
                align: "center",
              }}
            />
          </div>
        ) : (
          <>
            {currentQuestion?.prompt ? (
              <div className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2">
                {renderPromptWithHighlight(currentQuestion.prompt)}
              </div>
            ) : null}

            <div
              className={cn(
                "grid min-h-0 flex-1 gap-4",
                useCardOptions
                  ? "mx-auto w-full max-w-[1020px] flex-1 grid-cols-2 items-center content-center"
                  : "content-start md:grid-cols-2",
              )}
            >
              {currentOptions.map((option) =>
                useCardOptions ? (
                  <FlipCard
                    key={option.id}
                    compact
                    allowFlipBack
                    reportToHeroApi={false}
                    data={{
                      mode: "singleChoice",
                      columns: 1,
                      countsTowardScore: false,
                      items: [
                        {
                          id: option.id,
                          image: option.media,
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
                    containerClassName={cn(
                      "w-full [--flip-card-height:min(300px,calc(var(--hero-height,100vh)*0.3))] [--card-media-max-height:min(205px,calc(var(--flip-card-height)*0.66))]",
                      currentQuestionResult?.selectedOptionId === option.id
                        ? "ring-2 ring-amber-300/60 ring-offset-0 rounded-2xl"
                        : "",
                    )}
                    gridContainerClassName="grid-cols-1"
                    onItemClick={() => answerCardQuestion(option)}
                  />
                ) : (
                  <button
                    key={option.id}
                    type="button"
                    disabled={Boolean(currentQuestionResult)}
                    onClick={() => answerQuestion(option)}
                    className={cn(
                      "rounded-xl border border-white/20 bg-black/10 px-4 py-3 text-left transition",
                      "hover:bg-black/20 disabled:opacity-60",
                    )}
                  >
                    <Typography content={option.label} align="center" />
                  </button>
                ),
              )}
            </div>

            <div className="shrink-0 flex flex-col gap-2">
              <div className="min-h-[72px]">
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

              <div className="flex min-h-[44px] items-center justify-center">
                {canContinue ? (
                  <Button
                    variant="primary"
                    label={currentIndex < items.length - 1 ? "Continuar" : "Finalizar"}
                    className="mx-auto"
                    onClick={goToNextQuestion}
                  />
                ) : null}
              </div>

              <Typography
                content={{
                  text: `Pregunta ${Math.min(currentIndex + 1, items.length)} de ${items.length}`,
                  variant: "helper",
                  align: "center",
                }}
              />
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <div className="flex h-full min-h-0 max-h-full w-full max-w-full flex-col gap-4 overflow-hidden">
      {instruction ? (
        <div className="shrink-0 rounded-xl border border-white/15 p-4">
          <Typography
            content={instruction}
            variant={instruction?.variant ?? "body"}
            align={instruction?.align ?? "center"}
          />
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 auto-rows-fr items-stretch content-stretch gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <Card
            key={item?.id ?? index}
            as="button"
            onClick={() => selectCard(item)}
            className={cn(
              // En procedimental la card debe aprovechar mejor su alto disponible.
              // Por eso acercamos el detalle al titulo y dejamos crecer mas la media.
              "h-full min-h-0 self-stretch [--card-media-max-height:min(100%,calc(var(--hero-height,100vh)*0.34))]",
              selectedId === item?.id ? "border-emerald-300/50" : "",
            )}
            mediaClassName="min-h-0 flex-1"
            media={item?.media ?? item?.image ?? { src: item?.src, alt: item?.alt }}
            title={item?.title ?? item?.label ?? { text: item?.caption, variant: "label" }}
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
        ))}
      </div>
    </div>
  );
}
