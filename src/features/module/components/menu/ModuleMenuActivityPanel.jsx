import React, { useMemo } from "react";

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
          .map((c) => c + c)
          .join("")
      : normalized.padEnd(6, "0");
  const parsed = parseInt(fullHex, 16);
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
}

function withAlpha(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
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
      return "Puedes repetir esta misión para mejorar tu puntuación.";
    case "locked":
      return "Completa la misión anterior para desbloquear esta sección.";
    default:
      return "Cuando estés listo, puedes comenzar la misión.";
  }
}

const STATUS_BADGE_COLORS = {
  completed: { color: "#3b6d11", bg: "rgba(59,109,17,0.14)" },
  locked: { color: "#993c1d", bg: "rgba(153,60,29,0.12)" },
  available: { color: "#185fa5", bg: "rgba(24,95,165,0.12)" },
  in_progress: { color: "#ba7517", bg: "rgba(186,117,23,0.12)" },
};

/**
 * =========================================================
 * Sub-components
 * =========================================================
 */

function CornerOrnament({ style }) {
  return (
    <svg
      style={{
        position: "absolute",
        width: 44,
        height: 44,
        pointerEvents: "none",
        zIndex: 2,
        ...style,
      }}
      viewBox="0 0 44 44"
      fill="none">
      <path
        d="M3 41 L3 9 Q3 3 9 3 L41 3"
        stroke="#c9a227"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M6 38 L6 12 Q6 6 12 6 L38 6"
        stroke="#c9a227"
        strokeWidth="0.8"
        fill="none"
        opacity="0.45"
      />
      <circle cx="3" cy="3" r="3.5" fill="#c9a227" />
      <path d="M9 3 Q16 16 3 9" fill="rgba(201,162,39,0.28)" />
    </svg>
  );
}

function GoldDivider({ gem = "star" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "1rem 0",
        color: "#8b6914",
      }}>
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #c9a227 40%, #c9a227 60%, transparent)",
        }}
      />
      {gem === "star" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1 L8.2 5.2 L13 5.2 L9.4 7.8 L10.6 12 L7 9.4 L3.4 12 L4.6 7.8 L1 5.2 L5.8 5.2 Z"
            fill="#c9a227"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect
            x="1"
            y="1"
            width="8"
            height="8"
            rx="1"
            stroke="#c9a227"
            strokeWidth="1.2"
            fill="rgba(201,162,39,0.18)"
          />
          <rect x="3.5" y="3.5" width="3" height="3" fill="#c9a227" />
        </svg>
      )}
      <div
        style={{
          flex: 1,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, #c9a227 40%, #c9a227 60%, transparent)",
        }}
      />
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg, rgba(120,80,10,0.14), rgba(180,130,40,0.07))",
        border: "1.5px solid #a07820",
        borderRadius: 3,
        padding: "8px 10px",
        textAlign: "center",
      }}>
      <div
        style={{
          position: "absolute",
          inset: 2,
          border: "0.5px solid rgba(200,160,40,0.28)",
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          display: "block",
          fontSize: 9,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#7a5c14",
          marginBottom: 2,
        }}>
        {label}
      </span>
      <span
        style={{
          display: "block",
          fontSize: 15,
          fontWeight: 600,
          color: "#1e0e00",
        }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = STATUS_BADGE_COLORS[status] || STATUS_BADGE_COLORS.available;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 9,
        letterSpacing: "0.12em",
        padding: "3px 10px",
        borderRadius: 2,
        border: `1px solid ${colors.color}`,
        color: colors.color,
        background: colors.bg,
        marginTop: 5,
      }}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: colors.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {formatStatus(status)}
    </span>
  );
}

/**
 * =========================================================
 * Empty State
 * =========================================================
 */

