import React, { useMemo } from "react";
import { computeResult } from "../engine/scoringRegistry";

export default function SceneMCQ({ scene, game, locked }) {
  const questions = scene?.data?.questions || [];
  const answers = game.state.answers || {};

  const answeredCount = useMemo(
    () => questions.filter((q) => answers?.[q.id]?.value).length,
    [questions, answers],
  );

  const preview = useMemo(() => {
    try {
      return computeResult(game.activityDef, game.state);
    } catch {
      return null;
    }
  }, [game.activityDef, game.state]);

  const canContinue =
    questions.length > 0 && answeredCount === questions.length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {questions.map((q, idx) => (
        <div
          key={q.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="font-medium">
            {idx + 1}. {q.prompt}
          </div>

          <div className="grid gap-2">
            {q.options.map((opt) => {
              const active = answers?.[q.id]?.value === opt.id;
              return (
                <button
                  key={opt.id}
                  disabled={locked}
                  onClick={() => game.setAnswer(q.id, opt.id)}
                  className={[
                    "text-left rounded-xl border px-3 py-2 transition",
                    "border-white/10 hover:border-white/20 bg-black/10 hover:bg-black/20",
                    active ? "ring-2 ring-white/30" : "",
                    locked ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}>
                  <span className="font-semibold mr-2">
                    {opt.id.toUpperCase()}.
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
        <div className="text-sm opacity-80">
          Progreso: {answeredCount}/{questions.length}
          {preview && (
            <>
              {" "}
              · Correctas: {preview.okCount}/{preview.total} · Score:{" "}
              {preview.score}%
            </>
          )}
        </div>

        <button
          disabled={locked || !canContinue}
          onClick={() => game.next()}
          className={[
            "rounded-xl px-4 py-2 font-semibold",
            "bg-white/10 hover:bg-white/15 border border-white/10",
            locked || !canContinue ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}>
          Ver resultado
        </button>
      </div>
    </div>
  );
}
