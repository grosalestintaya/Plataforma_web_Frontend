import React, { useId, useMemo } from "react";
import conceptual from "@/assets/modules/conceptual.png";
import procedimental from "@/assets/modules/procedimental.png";
import actitudinal from "@/assets/modules/actitudinal.png";

function iconForType(type) {
  if (type === "conceptual") return conceptual;
  if (type === "procedimental") return procedimental;
  if (type === "actitudinal") return actitudinal;
  return conceptual;
}

function stateGlyph(status) {
  if (status === "completed") return "OK";
  if (status === "locked") return "L";
  if (status === "in_progress") return "...";
  return ">";
}

function getActiveIndex(list, selectedId) {
  const idx = list.findIndex(
    (a) => String(a.activityId) === String(selectedId),
  );
  return idx >= 0 ? idx : 0;
}

function statusBadgeBackground(status, themeHex) {
  if (status === "completed") {
    return "linear-gradient(180deg, #10b981, #047857)";
  }
  if (status === "locked") {
    return "linear-gradient(180deg, #666, #222)";
  }
  if (status === "in_progress") {
    return "linear-gradient(180deg, #f59e0b, #b45309)";
  }
  return `linear-gradient(180deg, ${themeHex}, ${themeHex}aa)`;
}

function buildRopePath(points, stemTopY = -34) {
  if (!points.length) return "";

  const first = points[0];

  let d = `
    M ${first.x} ${stemTopY}
    C ${first.x + 1.5} ${stemTopY + 18},
      ${first.x - 1.5} ${first.y - 18},
      ${first.x} ${first.y}
  `;

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const dy = b.y - a.y;
    const dx = b.x - a.x;
    const dir = dx === 0 ? (i % 2 === 0 ? 1 : -1) : Math.sign(dx);
    const bend = 22;

    d += `
      C ${a.x + dir * bend} ${a.y + dy * 0.36},
        ${b.x - dir * bend} ${b.y - dy * 0.36},
        ${b.x} ${b.y}
    `;
  }

  return d;
}