function EmptyState() {
  return (
    <div
      style={{
        position: "relative",
        maxWidth: 60,
        minHeight: 620,
        borderRadius: 6,
        border: "3px solid #8b6914",
        background:
          "linear-gradient(160deg, #f0dfa8 0%, #e8cf88 30%, #f2e0a5 60%, #dfc87a 100%)",
        boxShadow:
          "0 0 0 1px #c9a227, 0 0 0 5px #7a5510, 0 0 0 7px #c9a227, inset 0 2px 8px rgba(100,60,0,0.18), 8px 12px 32px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}>
      <CornerOrnament style={{ top: -4, left: -4 }} />
      <CornerOrnament style={{ top: -4, right: -4, transform: "scaleX(-1)" }} />
      <CornerOrnament
        style={{ bottom: -4, left: -4, transform: "scaleY(-1)" }}
      />
      <CornerOrnament
        style={{ bottom: -4, right: -4, transform: "scale(-1)" }}
      />
      <p
        style={{
          fontStyle: "italic",
          fontSize: 15,
          color: "#6b4c0e",
          textAlign: "center",
        }}>
        Selecciona una actividad para ver su detalle.
      </p>
    </div>
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
  ctaLabel = "Iniciar misión",
  onPlay,
}) {
  if (!activity) return <EmptyState />;

  const displayData = useMemo(
    () => ({
      title:
        activityContent?.title || activity?.title || "Actividad sin título",
      learn: activityContent?.learn || [],
      outcome: activityContent?.outcome || "",
    }),
    [activity, activityContent],
  );

  /* ---- Styles ---- */

  const parchmentStyle = {
    position: "relative",
    maxWidth: 960,
    maxHeight: 490,

    borderRadius: 6,
    border: "3px solid #8b6914",
    background:
      "radial-gradient(ellipse at 20% 10%, #f5e9c8 0%, transparent 55%)," +
      "radial-gradient(ellipse at 80% 90%, #e8d5a0 0%, transparent 55%)," +
      "linear-gradient(160deg, #f0dfa8 0%, #e8cf88 30%, #f2e0a5 60%, #dfc87a 100%)",
    boxShadow:
      "0 0 0 1px #c9a227," +
      "0 0 0 5px #7a5510," +
      "0 0 0 7px #c9a227," +
      "inset 0 2px 8px rgba(100,60,0,0.18)," +
      "inset 0 -2px 8px rgba(100,60,0,0.12)," +
      "8px 12px 36px rgba(0,0,0,0.45)",
    padding: "1.25rem 2rem 1.25rem",
    display: "flex",
    flexDirection: "column",
  };

  const sectionBoxStyle = {
    position: "relative",
    background:
      "linear-gradient(135deg, rgba(100,60,0,0.07), rgba(180,130,40,0.05))",
    border: "1.5px solid #a07820",
    borderRadius: 3,
    padding: "1rem 1.25rem",
    flex: 1,
  };

  const ctaActiveStyle = {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.1em",
    padding: "10px 28px",
    borderRadius: 3,
    cursor: "pointer",
    background:
      "linear-gradient(160deg, #d4a017 0%, #a07010 50%, #c49418 100%)",
    border: "2px solid #7a5510",
    color: "#fff8e0",
    boxShadow:
      "0 0 0 1px #e8c840," +
      "inset 0 1px 0 rgba(255,240,150,0.35)," +
      "inset 0 -1px 0 rgba(0,0,0,0.25)," +
      "2px 4px 10px rgba(0,0,0,0.4)",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
    transition: "transform 0.15s, filter 0.15s",
    whiteSpace: "nowrap",
  };

  const ctaLockedStyle = {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.1em",
    padding: "10px 28px",
    borderRadius: 3,
    cursor: "not-allowed",
    background: "linear-gradient(160deg, #c8b88a, #a89060)",
    border: "2px solid #7a6840",
    color: "rgba(30,10,0,0.38)",
    whiteSpace: "nowrap",
  };

  return (
    /* Google Fonts import via link — place in your index.html for production */
    <>
      <section style={parchmentStyle}>
        {/* Corner ornaments */}
        <CornerOrnament style={{ top: -4, left: -4 }} />
        <CornerOrnament
          style={{ top: -4, right: -4, transform: "scaleX(-1)" }}
        />
        <CornerOrnament
          style={{ bottom: -4, left: -4, transform: "scaleY(-1)" }}
        />
        <CornerOrnament
          style={{ bottom: -4, right: -4, transform: "scale(-1)" }}
        />

        {/* ── Header ── */}
        <header>
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#6b4c0e",
              margin: "0 0 4px",
            }}>
            {formatType(activity.type)}
          </p>

          <h2
            style={{
              fontSize: "clamp(18px, 4vw, 28px)",
              fontWeight: 700,
              color: "#1e0e00",
              lineHeight: 1.2,
              textShadow: "1px 1px 0 rgba(200,160,40,0.4)",
              margin: "0 0 6px",
            }}>
            {displayData.title}
          </h2>
        </header>

        {/* ── Stats ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 4,
          }}>
          <StatItem label="Estado" value={formatStatus(activity.status)} />
          <StatItem label="Intentos" value={activity.attemptsCount ?? 0} />
          <StatItem label="Mejor Score" value={activity.bestScore ?? "—"} />
        </section>

        <GoldDivider gem="square" />

        {/* ── Learn section ── */}
        <section style={sectionBoxStyle}>
          {/* Inner frame */}
          <div
            style={{
              position: "absolute",
              inset: 3,
              border: "0.5px solid rgba(200,160,40,0.25)",
              borderRadius: 1,
              pointerEvents: "none",
            }}
          />

          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#7a5c14",
              margin: "0 0 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1L7.5 4.5L11 5L8.5 7.5L9.2 11L6 9.2L2.8 11L3.5 7.5L1 5L4.5 4.5Z"
                fill="#c9a227"
              />
            </svg>
            Aprenderás
          </p>

          {displayData.learn.length > 0 ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}>
              {displayData.learn.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    fontSize: 15,
                    color: "#2a1a06",
                    lineHeight: 1.5,
                  }}>
                  <span
                    style={{
                      color: "#c9a227",
                      fontSize: 12,
                      marginTop: 3,
                      flexShrink: 0,
                    }}>
                    ✦
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p
              style={{
                fontStyle: "italic",
                fontSize: 14,
                color: "#7a5c14",
                margin: 0,
              }}>
              Aún no hay contenido definido para esta actividad.
            </p>
          )}

          {displayData.outcome && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid rgba(160,120,32,0.35)",
              }}>
              <span
                style={{
                  display: "block",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#7a5c14",
                  marginBottom: 4,
                }}>
                Resultado esperado
              </span>
              <p
                style={{
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "#2a1a06",
                  margin: 0,
                }}>
                {displayData.outcome}
              </p>
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <div style={{ marginTop: "1.25rem" }}>
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}>
            <p
              style={{
                fontStyle: "italic",
                fontSize: 13.5,
                color: "#6b4c0e",
                margin: 0,
                flex: 1,
                minWidth: 160,
              }}>
              {getHelperText(activity)}
            </p>

            <button
              type="button"
              disabled={!canPlay}
              onClick={onPlay}
              title={canPlay ? "Iniciar actividad" : "Actividad bloqueada"}
              style={canPlay ? ctaActiveStyle : ctaLockedStyle}
              onMouseEnter={(e) => {
                if (canPlay) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.filter = "brightness(1.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (canPlay) {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.filter = "";
                }
              }}
              onMouseDown={(e) => {
                if (canPlay)
                  e.currentTarget.style.transform = "translateY(1px)";
              }}
              onMouseUp={(e) => {
                if (canPlay)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}>
              {activity.status === "locked" ? "🔒 " : " "}
              {ctaLabel}
            </button>
          </footer>
        </div>
      </section>
    </>
  );
}
