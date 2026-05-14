import { useCallback, useEffect, useRef, useState } from "react";
import {
  startActivityAttempt,
  completeAttempt,
  completeAttemptKeepalive,
} from "@/services/activityApi";

function createMissionStartEvent(activityId) {
  // Evento base que deja trazabilidad del inicio del intento en el payload final.
  return { t: Date.now(), type: "mission_start", activityId };
}

function withTimestamp(event) {
  // Todos los eventos internos comparten el mismo shape temporal.
  return { t: Date.now(), ...event };
}

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
  // Evita duplicar el start si el usuario presiona dos veces antes del re-render.
  const startPromiseRef = useRef(null);

  useEffect(() => {
    // Cada cambio de mision reinicia el intento local.
    setAttemptId(null);
    setStatus("idle");
    setError(null);
    startedAtRef.current = null;
    payloadRef.current = { events: [] };
    startPromiseRef.current = null;
  }, [activityId]);

  const track = useCallback((event) => {
    // Permite agregar eventos durante la mision sin tocar el backend todavia.
    payloadRef.current.events.push(withTimestamp(event));
  }, []);

  /**
   * Construye el body final que consume el endpoint de cierre del intento.
   * No muta payloadRef: asi un retry no duplica `mission_finish/abandon`.
   */
  const buildCompletionBody = useCallback(
    ({ score = 0, extraPayload = {}, finishType = "mission_finish" } = {}) => {
      const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      const events = [
        ...(payloadRef.current.events ?? []),
        withTimestamp({ type: finishType }),
      ];

      return {
        score,
        durationMs,
        payload: { ...payloadRef.current, events, ...extraPayload },
      };
    },
    [],
  );

  const start = useCallback(async () => {
    if (!activityId) throw new Error("activityId faltante en la mision");

    // Evita pedir dos veces el mismo start para una sola vista.
    if (attemptId) return { attemptId };
    if (startPromiseRef.current) return startPromiseRef.current;

    setStatus("starting");
    setError(null);

    payloadRef.current = {
      events: [createMissionStartEvent(activityId)],
    };

    startPromiseRef.current = (async () => {
      const res = await startActivityAttempt(activityId);
      setAttemptId(res.attemptId);
      startedAtRef.current = Date.now();
      setStatus("active");
      return res;
    })();

    try {
      return await startPromiseRef.current;
    } catch (e) {
      setStatus("error");
      setError(e);
      throw e;
    } finally {
      startPromiseRef.current = null;
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

      // Completion y abandono usan el mismo contrato; solo cambia finishType.
      const body = buildCompletionBody({
        score,
        extraPayload,
        finishType: "mission_finish",
      });

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
    [attemptId, buildCompletionBody],
  );

  /**
   * Cierra el intento como abandono.
   * Puede ejecutarse normalmente o en modo `keepalive` durante recarga/cierre.
   */
  const abandonMission = useCallback(
    async ({
      score = 0,
      extraPayload = {},
      keepalive = false,
    } = {}) => {
      if (!attemptId || status === "completed") return null;

      // El abandono marca el intento como completado en backend con metadata extra.
      const body = buildCompletionBody({
        score,
        extraPayload: {
          abandoned: true,
          ...extraPayload,
        },
        finishType: "mission_abandon",
      });

      if (keepalive) {
        completeAttemptKeepalive(attemptId, body);
        /**
         * No cambiamos el estado local a `completed` aqui:
         * si el usuario cancela el refresh/cierre del navegador,
         * la sesion sigue viva y todavia debe poder mostrar
         * el modal de confirmacion al salir.
         */
        return null;
      }

      setStatus("completing");
      setError(null);

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
    [attemptId, buildCompletionBody, status],
  );

  return { attemptId, status, error, start, track, completeMission, abandonMission };
}
