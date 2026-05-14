import { useEffect, useMemo, useState } from "react";

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

/** Hook que devuelve true cuando el ancho de ventana es menor al breakpoint dado */
function useIsMobile(breakpoint = 481) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else {
      mq.addListener(handler);
    }
    setIsMobile(mq.matches);
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handler);
      } else {
        mq.removeListener(handler);
      }
    };
  }, [breakpoint]);

  return isMobile;
}

export default function HeaderSettingsButton({
  onClick,
  iconSrc,
  title = "Configuración",
  className = "",
}) {
  const isMobile = useIsMobile(481);

  // ─── Tokens responsivos ───────────────────────────────────────────────────
  const size = isMobile ? 42 : 56;
  const borderRadius = isMobile ? 11 : 14;
  const innerRadius = isMobile ? 8 : 10;
  const iconSize = isMobile ? 22 : 30;
  // ─────────────────────────────────────────────────────────────────────────

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

  const buttonStyle = {
    width: size,
    height: size,
    borderRadius,
    // ✅ border corregido (era "0.5 px" con espacio y "greenearl" de background)
    border: "1.5px solid #a07820",
    background: "linear-gradient(160deg, #f5e9c8, #e2c96a 60%, #c9a227)",
    boxShadow: ringShadow,
    padding: 0,
    transition: "transform 220ms ease, box-shadow 220ms ease",
    overflow: "hidden",
  };

  const glareStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "linear-gradient(180deg, rgba(255,248,180,0.28), transparent)",
    borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
    pointerEvents: "none",
  };

  const innerFrameStyle = {
    position: "absolute",
    inset: 3,
    border: "0.5px solid rgba(200,160,40,0.35)",
    borderRadius: innerRadius,
    pointerEvents: "none",
  };

  return (
    <>
      <button
        onClick={onClick}
        type="button"
        title={title}
        aria-label={title}
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

        {/* Icono */}
        <span
          className="group-hover:[transform:scale(1.08)_rotate(-4deg)] group-active:[transform:scale(0.96)]"
          style={{
            transition: "transform 220ms ease",
            position: "relative",
            zIndex: 10,
          }}>
          <img
            src={iconSrc}
            alt=""
            draggable={false}
            style={{
              width: iconSize,
              height: iconSize,
              objectFit: "contain",
              filter:
                "drop-shadow(0 1px 0 rgba(255,240,100,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
            }}
          />
        </span>
      </button>
    </>
  );
}
