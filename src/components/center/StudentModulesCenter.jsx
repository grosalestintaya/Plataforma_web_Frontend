import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";

const API = "http://localhost:5000/api/progress/overview";

const MODULE_BG = {
  1: "/media/modules/module-1.png",
  2: "/media/modules/module-2.png",
  3: "/media/modules/module-3.png",
  4: "/media/modules/module-4.png",
  5: "/media/modules/module-5.png",
  6: "/media/modules/module-6.png",
};

function getVar(el, name, fallback = "") {
  try {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback;
  } catch {
    return fallback;
  }
}

const statusRank = (status) =>
  status === "completed" ? 3 : status === "unlocked" ? 2 : 1;

function pickBestModuleCandidate(a, b) {
  const ra = statusRank(a?.status);
  const rb = statusRank(b?.status);
  if (ra !== rb) return ra > rb ? a : b;

  const ca = Number(a?.completedActivities ?? 0);
  const cb = Number(b?.completedActivities ?? 0);
  if (ca !== cb) return ca > cb ? a : b;

  return (a?.moduleId ?? 999999) < (b?.moduleId ?? 999999) ? a : b;
}

function normalizeToSixModules(modulesRaw) {
  const bySort = new Map();

  for (const m of Array.isArray(modulesRaw) ? modulesRaw : []) {
    const k = Number(m.sortOrder);
    if (!k || k < 1 || k > 6) continue;

    const prev = bySort.get(k);
    bySort.set(k, prev ? pickBestModuleCandidate(prev, m) : m);
  }

  return Array.from({ length: 6 }, (_, i) => {
    const n = i + 1;
    return (
      bySort.get(n) || {
        moduleId: `missing-${n}`,
        sortOrder: n,
        title: `Módulo ${n}`,
        status: "locked",
        completedActivities: 0,
        totalActivities: 3,
        activities: [],
      }
    );
  });
}

function getModuleState(module) {
  const done = Number(module.completedActivities ?? 0);
  const total = Number(module.totalActivities ?? 3);

  const isComplete = total > 0 && done >= total;
  const isLocked = module.status === "locked" && !isComplete;
  const isUnlocked = !isLocked && !isComplete;

  return { isComplete, isLocked, isUnlocked, done, total };
}

function shortTitle(fullTitle, order) {
  if (!fullTitle || typeof fullTitle !== "string") return `Módulo ${order}`;
  const parts = fullTitle.split(":");
  return (parts.length >= 2 ? parts.slice(1).join(":") : fullTitle).trim();
}

function pickActiveSortOrder(modules) {
  for (const m of modules) {
    const s = getModuleState(m);
    if (s.isUnlocked && !s.isComplete) return Number(m.sortOrder);
  }
  return Number(modules?.[modules.length - 1]?.sortOrder ?? 1);
}

function StatusIcon({ isComplete, isLocked }) {
  const Icon = isComplete ? CheckCircle2 : isLocked ? Lock : PlayCircle;
  return <Icon className="h-4 w-4" />;
}

function useResizeObserver(ref, cb) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => cb?.());
    ro.observe(el);

    return () => ro.disconnect();
  }, [ref, cb]);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Coordenadas relativas (0..1) para ocupar más ancho.
 */
function computeNodes() {
  return [
    { k: 1, x: 0.07, y: 0.3 },
    { k: 2, x: 0.25, y: 0.52 },
    { k: 3, x: 0.46, y: 0.28 },
    { k: 4, x: 0.66, y: 0.55 },
    { k: 5, x: 0.84, y: 0.3 },
    { k: 6, x: 0.93, y: 0.62 },
  ];
}

function makePath(points) {
  if (!points?.length) return "";

  const pts = points.map((p) => ({ x: p.x, y: p.y }));
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const mx = (prev.x + cur.x) / 2;
    const my = (prev.y + cur.y) / 2;
    const off = (i % 2 === 0 ? -1 : 1) * 18;
    d += ` Q ${mx} ${my + off} ${cur.x} ${cur.y}`;
  }

  return d;
}

