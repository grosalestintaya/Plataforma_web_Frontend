import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────

function normalizeStatus(status) {
  if (status === "completed") return "completed";
  if (status === "unlocked") return "unlocked";
  return "locked";
}

function getModuleBySortOrder(modules = [], sortOrder) {
  return (
    modules.find((m) => Number(m?.sortOrder) === Number(sortOrder)) || null
  );
}

const PIECE_ORDER = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
  "center",
];

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const CHAKANA_COLORS = {
  topLeft: {
    color: "#2962FF",
    dark: "#173EA8",
    light: "#DCE8FF",
    glow: "rgba(41,98,255,0.30)",
    beam: "rgba(41,98,255,0.42)",
    label: "M1",
  },
  topRight: {
    color: "#00C853",
    dark: "#0B8F42",
    light: "#D9FFE7",
    glow: "rgba(0,200,83,0.30)",
    beam: "rgba(0,200,83,0.42)",
    label: "M2",
  },
  bottomLeft: {
    color: "#FF890A",
    dark: "#B85A00",
    light: "#FFE0BA",
    glow: "rgba(255,137,10,0.30)",
    beam: "rgba(255,137,10,0.42)",
    label: "M3",
  },
  bottomRight: {
    color: "#FF3D00",
    dark: "#B32600",
    light: "#FFD8CC",
    glow: "rgba(255,61,0,0.30)",
    beam: "rgba(255,61,0,0.42)",
    label: "M4",
  },
  center: {
    color: "#7C4DFF",
    dark: "#5931CA",
    light: "#E4D9FF",
    glow: "rgba(124,77,255,0.36)",
    beam: "rgba(124,77,255,0.48)",
    label: "M5",
  },
};

const INACTIVE = {
  fill: "#807A8C",
  fillSoft: "#A5A0B3",
  text: "rgba(255,255,255,0.42)",
};

