import { useCallback, useMemo, useState } from "react";

function clamp(n, min, max) {
  // Mantiene el indice dentro del rango real de vistas.
  return Math.max(min, Math.min(n, max));
}

function getViewId(view) {
  // Centraliza el soporte para contenido nuevo (`id`) y legacy (`viewId`).
  return view?.id ?? view?.viewId ?? null;
}

/**
 * Identifica la vista de resumen final del flujo Lobby.
 * Se usa para decidir si la pantalla actual debe mostrar "Finalizar"
 * antes de entrar al `postGame`.
 */
function isPostGameView(view) {
  if (view?.role === "postGame" || view?.nav?.role === "postGame") return true;

  const template = String(view?.template ?? "").toLowerCase();
  const variant = String(view?.variant ?? "").toLowerCase();

  return template.includes("postgame") || variant === "postgame";
}

/**
 * Detecta la intro Lobby de la mision.
 * Sirve para bloquear el regreso desde la primera vista real del flujo.
 */
function isPreGameView(view) {
  if (view?.role === "preGame" || view?.nav?.role === "preGame") return true;

  const template = String(view?.template ?? "").toLowerCase();
  const variant = String(view?.variant ?? "").toLowerCase();

  return template.includes("pregame") || variant === "pregame";
}

function getFooterActionKind({ isBeforePostGame, isLast }) {
  // El footer expone intencion semantica para no depender de comparar labels.
  return isBeforePostGame || isLast ? "finish" : "next";
}

