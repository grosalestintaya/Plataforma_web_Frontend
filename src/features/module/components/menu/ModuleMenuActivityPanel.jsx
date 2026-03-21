import React from "react";

function hexToRgb(hex) {
  const h = String(hex || "#000").replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");

  const num = parseInt(full, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function prettyType(type) {
  if (type === "conceptual") return "Conceptual";
  if (type === "procedimental") return "Procedimental";
  if (type === "actitudinal") return "Actitudinal";
  return type || "Actividad";
}

function prettyStatus(status) {
  if (status === "completed") return "Completada";
  if (status === "locked") return "Bloqueada";
  if (status === "available") return "Disponible";
  if (status === "in_progress") return "En progreso";
  return status || "Sin estado";
}

function getHelperText(activity) {
  if (!activity) return "Selecciona una actividad.";

  if (activity.status === "completed") {
    return "Puedes repetir para practicar o mejorar tu score.";
  }

  if (activity.status === "locked") {
    return "Completa la actividad anterior para desbloquear.";
  }

  return "Cuando estes listo, inicia.";
}

export default function ModuleMenuActivityPanel({
  activity,
  activityContent,
  themeHex = "#7130F7",
  canPlay,
  ctaLabel,
  onPlay,
}) {
  if (!activity) {
    return (
      <div
        className="relative w-full max-w-[760px] p-6 md:p-7"
        style={{
          borderRadius: 28,
          background: `linear-gradient(180deg, ${withAlpha("#ffffff", 0.08)}, ${withAlpha("#000000", 0.18)})`,
          boxShadow: `
            0 18px 55px rgba(0,0,0,0.35),
            0 0 0 2px ${withAlpha("#ffffff", 0.14)},
            0 0 0 6px ${withAlpha(themeHex, 0.1)},
            0 30px 90px ${withAlpha(themeHex, 0.18)}
          `,
        }}
      >
        <div className="text-white/70">Selecciona una actividad.</div>
      </div>
    );
  }

  const displayType = activity?.type || "";
  const displayMission = activityContent?.missionNumber || null;
  const displayTitle =
    activityContent?.title || activity?.title || "Actividad sin título";
  const displayLearn = activityContent?.learn || [];
  const displayOutcome = activityContent?.outcome || "";

  return (
    <div
      className="relative w-full max-w-[760px] p- md:p-7"
      style={{
        borderRadius: 28,
        background: `linear-gradient(180deg, ${withAlpha("#ffffff", 0.08)}, ${withAlpha("#000000", 0.18)})`,
        boxShadow: `
          0 18px 55px rgba(0,0,0,0.35),
          0 0 0 2px ${withAlpha("#ffffff", 0.14)},
          0 0 0 6px ${withAlpha(themeHex, 0.1)},
          0 30px 90px ${withAlpha(themeHex, 0.18)}
        `,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: 28,
          border: `2px solid ${withAlpha("#ffffff", 0.18)}`,
        }}
      />

      <div
        className="pointer-events-none absolute left-6 right-6 top-4 h-10"
        style={{
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${withAlpha("#ffffff", 0.1)}, transparent)`,
          filter: "blur(6px)",
        }}
      />

      <div
        className="pointer-events-none absolute bottom-3 left-6 right-6 h-8"
        style={{
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${withAlpha(themeHex, 0.12)}, transparent)`,
          filter: "blur(10px)",
        }}
      />

      <div className="relative">
        <div className="text-xs text-white/60 uppercase tracking-wide">
          {prettyType(activity.type)}
        </div>

        <h2 className="mt-1 text-2xl font-semibold text-white/95">
          {displayTitle}
        </h2>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/70">
          <span>
            Estado:{" "}
            <b className="text-white/85">{prettyStatus(activity.status)}</b>
          </span>

          <span>
            Intentos:{" "}
            <b className="text-white/85">{activity.attemptsCount ?? 0}</b>
          </span>

          <span>
            Mejor score:{" "}
            <b className="text-white/85">{activity.bestScore ?? "-"}</b>
          </span>
        </div>

        <div
          className="mt-6 p-4"
          style={{
            borderRadius: 22,
            background: `linear-gradient(180deg, ${withAlpha("#ffffff", 0.06)}, ${withAlpha("#000000", 0.22)})`,
            boxShadow: `0 0 0 2px ${withAlpha("#ffffff", 0.1)}`,
          }}
        >
          <div className="mb-2 text-sm font-semibold text-white/90">
            Aprenderas
          </div>

          {displayLearn.length ? (
            <ul className="ml-5 list-disc space-y-1 text-sm text-white/75">
              {displayLearn.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-white/60">
              (Aun no hay contenido definido para esta actividad.)
            </div>
          )}

          {displayOutcome && (
            <div className="mt-3 text-sm text-white/75">
              Resultado esperado:{" "}
              <b className="text-white/90">{displayOutcome}</b>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-white/55">{getHelperText(activity)}</div>

          <button
            disabled={!canPlay}
            onClick={onPlay}
            className="rounded-2xl border px-5 py-2.5 font-semibold transition"
            style={{
              borderColor: canPlay
                ? withAlpha("#ffffff", 0.18)
                : withAlpha("#ffffff", 0.1),
              background: canPlay
                ? `linear-gradient(180deg, ${withAlpha(themeHex, 0.28)}, ${withAlpha(themeHex, 0.14)})`
                : withAlpha("#ffffff", 0.05),
              color: canPlay
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.40)",
              boxShadow: canPlay
                ? `
                  0 14px 40px ${withAlpha(themeHex, 0.22)},
                  0 0 0 2px ${withAlpha("#ffffff", 0.12)}
                `
                : "none",
            }}
            title={canPlay ? "Iniciar / Nuevo intento" : "Actividad bloqueada"}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
