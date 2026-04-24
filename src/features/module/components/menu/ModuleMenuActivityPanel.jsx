import React, { useMemo } from "react";
import { Heading, Text } from "../../blocks/base/Typography";

/**
 * =========================================================
 * Helpers
 * =========================================================
 */

const STATUS_MAP = {
  completed: "Completada",
  locked: "Bloqueada",
  available: "Disponible",
  in_progress: "En progreso",
};

const TYPE_MAP = {
  conceptual: "Conceptual",
  procedimental: "Procedimental",
  actitudinal: "Actitudinal",
};

function hexToRgb(hex) {
  const normalized = String(hex || "#000000")
    .replace("#", "")
    .trim();

  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized.padEnd(6, "0");

  const parsed = parseInt(fullHex, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function withAlpha(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

function formatType(type) {
  return TYPE_MAP[type] || type || "Actividad";
}

function formatStatus(status) {
  return STATUS_MAP[status] || status || "Sin estado";
}

function getHelperText(activity) {
  if (!activity) return "Selecciona una actividad.";

  switch (activity.status) {
    case "completed":
      return "Puedes repetir esta actividad para mejorar tu score.";

    case "locked":
      return "Completa la actividad anterior para desbloquear esta sección.";

    default:
      return "Cuando estés listo, puedes comenzar.";
  }
}

/**
 * =========================================================
 * Reusable blocks
 * =========================================================
 */

function StatItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <Text
        variant="caption"
        tone="muted"
        width="full"
        className="text-[11px] sm:text-xs">
        {label}
      </Text>

      <Text
        variant="bodySm"
        tone="primary"
        width="full"
        className="mt-1 font-semibold text-white">
        {value ?? "-"}
      </Text>
    </div>
  );
}

function EmptyState({ themeHex }) {
  return (
    <section
      className="relative w-full max-w-[760px] min-h-[620px] rounded-[28px] p-2 md:p-6 xl:p-2 flex flex-col justify-center"
      style={{
        background: `linear-gradient(
          180deg,
          ${withAlpha("#ffffff", 0.08)},
          ${withAlpha("#000000", 0.18)}
        )`,
        boxShadow: `
          0 20px 60px rgba(0,0,0,0.35),
          0 0 0 1px ${withAlpha("#ffffff", 0.12)},
          0 0 0 6px ${withAlpha(themeHex, 0.08)}
        `,
      }}>
      <Text variant="bodySm" tone="muted" width="full">
        Selecciona una actividad para ver su detalle.
      </Text>
    </section>
  );
}

/**
 * =========================================================
 * Main Component
 * =========================================================
 */

export default function ModuleMenuActivityPanel({
  activity,
  activityContent,
  themeHex = "#7130F7",
  canPlay = false,
  ctaLabel = "Iniciar",
  onPlay,
}) {
  if (!activity) {
    return <EmptyState themeHex={themeHex} />;
  }

  const displayData = useMemo(
    () => ({
      title:
        activityContent?.title || activity?.title || "Actividad sin título",

      learn: activityContent?.learn || [],

      outcome: activityContent?.outcome || "",
    }),
    [activity, activityContent],
  );

  const cardStyle = {
    background: `linear-gradient(
      180deg,
      ${withAlpha("#ffffff", 0.08)},
      ${withAlpha("#000000", 0.18)}
    )`,
    boxShadow: `
      0 20px 60px rgba(0,0,0,0.35),
      0 0 0 1px ${withAlpha("#ffffff", 0.12)},
      0 0 0 6px ${withAlpha(themeHex, 0.1)},
      0 30px 80px ${withAlpha(themeHex, 0.18)}
    `,
  };

  const buttonStyle = {
    borderColor: canPlay
      ? withAlpha("#ffffff", 0.18)
      : withAlpha("#ffffff", 0.08),

    background: canPlay
      ? `linear-gradient(
          180deg,
          ${withAlpha(themeHex, 0.3)},
          ${withAlpha(themeHex, 0.14)}
        )`
      : withAlpha("#ffffff", 0.04),

    color: canPlay ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.42)",

    boxShadow: canPlay ? `0 14px 40px ${withAlpha(themeHex, 0.22)}` : "none",
  };

  return (
    <section
      className="
        relative
        w-full
        max-w-[760px]
        min-h-[520px]
        rounded-[28px]
        p-1
        md:p-6
        xl:p-3
        flex
        flex-col
        justify-between
      "
      style={cardStyle}>
      {/* Glow top */}
      <div
        className="pointer-events-none absolute left-6 right-6 top-4 h-10 rounded-full blur-md"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${withAlpha("#ffffff", 0.1)},
            transparent
          )`,
        }}
      />

      {/* Glow bottom */}
      <div
        className="pointer-events-none absolute bottom-4 left-6 right-6 h-1 rounded-full blur-lg"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${withAlpha(themeHex, 0.14)},
            transparent
          )`,
        }}
      />

      {/* Layout vertical correcto */}
      <div className="relative flex h-full flex-col">
        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <header className="shrink-0">
          <Text
            variant="eyebrow"
            tone="soft"
            width="full"
            className="text-xs uppercase tracking-wide">
            {formatType(activity.type)}
          </Text>

          <Heading
            as="h2"
            variant="h2"
            tone="primary"
            width="full"
            className="mt-2 text-xl leading-tight md:text-3xl">
            {displayData.title}
          </Heading>
        </header>

        {/* ================================================= */}
        {/* Stats */}
        {/* ================================================= */}

        <section className="mt-5 shrink-0 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatItem label="Estado" value={formatStatus(activity.status)} />

          <StatItem label="Intentos" value={activity.attemptsCount ?? 0} />

          <StatItem label="Mejor score" value={activity.bestScore ?? "-"} />
        </section>

        {/* ================================================= */}
        {/* Expandable Body */}
        {/* ================================================= */}

        <section
          className="
            mt-2
            flex-1
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            p-1
            md:p-3
          ">
          <Text
            variant="label"
            tone="primary"
            width="full"
            className="mb-3 text-sm font-medium">
            Aprenderás
          </Text>

          {displayData.learn.length ? (
            <ul className="ml-5 list-disc space-y-1 text-sm text-white/80">
              {displayData.learn.map((item, index) => (
                <li key={index}>
                  <Text
                    as="span"
                    variant="caption"
                    tone="muted"
                    width="full"
                    className="text-sm leading-relaxed">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          ) : (
            <Text variant="bodySm" tone="soft" width="full">
              Aún no hay contenido definido para esta actividad.
            </Text>
          )}

          {displayData.outcome && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <Text
                variant="caption"
                tone="muted"
                width="full"
                className="text-sm">
                Resultado esperado:
              </Text>

              <Text
                variant="bodySm"
                tone="primary"
                width="full"
                className="mt-1 font-medium text-white">
                {displayData.outcome}
              </Text>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* Footer pegado abajo */}
        {/* ================================================= */}

        <footer
          className="
            mt-6
            shrink-0
            flex
            flex-col
            gap-4
            xl:flex-row
            xl:items-center
            xl:justify-between
          ">
          <Text
            variant="helper"
            tone="soft"
            width="full"
            className="text-sm leading-relaxed xl:flex-1">
            {getHelperText(activity)}
          </Text>

          <button
            type="button"
            disabled={!canPlay}
            onClick={onPlay}
            title={canPlay ? "Iniciar actividad" : "Actividad bloqueada"}
            className={[
              "w-full xl:w-auto",
              "rounded-2xl border px-6 py-3",
              "text-sm font-semibold",
              "transition-all duration-200",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-white/50",
              canPlay
                ? "cursor-pointer hover:-translate-y-0.5 hover:brightness-110"
                : "cursor-not-allowed",
            ].join(" ")}
            style={buttonStyle}>
            {ctaLabel}
          </button>
        </footer>
      </div>
    </section>
  );
}
