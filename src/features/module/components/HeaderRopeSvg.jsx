import React from "react";

function ImperialPendant({ x, y = 92, side = "left", themeHex = "#7130F7" }) {
  const dir = side === "left" ? -1 : 1;

  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="4.2" fill="#8C532C" />
      <circle cx="0" cy="0" r="1.6" fill="#F3D29F" />

      <path
        d={`M ${-10 * dir} 2 C ${-12 * dir} 14, ${-10 * dir} 28, ${-8 * dir} 42`}
        fill="none"
        stroke="#7A451F"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d={`M 0 3 C 0 16, 0 30, 0 46`}
        fill="none"
        stroke="#8C532C"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d={`M ${10 * dir} 2 C ${12 * dir} 14, ${10 * dir} 28, ${8 * dir} 42`}
        fill="none"
        stroke="#6C3C1C"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d={`M ${-10 * dir} 2 C ${-12 * dir} 14, ${-10 * dir} 28, ${-8 * dir} 42`}
        fill="none"
        stroke="rgba(255,229,191,0.26)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d={`M 0 3 C 0 16, 0 30, 0 46`}
        fill="none"
        stroke="rgba(255,236,205,0.3)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <g transform={`translate(${-8 * dir} 18)`}>
        <circle cx="0" cy="0" r="5.5" fill="#9B6236" />
        <circle cx="0" cy="0" r="2" fill="#EAC08A" />
      </g>

      <g transform="translate(0 24)">
        <circle cx="0" cy="0" r="6.4" fill="#8E552D" />
        <circle cx="0" cy="0" r="2.2" fill="#F1CEA0" />
      </g>

      <g transform={`translate(${8 * dir} 31)`}>
        <circle cx="0" cy="0" r="5.2" fill="#7D4723" />
        <circle cx="0" cy="0" r="1.8" fill="#EBC895" />
      </g>

      <g transform="translate(0 46)">
        <circle cx="0" cy="0" r="6.2" fill="#9A6034" />
        <circle cx="0" cy="0" r="2.1" fill="#F5D7AB" />
      </g>

      <g transform="translate(0 62)">
        <path
          d="M 0 -10 L 10 0 L 0 10 L -10 0 Z"
          fill="#6A3B1C"
          stroke="#D9A96A"
          strokeWidth="1.8"
        />
        <path
          d="M 0 -5 L 5 0 L 0 5 L -5 0 Z"
          fill={themeHex}
          opacity="0.9"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.8"
        />
        <circle cx="0" cy="0" r="1.6" fill="#FFFFFF" opacity="0.9" />
      </g>

      <line
        x1="-4"
        y1="71"
        x2="-4"
        y2="85"
        stroke="#8B532C"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="71"
        x2="4"
        y2="85"
        stroke="#6E3D1D"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </g>
  );
}