function PathWithGlow({ width, height, nodesPx, activeOrder, tokens }) {
  const d = makePath(nodesPx);

  const uid = useId().replace(/:/g, "");
  const pathId = `path-${uid}`;
  const glowId = `softGlow-${uid}`;
  const gradId = `pathGrad-${uid}`;
  const litMaskId = `litMask-${uid}`;

  const litUpTo = clamp(activeOrder - 1, 0, 6);
  const total = 1200;
  const litLen = total * (litUpTo / 6);

  const showParticles = litUpTo >= 1;

  return (
    <svg
      className="absolute inset-0"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tokens.primary} />
          <stop offset="1" stopColor={tokens.accent} />
        </linearGradient>

        {/* Ruta base para animateMotion */}
        <path id={pathId} d={d} />

        {/* Mask: revela solo tramo encendido */}
        <mask id={litMaskId} maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width={width} height={height} fill="black" />
          <path
            d={d}
            fill="none"
            stroke="white"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: `${litLen} ${total}`,
              strokeDashoffset: 0,
            }}
          />
        </mask>
      </defs>

      {/* camino base */}
      <path
        d={d}
        fill="none"
        stroke="rgba(15,23,42,0.10)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* camino iluminado */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        style={{
          strokeDasharray: `${litLen} ${total}`,
          strokeDashoffset: 0,
          opacity: 0.92,
        }}
      />

      {/* puntos guía */}
      {nodesPx.map((p, idx) => (
        <circle
          key={idx}
          cx={p.x}
          cy={p.y}
          r={idx <= litUpTo ? 4 : 3.5}
          fill={
            idx <= litUpTo ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.60)"
          }
          stroke={
            idx <= litUpTo ? "rgba(15,23,42,0.18)" : "rgba(15,23,42,0.10)"
          }
        />
      ))}

      {/* partículas viajando solo por tramo encendido */}
      {showParticles && (
        <g mask={`url(#${litMaskId})`} opacity="0.95">
          <circle r="4.2" fill="rgba(255,255,255,0.95)">
            <animateMotion
              dur="2.6s"
              repeatCount="indefinite"
              rotate="auto"
              keySplines="0.42 0 0.58 1"
              keyTimes="0;1"
              calcMode="spline">
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </circle>

          <circle r="3.6" fill="rgba(255,255,255,0.85)">
            <animateMotion
              dur="3.1s"
              repeatCount="indefinite"
              rotate="auto"
              begin="-1.1s">
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0.15;0.9;0.15"
              dur="3.1s"
              repeatCount="indefinite"
              begin="-1.1s"
            />
          </circle>

          <circle r="2.9" fill="rgba(255,255,255,0.80)">
            <animateMotion
              dur="2.2s"
              repeatCount="indefinite"
              rotate="auto"
              begin="-0.6s">
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0.1;0.8;0.1"
              dur="2.2s"
              repeatCount="indefinite"
              begin="-0.6s"
            />
          </circle>

          <circle r="6.5" fill="rgba(0,176,255,0.10)">
            <animateMotion
              dur="2.9s"
              repeatCount="indefinite"
              rotate="auto"
              begin="-1.8s">
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;0.9;0"
              dur="2.9s"
              repeatCount="indefinite"
              begin="-1.8s"
            />
          </circle>
        </g>
      )}
    </svg>
  );
}

