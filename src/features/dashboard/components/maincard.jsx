import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import nudoImg from "@/assets/modules/nudo.png";
import FinalModuleUnlockPanel from "./FinalModuleUnlockPanel";
function normalizeStatus(status) {
  if (status === "completed") return "completed";
  if (status === "unlocked") return "unlocked";
  return "locked";
}

function buildModuleRoute(sortOrder) {
  return `/modules/m${String(sortOrder).padStart(2, "0")}`;
}

const BRANCH_COLORS = [
  {
    main: "#6BE3B7",
    dark: "#1F7F67",
    light: "#E0FFF3",
    glow: "rgba(107, 227, 183, 0.34)",
  },
  {
    main: "#FF6D78",
    dark: "#B4374A",
    light: "#FFE1E5",
    glow: "rgba(255, 109, 120, 0.34)",
  },
  {
    main: "#6487FF",
    dark: "#3050CC",
    light: "#E0E7FF",
    glow: "rgba(100, 135, 255, 0.34)",
  },
  {
    main: "#FFA24A",
    dark: "#C96B14",
    light: "#FFE8D2",
    glow: "rgba(255, 162, 74, 0.34)",
  },
  {
    main: "#A182FF",
    dark: "#6849D7",
    light: "#EEE7FF",
    glow: "rgba(161, 130, 255, 0.34)",
  },
];
const MODULE_POINTS = [
  { x: 132, y: 96 },
  { x: 274, y: 134 },
  { x: 416, y: 142 },
  { x: 560, y: 128 },
  { x: 702, y: 100 },
];

const MAIN_ROPE_PATH = `
  M 54 70
  C 138 92, 220 123, 274 134
  C 330 145, 374 146, 416 142
  C 470 136, 516 126, 560 128
  C 624 128, 670 110, 770 82
`;

function getModulePoints() {
  return MODULE_POINTS;
}

function getMainRopePath() {
  return MAIN_ROPE_PATH;
}

function getBranchCurve(x, y, variant = 0) {
  const presets = [
    {
      start: { x, y: y + 18 },
      c1: { x: x + 16, y: y + 82 },
      c2: { x: x - 76, y: y + 224 },
      end: { x: x - 104, y: y + 334 },
    },
    {
      start: { x, y: y + 18 },
      c1: { x: x + 10, y: y + 80 },
      c2: { x: x - 62, y: y + 220 },
      end: { x: x - 84, y: y + 328 },
    },
    {
      start: { x, y: y + 18 },
      c1: { x: x + 4, y: y + 79 },
      c2: { x: x - 48, y: y + 216 },
      end: { x: x - 62, y: y + 324 },
    },
    {
      start: { x, y: y + 18 },
      c1: { x: x - 10, y: y + 81 },
      c2: { x: x - 56, y: y + 220 },
      end: { x: x - 70, y: y + 328 },
    },
    {
      start: { x, y: y + 18 },
      c1: { x: x - 18, y: y + 84 },
      c2: { x: x - 28, y: y + 224 },
      end: { x: x - 6, y: y + 332 },
    },
  ];

  return presets[variant] || presets[0];
}