function getAdvanceLabel(actionKind) {
  // Mantiene una sola fuente para los textos que leen footer y templates.
  return actionKind === "finish" ? "Finalizar" : "Continuar";
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

  const currentVisiblePosition = visibleIndices.findIndex(
    (index) => index === safeIndex,
  );
  const safeVisiblePosition =
    currentVisiblePosition >= 0 ? currentVisiblePosition : 0;
  const nextVisibleIndex =
    currentVisiblePosition >= 0
      ? visibleIndices[currentVisiblePosition + 1]
      : safeIndex + 1;
  const previousVisibleIndex =
    currentVisiblePosition >= 0
      ? visibleIndices[currentVisiblePosition - 1]
      : safeIndex - 1;
  const nextVisibleView =
    typeof nextVisibleIndex === "number" ? views[nextVisibleIndex] : null;
  const previousVisibleView =
    typeof previousVisibleIndex === "number"
      ? views[previousVisibleIndex]
      : null;
  const isFirst =
    visibleIndices.length === 0 ||
    visibleIndices[safeVisiblePosition] === visibleIndices[0];
  const isLast =
    visibleIndices.length === 0 ||
    visibleIndices[safeVisiblePosition] ===
      visibleIndices[visibleIndices.length - 1];
  // La vista previa al postGame es donde realmente cerramos el attempt.
  const isBeforePostGame = !isLast && isPostGameView(nextVisibleView);
  // La segunda vista del flujo no debe permitir volver a la intro.
  const isImmediatelyAfterPreGame =
    currentVisiblePosition === 1 && isPreGameView(previousVisibleView);
  const footerActionKind = getFooterActionKind({ isBeforePostGame, isLast });

  const goTo = useCallback(
    (idx) => setViewIndex(views.length ? clamp(idx, 0, views.length - 1) : 0),
    [views.length],
  );

  const goToViewId = useCallback(
    (viewId) => {
      const nextIndex = views.findIndex(
        (item) => getViewId(item) === viewId,
      );
      if (nextIndex < 0) return;
      goTo(nextIndex);
    },
    [goTo, views],
  );

  const next = useCallback(() => {
    if (typeof nextVisibleIndex === "number") goTo(nextVisibleIndex);
  }, [goTo, nextVisibleIndex]);

  const prev = useCallback(() => {
    if (typeof previousVisibleIndex === "number") goTo(previousVisibleIndex);
  }, [goTo, previousVisibleIndex]);

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
        if (typeof result?.goToIndex === "number")
          return goTo(result.goToIndex);
      }

      return fallbackNavigate();
    },
    [actions, goTo, goToViewId],
  );

  const heroApi = useMemo(
    () => ({ next, prev, goTo, goToViewId, setMission }),
    [next, prev, goTo, goToViewId, setMission],
  );

  /**
   * Centraliza el avance actual para footer y templates embebidos.
   * Asi evitamos que un template siga haciendo `next()` cuando en realidad
   * debe cerrar el attempt antes de entrar al `postGame`.
   */
  const advanceCurrentView = useCallback(async () => {
    if (!view) return;

    if (isBeforePostGame) {
      try {
        setFinishing(true);

        const result = await onFinishMission?.({
          missionKey,
          currentView: view,
          nextView: nextVisibleView,
          phase: "beforePostGame",
        });

        if (result?.next === false) return;
        if (typeof nextVisibleIndex === "number") goTo(nextVisibleIndex);
      } finally {
        setFinishing(false);
      }

      return;
    }

    if (!isLast) {
      return runActionAndNavigate(
        view.nav?.action,
        { missionKey, viewIndex: safeIndex, view },
        next,
      );
    }

    try {
      setFinishing(true);
      await onFinishMission?.({
        missionKey,
        currentView: view,
        nextView: null,
        phase: "final",
      });
    } finally {
      setFinishing(false);
    }
  }, [
    goTo,
    isBeforePostGame,
    isLast,
    missionKey,
    next,
    nextVisibleIndex,
    nextVisibleView,
    onFinishMission,
    runActionAndNavigate,
    safeIndex,
    view,
  ]);

  const heroApiWithFlow = useMemo(
    () => ({
      ...heroApi,
      // Los templates embebidos leen la misma accion/etiqueta que el footer.
      advanceCurrentView,
      goBackCurrentView: prev,
      advanceLabel: getAdvanceLabel(footerActionKind),
      advanceActionKind: footerActionKind,
      isBeforePostGame,
      canGoBack:
        !isBeforePostGame &&
        !isFirst &&
        !isImmediatelyAfterPreGame &&
        !finishing,
      canAdvance: !finishing,
    }),
    [
      advanceCurrentView,
      finishing,
      heroApi,
      isBeforePostGame,
      isFirst,
      isImmediatelyAfterPreGame,
      isLast,
      footerActionKind,
      prev,
    ],
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

    if (mode === "embedded") {
      return {
        // El template controla el avance con su propio boton.
        type: "status",
        centerText: view.nav?.label ?? "Resuelve la situacion para continuar",
      };
    }

    if (mode === "locked") {
      return {
        type: "locked",
        left: { label: "Atras", enabled: false },
        centerText: view.nav?.label ?? "En progreso...",
        right: { label: "Siguiente", enabled: false },
      };
    }

    return {
      type: "normal",
      left: {
        label: "Atras",
        visible: !isBeforePostGame && !isImmediatelyAfterPreGame,
        enabled:
          !isBeforePostGame &&
          !isFirst &&
          !isImmediatelyAfterPreGame &&
          !finishing,
        onClick: prev,
      },
      centerText: "Quipu Yachay",
      right: {
        // Si la siguiente visible es postGame, este boton cierra el attempt.
        action: footerActionKind,
        label: footerActionKind === "finish" ? "Finalizar" : "Siguiente",
        enabled: !finishing,
        onClick: advanceCurrentView,
      },
    };
  }, [
    advanceCurrentView,
    finishing,
    isFirst,
    isImmediatelyAfterPreGame,
    isBeforePostGame,
    isLast,
    footerActionKind,
    prev,
    view,
  ]);

  return {
    missionKey,
    viewIndex: safeIndex,
    view,
    heroApi: heroApiWithFlow,
    footerModel,
    setMission,
    goTo,
  };
}
