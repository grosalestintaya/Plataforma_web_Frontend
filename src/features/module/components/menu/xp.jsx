import React, { useEffect, useRef, useState } from "react";
import XpQuipuIcon from "@/shared/icons/XpQuipuIcon";

function formatInt(value) {
  return new Intl.NumberFormat("es-PE").format(Number(value || 0));
}

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

export default function XpPanel({
  monedas = 0,
  themeHex = "#00C853",
  className = "",
}) {
  const targetValue = Number(monedas || 0);
  const isMobile = useIsMobile(481);

  const [displayValue, setDisplayValue] = useState(0);
  const [delta, setDelta] = useState(null);
  const [pulse, setPulse] = useState(false);

  const prevTargetRef = useRef(0);
  const frameRef = useRef(null);
  const deltaTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);

  useEffect(() => {
    const from = Number(prevTargetRef.current || 0);
    const to = targetValue;

    if (from !== to) {
      setDelta(to - from);
      setPulse(true);
      clearTimeout(deltaTimerRef.current);
      clearTimeout(pulseTimerRef.current);
      deltaTimerRef.current = setTimeout(() => setDelta(null), 1000);
      pulseTimerRef.current = setTimeout(() => setPulse(false), 650);
    }

    cancelAnimationFrame(frameRef.current);

    const duration = from === 0 ? 950 : 700;
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setDisplayValue(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
        prevTargetRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetValue]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(deltaTimerRef.current);
      clearTimeout(pulseTimerRef.current);
    },
    [],
  );

  const hasDelta = delta !== null && delta !== 0;
  const isPositive = Number(delta) > 0;

  // ─── Tokens responsivos ───────────────────────────────────────────────────
  const padding = isMobile ? "7px 8px 2px 8px" : "10px 16px 10px 10px";
  const minWidth = isMobile ? 60 : 140;
  const gap = isMobile ? 4 : 10;
  const badgeSize = isMobile ? 26 : 36;
  const iconSize = isMobile ? 40 : 55;
  const iconWrapW = isMobile ? 32 : 44;
  const iconWrapH = isMobile ? 12 : 16;
  const labelFontSize = isMobile ? 7 : 8;
  const valueFontSize = isMobile ? 20 : 26;
  const deltaFontSize = isMobile ? 9 : 10;
  const borderRadius = isMobile ? 11 : 14;
  const innerRadius = isMobile ? 8 : 10;
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        className={className}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius,
          border: "1.5px solid #a07820",
          background: "linear-gradient(160deg, #f5e9c8, #e2c96a 60%, #c9a227)",
          boxShadow: pulse
            ? "0 0 0 1px #c9a227, 0 0 0 4px #7a5510, 0 0 0 6px #e8c840, inset 0 1px 0 rgba(255,240,150,0.4), 0 8px 24px rgba(0,0,0,0.5)"
            : "0 0 0 1px #c9a227, 0 0 0 4px #7a5510, 0 0 0 5px #c9a227, inset 0 1px 0 rgba(255,240,150,0.4), 0 8px 24px rgba(0,0,0,0.4)",
          padding,
          minWidth,
          display: "flex",
          alignItems: "center",
          gap,
          transform: pulse ? "scale(1.02)" : "scale(1)",
          transition: "transform 220ms ease, box-shadow 220ms ease",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}>
        {/* Inner frame line */}
        <div
          style={{
            position: "absolute",
            inset: 3,
            border: "0.5px solid rgba(200,160,40,0.35)",
            borderRadius: innerRadius,
            pointerEvents: "none",
          }}
        />

        {/* Top glare */}
        <div
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

        {/* Delta float */}
        {hasDelta && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 8,
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: deltaFontSize,
              fontWeight: 600,
              color: isPositive ? "#3b6d11" : "#993c1d",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              animation: "xpFloat 1000ms ease-out forwards",
              pointerEvents: "none",
            }}>
            {isPositive ? "+" : "-"}
            {formatInt(Math.abs(delta))}
          </span>
        )}

        {/* XP icon */}
        <div
          style={{
            position: "relative",
            width: iconWrapW,
            height: iconWrapH,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: pulse
              ? "drop-shadow(0 0 10px rgba(201,162,39,0.7)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
              : "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            transform: pulse ? "scale(1.08) rotate(-4deg)" : "scale(1)",
            transition: "filter 220ms ease, transform 220ms ease",
          }}>
          {/* circular badge background */}
          <div
            style={{
              width: badgeSize,
              height: badgeSize,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #ffe566, #c9a227 55%, #7a5510)",
              boxShadow:
                "0 0 0 1px #e8c840, inset 0 2px 4px rgba(255,240,100,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <XpQuipuIcon
              style={{
                width: iconSize,
                height: iconSize,
                color: "",
                filter: "drop-shadow(0 1px 0 rgba(255,240,100,0.5))",
              }}
            />
          </div>
        </div>

        {/* Label + value */}
        <div style={{ minWidth: 0, position: "relative" }}>
          <div
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: labelFontSize,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#7a5c14",
              marginBottom: 1,
            }}>
            XP
          </div>

          <div
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: valueFontSize,
              fontWeight: 700,
              color: "#1e0e00",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textShadow:
                "0 2px 0 rgba(200,160,40,0.3), 0 1px 0 rgba(255,240,100,0.5)",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
            {formatInt(displayValue)}
          </div>
        </div>

        <style>{`
          @keyframes xpFloat {
            0%   { transform: translateY(10px) scale(0.94); opacity: 0; }
            18%  { transform: translateY(0)    scale(1);    opacity: 1; }
            100% { transform: translateY(-16px) scale(1.03); opacity: 0; }
          }
        `}</style>
      </div>
    </>
  );
}