function curveToPath(curve) {
  const { start, c1, c2, end } = curve;
  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
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

function getActivityPointsFromCurve(curve) {
  const { start, c1, c2, end } = curve;
  return [0.23, 0.51, 0.79].map((t) => cubicBezierPoint(start, c1, c2, end, t));
}

function RopeStroke({
  d,
  palette,
  width = 18,
  opacity = 1,
  locked = false,
  type = "branch",
}) {
  const isMain = type === "main";

  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={isMain ? "rgba(0,0,0,0.34)" : "rgba(0,0,0,0.26)"}
        strokeWidth={width + (isMain ? 15 : 9)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={isMain ? "#2F1200" : locked ? "#59647A" : palette.dark}
        strokeWidth={width + (isMain ? 9 : 4)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={isMain ? "#82410F" : locked ? "#A9B6CD" : palette.main}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={d}
        fill="none"
        stroke={
          isMain ? "#F4BF7E" : locked ? "rgba(255,255,255,0.48)" : palette.light
        }
        strokeWidth={Math.max(1.6, width * 0.16)}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />

      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={Math.max(1, width * 0.06)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isMain ? "2 12" : "2 10"}
        opacity={locked ? 0.55 : 0.92}
      />
    </g>
  );
}

function ActivityBead({ x, y, palette, status }) {
  const state = normalizeStatus(status);
  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  if (isLocked) {
    return (
      <g opacity={0.95}>
        <circle
          cx={x}
          cy={y}
          r="24"
          fill={palette.glow}
          stroke={palette.main}
          strokeWidth="1.4"
        />

        <circle cx={x} cy={y} r="19.2" fill={palette.light} />

        <circle
          cx={x}
          cy={y}
          r="12.2"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.9"
        />

        <ellipse
          cx={x - 3.6}
          cy={y - 4.2}
          rx="3.6"
          ry="2.8"
          fill="rgba(255,255,255,0.28)"
        />

        <circle
          cx={x}
          cy={y}
          r="16"
          fill="none"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="1"
        />
      </g>
    );
  }
  return (
    <g>
      <circle cx={x} cy={y} r="28" fill={"none"} />

      <image
        href={nudoImg}
        x={x - 40}
        y={y - 40}
        width="80"
        height="80"
        preserveAspectRatio="xMidYMid meet"
        opacity={isCompleted ? 1 : 0.5}
      />

      {isCompleted && (
        <circle
          cx={x}
          cy={y}
          r="15"
          fill="none"
          stroke={palette.main}
          strokeWidth="1.4"
        />
      )}
    </g>
  );
}

function CurrentMarker({ x, y, palette }) {
  return (
    <g className="current-marker">
      <circle
        cx={x}
        cy={y}
        r="44"
        fill="none"
        stroke={palette.light}
        strokeWidth="1.8"
        opacity="0.75"
      />
      <circle
        cx={x}
        cy={y}
        r="50"
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1.2"
        strokeDasharray="6 10"
        opacity="0.9"
      />

      <g className="current-marker__ping">
        <circle
          cx={x}
          cy={y - 48}
          r="7"
          fill={palette.main}
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="2"
          filter="url(#ropeGlow)"
        />
        <circle
          cx={x}
          cy={y - 48}
          r="14"
          fill="none"
          stroke={palette.light}
          strokeWidth="1.6"
          opacity="0.7"
        />
      </g>
    </g>
  );
}

function ModuleNode({
  module,
  x,
  y,
  imageSrc,
  palette,
  isCurrentTarget = false,
}) {
  const navigate = useNavigate();
  const state = normalizeStatus(module.status);
  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const route = buildModuleRoute(module.sortOrder);
  const clipId = `clip-module-${module.sortOrder}`;

  const groupClassName = !isLocked ? "module-node--interactive" : "";

  return (
    <g
      className={groupClassName}
      style={{ cursor: isLocked ? "default" : "pointer" }}
      onClick={() => {
        if (!isLocked) navigate(route);
      }}>
      {isCurrentTarget && !isLocked && (
        <CurrentMarker x={x} y={y} palette={palette} />
      )}

      {!isLocked && (
        <circle
          cx={x}
          cy={y}
          r={isCurrentTarget ? "43" : "40"}
          fill={palette.glow}
          filter={isCurrentTarget ? "url(#ropeGlowStrong)" : "url(#ropeGlow)"}
          opacity={isCurrentTarget ? 1 : 0.85}
        />
      )}

      <circle
        cx={x}
        cy={y}
        r="33"
        fill={isLocked ? "#202736" : "#121924"}
        stroke={isLocked ? "rgba(210,221,243,0.28)" : palette.light}
        strokeWidth={isCurrentTarget ? "3.6" : "3.1"}
      />

      <circle
        cx={x}
        cy={y}
        r="27"
        fill={isLocked ? "#68748E" : palette.dark}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.8"
      />

      <defs>
        <clipPath id={clipId}>
          <circle cx={x} cy={y} r="20.8" />
        </clipPath>
      </defs>

      {imageSrc ? (
        <image
          href={imageSrc}
          x={x - 20.8}
          y={y - 20.8}
          width="41.6"
          height="41.6"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
          opacity={isLocked ? 0.8 : 1}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r="20.8"
          fill={isLocked ? "#C1CAE0" : palette.main}
        />
      )}

      <circle
        cx={x}
        cy={y}
        r="20.8"
        fill="none"
        stroke={isLocked ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.18)"}
        strokeWidth="2"
      />

      <ellipse
        cx={x - 7}
        cy={y - 8}
        rx="5.6"
        ry="4.3"
        fill="rgba(255,255,255,0.4)"
        opacity={isLocked ? 0.32 : 0.94}
      />

      {!isLocked && (
        <path
          d={`M ${x - 18} ${y + 17} Q ${x} ${y + 26} ${x + 18} ${y + 17}`}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.2"
          fill="none"
        />
      )}

      {isCompleted && (
        <>
          <circle
            cx={x}
            cy={y}
            r="37.5"
            fill="none"
            stroke="rgba(255,255,255,0.72)"
            strokeWidth="1.7"
          />
          <path
            d={`M ${x - 8} ${y + 1} L ${x - 2} ${y + 8} L ${x + 10} ${y - 7}`}
            stroke="white"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </g>
  );
}

function BranchGroup({ module, index, imageSrc, point, isCurrentTarget }) {
  const palette = BRANCH_COLORS[index % BRANCH_COLORS.length];
  const state = normalizeStatus(module.status);
  const lockedBranch = state === "locked";

  const curve = getBranchCurve(point.x, point.y, index);
  const branchPath = curveToPath(curve);
  const activityPoints = getActivityPointsFromCurve(curve);

  return (
    <g>
      <RopeStroke
        d={branchPath}
        palette={palette}
        width={12}
        opacity={lockedBranch ? 0.94 : 1}
        locked={lockedBranch}
        type="branch"
      />

      {(module.activities || []).slice(0, 3).map((activity, idx) => {
        const p = activityPoints[idx];
        if (!p) return null;

        return (
          <ActivityBead
            key={activity.activityId || idx}
            x={p.x}
            y={p.y}
            palette={palette}
            status={activity.status}
          />
        );
      })}

      <ModuleNode
        module={module}
        x={point.x}
        y={point.y}
        imageSrc={imageSrc}
        palette={palette}
        isCurrentTarget={isCurrentTarget}
      />
    </g>
  );
}

export default function ModulesRope({
  modules = [],
  moduleImages = {},
  className = "",
}) {
  const visibleModules = useMemo(() => {
    return [...modules]
      .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
      .slice(0, 5);
  }, [modules]);

  const currentUnlockedSortOrder = useMemo(() => {
    const unlockedModules = visibleModules.filter(
      (module) => normalizeStatus(module.status) === "unlocked",
    );

    if (!unlockedModules.length) return null;

    return unlockedModules.reduce((max, module) => {
      return Number(module.sortOrder) > Number(max.sortOrder) ? module : max;
    }).sortOrder;
  }, [visibleModules]);

  return (
    <section
      className={["w-full min-w-0 pb-0.5}", className]
        .filter(Boolean)
        .join(" ")}>
      <div
        className="
          grid w-full min-w-0 grid-cols-1 items-start
          gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,420px)] xl:gap-6
        ">
        <div className="min-w-0">
          <div className="w-full overflow-x-auto overflow-y-visible pb-1">
            <svg
              viewBox="0 0 820 470"
              preserveAspectRatio="xMidYMin meet"
              className="
  mx-auto block h-auto w-full min-w-0 max-w-[800px] overflow-visible
"
              role="img"
              aria-label="Cuerda de módulos">
              <defs>
                <filter
                  id="ropeGlow"
                  x="-120%"
                  y="-120%"
                  width="340%"
                  height="340%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter
                  id="ropeGlowStrong"
                  x="-160%"
                  y="-160%"
                  width="420%"
                  height="420%">
                  <feGaussianBlur stdDeviation="12" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <linearGradient id="metalA" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B4D17" />
                  <stop offset="100%" stopColor="#5B2800" />
                </linearGradient>

                <linearGradient id="metalB" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#A86326" />
                  <stop offset="100%" stopColor="#704015" />
                </linearGradient>
              </defs>

              <style>
                {`
                  .module-node--interactive {
                    transition: transform 180ms ease, filter 180ms ease;
                    transform-origin: center;
                  }

                  .module-node--interactive:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.04);
                  }

                  .current-marker__ping {
                    animation: currentPing 1.8s ease-in-out infinite;
                    transform-origin: center;
                  }

                  @keyframes currentPing {
                    0% {
                      opacity: 0.85;
                      transform: scale(1);
                    }
                    50% {
                      opacity: 1;
                      transform: scale(1.08);
                    }
                    100% {
                      opacity: 0.85;
                      transform: scale(1);
                    }
                  }
                `}
              </style>

              <g transform="rotate(-12 44 64)">
                <rect
                  x="18"
                  y="38"
                  width="58"
                  height="58"
                  rx="15"
                  fill="url(#metalA)"
                />
                <rect
                  x="22"
                  y="42"
                  width="50"
                  height="50"
                  rx="12"
                  fill="url(#metalB)"
                />
                <rect
                  x="25"
                  y="45"
                  width="12"
                  height="44"
                  rx="6"
                  fill="rgba(255,255,255,0.12)"
                />
                <rect
                  x="18"
                  y="38"
                  width="58"
                  height="58"
                  rx="15"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                />
              </g>

              <g transform="rotate(8 772 64)">
                <rect
                  x="744"
                  y="38"
                  width="58"
                  height="58"
                  rx="15"
                  fill="url(#metalA)"
                />
                <rect
                  x="748"
                  y="42"
                  width="50"
                  height="50"
                  rx="12"
                  fill="url(#metalB)"
                />
                <rect
                  x="751"
                  y="45"
                  width="12"
                  height="44"
                  rx="6"
                  fill="rgba(255,255,255,0.12)"
                />
                <rect
                  x="744"
                  y="38"
                  width="58"
                  height="58"
                  rx="15"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                />
              </g>

              <RopeStroke
                d={getMainRopePath()}
                palette={{ main: "#8F3E00", dark: "#4B1D00", light: "#F3BC79" }}
                width={22}
                opacity={1}
                locked={false}
                type="main"
              />

              {visibleModules.map((module, index) => (
                <BranchGroup
                  key={module.moduleId || index}
                  module={module}
                  index={index}
                  imageSrc={moduleImages[module.sortOrder]}
                  point={MODULE_POINTS[index]}
                  isCurrentTarget={
                    Number(module.sortOrder) ===
                    Number(currentUnlockedSortOrder)
                  }
                />
              ))}
            </svg>
          </div>
        </div>

        <aside className="min-w-0 xl:pt-3 pr-10">
          <div className="mx-auto  max-w-[530px]">
            <FinalModuleUnlockPanel modules={modules || []} />
          </div>
        </aside>
      </div>
    </section>
  );
}