export default function HeaderRopeSvg({
  className = "",
  themeHex = "#7130F7",
}) {
  const ropePath = `
    M -60 94
    C 120 78, 250 108, 410 94
    S 710 78, 860 94
    S 1160 110, 1320 94
    S 1510 80, 1660 94
  `;

  return (
    <svg
      viewBox="0 54 1600 128"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true">
      <defs>
        <linearGradient id="ropeBaseImperial" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#693C1E" />
          <stop offset="16%" stopColor="#88522B" />
          <stop offset="34%" stopColor="#B4713D" />
          <stop offset="50%" stopColor="#D49A5E" />
          <stop offset="66%" stopColor="#B6723C" />
          <stop offset="84%" stopColor="#88512A" />
          <stop offset="100%" stopColor="#63381C" />
        </linearGradient>

        <linearGradient
          id="ropeInnerImperial"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%">
          <stop offset="0%" stopColor="rgba(255,239,214,0.42)" />
          <stop offset="50%" stopColor="rgba(255,207,150,0.18)" />
          <stop offset="100%" stopColor="rgba(92,51,24,0.05)" />
        </linearGradient>

        <linearGradient id="imperialAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="20%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="50%" stopColor={themeHex} />
          <stop offset="80%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <filter
          id="ropeShadowImperial"
          x="-15%"
          y="-100%"
          width="130%"
          height="320%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="4.5"
            floodColor="rgba(0,0,0,0.32)"
          />
        </filter>

        <filter
          id="ropeGlowImperial"
          x="-20%"
          y="-120%"
          width="140%"
          height="340%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <mask id="ropeMaskImperial">
          <rect width="1600" height="210" fill="black" />
          <path
            d={ropePath}
            fill="none"
            stroke="white"
            strokeWidth="34"
            strokeLinecap="round"
          />
        </mask>

        <radialGradient id="centerGemImperial" cx="50%" cy="40%" r="70%">
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
        stroke="rgba(24,11,5,0.22)"
        strokeWidth="42"
        strokeLinecap="round"
        filter="url(#ropeShadowImperial)"
      />

      {/* cuerpo base más ancho */}
      <path
        d={ropePath}
        fill="none"
        stroke="url(#ropeBaseImperial)"
        strokeWidth="34"
        strokeLinecap="round"
      />

      {/* volumen interior */}
      <path
        d={ropePath}
        fill="none"
        stroke="url(#ropeInnerImperial)"
        strokeWidth="22"
        strokeLinecap="round"
      />

      {/* borde superior */}
      <path
        d={ropePath}
        fill="none"
        stroke="rgba(255,247,233,0.62)"
        strokeWidth="5.2"
        strokeLinecap="round"
        transform="translate(0,-2.4)"
      />

      {/* borde inferior */}
      <path
        d={ropePath}
        fill="none"
        stroke="rgba(82,45,21,0.42)"
        strokeWidth="5.6"
        strokeLinecap="round"
        transform="translate(0,3.2)"
      />

      {/* trenzado interno */}
      <g mask="url(#ropeMaskImperial)" opacity="0.8">
        {Array.from({ length: 34 }).map((_, i) => {
          const x = -120 + i * 55;
          return (
            <g key={`braid-a-${i}`}>
              <line
                x1={x}
                y1={36}
                x2={x + 90}
                y2={154}
                stroke="rgba(108,60,30,0.34)"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <line
                x1={x + 20}
                y1={30}
                x2={x + 110}
                y2={148}
                stroke="rgba(255,224,182,0.22)"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {Array.from({ length: 34 }).map((_, i) => {
          const x = -92 + i * 55;
          return (
            <g key={`braid-b-${i}`}>
              <line
                x1={x + 92}
                y1={38}
                x2={x}
                y2={152}
                stroke="rgba(125,73,38,0.16)"
                strokeWidth="3.2"
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
        stroke="url(#imperialAccent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
        filter="url(#ropeGlowImperial)"
      />

      {/* micro nudos */}
      <g opacity="0.96">
        {[
          [315, 96],
          [585, 88],
          [1035, 98],
          [1275, 90],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5.8" fill="#9A6033" />
            <circle cx={cx} cy={cy} r="2.1" fill="#F4D3A3" />
          </g>
        ))}
      </g>

      {/* colgantes */}
      <ImperialPendant x={92} y={92} side="left" themeHex={themeHex} />
      <ImperialPendant x={1508} y={92} side="right" themeHex={themeHex} />

      {/* centro */}
      <g transform="translate(800 95)">
        <path
          d="M 0 0 C -1.5 10, -1.5 18, 0 28"
          fill="none"
          stroke="#8B542C"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        <path
          d="M 0 0 C 1.5 10, 1.5 18, 0 28"
          fill="none"
          stroke="rgba(255,238,205,0.34)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        <g transform="translate(0 40)">
          <path
            d="M 0 -15 L 15 0 L 0 15 L -15 0 Z"
            fill="#6C3B1E"
            stroke="#E5B06F"
            strokeWidth="1.8"
          />
          <path
            d="M 0 -9 L 9 0 L 0 9 L -9 0 Z"
            fill="url(#centerGemImperial)"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth="1"
            filter="url(#ropeGlowImperial)"
          />
          <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" opacity="0.95" />
        </g>
      </g>
    </svg>
  );
}
