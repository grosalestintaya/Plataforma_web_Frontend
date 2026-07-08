import React, { useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

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

const CHAKANA_COLORS = {
  topLeft: {
    color: "#F54927",
    light: "#FF7A5C",
    glow: "rgba(245,73,39,0.55)",
    beam: "rgba(245,73,39,0.50)",
    label: "M1",
  },
  topRight: {
    color: "#FFA500",
    light: "#FFD080",
    glow: "rgba(255,165,0,0.55)",
    beam: "rgba(255,165,0,0.50)",
    label: "M2",
  },
  bottomLeft: {
    color: "#00E5FF",
    light: "#80F0FF",
    glow: "rgba(0,229,255,0.55)",
    beam: "rgba(0,229,255,0.50)",
    label: "M3",
  },
  bottomRight: {
    color: "#7130F7",
    light: "#B090FF",
    glow: "rgba(113,48,247,0.55)",
    beam: "rgba(113,48,247,0.50)",
    label: "M4",
  },
  center: {
    color: "#FFD36B",
    light: "#FFE9A8",
    glow: "rgba(255,211,107,0.65)",
    beam: "rgba(255,211,107,0.55)",
    label: "M5",
  },
};

const INACTIVE = {
  fill: "#3A3650",
  fillSoft: "#4E4868",
  text: "rgba(255,255,255,0.28)",
};

function useActiveMap(modules) {
  return useMemo(() => {
    return Object.fromEntries(
      PIECE_ORDER.map((key, i) => {
        const module = getModuleBySortOrder(modules, i + 1);
        const status = normalizeStatus(module?.status);
        return [key, status === "completed"];
      }),
    );
  }, [modules]);
}

const QUADRANT_PATHS = {
  topLeft:
    "M 76 188 H 164 A 56 56 0 0 1 188 164 V 76 H 124 V 112 H 100 V 148 H 76 Z",
  topRight:
    "M 212 164 A 56 56 0 0 1 236 188 H 324 V 148 H 300 V 112 H 276 V 76 H 212 Z",
  bottomLeft:
    "M 188 236 A 56 56 0 0 1 164 212 H 76 V 252 H 100 V 288 H 124 V 324 H 188 Z",
  bottomRight:
    "M 212 236 A 56 56 0 0 0 236 212 H 324 V 252 H 300 V 288 H 276 V 324 H 212 Z",
};

const QUADRANT_OUTER_EDGES = {
  topLeft:
    "M 76 188 H 164 A 56 56 0 0 1 188 164 V 76 H 124 V 112 H 100 V 148 H 76",
  topRight:
    "M 212 164 A 56 56 0 0 1 236 188 H 324 V 148 H 300 V 112 H 276 V 76 H 212",
  bottomLeft:
    "M 188 236 A 56 56 0 0 1 164 212 H 76 V 252 H 100 V 288 H 124 V 324 H 188",
  bottomRight:
    "M 212 236 A 56 56 0 0 0 236 212 H 324 V 252 H 300 V 288 H 276 V 324 H 212",
};

const ENERGY_PATHS = {
  topLeft: { path: "M 154 154 Q 176 176 184 184", hitCx: 186, hitCy: 186 },
  topRight: { path: "M 246 154 Q 224 176 216 184", hitCx: 214, hitCy: 186 },
  bottomLeft: { path: "M 154 246 Q 176 224 184 216", hitCx: 186, hitCy: 214 },
  bottomRight: { path: "M 246 246 Q 224 224 216 216", hitCx: 214, hitCy: 214 },
};

const LABEL_DEFS = [
  { key: "topLeft", x: 114, y: 66 },
  { key: "topRight", x: 286, y: 66 },
  { key: "bottomLeft", x: 114, y: 334 },
  { key: "bottomRight", x: 286, y: 334 },
];

// Partículas flotantes canvas
function ParticleCanvas({ active, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);

    if (!active) {
      ctx.clearRect(0, 0, W, H);
      return;
    }

    const count = 28;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * 40,
      vy: -(0.35 + Math.random() * 0.55),
      vx: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 1.8,
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.life += 0.006;
        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = Math.random() * W;
          p.y = H + 4;
        }
        p.x += p.vx;
        p.y += p.vy;

        const t = p.life / p.maxLife;
        const alpha = t < 0.2 ? t / 0.2 : t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle =
          color +
          Math.round(alpha * 200)
            .toString(16)
            .padStart(2, "0");
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, color]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ borderRadius: "50%" }}
    />
  );
}

