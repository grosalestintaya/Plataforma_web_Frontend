import React from "react";

function SlimPendant({ x, y = 54, side = "left", themeHex = "#7130F7" }) {
  const dir = side === "left" ? -1 : 1;

  return (
    <g transform={`translate(${x} ${y})`} opacity="0.96">
      {/* anclaje */}
      <circle cx="0" cy="0" r="3.2" fill="#8C532C" />
      <circle cx="0" cy="0" r="1.2" fill="#F3D29F" />

      {/* cuerdas cortas */}
      <path
        d={`M ${-7 * dir} 2 C ${-8 * dir} 8, ${-7 * dir} 14, ${-5.5 * dir} 22`}
        fill="none"
        stroke="#7A451F"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M 0 2 C 0 9, 0 16, 0 24"
        fill="none"
        stroke="#8C532C"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={`M ${7 * dir} 2 C ${8 * dir} 8, ${7 * dir} 14, ${5.5 * dir} 22`}
        fill="none"
        stroke="#6C3C1C"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* brillo */}
      <path
        d={`M ${-7 * dir} 2 C ${-8 * dir} 8, ${-7 * dir} 14, ${-5.5 * dir} 22`}
        fill="none"
        stroke="rgba(255,229,191,0.22)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M 0 2 C 0 9, 0 16, 0 24"
        fill="none"
        stroke="rgba(255,236,205,0.26)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* nudos */}
      <g transform={`translate(${-5.5 * dir} 10.5)`}>
        <circle cx="0" cy="0" r="3.6" fill="#9B6236" />
        <circle cx="0" cy="0" r="1.2" fill="#EAC08A" />
      </g>

      <g transform="translate(0 15)">
        <circle cx="0" cy="0" r="4.2" fill="#8E552D" />
        <circle cx="0" cy="0" r="1.4" fill="#F1CEA0" />
      </g>

      <g transform={`translate(${5.5 * dir} 19.5)`}>
        <circle cx="0" cy="0" r="3.4" fill="#7D4723" />
        <circle cx="0" cy="0" r="1.1" fill="#EBC895" />
      </g>

      {/* remate */}
      <g transform="translate(0 31)">
        <path
          d="M 0 -5.5 L 5.5 0 L 0 5.5 L -5.5 0 Z"
          fill="#6A3B1C"
          stroke="#D9A96A"
          strokeWidth="1.1"
        />
        <path
          d="M 0 -2.8 L 2.8 0 L 0 2.8 L -2.8 0 Z"
          fill={themeHex}
          opacity="0.9"
          stroke="rgba(255,255,255,0.34)"
          strokeWidth="0.55"
        />
      </g>
    </g>
  );
}

