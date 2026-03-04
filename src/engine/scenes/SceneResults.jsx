import React, { useMemo } from "react";
import { collectQuestions } from "../flowUtils";
import { computeResult } from "../scoringRegistry";

export default function SceneResults({ scene, game, locked }) {
  const d = scene?.data || {};
  const questions = useMemo(
    () => collectQuestions(game.activityDef),
    [game.activityDef],
  );

  const r = useMemo(() => {
    try {
      return game.state.result ?? computeResult(game.activityDef, game.state);
    } catch {
      return null;
    }
  }, [game.activityDef, game.state, game.state.result]);

  const answers = game.state.answers || {};

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-xl font-semibold">{d.title || "Resultados"}</div>

        {r ? (
          <div className="mt-2 opacity-80">
            Correctas: {r.okCount}/{r.total} · Score:{" "}
            <span className="font-semibold">{r.score}%</span>
          </div>
        ) : (
          <div className="mt-2 opacity-80">
            No se pudo calcular el resultado.
          </div>
        )}

        <div className="mt-4 space-y-2">
          {questions.map((q) => {
            const picked = answers?.[q.id]?.value ?? null;
            const ok = picked && picked === q.correctOptionId;
            return (
              <div
                key={q.id}
                className="rounded-xl border border-white/10 bg-black/10 p-3">
                <div className="text-sm font-medium">{q.prompt}</div>
                <div className="text-sm opacity-80 mt-1">
                  Tu respuesta:{" "}
                  <span className="font-semibold">{picked ?? "-"}</span> ·{" "}
                  {ok ? "✅" : "❌"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            disabled={locked || game.isSubmitting}
            onClick={() => game.prev()}
            className={[
              "rounded-xl px-4 py-2 bg-white/10 border border-white/10",
              locked || game.isSubmitting
                ? "opacity-60 cursor-not-allowed"
                : "",
            ].join(" ")}>
            Volver
          </button>

          <button
            disabled={locked || game.isSubmitting}
            onClick={async () => {
              game.computeResult();
              await game.finish(); // SUBMIT -> y te manda a "outro"
            }}
            className={[
              "rounded-xl px-4 py-2 font-semibold",
              "bg-white/10 hover:bg-white/15 border border-white/10",
              locked || game.isSubmitting
                ? "opacity-60 cursor-not-allowed"
                : "",
            ].join(" ")}>
            {game.isSubmitting ? "Enviando..." : "Enviar intento"}
          </button>
        </div>
      </div>
    </div>
  );
}
