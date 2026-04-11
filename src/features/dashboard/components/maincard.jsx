import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FinalModuleUnlockPanel from "./FinalModuleUnlockPanel";

function normalizeStatus(status) {
  if (status === "completed") return "completed";
  if (status === "unlocked") return "unlocked";
  return "locked";
}

function buildModuleRoute(sortOrder) {
  return `/modules/m${String(sortOrder).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getModuleLabelTitle(title, sortOrder) {
  if (!title) return `Módulo ${sortOrder}`;

  const cleaned = String(title)
    .replace(/^m[oó]dulo\s*\d+\s*:?\s*/i, "")
    .trim();

  return cleaned || `Módulo ${sortOrder}`;
}

function wrapLabelText(text, maxCharsPerLine = 18, maxLines = 2) {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];

  const lines = [];
  let current = "";

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;

    if (lines.length === maxLines - 1) {
      const rest = [current, ...words.slice(i + 1)].join(" ");
      current = rest;
      break;
    }
  }

  if (current) lines.push(current);

  return lines.slice(0, maxLines).map((line, index) => {
    if (index === maxLines - 1 && line.length > maxCharsPerLine + 5) {
      return `${line.slice(0, maxCharsPerLine + 1).trimEnd()}…`;
    }
    return line;
  });
}

function getModuleSegments(module) {
  const state = normalizeStatus(module?.status);
  const activities = Array.isArray(module?.activities)
    ? module.activities.slice(0, 3)
    : [];

  if (activities.length) {
    return activities.map((activity) => {
      const s = normalizeStatus(activity?.status);
      if (s === "completed") return 1;
      if (s === "unlocked") return 0.42;
      return 0;
    });
  }

  if (state === "locked") return [0, 0, 0];
  if (state === "completed") return [1, 1, 1];

  const total = Math.max(1, Number(module?.totalActivities) || 3);
  const completed = clamp(Number(module?.completedActivities) || 0, 0, total);

  return [0, 1, 2].map((index) => {
    if (index < completed) return 1;
    if (index === completed && state === "unlocked") return 0.42;
    return 0;
  });
}

function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

function cubicBezierTangent(p0, p1, p2, p3, t) {
  const mt = 1 - t;

  return {
    x:
      3 * mt * mt * (p1.x - p0.x) +
      6 * mt * t * (p2.x - p1.x) +
      3 * t * t * (p3.x - p2.x),
    y:
      3 * mt * mt * (p1.y - p0.y) +
      6 * mt * t * (p2.y - p1.y) +
      3 * t * t * (p3.y - p2.y),
  };
}

function tangentAngleDeg(tangent) {
  return (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
}

function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function getCurvePointAtLengthRatio(curve, ratio, samples = 180) {
  const { start, c1, c2, end } = curve;

  const points = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    points.push({
      t,
      point: cubicBezierPoint(start, c1, c2, end, t),
    });
  }

  let totalLength = 0;
  const cumulative = [0];

  for (let i = 1; i < points.length; i += 1) {
    totalLength += distance(points[i - 1].point, points[i].point);
    cumulative.push(totalLength);
  }

  const target = totalLength * clamp(ratio, 0, 1);

  for (let i = 1; i < cumulative.length; i += 1) {
    const prevLen = cumulative[i - 1];
    const nextLen = cumulative[i];

    if (target <= nextLen) {
      const localRatio =
        nextLen === prevLen ? 0 : (target - prevLen) / (nextLen - prevLen);

      const prev = points[i - 1];
      const next = points[i];
      const t = prev.t + (next.t - prev.t) * localRatio;

      return {
        t,
        point: cubicBezierPoint(start, c1, c2, end, t),
        tangent: cubicBezierTangent(start, c1, c2, end, t),
      };
    }
  }

  return {
    t: 1,
    point: cubicBezierPoint(start, c1, c2, end, 1),
    tangent: cubicBezierTangent(start, c1, c2, end, 1),
  };
}

function chooseLabelSide(pointX, labelWidth, viewWidth = 820) {
  const margin = 16;
  const leftCenterX = pointX - 108;
  const rightCenterX = pointX + 108;

  const leftFits = leftCenterX - labelWidth / 2 >= margin;
  const rightFits = rightCenterX + labelWidth / 2 <= viewWidth - margin;

  if (rightFits && !leftFits) return "right";
  if (leftFits && !rightFits) return "left";
  if (leftFits && rightFits) return pointX < viewWidth / 2 ? "right" : "left";

  return pointX < viewWidth / 2 ? "right" : "left";
}

const BRANCH_COLORS = [
  {
    main: "#69E2B5",
    dark: "#1F7F67",
    light: "#DFFFF3",
    glow: "rgba(105, 226, 181, 0.34)",
    labelBg: "rgba(16, 31, 28, 0.95)",
  },
  {
    main: "#FF7483",
    dark: "#B53C50",
    light: "#FFE3E8",
    glow: "rgba(255, 116, 131, 0.32)",
    labelBg: "rgba(40, 21, 27, 0.95)",
  },
  {
    main: "#6B8FFF",
    dark: "#3555C9",
    light: "#E3EAFF",
    glow: "rgba(107, 143, 255, 0.34)",
    labelBg: "rgba(19, 25, 43, 0.95)",
  },
  {
    main: "#FFB15D",
    dark: "#C76F1D",
    light: "#FFF0DF",
    glow: "rgba(255, 177, 93, 0.34)",
    labelBg: "rgba(46, 29, 14, 0.95)",
  },
  {
    main: "#B092FF",
    dark: "#6E50D6",
    light: "#EEE7FF",
    glow: "rgba(176, 146, 255, 0.34)",
    labelBg: "rgba(27, 20, 43, 0.95)",
  },
];

const ANCHOR_POINTS = [
  { x: 126, y: 88 },
  { x: 272, y: 110 },
  { x: 416, y: 122 },
  { x: 560, y: 108 },
  { x: 700, y: 84 },
];

const MAIN_ROPE_PATH = `
  M 40 76
  C 104 64, 176 74, 248 100
  C 328 129, 404 132, 480 118
  C 568 102, 646 79, 780 64
`;

function getBranchCurve(point, index) {
  const presets = [
    {
      start: { x: point.x, y: point.y - 4 },
      c1: { x: point.x + 18, y: point.y + 24 },
      c2: { x: point.x - 92, y: point.y + 152 },
      end: { x: point.x - 92, y: point.y + 298 },
    },
    {
      start: { x: point.x, y: point.y - 4 },
      c1: { x: point.x + 16, y: point.y + 28 },
      c2: { x: point.x - 62, y: point.y + 156 },
      end: { x: point.x - 64, y: point.y + 292 },
    },
    {
      start: { x: point.x, y: point.y - 4 },
      c1: { x: point.x + 8, y: point.y + 30 },
      c2: { x: point.x - 10, y: point.y + 166 },
      end: { x: point.x - 4, y: point.y + 294 },
    },
    {
      start: { x: point.x, y: point.y - 4 },
      c1: { x: point.x - 12, y: point.y + 28 },
      c2: { x: point.x + 14, y: point.y + 160 },
      end: { x: point.x + 26, y: point.y + 292 },
    },
    {
      start: { x: point.x, y: point.y - 4 },
      c1: { x: point.x - 24, y: point.y + 24 },
      c2: { x: point.x + 42, y: point.y + 154 },
      end: { x: point.x + 64, y: point.y + 298 },
    },
  ];

  return presets[index] || presets[0];
}

function curveToPath(curve) {
  const { start, c1, c2, end } = curve;
  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
}

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

function RopeStrokeBase({
  d,
  width = 16,
  muted = false,
  glow = false,
  braidMaskId,
}) {
  const baseOuter = muted ? "#5F6D82" : "#6E4A2E";
  const baseMid = muted ? "#94A3B8" : "#B97843";
  const baseHighlight = muted ? "rgba(255,255,255,0.42)" : "#F3D8B4";

  return (
    <g opacity={muted ? 0.74 : 1}>
      <path
        d={d}
        fill="none"
        stroke="rgba(18,9,4,0.18)"
        strokeWidth={width + 9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={baseOuter}
        strokeWidth={width + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={baseMid}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={baseHighlight}
        strokeWidth={Math.max(1.5, width * 0.17)}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.94"
      />

      <path
        d={d}
        fill="none"
        stroke="rgba(255,246,228,0.24)"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 8"
        opacity={muted ? 0.18 : 0.44}
      />

      {braidMaskId && (
        <g mask={`url(#${braidMaskId})`} opacity={muted ? 0.18 : 0.5}>
          {Array.from({ length: 18 }).map((_, i) => {
            const x = -220 + i * 52;
            return (
              <g key={`branch-braid-a-${i}`}>
                <line
                  x1={x}
                  y1={-40}
                  x2={x + 180}
                  y2={560}
                  stroke="rgba(109,61,29,0.20)"
                  strokeWidth="5.2"
                  strokeLinecap="round"
                />
                <line
                  x1={x + 18}
                  y1={-48}
                  x2={x + 198}
                  y2={552}
                  stroke="rgba(255,225,185,0.14)"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {Array.from({ length: 18 }).map((_, i) => {
            const x = -194 + i * 52;
            return (
              <g key={`branch-braid-b-${i}`}>
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

      {glow && (
        <path
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={width + 16}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ropeGlow)"
        />
      )}
    </g>
  );
}

function SeparatorKnot({ x, y, angle, palette, locked, active }) {
  const fill = locked ? "#738196" : "#8E5A32";
  const stroke = locked ? "rgba(255,255,255,0.18)" : "#D9A96A";
  const shine = locked ? "rgba(255,255,255,0.18)" : "rgba(255,232,197,0.9)";

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx="0" cy="0" rx="10.5" ry="8" fill="rgba(0,0,0,0.15)" />
      <ellipse
        cx="0"
        cy="0"
        rx="9"
        ry="6.3"
        fill={fill}
        stroke={stroke}
        strokeWidth={active ? "1.7" : "1.1"}
      />
      <path
        d="M -5.5 -4.5 Q 0 -1.3 5.5 -4.5"
        fill="none"
        stroke={shine}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M -5.5 4.5 Q 0 1.3 5.5 4.5"
        fill="none"
        stroke="rgba(90,49,24,0.18)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {!locked && (
        <circle
          cx="0"
          cy="0"
          r={active ? "1.7" : "1.35"}
          fill={palette.main}
          opacity={active ? 0.98 : 0.72}
        />
      )}
    </g>
  );
}

function RopeProgressSegments({
  d,
  curve,
  segments,
  palette,
  width = 10,
  active = false,
  locked = false,
}) {
  const tracks = [{ start: 61, length: 104 }];

  const gapCenters = [100];
  return (
    <g>
      {tracks.map((track, index) => {
        const fillRatio = clamp(segments?.[index] ?? 0, 0, 1);
        const visibleLength = track.length * fillRatio;

        return (
          <g key={index}>
            <path
              d={d}
              fill="none"
              stroke="rgba(255,241,220,0.18)"
              strokeWidth={width + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="100"
              strokeDasharray={`${track.length} ${100 - track.length}`}
              strokeDashoffset={-track.start}
              opacity="0.56"
            />

            {fillRatio > 0 && (
              <>
                <path
                  d={d}
                  fill="none"
                  stroke={palette.glow}
                  strokeWidth={active ? width + 11 : width + 7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  strokeDasharray={`${visibleLength} ${100 - visibleLength}`}
                  strokeDashoffset={-track.start}
                  opacity={active ? 1 : 0.72}
                  filter="url(#ropeGlow)"
                />
                <path
                  d={d}
                  fill="none"
                  stroke={palette.dark}
                  strokeWidth={width + 2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  strokeDasharray={`${visibleLength} ${100 - visibleLength}`}
                  strokeDashoffset={-track.start}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={palette.main}
                  strokeWidth={width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  strokeDasharray={`${visibleLength} ${100 - visibleLength}`}
                  strokeDashoffset={-track.start}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={palette.light}
                  strokeWidth={Math.max(1.2, width * 0.16)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  strokeDasharray={`${visibleLength} ${100 - visibleLength}`}
                  strokeDashoffset={-track.start}
                  opacity="0.96"
                />
              </>
            )}
          </g>
        );
      })}

      {gapCenters.map((ratio, index) => {
        const hit = getCurvePointAtLengthRatio(curve, ratio);
        const angle = tangentAngleDeg(hit.tangent);

        return (
          <SeparatorKnot
            key={index}
            x={hit.point.x}
            y={hit.point.y}
            angle={angle}
            palette={palette}
            locked={locked}
            active={active}
          />
        );
      })}
    </g>
  );
}

function SideBranchLabel({
  x,
  y,
  lines,
  palette,
  locked,
  active,
  side = "left",
}) {
  const maxLineLength = Math.max(...lines.map((line) => line.length), 6);
  const width = clamp(maxLineLength * 8.6 + 44, 132, 240);
  const height = lines.length === 1 ? 38 : 56;

  const desiredCenterX = x + (side === "left" ? -112 : 112);
  const desiredCenterY = y - 4;

  const boxX = clamp(desiredCenterX - width / 2, 10, 810 - width);
  const boxY = clamp(desiredCenterY - height / 2, 14, 470 - height - 12);

  const ropeEdgeX = side === "left" ? x - 12 : x + 12;
  const labelEdgeX = side === "left" ? boxX + width : boxX;
  const labelEdgeY = boxY + height / 2;

  return (
    <g className="side-branch-label">
      <path
        d={`M ${ropeEdgeX} ${y} Q ${(ropeEdgeX + labelEdgeX) / 2} ${y - 10} ${labelEdgeX} ${labelEdgeY}`}
        fill="none"
        stroke={locked ? "rgba(205,214,230,0.18)" : palette.main}
        strokeWidth={active ? "2.15" : "1.35"}
        strokeLinecap="round"
        opacity={active ? 0.95 : 0.72}
      />

      <rect
        x={boxX}
        y={boxY}
        width={width}
        height={height}
        rx="17"
        fill={locked ? "rgba(53,61,76,0.94)" : palette.labelBg}
        stroke={locked ? "rgba(205,214,230,0.20)" : palette.main}
        strokeWidth={active ? "2.25" : "1.2"}
        filter={active ? "url(#labelGlowStrong)" : "url(#labelGlow)"}
      />

      {lines.map((line, index) => {
        const firstLineY = lines.length === 1 ? boxY + 24 : boxY + 22;
        const lineY = firstLineY + index * 16;

        return (
          <text
            key={`${line}-${index}`}
            x={boxX + width / 2}
            y={lineY}
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fill={locked ? "rgba(233,238,248,0.82)" : "#F8FAFC"}
            style={{ userSelect: "none", letterSpacing: "0.2px" }}>
            {line}
          </text>
        );
      })}
    </g>
  );
}

function BranchButton({
  module,
  index,
  point,
  hovered,
  anyHovered,
  isCurrentTarget,
  onHover,
  onLeave,
  onActivate,
}) {
  const palette = BRANCH_COLORS[index % BRANCH_COLORS.length];
  const status = normalizeStatus(module?.status);
  const locked = status === "locked";
  const segments = getModuleSegments(module);

  const curve = getBranchCurve(point, index);
  const path = curveToPath(curve);

  const maskId = `branch-rope-mask-${module?.moduleId || "m"}-${module?.sortOrder || index}-${index}`;

  const titleText = getModuleLabelTitle(module?.title, module?.sortOrder);
  const labelLines = wrapLabelText(titleText, 17, 2);
  const estimatedLabelWidth = clamp(
    Math.max(...labelLines.map((line) => line.length), 6) * 8.6 + 44,
    132,
    240,
  );

  const isActive = hovered && !locked;
  const showSideLabel =
    !locked && (isActive || (isCurrentTarget && !anyHovered));

  const labelAnchor = getCurvePointAtLengthRatio(curve, 0.73);
  const labelSide = chooseLabelSide(labelAnchor.point.x, estimatedLabelWidth);

  const className = !locked
    ? `subrope-button subrope-button--sway subrope-button--sway-${index}`
    : "";

  return (
    <g
      className={className}
      style={{
        cursor: locked ? "default" : "pointer",
        transformOrigin: `${curve.start.x}px ${curve.start.y}px`,
        transformBox: "view-box",
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(index)}
      onBlur={onLeave}
      onClick={() => {
        if (!locked) onActivate(module);
      }}
      onKeyDown={(e) => {
        if (locked) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(module);
        }
      }}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={locked ? `${titleText} bloqueado` : `Abrir ${titleText}`}>
      <defs>
        <mask id={maskId}>
          <rect x="-200" y="-100" width="1300" height="800" fill="black" />
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="46"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <RopeStrokeBase
        d={path}
        width={isActive ? 16 : 15}
        muted={locked}
        glow={isActive || (isCurrentTarget && !anyHovered)}
        braidMaskId={maskId}
      />

      <RopeProgressSegments
        d={path}
        curve={curve}
        segments={segments}
        palette={palette}
        width={isActive ? 13 : 12}
        active={isActive || (isCurrentTarget && !anyHovered)}
        locked={locked}
      />

      {showSideLabel && (
        <SideBranchLabel
          x={labelAnchor.point.x}
          y={labelAnchor.point.y}
          lines={labelLines}
          palette={palette}
          locked={locked}
          active={isActive || (isCurrentTarget && !anyHovered)}
          side={labelSide}
        />
      )}
    </g>
  );
}

function MainRopeOverlay() {
  return (
    <>
      <path
        d={MAIN_ROPE_PATH}
        fill="none"
        stroke="rgba(24,11,5,0.22)"
        strokeWidth="42"
        strokeLinecap="round"
        filter="url(#ropeShadowImperial)"
      />

      <path
        d={MAIN_ROPE_PATH}
        fill="none"
        stroke="url(#ropeBaseImperial)"
        strokeWidth="34"
        strokeLinecap="round"
      />

      <path
        d={MAIN_ROPE_PATH}
        fill="none"
        stroke="url(#ropeInnerImperial)"
        strokeWidth="22"
        strokeLinecap="round"
      />

      <path
        d={MAIN_ROPE_PATH}
        fill="none"
        stroke="rgba(255,247,233,0.62)"
        strokeWidth="5.2"
        strokeLinecap="round"
        transform="translate(0,-2.4)"
      />

      <path
        d={MAIN_ROPE_PATH}
        fill="none"
        stroke="rgba(82,45,21,0.42)"
        strokeWidth="5.6"
        strokeLinecap="round"
        transform="translate(0,3.2)"
      />

      <g mask="url(#ropeMaskImperial)" opacity="0.8">
        {Array.from({ length: 18 }).map((_, i) => {
          const x = -70 + i * 52;
          return (
            <g key={`braid-a-${i}`}>
              <line
                x1={x}
                y1={30}
                x2={x + 78}
                y2={138}
                stroke="rgba(108,60,30,0.34)"
                strokeWidth="8.2"
                strokeLinecap="round"
              />
              <line
                x1={x + 18}
                y1={28}
                x2={x + 96}
                y2={136}
                stroke="rgba(255,224,182,0.18)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {Array.from({ length: 18 }).map((_, i) => {
          const x = -46 + i * 52;
          return (
            <g key={`braid-b-${i}`}>
              <line
                x1={x + 80}
                y1={32}
                x2={x}
                y2={140}
                stroke="rgba(125,73,38,0.14)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>

      <path
        d={MAIN_ROPE_PATH}
        fill="none"
        stroke="url(#imperialAccent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.62"
        filter="url(#ropeGlowImperial)"
      />

      {[
        [180, 84],
        [360, 112],
        [590, 98],
        [705, 82],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="5.8" fill="#9A6033" />
          <circle cx={cx} cy={cy} r="2.1" fill="#F4D3A3" />
        </g>
      ))}
    </>
  );
}

export default function ModulesRope({
  modules = [],
  moduleImages = {},
  className = "",
}) {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const visibleModules = useMemo(() => {
    return [...modules]
      .sort((a, b) => Number(a?.sortOrder) - Number(b?.sortOrder))
      .slice(0, 5);
  }, [modules]);

  const currentUnlockedSortOrder = useMemo(() => {
    const unlockedModules = visibleModules.filter(
      (module) => normalizeStatus(module?.status) === "unlocked",
    );

    if (!unlockedModules.length) return null;

    return unlockedModules.reduce((max, module) => {
      return Number(module?.sortOrder) > Number(max?.sortOrder) ? module : max;
    }).sortOrder;
  }, [visibleModules]);

  return (
    <section
      className={["w-full min-w-0 pb-1", className].filter(Boolean).join(" ")}>
      <div
        className="
          grid w-full min-w-0 grid-cols-1 items-start gap-4
          xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,420px)] xl:gap-6
        ">
        <div className="min-w-0">
          <div className="w-full overflow-x-auto overflow-y-visible pb-1">
            <svg
              viewBox="0 0 820 470"
              preserveAspectRatio="xMidYMin meet"
              className="mx-auto block h-auto w-full min-w-[760px] max-w-[820px] overflow-visible"
              role="img"
              aria-label="Mapa de subcuerdas de módulos">
              <defs>
                <linearGradient
                  id="ropeBaseImperial"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%">
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

                <linearGradient
                  id="imperialAccent"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="20%" stopColor="rgba(255,255,255,0.05)" />
                  <stop offset="50%" stopColor="#B092FF" />
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

                <filter
                  id="ropeGlow"
                  x="-140%"
                  y="-140%"
                  width="380%"
                  height="380%">
                  <feGaussianBlur stdDeviation="6.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter
                  id="labelGlow"
                  x="-80%"
                  y="-120%"
                  width="260%"
                  height="320%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter
                  id="labelGlowStrong"
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

                <mask id="ropeMaskImperial">
                  <rect width="820" height="470" fill="black" />
                  <path
                    d={MAIN_ROPE_PATH}
                    fill="none"
                    stroke="white"
                    strokeWidth="34"
                    strokeLinecap="round"
                  />
                </mask>
              </defs>

              <style>
                {`
                  .subrope-button {
                    transform-box: view-box;
                    transition:
                      transform 220ms cubic-bezier(.22,1,.36,1),
                      filter 220ms ease,
                      opacity 220ms ease;
                    will-change: transform, filter;
                  }

                  .subrope-button--sway {
                    animation: subropeSway 4.8s ease-in-out infinite;
                  }

                  .subrope-button--sway-0 { animation-delay: 0s; }
                  .subrope-button--sway-1 { animation-delay: .6s; }
                  .subrope-button--sway-2 { animation-delay: 1.1s; }
                  .subrope-button--sway-3 { animation-delay: 1.7s; }
                  .subrope-button--sway-4 { animation-delay: 2.2s; }

                  .subrope-button:hover,
                  .subrope-button:focus-visible {
                    transform: translateY(-4px) scale(1.045);
                    filter: brightness(1.1) saturate(1.1);
                    animation-play-state: paused;
                  }

                  .subrope-button:focus {
                    outline: none;
                  }

                  @keyframes subropeSway {
                    0%   { transform: rotate(0deg) translateY(0); }
                    25%  { transform: rotate(0.55deg) translateY(-0.5px); }
                    50%  { transform: rotate(0deg) translateY(0); }
                    75%  { transform: rotate(-0.55deg) translateY(0.5px); }
                    100% { transform: rotate(0deg) translateY(0); }
                  }

                  @media (prefers-reduced-motion: reduce) {
                    .subrope-button,
                    .subrope-button--sway {
                      animation: none !important;
                      transition: none !important;
                    }
                  }
                `}
              </style>

              <g transform="translate(16 36)">
                <rect
                  x="0"
                  y="0"
                  width="48"
                  height="36"
                  rx="12"
                  fill="#6C3510"
                />
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="28"
                  rx="10"
                  fill="#9A5320"
                />
              </g>

              <g transform="translate(756 28)">
                <rect
                  x="0"
                  y="0"
                  width="48"
                  height="36"
                  rx="12"
                  fill="#6C3510"
                />
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="28"
                  rx="10"
                  fill="#9A5320"
                />
              </g>

              {visibleModules.map((module, index) => (
                <BranchButton
                  key={module?.moduleId || index}
                  module={module}
                  index={index}
                  point={ANCHOR_POINTS[index]}
                  hovered={hoveredIndex === index}
                  anyHovered={hoveredIndex !== null}
                  isCurrentTarget={
                    Number(module?.sortOrder) ===
                    Number(currentUnlockedSortOrder)
                  }
                  onHover={setHoveredIndex}
                  onLeave={() => setHoveredIndex(null)}
                  onActivate={(selectedModule) =>
                    navigate(buildModuleRoute(selectedModule?.sortOrder))
                  }
                />
              ))}

              <MainRopeOverlay />

              <ImperialPendant x={64} y={88} side="left" themeHex="#B092FF" />
              <ImperialPendant x={756} y={76} side="right" themeHex="#B092FF" />
            </svg>
          </div>
        </div>

        <div className="min-w-0 pr-10 xl:pt-3">
          <div className="mx-auto max-w-[530px]">
            <FinalModuleUnlockPanel modules={modules || []} />
          </div>
        </div>
      </div>
    </section>
  );
}