function ChakanaDefs() {
  return (
    <defs>
      <filter id="gSoft" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="7" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="gStrong" x="-110%" y="-110%" width="320%" height="320%">
        <feGaussianBlur stdDeviation="14" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="gEdge" x="-110%" y="-110%" width="320%" height="320%">
        <feGaussianBlur stdDeviation="2.5" result="b1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b2" />
        <feMerge>
          <feMergeNode in="b1" />
          <feMergeNode in="b2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="gInner" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="pieceGloss" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
        <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      {/* ruido para efecto sketch */}
      <filter id="sketch" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="1.8"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  );
}

function ChakanaBackdrop({ finalUnlocked }) {
  return (
    <>
      <circle
        cx="200"
        cy="200"
        r="168"
        fill={
          finalUnlocked ? "rgba(255,211,107,0.05)" : "rgba(255,255,255,0.012)"
        }
        filter="url(#gStrong)"
      />
      <circle
        cx="200"
        cy="200"
        r="170"
        fill="none"
        stroke={
          finalUnlocked ? "rgba(255,220,140,0.22)" : "rgba(255,255,255,0.07)"
        }
        strokeWidth="1.5"
        filter="url(#sketch)"
      />
      <circle
        cx="200"
        cy="200"
        r="186"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
        strokeDasharray="7 11"
        filter="url(#sketch)"
      />
      <circle
        cx="200"
        cy="200"
        r="198"
        fill="none"
        stroke="rgba(255,255,255,0.03)"
        strokeWidth="0.8"
        strokeDasharray="3 14"
      />
    </>
  );
}

function QuadrantPiece({ pieceKey, active }) {
  const color = CHAKANA_COLORS[pieceKey];
  const fillPath = QUADRANT_PATHS[pieceKey];
  const edgePath = QUADRANT_OUTER_EDGES[pieceKey];

  return (
    <g>
      {active && (
        <>
          {/* glow area */}
          <path
            d={fillPath}
            fill={color.glow}
            filter="url(#gSoft)"
            opacity="0.35"
          />
          {/* outer neon edge */}
          <path
            d={edgePath}
            fill="none"
            stroke={color.color}
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
            filter="url(#gEdge)"
          />
          {/* sketch overlay on edge */}
          <path
            d={edgePath}
            fill="none"
            stroke={color.light}
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
            filter="url(#sketch)"
          />
        </>
      )}

      {/* base fill */}
      <path
        d={fillPath}
        fill={active ? color.color : INACTIVE.fill}
        filter={active ? "url(#sketch)" : undefined}
        style={{ transition: "fill 300ms ease" }}
      />

      {/* gloss */}
      <path
        d={fillPath}
        fill="url(#pieceGloss)"
        opacity={active ? 0.18 : 0.05}
      />

      {/* inner highlight line */}
      {active && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#gInner)"
        />
      )}
    </g>
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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="4 5"
      opacity="0.88"
      filter="url(#gSoft)"
    />
  );
}

function EnergyHit({ pieceKey, active, animClass }) {
  if (!active) return null;
  const color = CHAKANA_COLORS[pieceKey];
  const energy = ENERGY_PATHS[pieceKey];
  return (
    <g
      className={animClass}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <circle
        cx={energy.hitCx}
        cy={energy.hitCy}
        r="2.2"
        fill={color.light}
        filter="url(#gEdge)"
      />
      <circle
        cx={energy.hitCx}
        cy={energy.hitCy}
        r="3.8"
        fill="none"
        stroke={color.light}
        strokeWidth="2.4"
        opacity="0.9"
        filter="url(#gSoft)"
      />
    </g>
  );
}

