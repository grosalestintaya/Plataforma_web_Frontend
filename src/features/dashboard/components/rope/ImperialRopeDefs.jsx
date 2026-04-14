import React from "react";

export default function ImperialRopeDefs({ path, ids }) {
  return (
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

      <linearGradient id="ropeInnerImperial" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,239,214,0.42)" />
        <stop offset="50%" stopColor="rgba(255,207,150,0.18)" />
        <stop offset="100%" stopColor="rgba(92,51,24,0.05)" />
      </linearGradient>

      <linearGradient id="imperialAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
        <stop offset="20%" stopColor="rgba(255,255,255,0.05)" />
        <stop offset="50%" stopColor="#B092FF" />
        <stop offset="80%" stopColor="rgba(255,255,255,0.05)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>

      <filter
        id={ids.ropeShadowImperial}
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
        id={ids.ropeGlowImperial}
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

      <filter id={ids.ropeGlow} x="-140%" y="-140%" width="380%" height="380%">
        <feGaussianBlur stdDeviation="6.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id={ids.labelGlow} x="-80%" y="-120%" width="260%" height="320%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter
        id={ids.labelGlowStrong}
        x="-100%"
        y="-140%"
        width="300%"
        height="360%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <mask id={ids.ropeMaskImperial}>
        <rect width="820" height="470" fill="black" />
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth="34"
          strokeLinecap="round"
        />
      </mask>
    </defs>
  );
}
