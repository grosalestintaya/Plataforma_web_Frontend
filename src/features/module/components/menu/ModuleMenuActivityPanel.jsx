import React from "react";
import { Heading, Text } from "../../blocks/base/Typography";

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
        className="relative h-full min-h-0 w-full max-w-[760px] p-3 sm:p-4 md:p-5 lg:h-4/5 xl:p-7"
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
        <Text variant="bodySm" tone="muted" width="full">
          Selecciona una actividad.
        </Text>
      </div>
    );
  }

  // La tarjeta central usa la metadata normalizada del catalogo del modulo.
  const displayTitle =
    activityContent?.title || activity?.title || "Actividad sin título";
  const displayLearn = activityContent?.learn || [];
  const displayOutcome = activityContent?.outcome || "";

  return (
    <div
      className="relative h-4/5 sm:h-fit min-h-0 w-full max-w-[760px] p-3 sm:p-4 md:p-5 xl:p-7"
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

      {/* La tarjeta usa toda la altura disponible y reparte su contenido
          en bloques verticales para no quedar centrada en el contenedor. */}
      <div className="relative flex h-full min-h-0 flex-col">
        <Text
          variant="eyebrow"
          tone="soft"
          width="full"
          className="text-[10px] leading-tight sm:text-xs"
        >
          {prettyType(activity.type)}
        </Text>

        <Heading
          as="h2"
          variant="h2"
          tone="primary"
          width="full"
          className="mt-1 text-base leading-tight sm:text-xl md:text-[1.7rem] xl:text-2xl"
        >
          {displayTitle}
        </Heading>

        <div className="mt-2 flex shrink-0 flex-wrap gap-x-2 gap-y-1 sm:mt-3 sm:gap-3">
          <Text
            as="span"
            variant="caption"
            tone="muted"
            width="full"
            className="text-[10px] leading-tight sm:text-sm md:text-xs xl:text-sm"
          >
            Estado:{" "}
            <b className="text-white/85">{prettyStatus(activity.status)}</b>
          </Text>

          <Text
            as="span"
            variant="caption"
            tone="muted"
            width="full"
            className="text-[10px] leading-tight sm:text-sm md:text-xs xl:text-sm"
          >
            Intentos:{" "}
            <b className="text-white/85">{activity.attemptsCount ?? 0}</b>
          </Text>

          <Text
            as="span"
            variant="caption"
            tone="muted"
            width="full"
            className="text-[10px] leading-tight sm:text-sm md:text-xs xl:text-sm"
          >
            Mejor score:{" "}
            <b className="text-white/85">{activity.bestScore ?? "-"}</b>
          </Text>
        </div>

        <div
          className="mt-3 min-h-0 flex-1 p-2.5 sm:mt-4 sm:p-3 md:mt-5 md:p-3 xl:mt-6 xl:p-4"
          style={{
            borderRadius: 22,
            background: `linear-gradient(180deg, ${withAlpha("#ffffff", 0.06)}, ${withAlpha("#000000", 0.22)})`,
            boxShadow: `0 0 0 2px ${withAlpha("#ffffff", 0.1)}`,
          }}
        >
          <Text
            variant="label"
            tone="primary"
            width="full"
            className="mb-1 text-xs leading-tight sm:text-sm"
          >
            Aprenderas
          </Text>

          {displayLearn.length ? (
            <ul className="ml-4 list-disc space-y-0.5 text-[10px] leading-snug text-white/75 sm:ml-5 sm:space-y-1 sm:text-sm">
              {displayLearn.map((item, idx) => (
                <li key={idx}>
                  <Text
                    as="span"
                    variant="caption"
                    tone="muted"
                    width="full"
                    className="text-[10px] leading-snug sm:text-sm md:text-xs xl:text-sm"
                  >
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          ) : (
            <Text variant="bodySm" tone="soft" width="full">
              (Aun no hay contenido definido para esta actividad.)
            </Text>
          )}

          {displayOutcome && (
            <Text
              variant="caption"
              tone="muted"
              width="full"
              className="mt-2 text-[10px] leading-snug sm:mt-3 sm:text-sm md:text-xs xl:text-sm"
            >
              Resultado esperado:{" "}
              <b className="text-white/90">{displayOutcome}</b>
            </Text>
          )}
        </div>

        <div className="mt-3 flex shrink-0 flex-col gap-2 sm:mt-4 sm:gap-3 md:mt-5 xl:mt-6 xl:flex-row xl:items-center xl:justify-between">
          <Text
            variant="helper"
            tone="soft"
            width="full"
            className="min-w-0 text-[10px] leading-snug break-words sm:text-xs xl:flex-1"
          >
            {getHelperText(activity)}
          </Text>

          <button
            type="button"
            disabled={!canPlay}
            onClick={onPlay}
            className={[
              "w-full shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition xl:w-auto xl:px-5 xl:py-2.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              canPlay
                ? "cursor-pointer hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                : "cursor-not-allowed",
            ].join(" ")}
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
