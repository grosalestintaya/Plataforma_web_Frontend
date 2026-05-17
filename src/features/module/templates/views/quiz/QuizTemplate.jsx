import { useEffect, useMemo, useState } from "react";
import { useWindowSize } from "react-use";

import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { renderSlot } from "../../_core/SlotRenderer";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { getQuizRuntime } from "./quiz.config";
import * as Blocks from "@/features/module/blocks";

export default function QuizTemplate({ variant, data, heroApi, view }) {
  // =========================================================
  // Runtime & layout
  // =========================================================
  const runtime = getQuizRuntime({ variant, data, view });

  const layout = normalizeLayout(runtime?.layoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  // =========================================================
  // View / form identifiers
  // =========================================================
  const viewId = view?.id ?? view?.viewId ?? null;
  const formKey = view?.formKey ?? viewId;
  const formQuestion = runtime?.formQuestion ?? null;

  // =========================================================
  // Local state
  // =========================================================
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState({ formKey: null, reason: "" });
  const [showConfetti, setShowConfetti] = useState(false);

  // =========================================================
  // Derived values
  // =========================================================
  const reason = draft.formKey === formKey ? draft.reason : "";
  const reasonText = reason.trim();

  const reasonRequired = Boolean(
    formQuestion?.reasonRequired ??
    formQuestion?.inputRequired ??
    formQuestion?.requireReason ??
    false,
  );

  const hasPromptInput = Boolean(
    formQuestion?.prompt || formQuestion?.placeholder,
  );

  const minReasonLength = Number(formQuestion?.minReasonLength ?? 8);

  const selectedOption =
    (formQuestion?.options ?? []).find((item) => item?.id === selectedId) ??
    null;

  const selectedOptionLabel =
    typeof selectedOption?.label === "string" ||
    typeof selectedOption?.label === "number"
      ? String(selectedOption?.label)
      : (selectedOption?.label?.text ?? null);

  const hasRequiredReason =
    !hasPromptInput || !reasonRequired || reasonText.length >= minReasonLength;

  const isComplete = Boolean(selectedId) && hasRequiredReason;

  const requiresCompletion = view?.nav?.mode === "lockedUntilComplete";

  const canAdvance =
    Boolean(heroApi?.canAdvance ?? true) && (!requiresCompletion || isComplete);

  const canGoBack = Boolean(heroApi?.canGoBack ?? true);

  // =========================================================
  // Quiz progress
  // =========================================================
  const missionViews = heroApi?.getMissionViews?.() ?? [];

  const quizViews = missionViews.filter((item) =>
    /quiz/i.test(String(item?.template ?? "")),
  );

  const currentQuizIndex = quizViews.findIndex(
    (item) => (item?.id ?? item?.viewId) === viewId,
  );

  const progress = {
    current: currentQuizIndex >= 0 ? currentQuizIndex + 1 : 1,
    total: Math.max(quizViews.length, 1),
  };

  const isLastQuiz = progress.current === progress.total;

  // =========================================================
  // Trigger confetti
  // =========================================================
  useEffect(() => {
    if (isComplete && isLastQuiz) {
      setShowConfetti(true); // FIX: was incorrectly set to false — now triggers confetti

      const timer = setTimeout(() => {
        setShowConfetti(false); // hide after 5 s
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isComplete, isLastQuiz]);

  // =========================================================
  // Interactive state
  // =========================================================
  useEffect(() => {
    if (!formQuestion) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: isComplete,
      selectedOptionId: selectedId ?? null,
      selectedOptionLabel,
      reasonText,
      reasonLength: reasonText.length,
      reasonRequired,
      score: isComplete ? Number(selectedOption?.score ?? 100) : 0,
      countsTowardScore: isComplete,
      type: "reflectionQuestion",
    });
  }, [
    formQuestion,
    heroApi,
    isComplete,
    reasonRequired,
    reasonText,
    selectedId,
    selectedOption?.score,
    selectedOptionLabel,
    viewId,
  ]);

  // =========================================================
  // Guard: require valid layout & slots
  // =========================================================
  if (!layout || !slots.length) {
    return (
      <div className="grid h-full min-h-0 w-full place-items-center text-white/80">
        Config inválida para QuizTemplate
      </div>
    );
  }

  // =========================================================
  // Render
  // =========================================================
  return (
    <HeroGrid
      layout={layout}
      className="mx-0 w-[calc(100vw-2rem)] min-w-0 max-w-[calc(100vw-2rem)] overflow-visible px-0 sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] sm:px-0 md:w-full md:max-w-full md:px-0 lg:px-12">
      {slots.map((slot, index) => {
        const renderedSlot = renderSlot(slot, payload, Blocks, {
          heroApi,
          view,
          quizVariant: runtime?.variant,
        });

        if (!renderedSlot) return null;

        return (
          <HeroArea
            key={`${slot.area}-${slot.slotId ?? index}`}
            area={slot.area}
            className="w-full min-w-0 max-w-full justify-start overflow-visible">
            {renderedSlot}
          </HeroArea>
        );
      })}
    </HeroGrid>
  );
}