function TopUnionPendant({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="1">
      {/* cuerda superior corta */}
      <path
        d="M 0 -18 C 0 -13, 0 -8, 0 -3"
        fill="none"
        stroke="#7C4924"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 0 -18 C 0 -13, 0 -8, 0 -3"
        fill="none"
        stroke="rgba(255,234,205,0.24)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* lazadas laterales */}
      <path
        d="M -10 -1 C -13 5, -12 11, -7 15"
        fill="none"
        stroke="#8A542C"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M 10 -1 C 13 5, 12 11, 7 15"
        fill="none"
        stroke="#6E3E1F"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <path
        d="M -10 -1 C -13 5, -12 11, -7 15"
        fill="none"
        stroke="rgba(255,229,191,0.16)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d="M 10 -1 C 13 5, 12 11, 7 15"
        fill="none"
        stroke="rgba(255,236,205,0.14)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />

      {/* cuerpo principal del nudo */}
      <circle cx="0" cy="0" r="7.4" fill="#8F552D" />
      <circle cx="0" cy="0" r="2.3" fill="#F2CFA0" />

      {/* nudos compactos inferiores */}
      <circle cx="-7" cy="8" r="4.9" fill="#9B6236" />
      <circle cx="-7" cy="8" r="1.35" fill="#EAC08A" />

      <circle cx="7" cy="8" r="4.9" fill="#7D4723" />
      <circle cx="7" cy="8" r="1.2" fill="#EBC895" />

      <circle cx="0" cy="15" r="5.8" fill="#8C532C" />
      <circle cx="0" cy="15" r="1.75" fill="#F1CEA0" />

      {/* colitas mínimas del nudo */}
      <line
        x1="-2.8"
        y1="20"
        x2="-2.8"
        y2="28"
        stroke="#8B532C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="2.8"
        y1="20"
        x2="2.8"
        y2="28"
        stroke="#6E3D1D"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  );
}
export default function ActivityDots({
  activities,
  selectedId,
  onSelect,
  themeHex = "#7130F7",
}) {
  const uid = useId().replace(/:/g, "");

  const list = useMemo(() => {
    return [...(activities || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
  }, [activities]);

  const activeIdx = useMemo(
    () => getActiveIndex(list, selectedId),
    [list, selectedId],
  );

  const buttonSize = 110;
  const gap = 32;
  const topStemSpace = 46;
  const bottomPad = 10;
  const xOffsets = [0, 10, -6];

  const W = 188;
  const centerX = W / 2;

  const centers = list.map((_, idx) => ({
    x: centerX + (xOffsets[idx] ?? 0),
    y: topStemSpace + buttonSize / 2 + idx * (buttonSize + gap),
  }));

  const H =
    (centers[centers.length - 1]?.y ?? topStemSpace + buttonSize / 2) +
    buttonSize / 2 +
    bottomPad;

  const ropePath = buildRopePath(centers, -34);
  const glowPath = buildRopePath(centers.slice(0, activeIdx + 1), -34);

  const ids = {
    base: `activity-rope-base-${uid}`,
    inner: `activity-rope-inner-${uid}`,
    accent: `activity-rope-accent-${uid}`,
    shadow: `activity-rope-shadow-${uid}`,
    glow: `activity-rope-glow-${uid}`,
    mask: `activity-rope-mask-${uid}`,
  };

  const ropeKnots = centers.slice(0, -1).map((a, i) => {
    const b = centers[i + 1];
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
  });

  return (
    <div className="relative flex w-full justify-center overflow-visible">
      <div className="relative w-[188px] overflow-visible">
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          <svg
            width={W}
            height={H}
            viewBox={`0 -78 ${W} ${H + 78}`}
            className="overflow-visible"
            aria-hidden="true">
            <defs>
              <linearGradient id={ids.base} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#693C1E" />
                <stop offset="16%" stopColor="#88522B" />
                <stop offset="34%" stopColor="#B4713D" />
                <stop offset="50%" stopColor="#D49A5E" />
                <stop offset="66%" stopColor="#B6723C" />
                <stop offset="84%" stopColor="#88512A" />
                <stop offset="100%" stopColor="#63381C" />
              </linearGradient>

              <linearGradient id={ids.inner} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,239,214,0.40)" />
                <stop offset="50%" stopColor="rgba(255,207,150,0.18)" />
                <stop offset="100%" stopColor="rgba(92,51,24,0.05)" />
              </linearGradient>

              <linearGradient id={ids.accent} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={`${themeHex}D9`} />
                <stop offset="100%" stopColor={`${themeHex}40`} />
              </linearGradient>

              <filter
                id={ids.shadow}
                x="-70%"
                y="-50%"
                width="240%"
                height="220%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3.2"
                  floodColor="rgba(0,0,0,0.28)"
                />
              </filter>

              <filter
                id={ids.glow}
                x="-80%"
                y="-60%"
                width="260%"
                height="240%">
                <feGaussianBlur stdDeviation="3.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <mask id={ids.mask}>
                <rect x="0" y="-100" width={W} height={H + 140} fill="black" />
                <path
                  d={ropePath}
                  fill="none"
                  stroke="white"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              </mask>
            </defs>

            <path
              d={ropePath}
              fill="none"
              stroke="rgba(24,11,5,0.20)"
              strokeWidth="18"
              strokeLinecap="round"
              filter={`url(#${ids.shadow})`}
            />

            <path
              d={ropePath}
              fill="none"
              stroke={`url(#${ids.base})`}
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d={ropePath}
              fill="none"
              stroke={`url(#${ids.inner})`}
              strokeWidth="8.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d={ropePath}
              fill="none"
              stroke="rgba(255,247,233,0.58)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0,-1.4)"
            />

            <path
              d={ropePath}
              fill="none"
              stroke="rgba(82,45,21,0.34)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0,1.6)"
            />

            <g mask={`url(#${ids.mask})`} opacity="0.78">
              {Array.from({ length: 16 }).map((_, i) => {
                const x = 42 + i * 8;
                return (
                  <g key={`braid-a-${i}`}>
                    <line
                      x1={x}
                      y1={-18}
                      x2={x + 56}
                      y2={H - 18}
                      stroke="rgba(108,60,30,0.20)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <line
                      x1={x + 5}
                      y1={-22}
                      x2={x + 61}
                      y2={H - 22}
                      stroke="rgba(255,224,182,0.14)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {Array.from({ length: 16 }).map((_, i) => {
                const x = 82 + i * 8;
                return (
                  <line
                    key={`braid-b-${i}`}
                    x1={x}
                    y1={-18}
                    x2={x - 56}
                    y2={H - 18}
                    stroke="rgba(125,73,38,0.10)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            <path
              d={glowPath}
              fill="none"
              stroke={`url(#${ids.accent})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${ids.glow})`}
              opacity="0.94"
            />

            <path
              d={glowPath}
              fill="none"
              stroke={`${themeHex}AA`}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.92"
            />

            <g opacity="0.96">
              {ropeKnots.map((k, i) => (
                <g key={i}>
                  <circle cx={k.x} cy={k.y} r="4.5" fill="#9A6033" />
                  <circle cx={k.x} cy={k.y} r="1.5" fill="#F4D3A3" />
                </g>
              ))}
            </g>

            {centers[0] && (
              <TopUnionPendant
                x={centers[0].x}
                y={centers[0].y - 154}
                themeHex={themeHex}
              />
            )}
          </svg>
        </div>

        <div
          className="relative flex flex-col items-center overflow-visible"
          style={{
            paddingTop: `${topStemSpace}px`,
            paddingBottom: `${bottomPad}px`,
            gap: `${gap}px`,
          }}>
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
                {selected && !disabled && (
                  <>
                    <span
                      className="pointer-events-none absolute -inset-4 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${themeHex}40 0%, transparent 72%)`,
                        filter: "blur(4px)",
                        animation: "qyPulseSoft 1.8s ease-out infinite",
                      }}
                    />
                    <span
                      className="pointer-events-none absolute -inset-[10px] rounded-full"
                      style={{
                        border: `3px solid ${themeHex}33`,
                        animation: "qyRingSoft 1.7s ease-out infinite",
                      }}
                    />
                  </>
                )}

                <button
                  onClick={() => onSelect?.(a.activityId)}
                  disabled={disabled}
                  className={[
                    "group relative h-[110px] w-[110px] overflow-hidden rounded-full",
                    "transition-all duration-300",
                    disabled
                      ? "cursor-not-allowed opacity-55"
                      : "hover:scale-[1.045] active:scale-[1.015]",
                  ].join(" ")}
                  style={{
                    background:
                      "radial-gradient(circle at 28% 24%, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 45%, rgba(0,0,0,0.14) 100%)",
                    border: selected
                      ? "2px solid rgba(255,245,230,0.52)"
                      : "2px solid rgba(255,255,255,0.16)",
                    boxShadow: selected
                      ? `0 0 0 6px ${themeHex}18, 0 20px 60px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.22)`
                      : "0 16px 44px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14)",
                  }}
                  title={disabled ? "Bloqueada" : "Ver actividad"}>
                  <div
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      inset: 4,
                      border: selected
                        ? "2px solid rgba(229,176,111,0.72)"
                        : "1px solid rgba(217,169,106,0.34)",
                      boxShadow: selected
                        ? `inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 20px ${themeHex}20`
                        : "inset 0 0 0 1px rgba(255,255,255,0.10)",
                    }}
                  />

                  <img
                    src={img}
                    alt={a.type}
                    draggable={false}
                    className="pointer-events-none absolute rounded-full object-cover"
                    style={{
                      top: 10,
                      left: 10,
                      right: 10,
                      bottom: 10,
                      width: "calc(100% - 20px)",
                      height: "calc(100% - 20px)",
                      filter: disabled
                        ? "grayscale(1) contrast(1.02) brightness(0.82)"
                        : selected
                          ? "contrast(1.12) saturate(1.18)"
                          : "contrast(1.05) saturate(1.06)",
                    }}
                  />

                  <div
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      top: 10,
                      left: 10,
                      right: 10,
                      bottom: 10,
                      background:
                        "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.24), transparent 58%), linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.38))",
                    }}
                  />

                  {selected && (
                    <div
                      className="pointer-events-none absolute rounded-full"
                      style={{
                        top: 10,
                        left: 10,
                        right: 10,
                        bottom: 10,
                        boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.12), inset 0 0 0 10px ${themeHex}12`,
                      }}
                    />
                  )}

                  <div
                    className="absolute left-[7px] top-[7px] flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-black"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(38,20,8,0.92), rgba(18,10,4,0.92))",
                      border: "1px solid rgba(255,227,190,0.26)",
                      color: "#F7E5C7",
                      zIndex: 5,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.28)",
                    }}>
                    {a.sortOrder}
                  </div>

                  <div
                    className="absolute bottom-[7px] right-[7px] flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-black"
                    style={{
                      background: statusBadgeBackground(a.status, themeHex),
                      border: "1px solid rgba(255,255,255,0.24)",
                      color: "white",
                      zIndex: 5,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.28)",
                    }}>
                    {stateGlyph(a.status)}
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.14), transparent 38%)",
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes qyPulseSoft {
            0%   { transform: scale(0.92); opacity: 0.72; }
            70%  { transform: scale(1.08); opacity: 0.10; }
            100% { transform: scale(1.12); opacity: 0; }
          }

          @keyframes qyRingSoft {
            0%   { transform: scale(0.90); opacity: 0.42; }
            70%  { transform: scale(1.12); opacity: 0.08; }
            100% { transform: scale(1.18); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