function useActiveMap(modules) {
  return useMemo(() => {
    return Object.fromEntries(
      PIECE_ORDER.map((key, i) => {
        const module = getModuleBySortOrder(modules, i + 1);
        const status = normalizeStatus(module?.status);
        if (i === 4 && status === "unlocked") {
          return [key, status === "locked"];
        }
        return [key, status === "completed" || status === "unlocked"];
      }),
    );
  }, [modules]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometría
// ─────────────────────────────────────────────────────────────────────────────

const QUADRANT_PATHS = {
  topLeft: `
    M 76 188
    H 164
    A 56 56 0 0 1 188 164
    V 76
    H 124
    V 112
    H 100
    V 148
    H 76
    Z
  `,
  topRight: `
    M 212 164
    A 56 56 0 0 1 236 188
    H 324
    V 148
    H 300
    V 112
    H 276
    V 76
    H 212
    Z
  `,
  bottomLeft: `
    M 188 236
    A 56 56 0 0 1 164 212
    H 76
    V 252
    H 100
    V 288
    H 124
    V 324
    H 188
    Z
  `,
  bottomRight: `
    M 212 236
    A 56 56 0 0 0 236 212
    H 324
    V 252
    H 300
    V 288
    H 276
    V 324
    H 212
    Z
  `,
};

const QUADRANT_OUTER_EDGES = {
  topLeft: `
    M 76 188
    H 164
    A 56 56 0 0 1 188 164
    V 76
    H 124
    V 112
    H 100
    V 148
    H 76
  `,
  topRight: `
    M 212 164
    A 56 56 0 0 1 236 188
    H 324
    V 148
    H 300
    V 112
    H 276
    V 76
    H 212
  `,
  bottomLeft: `
    M 188 236
    A 56 56 0 0 1 164 212
    H 76
    V 252
    H 100
    V 288
    H 124
    V 324
    H 188
  `,
  bottomRight: `
    M 212 236
    A 56 56 0 0 0 236 212
    H 324
    V 252
    H 300
    V 288
    H 276
    V 324
    H 212
  `,
};

const SHINE_RECTS = {
  topLeft: { x: 136, y: 36, width: 42, height: 10, rx: 999 },
  topRight: { x: 222, y: 36, width: 42, height: 10, rx: 999 },
  bottomLeft: { x: 136, y: 354, width: 42, height: 10, rx: 999 },
  bottomRight: { x: 222, y: 354, width: 42, height: 10, rx: 999 },
};

const ENERGY_PATHS = {
  topLeft: {
    path: "M 154 154 Q 176 176 184 184",
    hitCx: 186,
    hitCy: 186,
    hitClass: "energy-hit hit-tl",
  },
  topRight: {
    path: "M 246 154 Q 224 176 216 184",
    hitCx: 214,
    hitCy: 186,
    hitClass: "energy-hit hit-tr",
  },
  bottomLeft: {
    path: "M 154 246 Q 176 224 184 216",
    hitCx: 186,
    hitCy: 214,
    hitClass: "energy-hit hit-bl",
  },
  bottomRight: {
    path: "M 246 246 Q 224 224 216 216",
    hitCx: 214,
    hitCy: 214,
    hitClass: "energy-hit hit-br",
  },
};

const LABEL_DEFS = [
  { key: "topLeft", x: 114, y: 66 },
  { key: "topRight", x: 286, y: 66 },
  { key: "bottomLeft", x: 114, y: 334 },
  { key: "bottomRight", x: 286, y: 334 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponentes SVG
// ─────────────────────────────────────────────────────────────────────────────

function ChakanaBackdrop({ finalUnlocked }) {
  return (
    <>
      <circle
        cx="200"
        cy="200"
        r="160"
        fill={
          finalUnlocked ? "rgba(255,212,111,0.045)" : "rgba(255,255,255,0.015)"
        }
        filter="url(#chakanaGlowStrong)"
      />

      <circle
        cx="200"
        cy="200"
        r="122"
        fill={
          finalUnlocked ? "rgba(124,77,255,0.055)" : "rgba(124,77,255,0.025)"
        }
        filter="url(#chakanaGlowSoft)"
      />

      <circle
        cx="200"
        cy="200"
        r="166"
        fill="none"
        stroke={
          finalUnlocked ? "rgba(255,221,158,0.20)" : "rgba(255,255,255,0.08)"
        }
        strokeWidth="2"
      />

      <circle
        cx="200"
        cy="200"
        r="184"
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1.2"
        strokeDasharray="8 10"
      />

      <circle
        cx="200"
        cy="200"
        r="196"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
        strokeDasharray="4 12"
      />
    </>
  );
}

function ChakanaAmbientGlow({ activeMap, finalUnlocked }) {
  const activeCount = Object.values(activeMap).filter(Boolean).length;
  if (!activeCount) return null;

  return (
    <circle
      cx="200"
      cy="200"
      r="124"
      fill={finalUnlocked ? "rgba(255,198,95,0.06)" : "rgba(124,77,255,0.045)"}
      filter="url(#chakanaGlowSoft)"
    />
  );
}

function EnergyBeam({ pieceKey, active }) {
  if (!active) return null;

  const color = CHAKANA_COLORS[pieceKey];
  const energy = ENERGY_PATHS[pieceKey];

  return (
    <path
      d={energy.path}
      fill="none"
      stroke={color.beam}
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="5 6"
      opacity="0.9"
      filter="url(#chakanaGlowSoft)"
    />
  );
}

function EnergyHit({ pieceKey, active }) {
  if (!active) return null;

  const color = CHAKANA_COLORS[pieceKey];
  const energy = ENERGY_PATHS[pieceKey];

  return (
    <g
      className={energy.hitClass}
      style={{
        transformBox: "fill-box",
        transformOrigin: "center",
      }}>
      <circle
        cx={energy.hitCx}
        cy={energy.hitCy}
        r="2"
        fill={color.light}
        opacity="1"
        filter="url(#chakanaEdgeGlow)"
      />
      <circle
        cx={energy.hitCx}
        cy={energy.hitCy}
        r="3"
        fill="none"
        stroke={color.light}
        strokeWidth="2.2"
        opacity="0.95"
        filter="url(#chakanaGlowSoft)"
      />
      <circle
        cx={energy.hitCx}
        cy={energy.hitCy}
        r="1"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.4"
        opacity="0.8"
      />
    </g>
  );
}

function QuadrantPiece({ pieceKey, active }) {
  const color = CHAKANA_COLORS[pieceKey];
  const fillPath = QUADRANT_PATHS[pieceKey];
  const edgePath = QUADRANT_OUTER_EDGES[pieceKey];
  const shine = SHINE_RECTS[pieceKey];

  return (
    <g>
      {active && (
        <>
          <path
            d={fillPath}
            fill={color.glow}
            filter="url(#chakanaGlowSoft)"
            opacity="0.42"
          />

          <path
            d={edgePath}
            fill="none"
            stroke={color.light}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
            filter="url(#chakanaEdgeGlow)"
          />

          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.88"
          />
        </>
      )}

      <path
        d={fillPath}
        fill={active ? color.color : INACTIVE.fill}
        style={{
          transition: "fill 220ms ease, filter 220ms ease, opacity 220ms ease",
          filter: active
            ? `drop-shadow(0 0 8px ${color.glow}) drop-shadow(0 0 14px ${color.glow})`
            : "drop-shadow(0 2px 8px rgba(0,0,0,0.10))",
        }}
      />

      <path
        d={fillPath}
        fill="url(#pieceGloss)"
        opacity={active ? 0.2 : 0.06}
      />

      <rect
        x={shine.x}
        y={shine.y}
        width={shine.width}
        height={shine.height}
        rx={shine.rx}
        fill={active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)"}
      />
    </g>
  );
}

function ChakanaQuadrants({ activeMap }) {
  return (
    <>
      <QuadrantPiece pieceKey="topLeft" active={activeMap.topLeft} />
      <QuadrantPiece pieceKey="topRight" active={activeMap.topRight} />
      <QuadrantPiece pieceKey="bottomLeft" active={activeMap.bottomLeft} />
      <QuadrantPiece pieceKey="bottomRight" active={activeMap.bottomRight} />
    </>
  );
}

function CenterHole() {
  return (
    <>
      <circle cx="200" cy="200" r="56" fill="var(--app-bg, #0f172a)" />
      <circle
        cx="200"
        cy="200"
        r="8"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1.2"
      />
    </>
  );
}

function CenterCore({ isOn }) {
  const color = CHAKANA_COLORS.center;

  return (
    <g>
      <circle
        cx="200"
        cy="200"
        r="50"
        fill={isOn ? color.dark : "#7D778D"}
        stroke={isOn ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)"}
        strokeWidth="2.2"
      />

      <circle
        cx="200"
        cy="200"
        r="42"
        fill={isOn ? color.color : INACTIVE.fillSoft}
        filter={isOn ? "url(#chakanaGlowSoft)" : undefined}
      />

      <circle
        cx="200"
        cy="200"
        r="31"
        fill={isOn ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)"}
      />

      <ellipse
        cx="187"
        cy="186"
        rx="10"
        ry="7"
        fill={isOn ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.10)"}
      />

      <circle
        cx="200"
        cy="200"
        r="42"
        fill="none"
        stroke={isOn ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}
        strokeWidth="1.1"
      />

      {isOn && (
        <text
          x="200"
          y="206"
          textAnchor="middle"
          fill="#F4EAFF"
          style={{
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.14em",
            paintOrder: "stroke",
            stroke: "rgba(18,10,40,0.8)",
            strokeWidth: "4px",
          }}>
          M5
        </text>
      )}
    </g>
  );
}

function ChakanaLabels({ activeMap }) {
  return (
    <>
      {LABEL_DEFS.map(({ key, x, y }) => {
        const isOn = activeMap[key];
        const palette = CHAKANA_COLORS[key];

        return (
          <g key={key} transform={`translate(${x}, ${y})`}>
            <circle
              cx="0"
              cy="0"
              r="14"
              fill={isOn ? "rgba(8,15,30,0.88)" : "rgba(255,255,255,0.06)"}
              stroke={
                isOn ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"
              }
              strokeWidth="1"
              filter={isOn ? "url(#chakanaEdgeGlow)" : undefined}
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill={isOn ? palette.light : INACTIVE.text}
              style={{
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.10em",
                paintOrder: "stroke",
                stroke: isOn ? "rgba(10,12,20,0.85)" : "rgba(10,12,20,0.50)",
                strokeWidth: "4px",
              }}>
              {palette.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

function ChakanaSvg({ activeMap, finalUnlocked }) {
  return (
    <div className="relative mx-auto -my-3 w-full max-w-[408px] leading-none">
      <svg
        viewBox="0 0 400 400"
        className="block h-auto w-full overflow-visible align-top">
        <defs>
          <filter
            id="chakanaGlowSoft"
            x="-90%"
            y="-90%"
            width="280%"
            height="280%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter
            id="chakanaGlowStrong"
            x="-120%"
            y="-120%"
            width="340%"
            height="340%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter
            id="chakanaEdgeGlow"
            x="-120%"
            y="-120%"
            width="340%"
            height="340%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="1"
              result="blur2"
            />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="pieceGloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.30)" />
            <stop offset="38%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <ChakanaBackdrop finalUnlocked={finalUnlocked} />
        <ChakanaAmbientGlow
          activeMap={activeMap}
          finalUnlocked={finalUnlocked}
        />

        <EnergyBeam pieceKey="topLeft" active={activeMap.topLeft} />
        <EnergyBeam pieceKey="topRight" active={activeMap.topRight} />
        <EnergyBeam pieceKey="bottomLeft" active={activeMap.bottomLeft} />
        <EnergyBeam pieceKey="bottomRight" active={activeMap.bottomRight} />

        <ChakanaQuadrants activeMap={activeMap} />
        <CenterHole />
        <CenterCore isOn={activeMap.center} />

        <EnergyHit pieceKey="topLeft" active={activeMap.topLeft} />
        <EnergyHit pieceKey="topRight" active={activeMap.topRight} />
        <EnergyHit pieceKey="bottomLeft" active={activeMap.bottomLeft} />
        <EnergyHit pieceKey="bottomRight" active={activeMap.bottomRight} />

        <ChakanaLabels activeMap={activeMap} />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Principal
// ─────────────────────────────────────────────────────────────────────────────

export default function FinalModuleUnlockPanel({
  modules = [],
  className = "",
  title = "Chakana sagrada",
  finalRoute = "/modules/m06",
  onOpenFinal = null,
}) {
  const navigate = useNavigate();
  const activeMap = useActiveMap(modules);

  const completedCount = useMemo(() => {
    return PIECE_ORDER.filter((key) => activeMap[key]).length;
  }, [activeMap]);

  const finalModule = useMemo(() => {
    return getModuleBySortOrder(modules, 6);
  }, [modules]);

  const finalState = normalizeStatus(finalModule?.status);

  const finalUnlocked =
    completedCount === 5 ||
    finalState === "unlocked" ||
    finalState === "completed";

  const helperText = finalUnlocked
    ? "La chakana ha sido completada. El módulo final ya está disponible."
    : "Activa los cuatro cuadrantes y el núcleo central para revelar el acceso final.";

  function handleOpenFinal() {
    if (!finalUnlocked) return;

    if (typeof onOpenFinal === "function") {
      onOpenFinal();
      return;
    }

    navigate(finalRoute);
  }

  return (
    <section
      className={[
        "relative flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-0 px-0 py-0",
        className,
      ].join(" ")}>
      <style>{`
        .energy-hit {
          transform-box: fill-box;
          transform-origin: center;
        }

        .hit-tl { animation: hitFlash 2.4s ease-out infinite; }
        .hit-tr { animation: hitFlash 2.4s ease-out infinite 0.45s; }
        .hit-bl { animation: hitFlash 2.4s ease-out infinite 0.90s; }
        .hit-br { animation: hitFlash 2.4s ease-out infinite 1.35s; }

        @keyframes hitFlash {
          0%, 68%, 100% {
            opacity: 0;
            transform: scale(0.35);
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          24% {
            opacity: 0.85;
            transform: scale(1.8);
          }
          42% {
            opacity: 0;
            transform: scale(2.5);
          }
        }

        .final-chakana-cta {
          transition:
            box-shadow 180ms ease,
            opacity 180ms ease,
            background 180ms ease,
            color 180ms ease,
            filter 180ms ease;
        }

        .final-chakana-cta:hover {
          filter: brightness(1.03);
        }
      `}</style>

      <div className="w-full text-center leading-none">
        <h2
          className="mt-4 -mb-4 text-[28px] font-black tracking-[0.01em] leading-none"
          style={{
            color: "var(--sidebar)",
            textShadow: "0 4px 18px rgba(0,0,0,0.26)",
          }}>
          {title}
        </h2>
      </div>

      <div className="w-full flex-none py-0">
        <ChakanaSvg activeMap={activeMap} finalUnlocked={finalUnlocked} />
      </div>

      <div className="-mt-5 w-full text-center leading-none ">
        <p className="mx-auto mt-0 max-w-[71ch] text-[13px] leading-5 var(--accent)">
          {helperText}
        </p>

        <button
          type="button"
          disabled={!finalUnlocked}
          onClick={handleOpenFinal}
          className="final-chakana-cta mx-auto mt-2 -mb-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 py-2 text-[14px] font-black"
          style={{
            background: finalUnlocked
              ? "linear-gradient(180deg, #FFD36B, #FF9D2F)"
              : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
            color: finalUnlocked ? "#3A2200" : "var(--accent)",
            boxShadow: finalUnlocked
              ? "0 14px 28px rgba(255,157,47,0.18), 0 8px 18px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.32)"
              : "0 8px 18px rgba(1,1,1,1), inset 0 1px 0 rgba(255,255,255,0.04)",
            cursor: finalUnlocked ? "pointer" : "not-allowed",
            opacity: finalUnlocked ? 1 : 0.9,
          }}>
          {finalUnlocked ? (
            <>Ingresar al módulo final</>
          ) : (
            <>
              <Lock size={15} />
              Aún sellado
            </>
          )}
        </button>
      </div>
    </section>
  );
}
