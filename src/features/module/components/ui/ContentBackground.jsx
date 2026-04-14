import React, { useMemo } from "react";
import { getModuleTheme } from "../../utils/moduleTheme";

export default function ContentBackground({
  moduleCode,
  children,
  className = "",
  patternOpacity = 0.14,
  ambientOpacity = 0.56,
  vignetteStrength = 0.1,
  topGlow = 0.03,
  bottomShade = 0.07,
}) {
  const theme = useMemo(() => {
    const moduleTheme = getModuleTheme(moduleCode);

    const primary =
      moduleTheme?.primary ||
      moduleTheme?.themeHex ||
      moduleTheme?.color ||
      "#64748b";

    return {
      primary,
      ambientTop: `rgba(255,255,255,${0.05 * ambientOpacity})`,
      ambientSide: `rgba(255,255,255,${0.022 * ambientOpacity})`,
      ambientCenter: `rgba(255,255,255,${0.018 * ambientOpacity})`,
      shadeBottom: `rgba(0,0,0,${bottomShade})`,
      shadeEdge: `rgba(0,0,0,${vignetteStrength})`,
      topGloss: `rgba(255,255,255,${topGlow})`,
    };
  }, [moduleCode, ambientOpacity, vignetteStrength, topGlow, bottomShade]);

  return (
    <div
      className={`relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden ${className}`}
      style={{ backgroundColor: theme.primary }}>
      {/* textil continuo tipo lliclla */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: patternOpacity }}
        aria-hidden="true">
        <LlicllaDiamondTextileOverlay />
      </div>

      {/* atmósfera suave */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(1000px 520px at 12% 10%, ${theme.ambientTop} 0%, transparent 58%),
            radial-gradient(860px 480px at 88% 12%, ${theme.ambientSide} 0%, transparent 60%),
            radial-gradient(820px 420px at 50% 42%, ${theme.ambientCenter} 0%, transparent 64%),
            linear-gradient(180deg, ${theme.topGloss} 0%, transparent 18%, transparent 76%, ${theme.shadeBottom} 100%)
          `,
        }}
      />

      {/* viñeta leve */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, transparent 0%, transparent 54%, ${theme.shadeEdge} 100%)
          `,
        }}
      />

      <div
        className="relative h-full"
        style={{
          "--activity-header-height": "clamp(96px, 13vh, 132px)",
          "--activity-footer-height": "clamp(56px, 8vh, 72px)",
          "--activity-shell-gutter": "clamp(12px, 2vw, 28px)",
          "--activity-module-primary": theme.primary,
        }}>
        {children}
      </div>
    </div>
  );
}

function LlicllaDiamondTextileOverlay() {
  const rows = [
    { y: 20, h: 98, strong: false, offset: 10, size: 34, gap: 142 },
    { y: 118, h: 110, strong: true, offset: 84, size: 42, gap: 154 },
    { y: 228, h: 96, strong: false, offset: 26, size: 32, gap: 146 },
    { y: 324, h: 114, strong: true, offset: 104, size: 44, gap: 160 },
    { y: 438, h: 100, strong: false, offset: 34, size: 34, gap: 146 },
    { y: 538, h: 116, strong: true, offset: 94, size: 42, gap: 156 },
    { y: 654, h: 96, strong: false, offset: 18, size: 32, gap: 144 },
    { y: 750, h: 110, strong: true, offset: 86, size: 40, gap: 152 },
    { y: 860, h: 40, strong: false, offset: 20, size: 28, gap: 140 },
  ];

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg">
      {rows.map((row, i) => (
        <DiamondTextileRow
          key={i}
          y={row.y}
          h={row.h}
          strong={row.strong}
          offset={row.offset}
          size={row.size}
          gap={row.gap}
        />
      ))}
    </svg>
  );
}