function MapNode({ module, tokens, x, y, size, isActive }) {
  const navigate = useNavigate();
  const order = Number(module.sortOrder);
  const bg = MODULE_BG[order];
  const { isComplete, isLocked, done, total } = getModuleState(module);

  const title = shortTitle(module.title, order);

  const ring = isLocked
    ? "none"
    : isComplete
      ? "0 0 0 4px rgba(255,215,0,0.75), 0 0 26px rgba(255,215,0,0.35)"
      : isActive
        ? `0 0 0 4px ${tokens.accent}, 0 0 36px rgba(0,176,255,0.45)`
        : `0 0 0 3px ${tokens.primary}, 0 0 18px rgba(255,255,255,0.15)`;

  const action = () => {
    if (isLocked) return;
    navigate(`/modules/m0${order}`);
  };

  return (
    <div
      className="absolute"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        zIndex: isActive ? 20 : 1,
      }}>
      <button
        type="button"
        disabled={isLocked}
        onClick={action}
        title={title}
        className={`group relative flex flex-col items-center transition-transform duration-200 ${
          !isLocked ? "hover:scale-[1.12]" : "cursor-not-allowed opacity-90"
        }`}
        style={{
          width: size,
          height: size,
          animation:
            isActive && !isLocked
              ? "float-node 3.5s ease-in-out infinite"
              : "none",
        }}>
        <div className="relative">
          {/* halo pulsante (nodo activo) */}
          {isActive && !isLocked && !isComplete && (
            <div
              className="absolute inset-[-18px] rounded-full"
              style={{
                animation: "pulse-ring 2.6s infinite",
                pointerEvents: "none",
              }}
            />
          )}

          <div
            className="absolute -inset-1 rounded-full"
            style={{ boxShadow: ring }}
          />

          <div
            className="relative overflow-hidden rounded-full border bg-white"
            style={{
              width: size,
              height: size,
              borderColor: tokens.cardBorder,
            }}>
            {bg ? (
              <img
                src={bg}
                alt=""
                draggable={false}
                className={`h-full w-full object-cover ${
                  isLocked ? "grayscale brightness-[0.78]" : ""
                }`}
              />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
            {isLocked && <div className="absolute inset-0 bg-white/25" />}
          </div>

          {/* número */}
          <div
            className="absolute -left-1 -top-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-white/85 text-sm font-extrabold backdrop-blur"
            style={{ borderColor: tokens.cardBorder, color: tokens.dashText }}>
            {order}
          </div>

          {/* estado */}
          <div
            className="absolute -right-1 -top-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-white/85 backdrop-blur"
            style={{
              borderColor: tokens.cardBorder,
              color: isComplete
                ? "#a16207"
                : isLocked
                  ? "rgba(15,23,42,0.55)"
                  : tokens.dashText,
            }}>
            <StatusIcon isComplete={isComplete} isLocked={isLocked} />
          </div>

          {/* etiqueta misión */}
          {isActive && !isLocked && !isComplete && (
            <div
              className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full border bg-white/90 px-4 py-1.5 text-[11px] font-extrabold tracking-wide backdrop-blur"
              style={{
                borderColor: tokens.cardBorder,
                color: tokens.dashText,
              }}>
              ▶ SIGUIENTE DESAFÍO
            </div>
          )}
        </div>

        {/* texto */}
        <div className="mt-3 w-[180px] text-center">
          <div
            className="line-clamp-2 text-[12px] font-extrabold leading-snug"
            style={{ color: tokens.dashText }}>
            {title}
          </div>
          <div
            className="mt-1 text-[11px] font-medium"
            style={{ color: tokens.mutedText }}>
            {done}/{total}
          </div>
        </div>
      </button>
    </div>
  );
}

