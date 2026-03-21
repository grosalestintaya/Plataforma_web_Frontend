import React, { useEffect, useRef, useState } from "react";
import coin from "@/assets/dashboard/coin.png";

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

export default function CoinsPanel({
  monedas = 0,
  themeHex = "#00C853",
  className = "",
}) {
  const targetValue = Number(monedas || 0);

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
      const diff = to - from;
      setDelta(diff);
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

      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);

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

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(deltaTimerRef.current);
      clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const hasDelta = delta !== null && delta !== 0;
  const isPositive = Number(delta) > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] px-0 py-0 ${className}`}
      style={{
        minWidth: 100,
        background: `linear-gradient(
          180deg,
          ${withAlpha("#ffffff", 0.1)} 0%,
          ${withAlpha(themeHex, 0.1)} 40%,
          ${withAlpha("#000000", 0.22)} 100%
        )`,
        boxShadow: `
          0 12px 26px ${withAlpha("#000000", 0.24)},
          inset 0 1px 0 ${withAlpha("#ffffff", 0.16)},
          inset 0 -2px 0 ${withAlpha("#000000", 0.12)},
          0 0 0 1px ${withAlpha("#ffffff", 0.1)},
          0 0 0 4px ${withAlpha(themeHex, pulse ? 0.16 : 0.07)}
        `,
        backdropFilter: "blur(10px)",
        transform: pulse ? "scale(1.02)" : "scale(1)",
        transition: "transform 220ms ease, box-shadow 220ms ease",
      }}>
      <div
        className="pointer-events-none absolute -left-1 -top-6 h-16 w-20 rotate-[-16deg] rounded-full"
        style={{
          background: `linear-gradient(180deg, ${withAlpha(
            "#ffffff",
            0.14,
          )}, ${withAlpha("#ffffff", 0.02)})`,
          filter: "blur(8px)",
        }}
      />

      {hasDelta && (
        <span
          className="pointer-events-none absolute right-3 top-2 text-[11px] font-extrabold tabular-nums"
          style={{
            color: isPositive ? "#FDE68A" : "#FCA5A5",
            animation: "coinFloat 1000ms ease-out forwards",
            textShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}>
          {isPositive ? "+" : "-"}
          {formatInt(Math.abs(delta))}
        </span>
      )}

      <div className="relative flex items-center gap-3">
        <div
          className="relative flex h-12 w-12 shrink-0 items-center justify-center"
          style={{
            filter: pulse
              ? "drop-shadow(0 0 12px rgba(255, 215, 64, 0.45)) drop-shadow(0 8px 12px rgba(0,0,0,0.22))"
              : "drop-shadow(0 6px 10px rgba(0,0,0,0.22))",
            transition: "filter 220ms ease, transform 220ms ease",
            transform: pulse ? "scale(1.08) rotate(-4deg)" : "scale(1)",
          }}>
          <img
            src={coin}
            alt="Monedas"
            draggable={false}
            className={`h-11 w-11 object-contain ${
              pulse ? "animate-[coinBob_420ms_ease]" : ""
            }`}
          />
        </div>

        <div className="min-w-0 leading-tight">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            Intis
          </div>

          <div
            className="tabular-nums text-[24px] font-black leading-none"
            style={{
              color: "#ffffff",
              textShadow: `
                0 2px 0 ${withAlpha("#000000", 0.16)},
                0 4px 12px ${withAlpha("#000000", 0.28)}
              `,
              letterSpacing: "-0.03em",
            }}>
            {formatInt(displayValue)}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes coinFloat {
            0% {
              transform: translateY(10px) scale(0.94);
              opacity: 0;
            }
            18% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(-16px) scale(1.03);
              opacity: 0;
            }
          }

          @keyframes coinBob {
            0% { transform: scale(1) rotate(0deg); }
            35% { transform: scale(1.08) rotate(-5deg); }
            70% { transform: scale(0.97) rotate(3deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}
      </style>
    </div>
  );
}
