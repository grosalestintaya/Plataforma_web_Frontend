import React, { useEffect, useMemo, useRef, useState } from "react";
import { resolveScene } from "./sceneRegistry";
import { computeResult } from "./scoringRegistry";
import { collectQuestions } from "./flowUtils";
import {
  startActivityAttempt,
  completeAttempt,
} from "../../../services/activityApi";

function buildPayload(activityDef, state) {
  const questions = collectQuestions(activityDef);
  const answers = state?.answers || {};

  return {
    answers: questions.map((q) => {
      const a = answers[q.id] || {};
      const selectedOptionId = a.value ?? null;
      const ok = selectedOptionId === q.correctOptionId;

      const extra = a.extra && typeof a.extra === "object" ? a.extra : {};

      // Tu base: { latuya: "q2", ok: false, formulario1: "respuesta" }
      // -> latuya = questionId por defecto; extra puede meter formulario1 u otros
      return {
        latuya: q.id,
        ok,
        selectedOptionId,
        ...extra,
      };
    }),
  };
}

export default function FlowRunner({ activityDef, onExit }) {
  const scenes = activityDef?.scenes || [];
  const [sceneIndex, setSceneIndex] = useState(0);

  const [netStatus, setNetStatus] = useState("starting"); // starting | playing | submitting | error
  const [error, setError] = useState("");

  const [attempt, setAttempt] = useState(null); // { attemptId, startedAt }
  const serverStartedAtMsRef = useRef(null);

  const [state, setState] = useState(() => ({
    answers: {}, // { [questionId]: { value, extra? } }
    result: null, // { score, okCount, total }
    completed: false, // submit OK
  }));

  const scene = scenes[sceneIndex] || null;
  const SceneComp = useMemo(
    () => (scene ? resolveScene(scene.template) : null),
    [scene],
  );

  // START attempt (con cache para refresh)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!activityDef?.backendActivityId)
          throw new Error("Falta backendActivityId.");
        if (!Array.isArray(scenes) || scenes.length === 0)
          throw new Error("Flow sin escenas.");

        setNetStatus("starting");
        setError("");

        const cacheKey = `attempt:${activityDef.moduleCode}:${activityDef.activityCode}`;
        const cachedRaw = sessionStorage.getItem(cacheKey);

        let data = null;
        if (cachedRaw) {
          try {
            data = JSON.parse(cachedRaw);
          } catch {
            data = null;
          }
        }

        if (!data?.attemptId || !data?.startedAt) {
          data = await startActivityAttempt(activityDef.backendActivityId);
          if (!data?.attemptId || !data?.startedAt)
            throw new Error("Backend no devolvió attemptId/startedAt.");
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }

        if (!alive) return;

        setAttempt(data);
        serverStartedAtMsRef.current = Date.parse(data.startedAt);
        setNetStatus("playing");
      } catch (e) {
        if (!alive) return;
        setNetStatus("error");
        setError(e?.message || "Error iniciando intento.");
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityDef?.backendActivityId]);

  const game = useMemo(() => {
    const next = () => setSceneIndex((i) => Math.min(i + 1, scenes.length - 1));
    const prev = () => setSceneIndex((i) => Math.max(i - 1, 0));
    const goTo = (id) => {
      const idx = scenes.findIndex((s) => s.id === id);
      if (idx >= 0) setSceneIndex(idx);
    };

    const setAnswer = (questionId, value, extra) => {
      setState((s) => ({
        ...s,
        answers: {
          ...s.answers,
          [questionId]: {
            value,
            extra:
              extra && typeof extra === "object"
                ? extra
                : s.answers?.[questionId]?.extra,
          },
        },
      }));
    };

    const compute = () => {
      const r = computeResult(activityDef, state);
      setState((s) => ({ ...s, result: r }));
      return r;
    };

    const finish = async () => {
      try {
        if (!attempt?.attemptId) throw new Error("No hay attemptId.");

        setNetStatus("submitting");
        setError("");

        const r = state.result ?? computeResult(activityDef, state);
        const startedMs = serverStartedAtMsRef.current || Date.now();
        const durationMs = Math.max(0, Date.now() - startedMs);

        const body = {
          score: r.score,
          durationMs,
          payload: buildPayload(activityDef, state),
        };

        await completeAttempt(attempt.attemptId, body);

        // limpia cache al completar
        const cacheKey = `attempt:${activityDef.moduleCode}:${activityDef.activityCode}`;
        sessionStorage.removeItem(cacheKey);

        setState((s) => ({ ...s, result: r, completed: true }));
        setNetStatus("playing");

        // avanza a outro si existe
        const outroIdx = scenes.findIndex((s) => s.id === "outro");
        if (outroIdx >= 0) setSceneIndex(outroIdx);
      } catch (e) {
        setNetStatus("error");
        setError(e?.message || "Error enviando resultados.");
      }
    };

    return {
      // meta
      activityDef,
      attemptId: attempt?.attemptId || null,
      startedAt: attempt?.startedAt || null,

      // state
      state,
      sceneIndex,
      scene,

      // navigation
      next,
      prev,
      goTo,

      // game ops
      setAnswer,
      computeResult: compute,
      finish,

      // helpers
      isSubmitting: netStatus === "submitting",
    };
  }, [activityDef, attempt, netStatus, scene, sceneIndex, scenes, state]);

  if (netStatus === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-400/20 bg-rose-500/10">
        <div className="font-semibold">Error</div>
        <div className="opacity-80 mt-1">{error}</div>
        <button
          onClick={onExit}
          className="mt-4 rounded-xl px-4 py-2 bg-white/10 border border-white/10">
          Volver
        </button>
      </div>
    );
  }

  if (netStatus === "starting") {
    return (
      <div className="max-w-2xl mx-auto p-0 rounded-2xl border border-white/10 bg-white/5">
        Iniciando actividad...
      </div>
    );
  }

  if (!scene || !SceneComp) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-white/10 bg-white/5">
        Escena inválida (template no registrado o flow vacío).
        <button
          onClick={onExit}
          className="mt-4 rounded-xl px-4 py-2 bg-white/10 border border-white/10">
          Volver
        </button>
      </div>
    );
  }

  const locked = netStatus !== "playing";

  return (
    <SceneComp
      activityDef={activityDef}
      scene={scene}
      game={game}
      locked={locked}
    />
  );
}