function ParchmentBg({ radius = 70 }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 520"
      preserveAspectRatio="none"
      aria-hidden="true">
      <defs>
        <linearGradient id="pg_base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7de" />
          <stop offset="0.35" stopColor="#f7e6c0" />
          <stop offset="1" stopColor="#f1ddb0" />
        </linearGradient>

        <radialGradient id="pg_light" cx="50%" cy="35%" r="70%">
          <stop offset="0" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="0.55" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        <filter id="pg_noise" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="
              0 0 0 0 0.55
              0 0 0 0 0.45
              0 0 0 0 0.25
              0 0 0 0.22 0"
            result="grain"
          />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>

        <filter id="pg_burn" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.015"
            numOctaves="2"
            seed="8"
            result="t"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="t"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <radialGradient id="pg_vignette" cx="50%" cy="45%" r="78%">
          <stop offset="0.62" stopColor="rgba(255,255,255,0)" />
          <stop offset="1" stopColor="rgba(120,70,20,0.16)" />
        </radialGradient>

        <rect
          x="0"
          y="0"
          width="1000"
          height="520"
          fill="url(#pg_vignette)"
          opacity="0.45"
        />

        <clipPath id="pg_clip">
          <rect x="0" y="0" width="1000" height="520" rx={radius} ry={radius} />
        </clipPath>
      </defs>

      <g clipPath="url(#pg_clip)">
        <path
          d="
            M45,72
            C28,96 26,128 38,150
            C18,175 18,220 40,242
            C22,270 24,318 44,340
            C26,368 30,412 54,434
            C80,462 120,486 160,490
            C210,505 280,506 330,494
            C390,514 470,510 520,492
            C575,510 650,512 700,494
            C760,510 835,502 884,480
            C930,458 968,418 956,378
            C978,350 980,302 956,278
            C978,252 980,204 954,178
            C976,150 974,112 950,92
            C922,58 870,40 820,38
            C770,18 705,18 654,34
            C590,16 520,18 470,34
            C408,16 330,18 280,36
            C230,20 165,22 120,42
            C90,50 62,58 45,72
            Z
          "
          fill="url(#pg_base)"
        />

        <path
          d="
            M45,72
            C28,96 26,128 38,150
            C18,175 18,220 40,242
            C22,270 24,318 44,340
            C26,368 30,412 54,434
            C80,462 120,486 160,490
            C210,505 280,506 330,494
            C390,514 470,510 520,492
            C575,510 650,512 700,494
            C760,510 835,502 884,480
            C930,458 968,418 956,378
            C978,350 980,302 956,278
            C978,252 980,204 954,178
            C976,150 974,112 950,92
            C922,58 870,40 820,38
            C770,18 705,18 654,34
            C590,16 520,18 470,34
            C408,16 330,18 280,36
            C230,20 165,22 120,42
            C90,50 62,58 45,72
            Z
          "
          fill="url(#pg_light)"
          opacity="0.9"
        />

        <g filter="url(#pg_noise)" opacity="0.35">
          <rect x="0" y="0" width="1000" height="520" fill="transparent" />
        </g>

        <path
          d="
            M45,72
            C28,96 26,128 38,150
            C18,175 18,220 40,242
            C22,270 24,318 44,340
            C26,368 30,412 54,434
            C80,462 120,486 160,490
            C210,505 280,506 330,494
            C390,514 470,510 520,492
            C575,510 650,512 700,494
            C760,510 835,502 884,480
            C930,458 968,418 956,378
            C978,350 980,302 956,278
            C978,252 980,204 954,178
            C976,150 974,112 950,92
            C922,58 870,40 820,38
            C770,18 705,18 654,34
            C590,16 520,18 470,34
            C408,16 330,18 280,36
            C230,20 165,22 120,42
            C90,50 62,58 45,72
            Z
          "
          fill="none"
          stroke="rgba(120,70,20,0.55)"
          strokeWidth="28"
          opacity="0.22"
          filter="url(#pg_burn)"
        />

        <path
          d="
            M45,72
            C28,96 26,128 38,150
            C18,175 18,220 40,242
            C22,270 24,318 44,340
            C26,368 30,412 54,434
            C80,462 120,486 160,490
            C210,505 280,506 330,494
            C390,514 470,510 520,492
            C575,510 650,512 700,494
            C760,510 835,502 884,480
            C930,458 968,418 956,378
            C978,350 980,302 956,278
            C978,252 980,204 954,178
            C976,150 974,112 950,92
            C922,58 870,40 820,38
            C770,18 705,18 654,34
            C590,16 520,18 470,34
            C408,16 330,18 280,36
            C230,20 165,22 120,42
            C90,50 62,58 45,72
            Z
          "
          fill="none"
          stroke="rgba(120,80,30,0.45)"
          strokeWidth="4"
          opacity="0.6"
        />

        <rect
          x="0"
          y="0"
          width="1000"
          height="520"
          fill="url(#pg_vignette)"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}

