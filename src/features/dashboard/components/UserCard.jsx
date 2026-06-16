import React, { useEffect, useRef, useState } from "react";
import { resolveAvatar } from "../helpers/helpers";
import coin from "@/assets/dashboard/coin.webp";
import XpQuipuIcon from "@/shared/icons/XpQuipuIcon";
import { Building2, Users, Sparkles } from "lucide-react";
const clamp = (n, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Number(n) || 0));

function formatInt(n) {
  try {
    return new Intl.NumberFormat("es-PE").format(n);
  } catch {
    return String(n);
  }
}

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
      const eased = 1 - Math.pow(1 - t, 3);
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

const CompactChip = ({ color, icon: Icon, children }) => (
  <div
    className="group relative flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border px-2.5 py-1.5"
    style={{
      background: `
        linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))
      `,
      borderColor: "rgba(255,255,255,0.14)",
      color: "#F8FAFC",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 12px rgba(0,0,0,0.10)",
    }}>
    <span
      className="absolute inset-y-0 left-0 w-[3px]"
      style={{
        background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 60%, white 40%))`,
        boxShadow: `0 0 12px ${color}`,
      }}
    />

    <span className="truncate text-xs font-semibold tracking-[0.01em]">
      {children}
    </span>
  </div>
);

const MetricPanel = ({
  color = "var(--coin-panel-bg)",
  textColor = "var(--coin-panel-text)",
  title,
  value,
  icon,
  delta = null,
  glow = false,
  pulse = false,
}) => {
  const panelClass = `
    relative overflow-hidden rounded-2xl transition-transform duration-200
    ${pulse ? "scale-[1.02]" : "scale-100"}
  `;

  return (
    <aside
      className={panelClass}
      style={{
        background: `
          linear-gradient(
            180deg,
            color-mix(in srgb, ${color} 88%, white 12%) 0%,
            color-mix(in srgb, ${color} 78%, black 22%) 100%
          )
        `,
        color: textColor,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: glow
          ? `0 10px 24px rgba(0,0,0,0.18), 0 0 0 2px color-mix(in srgb, ${color} 40%, white 60%), inset 0 1px 0 rgba(255,255,255,0.14)`
          : "0 8px 18px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 20% 18%, rgba(255,255,255,0.22), transparent 34%),
            linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.12) 48%, transparent 100%)
          `,
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{ background: "rgba(255,255,255,0.24)" }}
      />

      <div className="relative flex h-full items-center gap-3 px-3 py-3.4">
        <div className="relative flex h-18 w-18 shrink-0 items-center justify-center rounded-xl">
          <div className="absolute inset-[6px] rounded-[10px]" />
          <div className="relative z-[1]">{icon}</div>
        </div>

        <div className="min-w-0">
          <p
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{
              color: textColor,
              opacity: 0.82,
            }}>
            {title}
          </p>

          <div className="relative">
            <p
              className="text-2xl font-extrabold leading-none tabular-nums xl:text-3xl"
              style={{
                color: textColor,
                textShadow: "0 2px 10px rgba(0,0,0,0.20)",
              }}>
              {value}
            </p>

            {delta !== null && (
              <span
                className="pointer-events-none absolute -top-4 right-0 text-xs font-black"
                style={{
                  color: textColor,
                  opacity: 0.96,
                  textShadow: "0 2px 8px rgba(0,0,0,0.22)",
                  animation: "coinFloat 900ms ease-out forwards",
                }}>
                +{formatInt(delta)}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

const UserCard = ({ user, isFirst = false }) => {
  const progreso = clamp(user?.progreso);
  const animatedCoins = useCountUp(user?.monedas ?? 0, { duration: 650 });
  const animatedXp = useCountUp(user?.puntos ?? 0, { duration: 650 });

  const prevCoinsRef = useRef(Number(user?.monedas) || 0);
  const [coinPulse, setCoinPulse] = useState(false);
  const [coinGlow, setCoinGlow] = useState(false);
  const [coinDelta, setCoinDelta] = useState(null);

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

  return (
    <div
      className="
        relative w-full overflow-hidden rounded-2xl border shadow-md
        px-4 py-0
        xl:px-4 xl:py-2
      "
      style={{
        background: `
          linear-gradient(
            135deg,
            color-mix(in srgb, var(--primary) 78%, black 22%) 0%,
            color-mix(in srgb, var(--primary) 58%, var(--accent) 42%) 52%,
            color-mix(in srgb, var(--accent) 72%, black 28%) 100%
          )
        `,
        borderColor: "rgba(255,255,255,0.12)",
        minHeight: "clamp(90px, 16vh, 105px)",
        maxHeight: "18vh",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.10), 0 10px 24px rgba(0,0,0,0.14)",
      }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: `
            radial-gradient(circle at 14% 18%, rgba(255,255,255,0.16), transparent 20%),
            radial-gradient(circle at 84% 22%, rgba(255,255,255,0.12), transparent 18%),
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "auto, auto, 18px 18px, 18px 18px",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,0.95), rgba(0,0,0,0.45), rgba(0,0,0,0.95))",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{ background: "rgba(255,255,255,0.18)" }}
      />

      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1.5"
        style={{
          background:
            "linear-gradient(180deg, #ffffff, var(--usercard-accent), var(--usercard-accent-2))",
          boxShadow:
            "0 0 18px var(--usercard-accent), 0 0 28px var(--usercard-accent-2)",
        }}
      />

      <div
        className="
          relative grid h-full items-center gap-12
          xl:grid-cols-[minmax(320px,1fr)_340px]
        "
        id="nav-user">
        <section className="min-w-0">
          <div className="flex h-full min-w-0 items-center gap-3">
            <div className="relative shrink-1">
              <div
                className="absolute inset-0 rounded-xl opacity-70 blur-[8px]"
                style={{
                  background: `
                    linear-gradient(
                      135deg,
                      var(--usercard-accent),
                      var(--usercard-accent-2)
                    )
                  `,
                }}
              />
              <div
                className="relative rounded-[70px] border  p-[0.1px]"
                style={{
                  borderColor: "rgba(255,255,255,0.18)",
                  background: `
                    linear-gradient(
                      135deg,
                      rgba(255,255,255,0.95) 0%,
                      gold 45%,
                      var(--sidebar) 100%
                    )
                  `,
                  borderColor: "var(--primary)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.08), 0 8px 18px rgba(0,0,0,0.20)",
                }}>
                <img
                  src={resolveAvatar(user?.foto)}
                  alt={`Perfil de ${user?.nombre || "usuario"}`}
                  className="h-17 w-17 rounded-[40px] object-cover xl:h-20 xl:w-20"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = resolveAvatar("default");
                  }}
                />
              </div>

              <span
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2"
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff, var(--usercard-accent))",
                  borderColor:
                    "color-mix(in srgb, var(--primary) 80%, black 20%)",
                  boxShadow:
                    "0 0 10px var(--usercard-accent), 0 0 16px var(--usercard-accent-2)",
                }}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <h2
                  className={`truncate font-bold ${isFirst ? "text-2xl" : "text-xl"}`}
                  title={user?.nombre}
                  style={{
                    color: "#F8FAFC",
                    textShadow: "0 2px 10px rgba(0,0,0,0.20)",
                  }}>
                  {user?.nombre || "Usuario"}
                </h2>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <CompactChip
                    color="var(--usercard-accent-2)"
                    icon={Building2}>
                    {"🏫 " + user?.institucion || "Sin sección"}
                  </CompactChip>

                  <CompactChip color="var(--usercard-accent-2)" icon={Users}>
                    👨🏼‍🎓{user?.seccion || "Sin grade"}
                  </CompactChip>

                  <CompactChip
                    color="var( --usercard-accent-2)"
                    icon={Sparkles}>
                    🔮 Lv. {user?.nivel ?? "-"}
                  </CompactChip>
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{
                      color: "rgba(255,255,255,0.88)",
                      textShadow: "0 1px 6px rgba(0,0,0,0.14)",
                    }}>
                    PROGRESO ACTUAL EN EL NIVEL {user?.nivel ?? "-"}
                  </p>

                  <span
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-extrabold"
                    style={{
                      color: "#ffffff",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
                      boxShadow:
                        "inset 0 0 0 1px rgba(255,255,255,0.12), 0 4px 10px rgba(0,0,0,0.10)",
                    }}>
                    {progreso}%
                  </span>
                </div>

                <div
                  className="relative h-2.5 w-full overflow-hidden rounded-full"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.26), rgba(255,255,255,0.05))",
                    boxShadow:
                      "inset 0 1px 3px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.04)",
                  }}>
                  <div
                    className="relative h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progreso}%`,
                      background: `
                        linear-gradient(
                          90deg,
                          var(--usercard-accent) 0%,
                          color-mix(in srgb, var(--usercard-accent) 60%, var(--usercard-accent-2) 40%) 55%,
                          var(--usercard-accent-2) 100%
                        )
                      `,
                      boxShadow:
                        "0 0 10px var(--usercard-accent), 0 0 18px var(--usercard-accent-2)",
                    }}>
                    <span
                      className="absolute right-0 top-0 h-full w-10 opacity-60"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.75))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid h-full grid-cols-2 gap-3">
          <MetricPanel
            title="intis"
            value={formatInt(animatedCoins)}
            delta={coinDelta}
            glow={coinGlow}
            pulse={coinPulse}
            color="var(--coin-panel-bg)"
            textColor="#4A2B00"
            icon={
              <img
                src={coin}
                alt="Intis"
                className="h-18 w-18 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
              />
            }
          />

          <MetricPanel
            title="XP"
            value={formatInt(animatedXp)}
            icon={<XpQuipuIcon className="h-18 w-18" />}
            color="var(--sidebar)"
            textColor="#ffffff"
          />
        </section>
      </div>

      <style>
        {`
          @keyframes coinFloat {
            0%   { transform: translateY(8px); opacity: 0; }
            15%  { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-12px); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default UserCard;
