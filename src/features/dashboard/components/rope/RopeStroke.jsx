import React from "react";
import { ROPE_VISUAL_VARIANTS } from "./rope.variants";

function getPalette(kind, state, visualVariant) {
  const locked = state === "locked";
  const variant =
    ROPE_VISUAL_VARIANTS[visualVariant] || ROPE_VISUAL_VARIANTS.imperial;

  if (kind === "main") {
    return {
      outer: "#6E4A2E",
      mid: "#B97843",
      high: "#F3D8B4",
      shadow: "rgba(18,9,4,0.18)",
      braidA: "rgba(108,60,30,0.34)",
      braidB: "rgba(255,224,182,0.18)",
      accentOpacity: variant.accentOpacity,
      highlightScale: variant.highlightScale,
      shadowExtra: variant.shadowExtra,
      braidOpacity: variant.braidOpacity,
    };
  }

  if (locked) {
    return {
      outer: "#5A6677",
      mid: "#8C98AA",
      high: "rgba(255,255,255,0.34)",
      shadow: "rgba(12,18,29,0.16)",
      braidA: "rgba(180,190,208,0.10)",
      braidB: "rgba(255,255,255,0.06)",
      accentOpacity: 0,
      highlightScale: 0.13,
      shadowExtra: 7,
      braidOpacity: 0.14,
    };
  }

  return {
    outer: "#6E4A2E",
    mid: "#B97843",
    high: "#F3D8B4",
    shadow: "rgba(18,9,4,0.18)",
    braidA: "rgba(109,61,29,0.20)",
    braidB: "rgba(255,225,185,0.14)",
    accentOpacity: variant.accentOpacity,
    highlightScale: variant.highlightScale,
    shadowExtra: variant.shadowExtra,
    braidOpacity: variant.braidOpacity,
  };
}

export default function RopeStroke({
  d,
  width = 16,
  kind = "branch",
  state = "unlocked",
  accent = "#B092FF",
  glow = false,
  braidMaskId,
  visualVariant = "imperial",
  defsIds,
}) {
  const locked = state === "locked";
  const palette = getPalette(kind, state, visualVariant);

  return (
    <g opacity={locked ? 0.78 : 1}>
      <path
        d={d}
        fill="none"
        stroke={palette.shadow}
        strokeWidth={width + palette.shadowExtra}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={palette.outer}
        strokeWidth={width + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={palette.mid}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={palette.high}
        strokeWidth={Math.max(1.3, width * palette.highlightScale)}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.94"
      />

      {!locked && kind !== "main" && (
        <path
          d={d}
          fill="none"
          stroke={accent}
          strokeWidth={Math.max(1.15, width * 0.11)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={palette.accentOpacity}
        />
      )}

      {braidMaskId && (
        <g mask={`url(#${braidMaskId})`} opacity={palette.braidOpacity}>
          {Array.from({ length: 18 }).map((_, i) => {
            const x = -220 + i * 52;
            return (
              <g key={`braid-a-${i}`}>
                <line
                  x1={x}
                  y1={-40}
                  x2={x + 180}
                  y2={560}
                  stroke={palette.braidA}
                  strokeWidth="5.2"
                  strokeLinecap="round"
                />
                <line
                  x1={x + 18}
                  y1={-48}
                  x2={x + 198}
                  y2={552}
                  stroke={palette.braidB}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {Array.from({ length: 18 }).map((_, i) => {
            const x = -194 + i * 52;
            return (
              <g key={`braid-b-${i}`}>
                <line
                  x1={x + 180}
                  y1={-40}
                  x2={x}
                  y2={560}
                  stroke="rgba(125,73,38,0.12)"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>
      )}

      {glow && !locked && defsIds?.ropeGlow && (
        <path
          d={d}
          fill="none"
          stroke={accent}
          strokeWidth={width + 8}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.2"
          filter={`url(#${defsIds.ropeGlow})`}
        />
      )}
    </g>
  );
}
