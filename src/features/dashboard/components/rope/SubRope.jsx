import React, {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SubRopeLabel from "./SubRopeLabel";
import { buildBranchCurve } from "./rope.variants";
import {
  chooseLabelSide,
  clamp,
  curveToPath,
  getCurvePointAtLengthRatio,
  getModuleLabelTitle,
  normalizeStatus,
  tangentAngleDeg,
  wrapLabelText,
} from "./rope.utils";

function hexToRgba(hex, alpha = 1) {
  const clean = String(hex || "#000000").replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0");

  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function useBraidStamps(
  pathRef,
  { step = 9.6, trimStart = 5, trimEnd = 5, sideOffset = 1.65 } = {},
) {
  const [items, setItems] = useState([]);

  useLayoutEffect(() => {
    const pathNode = pathRef.current;
    if (!pathNode) return;

    let frame = 0;

    const build = () => {
      try {
        const total = pathNode.getTotalLength();
        const end = Math.max(trimStart, total - trimEnd);
        const nextItems = [];

        let i = 0;
        for (let d = trimStart; d <= end; d += step) {
          const p = pathNode.getPointAtLength(d);
          const prev = pathNode.getPointAtLength(Math.max(0, d - 1.4));
          const next = pathNode.getPointAtLength(Math.min(total, d + 1.4));

          const dx = next.x - prev.x;
          const dy = next.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;

          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          const nx = -dy / len;
          const ny = dx / len;

          const sign = i % 2 === 0 ? 1 : -1;
          const offset = sign * sideOffset;

          nextItems.push({
            x: p.x + nx * offset,
            y: p.y + ny * offset,
            angle,
            flip: sign,
            scaleX: i % 2 === 0 ? 1.05 : 1.0,
            scaleY: i % 2 === 0 ? 1.03 : 0.99,
            opacity: i % 2 === 0 ? 1 : 0.94,
          });

          i += 1;
        }

        setItems(nextItems);
      } catch {
        setItems([]);
      }
    };

    frame = requestAnimationFrame(build);
    return () => cancelAnimationFrame(frame);
  }, [pathRef, step, trimStart, trimEnd, sideOffset]);

  return items;
}

function TopBindKnot({ x, y, locked = false, palette }) {
  const fill = locked ? "#6F7B8C" : palette.dark;
  const stroke = locked
    ? "rgba(255,255,255,0.16)"
    : hexToRgba(palette.light, 0.72);
  const shine = locked
    ? "rgba(255,255,255,0.16)"
    : hexToRgba(palette.light, 0.86);

  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="8.8" ry="6.5" fill="rgba(0,0,0,0.15)" />
      <ellipse
        cx="0"
        cy="0"
        rx="7.1"
        ry="5.2"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.05"
      />
      <path
        d="M -4 -2.4 Q 0 -0.7 4 -2.4"
        fill="none"
        stroke={shine}
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <path
        d="M -4 2.4 Q 0 0.7 4 2.4"
        fill="none"
        stroke={locked ? "rgba(0,0,0,0.10)" : hexToRgba(palette.dark, 0.22)}
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </g>
  );
}

function TailKnot({ x, y, angle = 0, locked = false, palette }) {
  const fill = locked ? "#6F7B8C" : palette.dark;
  const stroke = locked
    ? "rgba(255,255,255,0.14)"
    : hexToRgba(palette.light, 0.68);
  const shine = locked
    ? "rgba(255,255,255,0.14)"
    : hexToRgba(palette.light, 0.8);

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx="0" cy="0" rx="7.8" ry="5.8" fill="rgba(0,0,0,0.13)" />
      <ellipse
        cx="0"
        cy="0"
        rx="6.3"
        ry="4.6"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.95"
      />
      <path
        d="M -3.6 -2 Q 0 -0.55 3.6 -2"
        fill="none"
        stroke={shine}
        strokeWidth="0.72"
        strokeLinecap="round"
      />
    </g>
  );
}

