import { useCallback, useEffect, useRef, useState } from "react";
import { startActivityAttempt, completeAttempt } from "@/services/activityApi";

/**
 * useMissionAttempt:
 * - mode="manual": start() se llama con botón "Empezar"
 * - mode="auto": inicia automáticamente cuando cambia activityId
 */
export function useMissionAttempt(activityId, { mode = "manual" } = {}) {
  const [attemptId, setAttemptId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | starting | active | completing | completed | error
  const [error, setError] = useState(null);

  const startedAtRef = useRef(null);
  const payloadRef = useRef({ events: [] });

  // reset cuando cambia misión (activityId)
  useEffect(() => {
    setAttemptId(null);
    setStatus("idle");
    setError(null);
    startedAtRef.current = null;
    payloadRef.current = { events: [] };
  }, [activityId]);

  // track de eventos para payload final
  const track = useCallback((event) => {
    payloadRef.current.events.push({ t: Date.now(), ...event });
  }, []);

  // start POST
  const start = useCallback(async () => {
    if (!activityId) throw new Error("activityId faltante en la misión");

    // evita doble start
    if (attemptId) return { attemptId };

    setStatus("starting");
    setError(null);

    payloadRef.current = { events: [{ t: Date.now(), type: "mission_start", activityId }] };

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

  // auto-start opcional (si lo usas algún día)
  useEffect(() => {
    if (mode !== "auto") return;
    if (!activityId) return;
    // no await: no queremos promesas colgando en effect
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activityId]);

  // complete POST
  const completeMission = useCallback(
    async ({ score = 0, extraPayload = {} } = {}) => {
      if (!attemptId) throw new Error("No attemptId: primero presiona Empezar");

      setStatus("completing");
      setError(null);

      const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      payloadRef.current.events.push({ t: Date.now(), type: "missi  _finish" });

      const body = {
        score,
        durationMs,
        payload: { ...payloadRef.current, ...extraPayload }
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
    [attemptId]
  );

  return { attemptId, status, error, start, track, completeMission };
}