function CenterHole() {
  return (
    <>
      <circle cx="200" cy="200" r="56" fill="var(--app-bg, #0d0b1a)" />
      <circle
        cx="200"
        cy="200"
        r="56"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
        filter="url(#sketch)"
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
        r="52"
        fill={isOn ? "rgba(255,200,80,0.12)" : "rgba(255,255,255,0.03)"}
        filter="url(#gSoft)"
      />
      <circle
        cx="200"
        cy="200"
        r="46"
        fill={isOn ? "#1C1530" : INACTIVE.fill}
        stroke={isOn ? color.color : "rgba(255,255,255,0.08)"}
        strokeWidth="2.4"
        filter="url(#sketch)"
      />
      <circle
        cx="200"
        cy="200"
        r="36"
        fill={isOn ? color.color : INACTIVE.fillSoft}
        filter={isOn ? "url(#gSoft)" : undefined}
        style={{ transition: "fill 300ms ease" }}
      />
      <circle
        cx="200"
        cy="200"
        r="27"
        fill={isOn ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}
      />
      <ellipse
        cx="189"
        cy="187"
        rx="9"
        ry="6"
        fill={isOn ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)"}
      />
      {isOn && (
        <text
          x="200"
          y="206"
          textAnchor="middle"
          fill="#1A0E00"
          style={{
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.14em",
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
              r="15"
              fill={isOn ? "rgba(8,6,22,0.90)" : "rgba(255,255,255,0.04)"}
              stroke={isOn ? palette.color : "rgba(255,255,255,0.07)"}
              strokeWidth="1.4"
              filter={isOn ? "url(#gEdge)" : "url(#sketch)"}
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
                stroke: isOn ? "rgba(10,6,24,0.9)" : "rgba(0,0,0,0.4)",
                strokeWidth: "3.5px",
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
    <div className="relative mx-auto w-full max-w-[420px]">
      <svg
        viewBox="0 0 400 400"
        className="block h-auto w-full overflow-visible align-top">
        <ChakanaDefs />
        <ChakanaBackdrop finalUnlocked={finalUnlocked} />

        <EnergyBeam pieceKey="topLeft" active={activeMap.topLeft} />
        <EnergyBeam pieceKey="topRight" active={activeMap.topRight} />
        <EnergyBeam pieceKey="bottomLeft" active={activeMap.bottomLeft} />
        <EnergyBeam pieceKey="bottomRight" active={activeMap.bottomRight} />

        <QuadrantPiece pieceKey="topLeft" active={activeMap.topLeft} />
        <QuadrantPiece pieceKey="topRight" active={activeMap.topRight} />
        <QuadrantPiece pieceKey="bottomLeft" active={activeMap.bottomLeft} />
        <QuadrantPiece pieceKey="bottomRight" active={activeMap.bottomRight} />

        <CenterHole />
        <CenterCore isOn={activeMap.center} />

        <EnergyHit
          pieceKey="topLeft"
          active={activeMap.topLeft}
          animClass="hit-tl"
        />
        <EnergyHit
          pieceKey="topRight"
          active={activeMap.topRight}
          animClass="hit-tr"
        />
        <EnergyHit
          pieceKey="bottomLeft"
          active={activeMap.bottomLeft}
          animClass="hit-bl"
        />
        <EnergyHit
          pieceKey="bottomRight"
          active={activeMap.bottomRight}
          animClass="hit-br"
        />

        <ChakanaLabels activeMap={activeMap} />

        {/* rune tick marks around outer ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const inner = i % 6 === 0 ? 174 : i % 3 === 0 ? 178 : 181;
          const outer = 190;
          const x1 = 200 + inner * Math.cos(angle);
          const y1 = 200 + inner * Math.sin(angle);
          const x2 = 200 + outer * Math.cos(angle);
          const y2 = 200 + outer * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={
                finalUnlocked
                  ? "rgba(255,220,140,0.45)"
                  : "rgba(255,255,255,0.12)"
              }
              strokeWidth={i % 6 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.7}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function FinalModuleUnlockPanel({
  modules = [],
  className = "",
  title = "Chakana sagrada",
  finalRoute = "/juegofinal",
  onOpenFinal = null,
}) {
  const navigate = useNavigate();
  const activeMap = useActiveMap(modules);

  const completedCount = useMemo(
    () => PIECE_ORDER.filter((k) => activeMap[k]).length,
    [activeMap],
  );

  const finalModule = useMemo(
    () => getModuleBySortOrder(modules, 6),
    [modules],
  );
  const finalState = normalizeStatus(finalModule?.status);
  const finalUnlocked =
    completedCount === 5 ||
    finalState === "unlocked" ||
    finalState === "completed";

  const helperText = finalUnlocked
    ? "La chakana está completa. El módulo final ya está disponible."
    : `Activa los cuatro cuadrantes y el núcleo para revelar el acceso final. (${completedCount}/5)`;

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
        "relative flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-0 overflow-hidden px-0 py-0",
        className,
      ].join(" ")}>
      <style>{`
        .hit-tl,.hit-tr,.hit-bl,.hit-br {
          transform-box: fill-box;
          transform-origin: center;
        }
        .hit-tl { animation: hitFlash 2.6s ease-out infinite 0s; }
        .hit-tr { animation: hitFlash 2.6s ease-out infinite 0.5s; }
        .hit-bl { animation: hitFlash 2.6s ease-out infinite 1.0s; }
        .hit-br { animation: hitFlash 2.6s ease-out infinite 1.5s; }

        @keyframes hitFlash {
          0%,70%,100% { opacity:0; transform:scale(0.3); }
          12%          { opacity:1; transform:scale(1); }
          28%          { opacity:.8; transform:scale(1.9); }
          48%          { opacity:0; transform:scale(2.6); }
        }

        @keyframes runeRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .chakana-rune-ring {
          transform-box: fill-box;
          transform-origin: 200px 200px;
          animation: runeRotate 32s linear infinite;
        }
        .chakana-rune-ring-rev {
          transform-box: fill-box;
          transform-origin: 200px 200px;
          animation: runeRotate 48s linear infinite reverse;
        }

        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 14px 28px rgba(255,157,47,0.22), 0 6px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.32); }
          50%     { box-shadow: 0 18px 36px rgba(255,157,47,0.40), 0 8px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.38); }
        }

        .cta-unlocked {
          animation: ctaPulse 2.4s ease-in-out infinite;
          transition: filter 150ms ease, transform 120ms ease;
        }
        .cta-unlocked:hover { filter: brightness(1.06); transform: translateY(-1px); }
        .cta-unlocked:active { transform: translateY(0px); }
      `}</style>

      {/* título */}
      <h2
        className="mt-3 mb-1 text-[26px] font-black tracking-tight leading-none text-center"
        style={{
          color: "var(--sidebar)",
          textShadow: "0 4px 20px rgba(0,0,0,0.30)",
        }}>
        {title}
      </h2>

      {/* progreso */}
      <div className="mb-1 flex items-center gap-1.5">
        {PIECE_ORDER.map((key) => (
          <div
            key={key}
            className="h-1.5 w-6 rounded-full transition-all duration-500"
            style={{
              background: activeMap[key]
                ? CHAKANA_COLORS[key].color
                : "rgba(255,255,255,0.12)",
              boxShadow: activeMap[key]
                ? `0 0 6px ${CHAKANA_COLORS[key].glow}`
                : "none",
            }}
          />
        ))}
      </div>

      {/* chakana SVG */}
      <ChakanaSvg activeMap={activeMap} finalUnlocked={finalUnlocked} />

      {/* helper + CTA */}
      <div className="-mt-3 w-full text-center">
        <p
          className="mx-auto max-w-[56ch] text-[12px] leading-relaxed"
          style={{ color: "var(--card-muted)" }}>
          {helperText}
        </p>

        <button
          type="button"
          disabled={!finalUnlocked}
          onClick={handleOpenFinal}
          className={`mx-auto mt-3 mb-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2 text-[13px] font-black uppercase tracking-[0.12em] ${finalUnlocked ? "cta-unlocked" : ""}`}
          style={{
            background: finalUnlocked
              ? "linear-gradient(180deg, #FFD87A 0%, #FF9D2F 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
            color: finalUnlocked ? "#2E1800" : "var(--card-muted)",
            border: finalUnlocked
              ? "1px solid rgba(255,220,140,0.40)"
              : "1px solid rgba(255,255,255,0.08)",
            cursor: finalUnlocked ? "pointer" : "not-allowed",
            opacity: finalUnlocked ? 1 : 0.7,
          }}>
          {finalUnlocked ? (
            "Ingresar al módulo final"
          ) : (
            <>
              <Lock size={13} /> Aún sellado
            </>
          )}
        </button>
      </div>
    </section>
  );
}
