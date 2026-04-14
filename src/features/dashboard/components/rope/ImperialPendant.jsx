import React from "react";

export default function ImperialPendant({
  x,
  y = 92,
  side = "left",
  themeHex = "#7130F7",
}) {
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
        d="M 0 3 C 0 16, 0 30, 0 46"
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
        d="M 0 3 C 0 16, 0 30, 0 46"
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