export default function SubRope({
  module,
  index,
  point,
  curveVariant,
  palette,
  defsIds,
  state,
  active = false,
  showLabel = false,
  animate = true,
  onHover,
  onLeave,
  onActivate,
}) {
  const guideRef = useRef(null);
  const uid = useId().replace(/:/g, "");

  const status = normalizeStatus(state || module?.status);
  const locked = status === "locked";

  const curve = useMemo(
    () => buildBranchCurve(point, curveVariant),
    [point, curveVariant],
  );

  const path = useMemo(() => curveToPath(curve), [curve]);

  const maskId = `subrope-mask-${uid}`;
  const braidCellId = `subrope-braid-cell-${uid}`;

  const stamps = useBraidStamps(guideRef, {
    step: 9.6,
    trimStart: 5,
    trimEnd: 5,
    sideOffset: 1.65,
  });

  const titleText = getModuleLabelTitle(module?.title, module?.sortOrder);
  const labelLines = wrapLabelText(titleText, 17, 2);

  const estimatedLabelWidth = clamp(
    Math.max(...labelLines.map((line) => line.length), 6) * 8.6 + 44,
    132,
    240,
  );

  const labelAnchor = getCurvePointAtLengthRatio(curve, 0.72);
  const labelSide = chooseLabelSide(labelAnchor.point.x, estimatedLabelWidth);

  const tailAnchor = getCurvePointAtLengthRatio(curve, 0.94);
  const tailAngle = tangentAngleDeg(tailAnchor.tangent);

  const interactive = !locked;
  const glowOn = interactive && active;

  const className =
    interactive && animate
      ? `subrope-button subrope-button--sway subrope-button--sway-${index}`
      : "";

  const tones = locked
    ? {
        patternFill: "#8692A1",
        patternStroke: "#4B5665",
        crossShadow: "rgba(46,55,69,0.34)",
        hi: "rgba(255,255,255,0.16)",
        inner: "rgba(255,255,255,0.08)",
        shadow: "rgba(18,24,33,0.12)",
        support1: "#5E6A7A",
        support2: "#8A97A8",
        support1Opacity: 0.5,
        support2Opacity: 0.18,
        topLight: "rgba(255,255,255,0.08)",
        glowSoft: "rgba(255,255,255,0)",
        glowStrong: "rgba(255,255,255,0)",
        glowLine: "rgba(255,255,255,0)",
        knotPalette: {
          dark: "#5E6A7A",
          light: "#D9E0E8",
        },
      }
    : {
        patternFill: palette.main,
        patternStroke: palette.dark,
        crossShadow: hexToRgba(palette.dark, 0.34),
        hi: hexToRgba(palette.light, 0.3),
        inner: hexToRgba(palette.dark, 0.16),
        shadow: hexToRgba(palette.dark, 0.16),
        support1: hexToRgba(palette.dark, 0.92),
        support2: hexToRgba(palette.main, 0.56),
        support1Opacity: 0.82,
        support2Opacity: 0.62,
        topLight: hexToRgba(palette.light, 0.16),
        glowSoft: hexToRgba(palette.main, 0.3),
        glowStrong: hexToRgba(palette.main, 0.52),
        glowLine: hexToRgba(palette.light, 0.55),
        knotPalette: {
          dark: palette.dark,
          light: palette.light,
        },
      };

  return (
    <g
      className={className}
      style={{
        cursor: interactive ? "pointer" : "default",
        transformOrigin: `${curve.start.x}px ${curve.start.y}px`,
        transformBox: "view-box",
        "--subrope-duration": `${6.4 + index * 0.45}s`,
        "--subrope-amp": `${0.34 + index * 0.03}deg`,
        "--subrope-lift": `${0.55 + index * 0.08}px`,
      }}
      onMouseEnter={interactive ? () => onHover?.(index) : undefined}
      onMouseLeave={interactive ? onLeave : undefined}
      onFocus={interactive ? () => onHover?.(index) : undefined}
      onBlur={interactive ? onLeave : undefined}
      onClick={interactive ? () => onActivate?.(module) : undefined}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate?.(module);
        }
      }}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={locked ? `${titleText} bloqueado` : `Abrir ${titleText}`}>
      <defs>
        <g id={braidCellId}>
          <path
            d="
              M -14.8 0
              C -12.4 -5.2, -7.2 -8.8, -0.5 -9
              C 6.2 -9.2, 11.3 -5.3, 14.6 0
              C 11.4 5.3, 6.2 9.2, -0.5 9
              C -7.2 8.8, -12.4 5.2, -14.8 0
              Z
            "
            fill={tones.patternFill}
            stroke={"#4A2812"}
            strokeWidth="1.18"
            strokeLinejoin="round"
          />

          <path
            d="
              M -9.5 5.8
              C -5.9 3.2, -1.8 0.4, 8.2 -6.3
            "
            fill="none"
            stroke={tones.crossShadow}
            strokeWidth="2.05"
            strokeLinecap="round"
          />

          <path
            d="
              M -8.7 -4.7
              C -4.8 -6.8, 0.1 -6.2, 7.9 -2.2
            "
            fill="none"
            stroke={tones.hi}
            strokeWidth="1.18"
            strokeLinecap="round"
          />

          <path
            d="
              M -10.9 -1.4
              C -4.8 -3.8, 2 -3.2, 9.8 2.5
            "
            fill="none"
            stroke={tones.inner}
            strokeWidth="0.82"
            strokeLinecap="round"
          />
        </g>

        <mask id={maskId}>
          <rect x="-120" y="-60" width="1100" height="800" fill="black" />
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      <path
        ref={guideRef}
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="1"
        pointerEvents="none"
      />

      <path
        d={path}
        fill="none"
        stroke={locked ? "rgba(18,24,33,0.12)" : hexToRgba(palette.dark, 0.16)}
        strokeWidth="24.5"
        strokeLinecap="round"
        filter={
          defsIds?.ropeShadowImperial
            ? `url(#${defsIds.ropeShadowImperial})`
            : undefined
        }
      />

      <path
        d={path}
        fill="none"
        stroke={tones.support1}
        strokeWidth="15.5"
        strokeLinecap="round"
        opacity={locked ? 0.5 : 0.72}
      />

      <path
        d={path}
        fill="none"
        stroke={tones.support2}
        strokeWidth="8.9"
        strokeLinecap="round"
        opacity={locked ? 0.18 : 0.52}
      />

      <g mask={`url(#${maskId})`}>
        {stamps.map((item, i) => (
          <use
            key={i}
            href={`#${braidCellId}`}
            transform={`
              translate(${item.x} ${item.y})
              rotate(${item.angle + item.flip * 162})
              scale(${item.scaleX} ${item.flip * item.scaleY})
            `}
            opacity={item.opacity}
          />
        ))}
      </g>

      <path
        d={path}
        fill="none"
        stroke={
          locked ? "rgba(255,255,255,0.08)" : hexToRgba(palette.light, 0.16)
        }
        strokeWidth="0.9"
        strokeLinecap="round"
        transform="translate(0,-0.7)"
      />

      {glowOn && (
        <path
          d={path}
          fill="none"
          stroke={tones.glow}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.22"
          filter={defsIds?.ropeGlow ? `url(#${defsIds.ropeGlow})` : undefined}
        />
      )}

      <TopBindKnot
        x={curve.start.x}
        y={curve.start.y + 1}
        locked={locked}
        palette={tones.knotPalette}
      />

      <TailKnot
        x={tailAnchor.point.x}
        y={tailAnchor.point.y}
        angle={tailAngle}
        locked={locked}
        palette={tones.knotPalette}
      />

      {showLabel && !locked && (
        <SubRopeLabel
          x={labelAnchor.point.x}
          y={labelAnchor.point.y}
          lines={labelLines}
          palette={palette}
          locked={locked}
          active={glowOn}
          side={labelSide}
          defsIds={defsIds}
        />
      )}
    </g>
  );
}
