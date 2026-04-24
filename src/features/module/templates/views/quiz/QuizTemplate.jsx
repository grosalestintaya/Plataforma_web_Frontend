import { useEffect, useMemo, useState } from "react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { renderSlot } from "../../_core/SlotRenderer";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { getQuizRuntime } from "./quiz.config";

import * as Blocks from "@/features/module/blocks";

function getFormKey(viewId, formQuestion) {
  return `${viewId ?? "quiz"}:${formQuestion?.question?.text ?? ""}`;
}

/**
 * =========================================================
 * Main
 * =========================================================
 */

export default function QuizTemplate({ variant, data, heroApi, view }) {
  /**
   * =========================================================
   * Confetti
   * =========================================================
   */

  const { width, height } = useWindowSize();

  const [showConfetti, setShowConfetti] = useState(false);

  /**
   * Ejemplo:
   * mostrar confetti cuando sea la última pregunta
   * y esté completada
   */

  /**
   * =========================================================
   * Runtime
   * =========================================================
   */

  const runtime = getQuizRuntime({
    variant,
    data,
    view,
  });

  const outerLayout = normalizeLayout(runtime?.outerLayoutDef);
  const contentLayout = normalizeLayout(runtime?.contentLayoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  const viewId = view?.id ?? view?.viewId;
  const formQuestion = payload?.formQuestion ?? null;

  const formKey = useMemo(
    () => getFormKey(viewId, formQuestion),
    [formQuestion, viewId],
  );

  const [draft, setDraft] = useState({
    formKey,
    selectedId: null,
    reason: "",
  });

  useEffect(() => {
    setDraft({
      formKey,
      selectedId: null,
      reason: "",
    });
  }, [formKey]);

  const selectedId = draft.formKey === formKey ? draft.selectedId : null;

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

  /**
   * =========================================================
   * Trigger confetti
   * =========================================================
   */

  useEffect(() => {
    if (isComplete && isLastQuiz) {
      setShowConfetti(true);

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isComplete, isLastQuiz]);

  /**
   * =========================================================
   * Interactive state
   * =========================================================
   */

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

  if (!outerLayout || !contentLayout || !slots.length) {
    return (
      <div className="text-white/80">Config invalida para QuizTemplate</div>
    );
  }

  const quizState = {
    progress,
    selectedId,

    setSelectedId: (nextSelectedId) =>
      setDraft((prev) => ({
        ...prev,
        formKey,
        selectedId: nextSelectedId,
      })),

    reason,

    setReason: (nextReason) =>
      setDraft((prev) => ({
        ...prev,
        formKey,
        reason: nextReason,
      })),

    canGoBack,
    canAdvance,

    goBack: () => heroApi?.goBackCurrentView?.(),

    advance: () => heroApi?.advanceCurrentView?.(),

    advanceLabel: heroApi?.advanceLabel ?? "Continuar",
  };

  const outerSlots = slots.filter((slot) =>
    ["navigation", "leftNav", "rightNav"].includes(slot.area),
  );
  const contentSlots = slots.filter(
    (slot) => !["navigation", "leftNav", "rightNav"].includes(slot.area),
  );

  const renderQuizSlot = (slot, index) => {
    const renderedSlot = renderSlot(slot, payload, Blocks, {
      heroApi,
      view,
      quizState,
    });

    if (!renderedSlot) {
      return null;
    }

    return (
      <HeroArea
        key={`${slot.area}-${index}`}
        area={slot.area}
        className={slot.className}>
        {renderedSlot}
      </HeroArea>
    );
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={350}
        />
      )}

      <HeroGrid layout={outerLayout} className="h-full min-h-full w-full">
        {outerSlots.map(renderQuizSlot)}

        <HeroArea area="content" className="w-full p-0">
          <HeroGrid
            layout={contentLayout}
            className="h-full min-h-0 w-full px-0 md:px-0">
            {contentSlots.map(renderQuizSlot)}
          </HeroGrid>
        </HeroArea>
      </HeroGrid>
    </>
  );
}
