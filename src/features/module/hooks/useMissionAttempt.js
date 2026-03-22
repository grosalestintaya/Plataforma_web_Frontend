import { useCallback, useEffect, useRef, useState } from "react";
import { startActivityAttempt, completeAttempt } from "@/services/activityApi";

/**
 * Maneja el ciclo completo del attempt de una mision.
 * `manual` espera el boton "Empezar"; `auto` inicia al entrar.
 */
export function useMissionAttempt(activityId, { mode = "manual" } = {}) {
  const [attemptId, setAttemptId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // Guarda el momento real en que el attempt arranco.
  const startedAtRef = useRef(null);
  // Acumula eventos para enviarlos juntos al cerrar la mision.
  const payloadRef = useRef({ events: [] });

  useEffect(() => {
    // Cada cambio de mision reinicia el intento local.
    setAttemptId(null);
    setStatus("idle");
    setError(null);
    startedAtRef.current = null;
    payloadRef.current = { events: [] };
  }, [activityId]);

  const track = useCallback((event) => {
    // Permite agregar eventos durante la mision sin tocar el backend todavia.
    payloadRef.current.events.push({ t: Date.now(), ...event });
  }, []);

  const start = useCallback(async () => {
    if (!activityId) throw new Error("activityId faltante en la mision");

    // Evita pedir dos veces el mismo start para una sola vista.
    if (attemptId) return { attemptId };

    setStatus("starting");
    setError(null);

    payloadRef.current = {
      events: [{ t: Date.now(), type: "mission_start", activityId }],
    };

    try {
      const res = await startActivityAttempt(activityId);
      setAttemptId(res.attemptId);
      startedAtRef.current = Date.now();
      setStatus("active");
      return res;
    } catch (e) {
      setStatus("error");
      setError(e);
      throw e;
    }
  }, [activityId, attemptId]);

  useEffect(() => {
    if (mode !== "auto") return;
    if (!activityId) return;

    // Auto-start solo se usa cuando la mision debe arrancar sin intro.
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activityId]);

  const completeMission = useCallback(
    async ({ score = 0, extraPayload = {} } = {}) => {
      if (!attemptId) throw new Error("No attemptId: primero presiona Empezar");

      setStatus("completing");
      setError(null);

      // El tiempo se mide desde el start real, no desde que se abrio la pagina.
      const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      payloadRef.current.events.push({ t: Date.now(), type: "mission_finish" });

      const body = {
        score,
        durationMs,
        payload: { ...payloadRef.current, ...extraPayload },
      };

      try {
        const res = await completeAttempt(attemptId, body);
        setStatus("completed");
        return res;
      } catch (e) {
        setStatus("error");
        setError(e);
        throw e;
      }
    },
    [attemptId],
  );

  return { attemptId, status, error, start, track, completeMission };
}
