import { useEffect, useMemo, useState } from "react";
import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";
import Card from "../container/Card";
import { cn } from "@/shared/libs/utils";

/**
 * Normaliza una opcion corta para preguntas secuenciales.
 */
function normalizeQuestionOption(option, index) {
  return {
    id: option?.id ?? `option-${index + 1}`,
    label: option?.label ?? option?.text ?? `Opcion ${index + 1}`,
    correct: Boolean(option?.correct),
    feedback: option?.feedback,
    score: Number(option?.score ?? (option?.correct ? 100 : 60)),
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

  const [selectedId, setSelectedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pendingQuestionResult, setPendingQuestionResult] = useState(null);

  const currentQuestion = items[currentIndex] ?? null;
  const currentOptions = useMemo(
    () => (currentQuestion?.options ?? []).map(normalizeQuestionOption),
    [currentQuestion?.options],
  );

  const selectedCard = useMemo(
    () => items.find((item) => item?.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (!isQuestionSequence) return;
    if (answers.length !== items.length || items.length === 0) return;

    const correctCount = answers.filter((item) => item.correct).length;
    const score = Math.round((correctCount / items.length) * 100);

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
        option?.feedback ??
        currentQuestion?.feedback ??
        {
          text: option.correct ? "Respuesta correcta." : "Respuesta incorrecta.",
          variant: "helper",
          align: "center",
        },
    });
  }

  /**
   * Guarda la respuesta actual y continua la secuencia.
   */
  function goToNextQuestion() {
    if (!pendingQuestionResult) return;

    setAnswers((prev) => [...prev, pendingQuestionResult]);
    setPendingQuestionResult(null);

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

    return (
      <section className="flex flex-col gap-4 rounded-2xl  p-4">
        {data?.instruction ? (
          <Typography
            content={data.instruction}
            variant={data?.instruction?.variant ?? "bodySm"}
            align={data?.instruction?.align ?? "center"}
          />
        ) : null}

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
              <Typography
                content={currentQuestion.prompt}
                variant={currentQuestion?.prompt?.variant ?? "body"}
                align={currentQuestion?.prompt?.align ?? "center"}
              />
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              {currentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={Boolean(pendingQuestionResult)}
                  onClick={() => answerQuestion(option)}
                  className={cn(
                    "rounded-xl border border-white/20 bg-black/10 px-4 py-3 text-left transition",
                    "hover:bg-black/20 disabled:opacity-60",
                  )}
                >
                  <Typography
                    content={{ text: option.label, variant: "bodySm" }}
                    align="center"
                  />
                </button>
              ))}
            </div>

            {pendingQuestionResult?.feedback ? (
              <div className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 p-4">
                <Typography content={pendingQuestionResult.feedback} />
              </div>
            ) : null}

            {pendingQuestionResult ? (
              <Button
                variant="primary"
                label={currentIndex < items.length - 1 ? "Siguiente" : "Finalizar"}
                className="mx-auto"
                onClick={goToNextQuestion}
              />
            ) : null}

            <Typography
              content={{
                text: `Pregunta ${Math.min(currentIndex + 1, items.length)} de ${items.length}`,
                variant: "helper",
                align: "center",
              }}
            />
          </>
        )}
      </section>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item, index) => (
        <Card
          key={item?.id ?? index}
          as="button"
          onClick={() => selectCard(item)}
          className={cn(
            "h-full",
            selectedId === item?.id ? "border-emerald-300/50 bg-emerald-500/10" : "",
          )}
          media={item?.media ?? item?.image ?? { src: item?.src, alt: item?.alt }}
          title={item?.title ?? item?.label ?? { text: item?.caption, variant: "label" }}
          text={item?.text}
          footer={
            item?.detail ? (
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
  );
}
