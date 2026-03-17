import { useEffect, useRef, useState } from "react";
import { ensureActivityAttempt } from "../engine/flowAttempt";

/**
 * Maneja el inicio o restauración del intento.
 */
export function useActivityAttempt({ activityDef, scenes }) {
  const [netStatus, setNetStatus] = useState("starting");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(null);

  /**
   * Guarda el inicio real del intento.
   */
  const serverStartedAtMsRef = useRef(null);

  const backendActivityId = activityDef?.backendActivityId || null;
  const moduleCode = activityDef?.moduleCode || "";
  const activityCode = activityDef?.activityCode || "";
  const sceneCount = Array.isArray(scenes) ? scenes.length : 0;

  useEffect(() => {
    let isMounted = true;

    async function bootAttempt() {
      try {
        if (!backendActivityId) {
          throw new Error("Falta backendActivityId.");
        }

        if (sceneCount === 0) {
          throw new Error("Flow sin escenas.");
        }

        setNetStatus("starting");
        setError("");
        setAttempt(null);
        serverStartedAtMsRef.current = null;

        const attemptData = await ensureActivityAttempt({
          backendActivityId,
          moduleCode,
          activityCode,
        });

        if (!isMounted) return;

        setAttempt(attemptData);
        serverStartedAtMsRef.current = Date.parse(attemptData.startedAt);
        setNetStatus("playing");
      } catch (error) {
        if (!isMounted) return;

        setNetStatus("error");
        setError(error?.message || "Error iniciando intento.");
      }
    }

    bootAttempt();

    return () => {
      isMounted = false;
    };
  }, [backendActivityId, moduleCode, activityCode, sceneCount]);

  return {
    netStatus,
    error,
    attempt,
    serverStartedAtMsRef,
    setNetStatus,
    setError,
  };
}