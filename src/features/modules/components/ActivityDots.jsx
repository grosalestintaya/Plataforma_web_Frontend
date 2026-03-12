import React, { useMemo } from "react";
import conceptual from "@/assets/modules/conceptual.png";
import procedimental from "@/assets/modules/procedimental.png";
import actitudinal from "@/assets/modules/actitudinal.png";
function iconForType(type) {
  if (type === "conceptual") return conceptual;
  if (type === "procedimental") return procedimental;
  if (type === "actitudinal") return actitudinal;
  return defaultIcon;
}

function stateGlyph(status) {
  if (status === "completed") return "✓";
  if (status === "locked") return "🔒";
  if (status === "in_progress") return "…";
  return "▶";
}

function getActiveIndex(list, selectedId) {
  const idx = list.findIndex(
    (a) => String(a.activityId) === String(selectedId),
  );
  return idx >= 0 ? idx : 0;
}

export default function ActivityDots({
  activities,
  selectedId,
  onSelect,
  themeHex,
}) {
  const list = useMemo(() => {
    return [...(activities || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
  }, [activities]);

  const activeIdx = useMemo(
    () => getActiveIndex(list, selectedId),
    [list, selectedId],
  );

  // Alturas de burbujas (en px) dentro del “rail”
  // Ajusta si cambias tamaños o gaps
  const bubbleSize = 92;
  const gap = 32; // equivale al gap-8 aprox
  const topPad = 12;
  const y1 = topPad + bubbleSize / 2; // centro bubble 1
  const y2 = y1 + bubbleSize + gap; // centro bubble 2
  const y3 = y2 + bubbleSize + gap; // centro bubble 3

  const ys = [y1, y2, y3];
  const activeY = ys[activeIdx] ?? y1;

  // offsets suaves para que “bailen” un poco
  const xOffsets = [0, 10, -6];

  // SVG viewbox dims
  const W = 160;
  const H = y3 + topPad;

  // Path ondulado (cuerda)
  // x medio = 80
  const ropePath = `
    M 80 ${y1}
    C 105 ${(y1 + y2) / 2 - 18}, 55 ${(y1 + y2) / 2 + 18}, 80 ${y2}
    C 105 ${(y2 + y3) / 2 - 18}, 55 ${(y2 + y3) / 2 + 18}, 80 ${y3}
  `;

  // Path “glow” hasta la actividad activa:
  // (lo hacemos por segmentos para que termine exactamente en y activa)
  const glowPath =
    activeIdx === 0
      ? `M 80 ${y1} L 80 ${y1}` // nada (punto)
      : activeIdx === 1
        ? `
        M 80 ${y1}
        C 105 ${(y1 + y2) / 2 - 18}, 55 ${(y1 + y2) / 2 + 18}, 80 ${y2}
      `
        : `
        M 80 ${y1}
        C 105 ${(y1 + y2) / 2 - 18}, 55 ${(y1 + y2) / 2 + 18}, 80 ${y2}
        C 105 ${(y2 + y3) / 2 - 18}, 55 ${(y2 + y3) / 2 + 18}, 80 ${y3}
      `;

  return (
    <div className="relative w-full flex justify-center">
      <div className="relative w-[160px]">
        {/* ===== CUERDA ONDULADA (SVG) ===== */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            width="160"
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="overflow-visible">
            <defs>
              {/* degradado cuerda base */}
              <linearGradient id="ropeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(92,55,25,0.85)" />
                <stop offset="45%" stopColor="rgba(138,88,45,0.95)" />
                <stop offset="100%" stopColor="rgba(92,55,25,0.85)" />
              </linearGradient>

              {/* glow del módulo */}
              <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`${themeHex}cc`} />
                <stop offset="100%" stopColor={`${themeHex}44`} />
              </linearGradient>

              {/* blur glow */}
              <filter
                id="glowBlur"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* base cuerda (más gruesa) */}
            <path
              d={ropePath}
              fill="none"
              stroke="url(#ropeGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />

            {/* borde/relieve cuerda */}
            <path
              d={ropePath}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* glow hasta la activa (blur + animación suave) */}
            <path
              d={glowPath}
              fill="none"
              stroke="url(#glowGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowBlur)"
              opacity="0.9"
              className="animate-[pulse_2s_ease-in-out_infinite]"
            />
          </svg>
        </div>

        {/* ===== BURBUJAS ===== */}
        <div className="relative flex flex-col items-center gap-8 py-2">
          {list.map((a, idx) => {
            const selected = String(a.activityId) === String(selectedId);
            const disabled = a.status === "locked";
            const img = iconForType(a.type);
            const x = xOffsets[idx] ?? 0;

            return (
              <div
                key={a.activityId}
                className="relative"
                style={{ transform: `translateX(${x}px)` }}>
                {/* Pulso externo */}
                {selected && !disabled && (
                  <>
                    <span
                      className="absolute -inset-3 rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${themeHex}55 0%, transparent 100%)`,
                        filter: "blur(2px)",
                        animation: "qyPulse 1.4s ease-out infinite",
                      }}
                    />
                    <span
                      className="absolute -inset-5 rounded-full pointer-events-none"
                      style={{
                        border: `5px solid ${themeHex}55`,
                        animation: "qyRing 1.3s ease-out infinite",
                      }}
                    />
                  </>
                )}

                <button
                  onClick={() => onSelect(a.activityId)}
                  disabled={disabled}
                  className={[
                    "relative w-[110px] h-[110px] rounded-full overflow-hidden",
                    "transition-all duration-300",
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105",
                  ].join(" ")}
                  style={{
                    border: selected
                      ? "3px solid rgba(255,255,255,0.22)"
                      : "2px solid rgba(255,255,255,0.14)",
                    boxShadow: selected
                      ? `0 0 0 7px ${themeHex}22, 0 22px 70px rgba(0,0,0,0.45)`
                      : "0 18px 55px rgba(0,0,0,0.35)",
                    background: "rgba(255,255,255,0.06)",
                  }}
                  title={disabled ? "Bloqueada" : "Ver actividad"}>
                  <img
                    src={img}
                    alt={a.type}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                      filter: disabled
                        ? "grayscale(1) contrast(1.05) brightness(0.9)"
                        : selected
                          ? "contrast(1.12) saturate(1.2)"
                          : "contrast(1.06) saturate(1.08)",
                    }}
                  />

                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35))",
                    }}
                  />

                  {/* Número */}
                  <div
                    className="absolute top-1 left-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold"
                    style={{
                      background: "rgba(0,0,0,0.70)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "white",
                      zIndex: 5,
                    }}>
                    {a.sortOrder}
                  </div>

                  {/* Estado */}
                  <div
                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold"
                    style={{
                      background:
                        a.status === "completed"
                          ? "linear-gradient(180deg, #10b981, #047857)"
                          : a.status === "locked"
                            ? "linear-gradient(180deg, #666, #222)"
                            : a.status === "in_progress"
                              ? "linear-gradient(180deg, #f59e0b, #b45309)"
                              : `linear-gradient(180deg, ${themeHex}, ${themeHex}aa)`,
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "white",
                      zIndex: 5,
                    }}>
                    {stateGlyph(a.status)}
                  </div>

                  {/* ring interno cuando está selected */}
                  {selected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.10), inset 0 0 0 10px ${themeHex}14`,
                      }}
                    />
                  )}
                </button>

                {/* Keyframes inline */}
                <style>{`
                  @keyframes qyPulse {
                    0%   { transform: scale(0.90); opacity: 0.85; }
                    70%  { transform: scale(1.10); opacity: 0.15; }
                    100% { transform: scale(1.14); opacity: 0; }
                  }
                  @keyframes qyRing {
                    0%   { transform: scale(0.88); opacity: 0.55; }
                    70%  { transform: scale(1.16); opacity: 0.10; }
                    100% { transform: scale(1.22); opacity: 0; }
                  }
                `}</style>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
