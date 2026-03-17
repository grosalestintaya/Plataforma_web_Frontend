import { useMemo } from "react";
import { useActivityAttempt } from "./useActivityAttempt";
import { useFlowGame } from "./useFlowGame";

/**
 * Orquesta intento, flow y footer del reproductor de actividad.
 */
export function useActivityPlayer(activityDef, { onExit }) {
  const scenes = activityDef?.scenes || [];

  /**
   * Identifica una actividad concreta.
   */
  const activityKey = `${activityDef?.backendActivityId || ""}:${activityDef?.moduleCode || ""}:${activityDef?.activityCode || ""}`;

  const {
    netStatus,
    error,
    attempt,
    serverStartedAtMsRef,
    setNetStatus,
    setError,
  } = useActivityAttempt({
    activityDef,
    scenes,
  });

  const { game, scene } = useFlowGame({
    activityDef,
    activityKey,
    scenes,
    attempt,
    netStatus,
    setNetStatus,
    setError,
    serverStartedAtMsRef,
  });

  /**
   * Bloquea interacción mientras no esté en playing.
   */
  const locked = netStatus !== "playing";

  /**
   * Lee reglas de navegación desde la escena actual.
   */
  const footerModel = useMemo(() => {
    const isReady = netStatus === "playing" && !!game;
    const nav = scene?.navigation || {};

    const showPrev = nav.showPrev ?? true;
    const showNext = nav.showNext ?? !game?.isLastScene;
    const showFinish = nav.showFinish ?? !!game?.isLastScene;

    return {
      prevEnabled: isReady && showPrev && !game?.isFirstScene,
      nextEnabled: isReady && showNext && !game?.isLastScene,
      finishEnabled: isReady && showFinish && !!game?.isLastScene,

      showPrev,
      showNext,
      showFinish,

      onPrev: () => {
        if (!isReady || !showPrev || game?.isFirstScene) return;
        game.prev();
      },

      onNext: () => {
        if (!isReady || !showNext || game?.isLastScene) return;
        game.next();
      },

      onFinish: () => {
        if (!isReady || !showFinish || !game?.isLastScene) return;
        game.finish();
      },

      onExit,
    };
  }, [game, netStatus, onExit, scene]);

  return {
    scene,
    game,
    locked,
    netStatus,
    error,
    footerModel,
    onExit,
  };
}