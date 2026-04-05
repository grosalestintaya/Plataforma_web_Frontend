import { useCallback, useEffect, useMemo, useState } from "react";

function getComparableInteractiveState(result = {}) {
  return {
    completed: Boolean(result?.completed),
    score: Number(result?.score ?? 0),
    type: result?.type ?? "interactive",
    countsTowardScore: result?.countsTowardScore,
    selectedOptionId: result?.selectedOptionId ?? null,
    selectedOptionLabel: result?.selectedOptionLabel ?? null,
    reasonText: result?.reasonText ?? null,
    reasonRequired: Boolean(result?.reasonRequired),
    balance: result?.balance ?? null,
    total: result?.total ?? null,
    selectedProductIds: Array.isArray(result?.selectedProductIds)
      ? [...result.selectedProductIds].sort()
      : null,
  };
}

function hasInteractiveStateChanged(previousResult, nextResult) {
  return (
    JSON.stringify(getComparableInteractiveState(previousResult)) !==
    JSON.stringify(getComparableInteractiveState(nextResult))
  );
}

/**
 * Evalua ramas condicionales con un snapshot de estado dado.
 * Se reutiliza tanto para el player como para los templates embebidos.
 */
function isViewAllowedByState(view, interactiveState) {
  const rule = view?.when ?? view?.availability?.dependsOn;
  if (!rule) return true;

  const sourceState = interactiveState?.[rule.viewId];
  const sourceValue = sourceState?.[rule.stateKey];

  if (rule.includes !== undefined) {
    return Array.isArray(sourceValue) && sourceValue.includes(rule.includes);
  }

  if (rule.equals !== undefined) {
    return sourceValue === rule.equals;
  }

  if (rule.notIncludes !== undefined) {
    return !Array.isArray(sourceValue) || !sourceValue.includes(rule.notIncludes);
  }

  return true;
}

/**
 * Centraliza el runtime interactivo de la actividad.
 * Aqui se guarda el estado de quizzes, juegos y respuestas libres.
 */
export function useActivityInteractiveState({
  missionKey,
  moduleData,
  missionAttemptTrack,
}) {
  const [interactiveState, setInteractiveState] = useState({});

  useEffect(() => {
    // Cada nueva mision arranca con estado interactivo limpio.
    setInteractiveState({});
  }, [missionKey]);

  const setInteractiveViewState = useCallback(
    (viewId, result) => {
      if (!viewId) return;

      let didChange = false;
      let shouldTrackEvent = false;

      setInteractiveState((prev) => {
        const nextResult = {
          ...prev[viewId],
          ...result,
        };

        if (!hasInteractiveStateChanged(prev[viewId], nextResult)) {
          return prev;
        }

        const previousState = prev[viewId] ?? {};
        shouldTrackEvent =
          previousState?.completed !== nextResult?.completed ||
          previousState?.selectedOptionId !== nextResult?.selectedOptionId;
        didChange = true;

        return {
          ...prev,
          [viewId]: nextResult,
        };
      });

      if (!didChange || !shouldTrackEvent) return;

      missionAttemptTrack?.({
        type: "interactive_result",
        viewId,
        gameType: result?.type ?? "interactive",
        completed: Boolean(result?.completed),
        score: Number(result?.score ?? 0),
      });
    },
    [missionAttemptTrack],
  );

  const isViewAvailable = useCallback(
    (view) => isViewAllowedByState(view, interactiveState),
    [interactiveState],
  );

  const missionScore = useMemo(() => {
    const scores = Object.values(interactiveState)
      .filter((entry) => entry?.countsTowardScore !== false)
      .map((entry) => Number(entry?.score))
      .filter((value) => Number.isFinite(value));

    if (!scores.length) return 0;

    return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  }, [interactiveState]);

  const getInteractiveState = useCallback(
    (viewId) => interactiveState[viewId] ?? null,
    [interactiveState],
  );

  const resolveNextViewId = useCallback(
    (fromViewId, anticipatedResult = null) => {
      const views = moduleData.missions?.[missionKey]?.views ?? [];
      const currentIndex = views.findIndex(
        (item) => (item?.id ?? item?.viewId) === fromViewId,
      );

      if (currentIndex < 0) return null;

      const previewState = anticipatedResult
        ? {
            ...interactiveState,
            [fromViewId]: {
              ...interactiveState[fromViewId],
              ...anticipatedResult,
            },
          }
        : interactiveState;

      const nextVisibleView = views
        .slice(currentIndex + 1)
        .find((candidate) => isViewAllowedByState(candidate, previewState));

      return nextVisibleView?.id ?? nextVisibleView?.viewId ?? null;
    },
    [interactiveState, missionKey, moduleData],
  );

  /**
   * Resume respuestas interactivas para enviarlas al backend.
   * En actitudinal esto incluye la opcion marcada y el texto opcional.
   */
  const buildInteractiveResponsesPayload = useCallback(
    () =>
      Object.entries(interactiveState).map(([viewId, result]) => ({
        viewId,
        type: result?.type ?? "interactive",
        completed: Boolean(result?.completed),
        score: Number(result?.score ?? 0),
        selectedOptionId: result?.selectedOptionId ?? null,
        selectedOptionLabel: result?.selectedOptionLabel ?? null,
        reasonText: result?.reasonText ?? null,
        reasonRequired: Boolean(result?.reasonRequired),
      })),
    [interactiveState],
  );

  return {
    interactiveState,
    setInteractiveViewState,
    isViewAvailable,
    missionScore,
    getInteractiveState,
    resolveNextViewId,
    buildInteractiveResponsesPayload,
  };
}
