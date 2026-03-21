import React from "react";

export default function SceneOutro({ scene, game, locked }) {
  const d = scene?.data || {};
  const completed = !!game.state.completed;
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-xl font-semibold">{d.title || "Fin"}</div>
        {d.body && <div className="opacity-80 mt-2">{d.body}</div>}

        <div className="mt-3 text-sm opacity-70">
          Estado: {completed ? "✅ Completado" : "⏳ No enviado"}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            disabled={locked}
            onClick={() => game.goTo("intro")}
            className={[
              "rounded-xl px-4 py-2 bg-white/10 border border-white/10",
              locked ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}>
            Reiniciar UI
          </button>

          <button
            disabled={locked}
            onClick={() => window.history.back()}
            className={[
              "rounded-xl px-4 py-2 font-semibold",
              "bg-white/10 hover:bg-white/15 border border-white/10",
              locked ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}>
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
