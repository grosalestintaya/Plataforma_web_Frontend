import React, { useEffect, useMemo, useRef, useState } from "react";
import { resolveAvatar, getInitials } from "../helpers/helpers";
import coin from "@/assets/dashboard/coin.png";
const clamp = (n, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Number(n) || 0));

function formatInt(n) {
  try {
    return new Intl.NumberFormat("es-PE").format(n);
  } catch {
    return String(n);
  }
}

/**
 * Count-up suave y rápido (recomendado 400–900ms).
 * Si lo dejas en 9s se siente lento y “buggy”.
 */
function useCountUp(value, { duration = 650 } = {}) {
  const [display, setDisplay] = useState(() => Number(value) || 0);

  const rafRef = useRef(null);
  const startRef = useRef(0);
  const fromRef = useRef(display);
  const toRef = useRef(Number(value) || 0);

  useEffect(() => {
    const to = Number(value) || 0;
    const from = display;
    if (to === from) return;

    fromRef.current = from;
    toRef.current = to;
    startRef.current = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = Math.round(
        fromRef.current + (toRef.current - fromRef.current) * eased,
      );
      setDisplay(next);

      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}

const UserCard = ({ user }) => {
  const progreso = clamp(user?.progreso);

  // Count-up (rápido y satisfactorio)
  const animatedCoins = useCountUp(user?.monedas ?? 0, { duration: 650 });

  // Pulse + glow + +X floating
  const prevCoinsRef = useRef(Number(user?.monedas) || 0);
  const [coinPulse, setCoinPulse] = useState(false);
  const [coinGlow, setCoinGlow] = useState(false);
  const [coinDelta, setCoinDelta] = useState(null); // number | null

  useEffect(() => {
    const current = Number(user?.monedas) || 0;
    const prev = prevCoinsRef.current;

    if (current > prev) {
      const delta = current - prev;

      setCoinDelta(delta);
      setCoinPulse(true);
      setCoinGlow(true);

      const t1 = setTimeout(() => setCoinPulse(false), 220);
      const t2 = setTimeout(() => setCoinGlow(false), 650);
      const t3 = setTimeout(() => setCoinDelta(null), 900);

      prevCoinsRef.current = current;

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    prevCoinsRef.current = current;
  }, [user?.monedas]);

  const coinPanelClass = useMemo(() => {
    return `rounded-2xl w-[300px] py-1 pl-6 shadow-md flex items-center justify-left gap-3 ml-auto
            relative overflow-hidden transition-transform duration-200
            ${coinPulse ? "scale-[1.03]" : "scale-100"}`;
  }, [coinPulse]);

  return (
    <div
      className="rounded-2xl shadow-md p-2 flex items-center w-full h-[130px] border"
      style={{
        backgroundColor: "var(--usercard-bg)",
        borderColor: "var(--usercard-border)",
      }}>
      {/* Izquierda: Perfil + Info */}
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={resolveAvatar(user.foto)}
          alt={`Perfil de ${user.nombre || "usuario"}`}
          className="w-24 h-24 object-cover rounded-2xl border"
          style={{ borderColor: "var(--usercard-border)" }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = resolveAvatar("default");
          }}
        />

        <div className="flex flex-col justify-center min-w-0">
          <h2
            className="text-xl font-bold truncate"
            style={{ color: "var(--card-text)" }}
            title={user.nombre}>
            {user.nombre}
          </h2>

          <p className="text-sm mt-1" style={{ color: "var(--card-muted)" }}>
            Nivel: {user.nivel} — {user.puntos} pts acumulados
          </p>

          {/* Barra de progreso */}
          <div
            className="w-[420px] rounded-full h-3 mt-2 overflow-hidden"
            style={{ backgroundColor: "var(--progress-track)" }}>
            <div
              className="h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progreso}%`,
                backgroundColor: "var(--usercard-accent)",
              }}
            />
          </div>

          {/* Chips */}
          <div className="flex gap-3 mt-3">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-xl shadow-sm border"
              style={{
                backgroundColor: "var(--chip-bg)",
                borderColor: "var(--card-border)",
                color: "var(--chip-text)",
              }}>
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: "var(--usercard-accent-2)" }}
              />
              <span className="text-sm truncate max-w-[220px]">
                {user.institucion}
              </span>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1 rounded-xl shadow-sm border"
              style={{
                backgroundColor: "var(--chip-bg)",
                borderColor: "var(--card-border)",
                color: "var(--chip-text)",
              }}>
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: "var(--usercard-accent)" }}
              />
              <span className="text-sm truncate max-w-[140px]">
                {user.seccion}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Derecha: Monedas (count-up + pulse + glow + +X) */}
      <div
        className={coinPanelClass}
        style={{
          backgroundColor: "var(--coin-panel-bg)",
          color: "var(--coin-panel-text)", // debe ser blanco (define en CSS)
          boxShadow: coinGlow
            ? "0 10px 30px rgba(0,0,0,0.18), 0 0 0 4px var(--sidebar-accent)"
            : "0 10px 30px rgba(0,0,0,0.10)",
        }}>
        {/* +X flotante */}
        {coinDelta !== null && (
          <span
            className="absolute top-3 right-4 text-sm font-semibold pointer-events-none"
            style={{
              color: "var(--coin-panel-text)",
              opacity: 0.95,
              animation: "coinFloat 900ms ease-out forwards",
              textShadow: "0 2px 10px rgba(0,0,0,0.20)",
            }}>
            +{formatInt(coinDelta)}
          </span>
        )}

        <img src={coin} alt="Intis" className="w-26 h-26 object-contain" />

        {/* Valor (sin “Intis” grande; si quieres label pequeño, lo añadimos debajo) */}
        <span
          className="text-5xl font-bold leading-none tabular-nums"
          style={{
            color: "var(--coin-panel-text)",
            textShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}>
          {formatInt(animatedCoins)}
        </span>
        <br />

        {/* Keyframes inline */}
        <style>
          {`
            @keyframes coinFloat {
              0%   { transform: translateY(10px); opacity: 0; }
              15%  { transform: translateY(0);    opacity: 1; }
              100% { transform: translateY(-18px); opacity: 0; }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default UserCard;