export default function StudentModulesCenter() {
  const token = localStorage.getItem("token");
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const [tokens, setTokens] = useState({
    appBg: "#f8fafc",
    dashText: "#0f172a",
    dashBg: "rgba(0,0,0,0.05)",
    mutedText: "rgba(100,116,139,0.95)",
    cardBorder: "rgba(15,23,42,0.12)",
    primary: "#2962ff",
    accent: "#00b0ff",
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setTokens({
      appBg: getVar(el, "--app-bg", "#f8fafc"),
      dashText: getVar(el, "--dash-title-text", "#0f172a"),
      dashBg: getVar(el, "--dash-title-bg", "rgba(0,0,0,0.05)"),
      mutedText: "rgba(100,116,139,0.95)",
      cardBorder: getVar(el, "--card-border", "rgba(15,23,42,0.12)"),
      primary: getVar(el, "--primary", "#2962ff"),
      accent: getVar(el, "--accent", "#00b0ff"),
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);

      setOverview(await res.json());
    } catch (e) {
      setError(e?.message || "No se pudo cargar módulos");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modules = useMemo(() => {
    const raw = overview?.modules ?? [];
    return normalizeToSixModules(raw /* dedupe */).sort(
      (a, b) => Number(a.sortOrder) - Number(b.sortOrder),
    );
  }, [overview]);

  const activeOrder = useMemo(() => pickActiveSortOrder(modules), [modules]);

  const [stage, setStage] = useState({ w: 1200, h: 520 });

  const recalcStage = () => {
    const el = stageRef.current;
    if (!el) return;

    const w = Math.max(360, Math.floor(el.getBoundingClientRect().width));
    const h = clamp(Math.floor(w * 0.36), 380, 520);

    setStage({ w, h });
  };

  useResizeObserver(stageRef, recalcStage);

  useEffect(() => {
    recalcStage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodes = useMemo(() => computeNodes(), []);
  const nodesPx = useMemo(
    () =>
      nodes.map((n) => ({
        k: n.k,
        x: Math.round(n.x * stage.w),
        y: Math.round(n.y * stage.h),
      })),
    [nodes, stage],
  );

  const nodeSize = clamp(Math.round(stage.w * 0.07), 68, 116);

  return (
    <section
      ref={containerRef}
      className="relative w-full rounded-3xl p-0 bg-transparent">
      <div className="relative w-full">
        {error && (
          <div
            className="relative mx-5 mt-4 rounded-2xl border bg-white/70 px-4 py-3 text-sm backdrop-blur"
            style={{ borderColor: tokens.cardBorder }}>
            <span className="font-semibold" style={{ color: tokens.dashText }}>
              Error:
            </span>{" "}
            <span style={{ color: tokens.mutedText }}>{error}</span>
          </div>
        )}

        <div ref={stageRef} className="relative w-full px-0">
          <div
            className="relative w-full overflow-hidden rounded-3xl border bg-transparent"
            style={{
              height: stage.h,
              borderColor: "bg-transparent",
              backgroundColor: tokens.primary,
            }}>
            {/* Fondo pergamino SVG */}
            <ParchmentBg radius={24} />

            {/* Camino + partículas */}
            <PathWithGlow
              width={stage.w}
              height={stage.h}
              nodesPx={nodesPx}
              activeOrder={activeOrder}
              tokens={tokens}
            />

            {/* Nodos */}
            {modules.map((m) => {
              const k = Number(m.sortOrder);
              const p = nodesPx.find((x) => x.k === k);
              if (!p) return null;

              return (
                <MapNode
                  key={`${m.sortOrder}-${m.moduleId}`}
                  module={m}
                  tokens={tokens}
                  x={p.x}
                  y={p.y}
                  size={nodeSize}
                  isActive={k === activeOrder}
                />
              );
            })}

            {loading && (
              <div className="absolute inset-0 grid place-items-center bg-white/35 backdrop-blur">
                <div
                  className="rounded-3xl border bg-white/70 px-5 py-4 text-sm font-semibold"
                  style={{
                    borderColor: tokens.cardBorder,
                    color: tokens.dashText,
                  }}>
                  Cargando mapa…
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-4" />
      </div>
    </section>
  );
}
