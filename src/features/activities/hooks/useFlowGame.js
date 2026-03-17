import { useEffect, useMemo, useState } from "react";
import { computeResult } from "../engine/scoringRegistry";
import { buildFlowPayload } from "../engine/flowPayload";
import {
  clearCachedAttempt,
  submitActivityAttempt,
} from "../engine/flowAttempt";

/**
 * Maneja escena actual, respuestas, scoring y finalización.
 */
export function useFlowGame({
  activityDef,
  activityKey,
  scenes,
  attempt,
  netStatus,
  setNetStatus,
  setError,
  serverStartedAtMsRef,
}) {
  const [sceneIndex, setSceneIndex] = useState(0);

  const [state, setState] = useState({
    answers: {},
    result: null,
    completed: false,
  });

  /**
   * Reinicia el estado del flow al cambiar de actividad.
   */
  useEffect(() => {
    setSceneIndex(0);
    setState({
      answers: {},
      result: null,
      completed: false,
    });
  }, [activityKey]);

  const scene = scenes[sceneIndex] || null;

  const game = useMemo(() => {
    const next = () => {
      setSceneIndex((current) => Math.min(current + 1, scenes.length - 1));
    };

    const prev = () => {
      setSceneIndex((current) => Math.max(current - 1, 0));
    };

    const goTo = (sceneId) => {
      const targetIndex = scenes.findIndex((item) => item.id === sceneId);
      if (targetIndex >= 0) {
        setSceneIndex(targetIndex);
      }
    };

    /**
     * Guarda o actualiza la respuesta de una pregunta.
     */
    const setAnswer = (questionId, value, extra) => {
      setState((prevState) => ({
        ...prevState,
        answers: {
          ...prevState.answers,
          [questionId]: {
            value,
            extra:
              extra && typeof extra === "object"
                ? extra
                : prevState.answers?.[questionId]?.extra,
          },
        },
      }));
    };

    /**
     * Calcula el resultado actual.
     */
    const compute = () => {
      const result = computeResult(activityDef, state);

      setState((prevState) => ({
        ...prevState,
        result,
      }));

      return result;
    };

    /**
     * Envía el cierre del intento al backend.
     */
    const finish = async () => {
      try {
        if (!attempt?.attemptId) {
          throw new Error("No hay attemptId.");
        }

        setNetStatus("submitting");
        setError("");

        const result = state.result ?? computeResult(activityDef, state);
        const startedMs = serverStartedAtMsRef.current || Date.now();
        const durationMs = Math.max(0, Date.now() - startedMs);

        const body = {
          score: result.score,
          durationMs,
          payload: buildFlowPayload(activityDef, state),
        };

        await submitActivityAttempt(attempt.attemptId, body);
        clearCachedAttempt(activityDef);

        setState((prevState) => ({
          ...prevState,
          result,
          completed: true,
        }));

        setNetStatus("playing");

        const outroIndex = scenes.findIndex((item) => item.id === "outro");
        if (outroIndex >= 0) {
          setSceneIndex(outroIndex);
        }
      } catch (error) {
        setNetStatus("error");
        setError(error?.message || "Error enviando resultados.");
      }
    };

    return {
      activityDef,
      attemptId: attempt?.attemptId || null,
      startedAt: attempt?.startedAt || null,

      state,
      sceneIndex,
      scene,

      next,
      prev,
      goTo,

      setAnswer,
      computeResult: compute,
      finish,

      isSubmitting: netStatus === "submitting",
      isFirstScene: sceneIndex === 0,
      isLastScene: sceneIndex === scenes.length - 1,
    };
  }, [
    activityDef,
    attempt,
    netStatus,
    scene,
    sceneIndex,
    scenes,
    serverStartedAtMsRef,
    setError,
    setNetStatus,
    state,
  ]);

  return {
    game,
    scene,
  };
}