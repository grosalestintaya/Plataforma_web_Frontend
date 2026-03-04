import React, { useMemo } from "react";

function tipByType(type) {
  if (type === "conceptual") return "Lee con calma: aquí construyes la idea base.";
  if (type === "procedimental") return "Aquí se practica: prueba, falla y mejora.";
  if (type === "actitudinal") return "Piensa en tu vida diaria: decisiones pequeñas suman.";
  return "Sigue avanzando: cada intento cuenta.";
}

export default function GuideWidget({ theme, selectedActivity }) {
  const tip = useMemo(() => {
    if (!selectedActivity) return theme.guide.tagline;
    return tipByType(selectedActivity.type);
  }, [selectedActivity, theme]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
          {theme.guide.emoji}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/90">
            {theme.guide.animal} guía
          </div>
          <div className="text-xs text-white/60">{theme.name}</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-white/80 leading-relaxed">{tip}</div>

      {selectedActivity?.status === "locked" && (
        <div className="mt-3 text-xs text-white/60">
          Desbloquea completando la actividad anterior.
        </div>
      )}
    </div>
  );
}