export default function ContentRopeSvg({
  className = "",
  themeHex = "#7130F7",
}) {
  const uid = React.useId().replace(/:/g, "");
  const ids = {
    base: `content-rope-base-${uid}`,
    inner: `content-rope-inner-${uid}`,
    accent: `content-rope-accent-${uid}`,
    shadow: `content-rope-shadow-${uid}`,
    glow: `content-rope-glow-${uid}`,
    mask: `content-rope-mask-${uid}`,
    gem: `content-rope-gem-${uid}`,
  };

  const ropePath = `
    M -80 54
    C 140 45, 320 62, 520 54
    S 900 46, 1100 54
    S 1480 62, 1700 54
    S 2080 46, 2280 54
  `;

  const ropeKnots = [
    [360, 55],
    [700, 51],
    [1040, 56],
    [1380, 52],
    [1720, 55],
  ];

  return (
    <svg
      viewBox="0 26 2200 72"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true">
      <defs>
        <linearGradient id={ids.base} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#693C1E" />
          <stop offset="16%" stopColor="#88522B" />
          <stop offset="34%" stopColor="#B4713D" />
          <stop offset="50%" stopColor="#D49A5E" />
          <stop offset="66%" stopColor="#B6723C" />
          <stop offset="84%" stopColor="#88512A" />
          <stop offset="100%" stopColor="#63381C" />
        </linearGradient>

        <linearGradient id={ids.inner} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,239,214,0.42)" />
          <stop offset="50%" stopColor="rgba(255,207,150,0.18)" />
          <stop offset="100%" stopColor="rgba(92,51,24,0.05)" />
        </linearGradient>

        <linearGradient id={ids.accent} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="22%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="50%" stopColor={themeHex} />
          <stop offset="78%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <filter id={ids.shadow} x="-15%" y="-160%" width="130%" height="420%">
          <feDropShadow
            dx="0"
            dy="2.8"
            stdDeviation="2.8"
            floodColor="rgba(0,0,0,0.24)"
          />
        </filter>

        <filter id={ids.glow} x="-20%" y="-180%" width="140%" height="460%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <mask id={ids.mask}>
          <rect width="2200" height="140" fill="black" />
          <path
            d={ropePath}
            fill="none"
            stroke="white"
            strokeWidth="20"
            strokeLinecap="round"
          />
        </mask>

        <radialGradient id={ids.gem} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="16%" stopColor="#F8ECFF" />
          <stop offset="54%" stopColor={themeHex} />
          <stop offset="100%" stopColor="#2A1246" />
        </radialGradient>
      </defs>

      {/* sombra */}
      <path
        d={ropePath}
        fill="none"
        stroke="rgba(24,11,5,0.18)"
        strokeWidth="26"
        strokeLinecap="round"
        filter={`url(#${ids.shadow})`}
      />

      {/* base */}
      <path
        d={ropePath}
        fill="none"
        stroke={`url(#${ids.base})`}
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* volumen */}
      <path
        d={ropePath}
        fill="none"
        stroke={`url(#${ids.inner})`}
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* borde superior */}
      <path
        d={ropePath}
        fill="none"
        stroke="rgba(255,247,233,0.56)"
        strokeWidth="3.1"
        strokeLinecap="round"
        transform="translate(0,-1.5)"
      />

      {/* borde inferior */}
      <path
        d={ropePath}
        fill="none"
        stroke="rgba(82,45,21,0.34)"
        strokeWidth="3.3"
        strokeLinecap="round"
        transform="translate(0,1.8)"
      />

      {/* trenzado fino */}
      <g mask={`url(#${ids.mask})`} opacity="0.8">
        {Array.from({ length: 46 }).map((_, i) => {
          const x = -120 + i * 50;
          return (
            <g key={`content-braid-a-${i}`}>
              <line
                x1={x}
                y1={28}
                x2={x + 64}
                y2={82}
                stroke="rgba(108,60,30,0.30)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <line
                x1={x + 12}
                y1={26}
                x2={x + 76}
                y2={80}
                stroke="rgba(255,224,182,0.16)"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {Array.from({ length: 46 }).map((_, i) => {
          const x = -98 + i * 50;
          return (
            <g key={`content-braid-b-${i}`}>
              <line
                x1={x + 68}
                y1={30}
                x2={x}
                y2={80}
                stroke="rgba(125,73,38,0.13)"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>

      {/* hilo mágico */}
      <path
        d={ropePath}
        fill="none"
        stroke={`url(#${ids.accent})`}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.68"
        filter={`url(#${ids.glow})`}
      />

      {/* micro nudos */}
      <g opacity="0.94">
        {ropeKnots.map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.8" fill="#9A6033" />
            <circle cx={cx} cy={cy} r="1.3" fill="#F4D3A3" />
          </g>
        ))}
      </g>

      {/* colgantes discretos */}
      <SlimPendant x={92} y={54} side="left" themeHex={themeHex} />
      <SlimPendant x={2108} y={54} side="right" themeHex={themeHex} />

      {/* centro más compacto */}
      <g transform="translate(1100 54)">
        <path
          d="M 0 0 C -1 5, -1 10, 0 15"
          fill="none"
          stroke="#8B542C"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M 0 0 C 1 5, 1 10, 0 15"
          fill="none"
          stroke="rgba(255,238,205,0.26)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        <g transform="translate(0 22)">
          <path
            d="M 0 -7.5 L 7.5 0 L 0 7.5 L -7.5 0 Z"
            fill="#6C3B1E"
            stroke="#E5B06F"
            strokeWidth="1"
          />
          <path
            d="M 0 -4.2 L 4.2 0 L 0 4.2 L -4.2 0 Z"
            fill={`url(#${ids.gem})`}
            stroke="rgba(255,255,255,0.34)"
            strokeWidth="0.6"
            filter={`url(#${ids.glow})`}
          />
          <circle cx="0" cy="0" r="1.1" fill="#FFFFFF" opacity="0.94" />
        </g>
      </g>
    </svg>
  );
}
