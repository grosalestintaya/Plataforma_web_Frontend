import { useMemo } from "react";

const SETTINGS_BUTTON_CLASS =
  "group relative grid h-11 w-11 cursor-pointer place-items-center rounded-2xl transition duration-300 hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97] sm:h-12 sm:w-12 md:h-14 md:w-14";
const SETTINGS_GLOSS_CLASS = "pointer-events-none absolute inset-1 rounded-2xl";
const SETTINGS_ICON_CLASS =
  "relative z-10 h-7 w-7 object-contain transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110 sm:h-8 sm:w-8 md:h-9 md:w-9";
const SETTINGS_HOVER_RING_CLASS =
  "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100";

function hexToRgba(hex, a = 1) {
  const h = String(hex || "#000").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");

  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Botón de configuración:
 * - Usa un tamaño más contenido para que el header no gane altura extra.
 * - Mantiene la misma jerarquía visual del dashboard.
 */
export default function HeaderSettingsButton({
  onClick,
  themeHex = "#7130F7",
  iconSrc,
  title = "Configuración",
  className = "",
}) {
  const buttonStyle = useMemo(
    () => ({
      background: `linear-gradient(180deg, ${hexToRgba(themeHex, 0.3)}, ${hexToRgba(themeHex, 0.14)})`,
      border: `1px solid ${hexToRgba("#ffffff", 0.18)}`,
      boxShadow: `
        0 8px 24px ${hexToRgba("#000000", 0.28)},
        0 0 18px ${hexToRgba(themeHex, 0.22)}
      `,
      backdropFilter: "blur(8px)",
    }),
    [themeHex],
  );

  const glossStyle = useMemo(
    () => ({
      background: `linear-gradient(180deg, ${hexToRgba("#ffffff", 0.14)}, ${hexToRgba("#ffffff", 0.03)})`,
    }),
    [],
  );

  const hoverRingStyle = useMemo(
    () => ({
      boxShadow: `inset 0 0 0 1px ${hexToRgba("#ffffff", 0.14)}`,
    }),
    [],
  );

  return (
    <button
      onClick={onClick}
      type="button"
      title={title}
      aria-label={title}
      className={`${SETTINGS_BUTTON_CLASS} ${className}`}
      style={buttonStyle}>
      <span
        className={SETTINGS_GLOSS_CLASS}
        style={glossStyle}
      />

      <img
        src={iconSrc}
        alt=""
        draggable={false}
        className={SETTINGS_ICON_CLASS}
      />

      <span
        className={SETTINGS_HOVER_RING_CLASS}
        style={hoverRingStyle}
      />
    </button>
  );
}
