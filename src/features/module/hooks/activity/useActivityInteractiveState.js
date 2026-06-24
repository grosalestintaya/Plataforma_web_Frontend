import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function normalizeComparableValue(value) {
  // Normaliza estructuras anidadas para comparar estados completos sin
  // depender del orden de keys ni perder payloads especificos de cada juego.
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeComparableValue(value[key]);
        return acc;
      }, {});
  }

  return value;
}

function hasInteractiveStateChanged(previousResult, nextResult) {
  return (
    JSON.stringify(normalizeComparableValue(previousResult ?? {})) !==
    JSON.stringify(normalizeComparableValue(nextResult ?? {}))
  );
}

function getViewId(view) {
  // Las vistas vienen normalizadas con id/viewId, pero algunos datos legacy
  // todavia pueden traer solo uno de los dos.
  return view?.id ?? view?.viewId ?? null;
}

function getStateValue(state, rule) {
  const sourceState = state?.[rule.viewId];
  return sourceState?.[rule.stateKey];
}

/**
 * Evalua ramas condicionales con un snapshot de estado dado.
 * Se reutiliza tanto para el player como para los templates embebidos.
 */
function isViewAllowedByState(view, interactiveState) {
  const rule = view?.when ?? view?.availability?.dependsOn;
  if (!rule) return true;

  const sourceValue = getStateValue(interactiveState, rule);

  if (rule.includesAny !== undefined) {
    return (
      Array.isArray(sourceValue) &&
      Array.isArray(rule.includesAny) &&
      rule.includesAny.some((item) => sourceValue.includes(item))
    );
  }

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

function shouldTrackInteractiveEvent(previousResult, nextResult) {
  // El tracking de attempt solo necesita eventos relevantes; cambios visuales
  // menores no deben inflar el payload de eventos.
  return (
    previousResult?.completed !== nextResult?.completed ||
    previousResult?.selectedOptionId !== nextResult?.selectedOptionId ||
    previousResult?.score !== nextResult?.score
  );
}

function shouldCountTowardMissionScore(entry) {
  // Compatibilidad: los interactivos antiguos cuentan salvo que digan false,
  // pero solo cuando ya estan completos para evitar promedios parciales.
  return Boolean(entry?.completed) && entry?.countsTowardScore !== false;
}

function getMissionScoreOverride(entry) {
  const override = Number(
    entry?.missionScoreOverride ?? entry?.payload?.missionScoreOverride,
  );

  return Number.isFinite(override) ? override : null;
}

function calculateMissionScore(interactiveState) {
  const completedEntries = Object.values(interactiveState).filter(
    shouldCountTowardMissionScore,
  );

  const overrideScores = completedEntries
    .map(getMissionScoreOverride)
    .filter((value) => Number.isFinite(value));

  if (overrideScores.length) {
    return Math.round(overrideScores[overrideScores.length - 1]);
  }

  const scores = completedEntries
    .map((entry) => Number(entry?.score))
    .filter((value) => Number.isFinite(value));

  if (!scores.length) return 0;

  return Math.round(
    scores.reduce((sum, value) => sum + value, 0) / scores.length,
  );
}

function buildResponsePayload(viewId, result) {
  // Mantiene campos conocidos para backend actual y agrega rawPayload para
  // que nuevos interactivos no pierdan informacion propia.
  return {
    viewId,
    type: result?.type ?? "interactive",
    completed: Boolean(result?.completed),
    score: Number(result?.score ?? 0),
    missionScoreOverride: getMissionScoreOverride(result),
    countsTowardScore: result?.countsTowardScore,
    selectedOptionId: result?.selectedOptionId ?? result?.selectedId ?? null,
    selectedOptionLabel: result?.selectedOptionLabel ?? null,
    reasonText: result?.reasonText ?? null,
    reasonRequired: Boolean(result?.reasonRequired),
    awardedCoins: Number(result?.awardedCoins ?? result?.coinsAward ?? 0),
    balance: result?.balance ?? null,
    total: result?.total ?? null,
    selectedProductIds: Array.isArray(result?.selectedProductIds)
      ? result.selectedProductIds
      : null,
    rawPayload: result?.payload ?? result ?? {},
  };
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
  const interactiveStateRef = useRef({});

  useEffect(() => {
    // Cada nueva mision arranca con estado interactivo limpio.
    interactiveStateRef.current = {};
    setInteractiveState({});
  }, [missionKey]);

  const setInteractiveViewState = useCallback(
    (viewId, result) => {
      if (!viewId) return;

      const previousState = interactiveStateRef.current[viewId] ?? {};
      const nextResult = {
        ...previousState,
        ...result,
      };

      if (!hasInteractiveStateChanged(previousState, nextResult)) return;

      const shouldTrackEvent = shouldTrackInteractiveEvent(
        previousState,
        nextResult,
      );

      const nextState = {
        ...interactiveStateRef.current,
        [viewId]: nextResult,
      };

      // La ref se actualiza primero para que cualquier vista siguiente
      // lea el saldo correcto incluso antes del re-render de React.
      interactiveStateRef.current = nextState;
      setInteractiveState(nextState);

      if (!shouldTrackEvent) return;

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
    return calculateMissionScore(interactiveState);
  }, [interactiveState]);

  const getInteractiveState = useCallback(
    (viewId) => interactiveStateRef.current[viewId] ?? null,
    [],
  );

  const resolveNextViewId = useCallback(
    (fromViewId, anticipatedResult = null) => {
      const views = moduleData.missions?.[missionKey]?.views ?? [];
      const currentIndex = views.findIndex(
        (item) => getViewId(item) === fromViewId,
      );

      if (currentIndex < 0) return null;

      const previewState = anticipatedResult
        ? {
            ...interactiveStateRef.current,
            [fromViewId]: {
              ...interactiveStateRef.current[fromViewId],
              ...anticipatedResult,
            },
          }
        : interactiveStateRef.current;

      const nextVisibleView = views
        .slice(currentIndex + 1)
        .find((candidate) => isViewAllowedByState(candidate, previewState));

      return getViewId(nextVisibleView);
    },
    [missionKey, moduleData],
  );

  /**
   * Resume respuestas interactivas para enviarlas al backend.
   * En actitudinal esto incluye la opcion marcada y el texto opcional.
   */
  const buildInteractiveResponsesPayload = useCallback(
    () =>
      Object.entries(interactiveState).map(([viewId, result]) =>
        buildResponsePayload(viewId, result),
      ),
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
