import { useMemo } from "react";

const SETTINGS_BUTTON_CLASS =
  "group relative grid cursor-pointer place-items-center focus-visible:outline-none active:scale-[0.97]";

function hexToRgb(hex) {
  const h = String(hex || "#000")
    .replace("#", "")
    .trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export default function HeaderSettingsButton({
  onClick,
  iconSrc,
  title = "Configuración",
  className = "",
}) {
  // ── Capas de ring exterior (igual que XpPanel)
  const ringShadow = [
    `0 0 0 1px #c9a227`,
    `0 0 0 4px #7a5510`,
    `0 0 0 5px #c9a227`,
    `inset 0 1px 0 ${withAlpha("#fff8b4", 0.4)}`,
    `0 8px 24px ${withAlpha("#000", 0.4)}`,
  ].join(", ");

  const ringShadowHover = [
    `0 0 0 1px #c9a227`,
    `0 0 0 4px #7a5510`,
    `0 0 0 6px #e8c840`,
    `inset 0 1px 0 ${withAlpha("#fff8b4", 0.4)}`,
    `0 8px 28px ${withAlpha("#000", 0.5)}`,
  ].join(", ");

  const buttonStyle = useMemo(
    () => ({
      width: 56,
      height: 56,
      borderRadius: 14,
      border: "0.5 px solid #a07820",
      background: "greenearl",
      boxShadow: ringShadow,
      padding: 0,
      transition: "transform 220ms ease, box-shadow 220ms ease",
      overflow: "hidden",
    }),
    [],
  );

  // ── Glare superior (igual que XpPanel)
  const glareStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    borderRadius: "14px 14px 0 0",
    pointerEvents: "none",
  };

  // ── Inner frame
  const innerFrameStyle = {
    position: "absolute",
    inset: 3,
    border: "0.5px solid rgba(200,160,40,0.35)",
    borderRadius: 10,
    pointerEvents: "none",
  };

  // ── Badge circular (igual al del icono en XpPanel)
  const badgeStyle = {};

  return (
    <>
      <button
        onClick={onClick}
        type="button"
        title={title}
        label={title}
        className={`${SETTINGS_BUTTON_CLASS} ${className}`}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = ringShadowHover;
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = ringShadow;
          e.currentTarget.style.transform = "scale(1)";
        }}>
        {/* Inner frame */}
        <span style={innerFrameStyle} />

        {/* Glare */}
        <span style={glareStyle} />

        {/* Badge + icono */}
        <span
          style={badgeStyle}
          className="group-hover:[transform:scale(1.08)_rotate(-4deg)] group-active:[transform:scale(0.96)]">
          <img
            src={iconSrc}
            alt=""
            draggable={false}
            style={{
              width: 30,
              height: 30,
              objectFit: "contain",
              filter: "drop-shadow(0 1px 0 rgba(255,240,100,0.5))",
              color: "#3b2200",
            }}
          />
        </span>
      </button>
    </>
  );
}
