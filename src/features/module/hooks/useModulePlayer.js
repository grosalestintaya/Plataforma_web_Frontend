import { useCallback, useMemo, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

/**
 * Controla la vista actual de la mision y el footer de navegacion.
 * Tambien soporta saltos entre vistas cuando una rama lo necesita.
 */
export function useModulePlayer(
  moduleData,
  { initialMissionKey, onFinishMission, actions, isViewAvailable } = {},
) {
  const missions = moduleData?.missions ?? {};
  const missionKeys = Object.keys(missions);

  const startMissionKey = missions?.[initialMissionKey]
    ? initialMissionKey
    : missionKeys[0];

  const [missionKey, setMissionKey] = useState(startMissionKey);
  const [viewIndex, setViewIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const views = missions?.[missionKey]?.views ?? [];
  const safeIndex = views.length ? clamp(viewIndex, 0, views.length - 1) : 0;
  const view = views[safeIndex];

  // Solo las vistas visibles participan en siguiente / atras.
  const visibleIndices = useMemo(
    () =>
      views
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => (isViewAvailable ? isViewAvailable(item) : true))
        .map(({ index }) => index),
    [isViewAvailable, views],
  );

  const currentVisiblePosition = visibleIndices.findIndex((index) => index === safeIndex);
  const safeVisiblePosition = currentVisiblePosition >= 0 ? currentVisiblePosition : 0;
  const isFirst =
    visibleIndices.length === 0 ||
    visibleIndices[safeVisiblePosition] === visibleIndices[0];
  const isLast =
    visibleIndices.length === 0 ||
    visibleIndices[safeVisiblePosition] === visibleIndices[visibleIndices.length - 1];

  const goTo = useCallback(
    (idx) => setViewIndex(views.length ? clamp(idx, 0, views.length - 1) : 0),
    [views.length],
  );

  const goToViewId = useCallback(
    (viewId) => {
      const nextIndex = views.findIndex((item) => item?.id === viewId);
      if (nextIndex < 0) return;
      goTo(nextIndex);
    },
    [goTo, views],
  );

  const next = useCallback(() => {
    const nextIndex =
      currentVisiblePosition >= 0
        ? visibleIndices[currentVisiblePosition + 1]
        : safeIndex + 1;

    if (typeof nextIndex === "number") goTo(nextIndex);
  }, [currentVisiblePosition, goTo, safeIndex, visibleIndices]);

  const prev = useCallback(() => {
    const previousIndex =
      currentVisiblePosition >= 0
        ? visibleIndices[currentVisiblePosition - 1]
        : safeIndex - 1;

    if (typeof previousIndex === "number") goTo(previousIndex);
  }, [currentVisiblePosition, goTo, safeIndex, visibleIndices]);

  const setMission = useCallback(
    (mk) => {
      if (!missions?.[mk]) return;
      setMissionKey(mk);
      // Reinicia la vista al entrar a otra mision.
      setViewIndex(0);
    },
    [missions],
  );

  const runActionAndNavigate = useCallback(
    async (actionKey, context, fallbackNavigate) => {
      if (actionKey && actions?.[actionKey]) {
        const result = await actions[actionKey](context);

        // La accion puede frenar la navegacion si necesita esperar algo.
        if (result?.next === false) return;
        // La accion puede saltar directo a una vista concreta.
        if (result?.goToViewId) return goToViewId(result.goToViewId);
        // La accion tambien puede resolver el indice por su cuenta.
        if (typeof result?.goToIndex === "number") return goTo(result.goToIndex);
      }

      return fallbackNavigate();
    },
    [actions, goTo, goToViewId],
  );

  const heroApi = useMemo(
    () => ({ next, prev, goTo, goToViewId, setMission }),
    [next, prev, goTo, goToViewId, setMission],
  );

  const footerModel = useMemo(() => {
    if (!view) {
      return {
        type: "normal",
        left: { enabled: false },
        right: { enabled: false },
        centerText: "Quipu Yachay",
      };
    }

    const mode = view.nav?.mode ?? "normal";

    if (mode === "cta") {
      return {
        type: "cta",
        center: {
          label: view.nav?.label ?? "Empezar",
          enabled: !finishing,
          onClick: async () =>
            runActionAndNavigate(
              view.nav?.action,
              { missionKey, viewIndex: safeIndex, view },
              next,
            ),
        },
      };
    }

    if (mode === "locked") {
      return {
        type: "locked",
        left: { label: "< Atrás", enabled: false },
        centerText: view.nav?.label ?? "En progreso...",
        right: { label: "Siguiente >", enabled: false },
      };
    }

    return {
      type: "normal",
      left: {
        label: "< Atrás",
        enabled: !isFirst && !finishing,
        onClick: prev,
      },
      centerText: "Quipu Yachay",
      right: {
        label: isLast ? "Finalizar" : "Siguiente >",
        enabled: !finishing,
        onClick: async () => {
          if (!isLast) {
            return runActionAndNavigate(
              view.nav?.action,
              { missionKey, viewIndex: safeIndex, view },
              next,
            );
          }

          try {
            setFinishing(true);
            await onFinishMission?.({ missionKey });
          } finally {
            setFinishing(false);
          }
        },
      },
    };
  }, [
    finishing,
    isFirst,
    isLast,
    missionKey,
    next,
    onFinishMission,
    prev,
    runActionAndNavigate,
    safeIndex,
    view,
  ]);

  return {
    missionKey,
    viewIndex: safeIndex,
    view,
    heroApi,
    footerModel,
    setMission,
    goTo,
  };
}
