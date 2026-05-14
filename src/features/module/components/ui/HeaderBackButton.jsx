import { useEffect, useState } from "react";

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
function withAlpha(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const RING_SHADOW = [
  "0 0 0 1px #c9a227",
  "0 0 0 4px #7a5510",
  "0 0 0 5px #c9a227",
  `inset 0 1px 0 ${withAlpha("#fff8b4", 0.4)}`,
  `0 10px 28px ${withAlpha("#000", 0.4)}`,
].join(", ");

const RING_SHADOW_HOVER = [
  "0 0 0 1px #c9a227",
  "0 0 0 4px #7a5510",
  "0 0 0 6px #e8c840",
  `inset 0 1px 0 ${withAlpha("#fff8b4", 0.4)}`,
  `0 12px 32px ${withAlpha("#000", 0.5)}`,
].join(", ");

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
      mq.addListener(handler); // fallback Safari antiguo
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

export default function HeaderBackButton({
  onClick,
  label = "Volver",
  className = "",
}) {
  const isMobile = useIsMobile(481);

  // ─── Tokens responsivos ───────────────────────────────────────────────────
  const height = isMobile ? 42 : 52;
  // En móvil solo hay el badge, centramos con padding simétrico
  const paddingInline = isMobile ? "8px" : "14px 20px";
  const borderRadius = isMobile ? 11 : 14;
  const innerRadius = isMobile ? 8 : 10;
  const gap = isMobile ? 8 : 12;
  const badgeSize = isMobile ? 26 : 34;
  const labelFontSize = isMobile ? 12 : 14;
  const arrowBoxSize = isMobile ? 11 : 14;
  const arrowBarW = isMobile ? 7 : 9;
  const arrowBarH = isMobile ? 1.8 : 2.2;
  const arrowBarLeft = isMobile ? 2 : 3;
  const arrowChevronW = isMobile ? 5 : 7;
  const arrowChevronH = isMobile ? 5 : 7;
  const arrowBorder = isMobile ? "1.8px" : "2.2px";
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <button
        onClick={onClick}
        type="button"
        title={label}
        aria-label={label}
        className={`group relative overflow-hidden cursor-pointer focus-visible:outline-none active:scale-[0.97] ${className}`}
        style={{
          height,
          paddingInline,
          borderRadius,
          border: "1.5px solid #a07820",
          background: "linear-gradient(160deg, #f5e9c8, #e2c96a 60%, #c9a227)",
          boxShadow: RING_SHADOW,
          display: "flex",
          alignItems: "center",
          gap,
          transition: "transform 220ms ease, box-shadow 220ms ease",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = RING_SHADOW_HOVER;
          e.currentTarget.style.transform = "scale(1.02) translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = RING_SHADOW;
          e.currentTarget.style.transform = "scale(1)";
        }}>
        {/* Inner frame line */}
        <span
          style={{
            position: "absolute",
            inset: 3,
            border: "0.5px solid rgba(200,160,40,0.35)",
            borderRadius: innerRadius,
            pointerEvents: "none",
          }}
        />

        {/* Top glare */}
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(180deg, rgba(255,248,180,0.28), transparent)",
            borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
            pointerEvents: "none",
          }}
        />

        {/* Badge circular con flecha */}
        <span
          className="group-hover:[transform:scale(1.08)_translateX(-2px)]"
          style={{
            position: "relative",
            flexShrink: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #ffe566, #c9a227 55%, #7a5510)",
            border: "2px solid #7a5510",
            boxShadow:
              "0 0 0 1px #e8c840, inset 0 2px 4px rgba(255,240,100,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 220ms ease",
          }}>
          {/* Flecha ← */}
          <span
            style={{
              position: "relative",
              display: "block",
              width: arrowBoxSize,
              height: arrowBoxSize,
            }}>
            <span
              style={{
                position: "absolute",
                left: arrowBarLeft,
                top: "50%",
                height: arrowBarH,
                width: arrowBarW,
                transform: "translateY(-50%)",
                borderRadius: 9999,
                background: "#3b2200",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                width: arrowChevronW,
                height: arrowChevronH,
                transform: "translateY(-50%) rotate(45deg)",
                borderRadius: 1,
                borderBottom: `${arrowBorder} solid #3b2200`,
                borderLeft: `${arrowBorder} solid #3b2200`,
                color: "#1e0e00",
              }}
            />
          </span>
        </span>

        {/* Label — oculto en móvil */}
        {!isMobile && (
          <span
            style={{
              position: "relative",
              zIndex: 10,
              fontSize: labelFontSize,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#1e0e00",
              textShadow:
                "0 2px 0 rgba(200,160,40,0.3), 0 1px 0 rgba(255,240,100,0.5)",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}>
            {label}
          </span>
        )}
      </button>
    </>
  );
}