function DiamondTextileRow({
  y,
  h,
  strong = false,
  offset = 0,
  size = 36,
  gap = 148,
}) {
  const rowBg = strong ? "rgba(255,255,255,0.026)" : "rgba(255,255,255,0.014)";

  const count = Math.ceil((1600 + gap * 2) / gap);

  return (
    <g transform={`translate(0, ${y})`}>
      <rect x="0" y="0" width="1600" height={h} fill={rowBg} />

      {Array.from({ length: count }).map((_, i) => {
        const x = -80 + offset + i * gap;
        const cy = h / 2;

        return (
          <g key={i} transform={`translate(${x}, ${cy})`}>
            <TextileDiamondMotif size={size} strong={strong} />
          </g>
        );
      })}
    </g>
  );
}

function TextileDiamondMotif({ size = 36, strong = false }) {
  const outerFill = strong
    ? "rgba(255,255,255,0.18)"
    : "rgba(255,255,255,0.13)";

  const innerFill = strong ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.08)";

  const softFill = strong ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)";

  const stitchFill = strong
    ? "rgba(255,255,255,0.11)"
    : "rgba(255,255,255,0.08)";

  const s = size;
  const mid = s * 0.52;
  const inner = s * 0.46;
  const mini = s * 0.18;
  const stitch = s * 0.12;

  return (
    <g>
      {/* rombo exterior con quiebre más textil */}
      <path
        d={`
          M 0 -${s}
          L ${mid} -${mid}
          L ${s} 0
          L ${mid} ${mid}
          L 0 ${s}
          L -${mid} ${mid}
          L -${s} 0
          L -${mid} -${mid}
          Z
        `}
        fill={outerFill}
      />

      {/* rombo interno */}
      <path
        d={`
          M 0 -${inner}
          L ${inner} 0
          L 0 ${inner}
          L -${inner} 0
          Z
        `}
        fill={innerFill}
      />

      {/* rombitos textiles en 4 lados */}
      <path
        d={`M 0 -${s + mini} L ${mini} -${s} L 0 -${s - mini} L -${mini} -${s} Z`}
        fill={softFill}
      />
      <path
        d={`M ${s + mini} 0 L ${s} ${mini} L ${s - mini} 0 L ${s} -${mini} Z`}
        fill={softFill}
      />
      <path
        d={`M 0 ${s + mini} L ${mini} ${s} L 0 ${s - mini} L -${mini} ${s} Z`}
        fill={softFill}
      />
      <path
        d={`M -${s + mini} 0 L -${s} ${mini} L -${s - mini} 0 L -${s} -${mini} Z`}
        fill={softFill}
      />

      {/* pequeñas “costuras” diagonales, sin líneas horizontales */}
      <path
        d={`
          M -${stitch * 2.2} -${stitch * 4}
          L 0 -${stitch * 1.8}
          L ${stitch * 2.2} -${stitch * 4}
          L 0 -${stitch * 6.2}
          Z
        `}
        fill={stitchFill}
      />
      <path
        d={`
          M ${stitch * 4} -${stitch * 2.2}
          L ${stitch * 1.8} 0
          L ${stitch * 4} ${stitch * 2.2}
          L ${stitch * 6.2} 0
          Z
        `}
        fill={stitchFill}
      />
      <path
        d={`
          M -${stitch * 2.2} ${stitch * 4}
          L 0 ${stitch * 1.8}
          L ${stitch * 2.2} ${stitch * 4}
          L 0 ${stitch * 6.2}
          Z
        `}
        fill={stitchFill}
      />
      <path
        d={`
          M -${stitch * 4} -${stitch * 2.2}
          L -${stitch * 1.8} 0
          L -${stitch * 4} ${stitch * 2.2}
          L -${stitch * 6.2} 0
          Z
        `}
        fill={stitchFill}
      />

      {/* acento central más suave */}
      <path
        d={`
          M 0 -${inner * 0.48}
          L ${inner * 0.48} 0
          L 0 ${inner * 0.48}
          L -${inner * 0.48} 0
          Z
        `}
        fill="rgba(255,255,255,0.07)"
      />
    </g>
  );
}
