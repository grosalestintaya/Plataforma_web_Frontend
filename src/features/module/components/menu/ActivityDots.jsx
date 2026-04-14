import React, {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import conceptual from "@/assets/modules/conceptual.png";
import procedimental from "@/assets/modules/procedimental.png";
import actitudinal from "@/assets/modules/actitudinal.png";

function iconForType(type) {
  if (type === "conceptual") return conceptual;
  if (type === "procedimental") return procedimental;
  if (type === "actitudinal") return actitudinal;
  return conceptual;
}

function stateGlyph(status) {
  if (status === "completed") return "OK";
  if (status === "locked") return "L";
  if (status === "in_progress") return "...";
  return ">";
}

function statusBadgeBackground(status, themeHex) {
  if (status === "completed") {
    return "linear-gradient(180deg, #10b981, #047857)";
  }
  if (status === "locked") {
    return "linear-gradient(180deg, #666, #222)";
  }
  if (status === "in_progress") {
    return "linear-gradient(180deg, #f59e0b, #b45309)";
  }
  return `linear-gradient(180deg, ${themeHex}, ${themeHex}cc)`;
}

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

function mixHex(hex, target = "#ffffff", amount = 0.5) {
  const parse = (value) => {
    const clean = String(value || "#000000").replace("#", "");
    const full =
      clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean.padEnd(6, "0");

    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const toHex = (value) => value.toString(16).padStart(2, "0");

  const a = parse(hex);
  const b = parse(target);

  const r = Math.round(a.r + (b.r - a.r) * amount);
  const g = Math.round(a.g + (b.g - a.g) * amount);
  const b2 = Math.round(a.b + (b.b - a.b) * amount);

  return `#${toHex(r)}${toHex(g)}${toHex(b2)}`;
}

function makePalette(themeHex) {
  const base = themeHex || "#7130F7";

  return {
    main: base,
    dark: mixHex(base, "#2a160b", 0.52),
    light: mixHex(base, "#ffffff", 0.5),
    shadow: hexToRgba(mixHex(base, "#160c06", 0.72), 0.24),
  };
}

function makeRopeTones(palette) {
  return {
    patternFill: palette.main,
    patternStroke: palette.dark,
    crossShadow: hexToRgba(palette.dark, 0.34),
    hi: hexToRgba(palette.light, 0.3),
    inner: hexToRgba(palette.dark, 0.16),
    shadow: hexToRgba(palette.dark, 0.16),
    support1: hexToRgba(palette.dark, 0.92),
    support2: hexToRgba(palette.main, 0.56),
    topLight: hexToRgba(palette.light, 0.16),
    knotPalette: {
      dark: palette.dark,
      light: palette.light,
    },
  };
}

function buildRopePath(points, stemTopY = -34) {
  if (!points.length) return "";

  const first = points[0];

  let d = `
    M ${first.x} ${stemTopY}
    C ${first.x + 1.4} ${stemTopY + 18},
      ${first.x - 1.4} ${first.y - 18},
      ${first.x} ${first.y}
  `;

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const dy = b.y - a.y;
    const dx = b.x - a.x;
    const dir = dx === 0 ? (i % 2 === 0 ? 1 : -1) : Math.sign(dx);
    const bend = 24;

    d += `
      C ${a.x + dir * bend} ${a.y + dy * 0.36},
        ${b.x - dir * bend} ${b.y - dy * 0.36},
        ${b.x} ${b.y}
    `;
  }

  return d;
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

function useTailMeta(pathRef, ratio = 0.965) {
  const [meta, setMeta] = useState(null);

  useLayoutEffect(() => {
    const pathNode = pathRef.current;
    if (!pathNode) return;

    let frame = 0;

    const build = () => {
      try {
        const total = pathNode.getTotalLength();
        const d = total * ratio;

        const p = pathNode.getPointAtLength(d);
        const prev = pathNode.getPointAtLength(Math.max(0, d - 1.6));
        const next = pathNode.getPointAtLength(Math.min(total, d + 1.6));

        const angle =
          (Math.atan2(next.y - prev.y, next.x - prev.x) * 180) / Math.PI;

        setMeta({
          x: p.x,
          y: p.y,
          angle,
        });
      } catch {
        setMeta(null);
      }
    };

    frame = requestAnimationFrame(build);
    return () => cancelAnimationFrame(frame);
  }, [pathRef, ratio]);

  return meta;
}

function TopBindKnot({ x, y, palette }) {
  const fill = palette.dark;
  const stroke = hexToRgba(palette.light, 0.72);
  const shine = hexToRgba(palette.light, 0.86);

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
        stroke={hexToRgba(palette.dark, 0.22)}
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </g>
  );
}

function TailKnot({ x, y, angle = 0, palette }) {
  const fill = palette.dark;
  const stroke = hexToRgba(palette.light, 0.68);
  const shine = hexToRgba(palette.light, 0.8);

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

function MidRopeKnot({ x, y, palette }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="6.2" ry="4.7" fill="rgba(0,0,0,0.14)" />
      <ellipse
        cx="0"
        cy="0"
        rx="4.9"
        ry="3.7"
        fill={palette.dark}
        stroke={hexToRgba(palette.light, 0.54)}
        strokeWidth="0.9"
      />
      <path
        d="M -2.8 -1.5 Q 0 -0.35 2.8 -1.5"
        fill="none"
        stroke={hexToRgba(palette.light, 0.68)}
        strokeWidth="0.65"
        strokeLinecap="round"
      />
    </g>
  );
}

export default function ActivityDots({
  activities,
  onClickDot,
  selectedId,
  onSelect,
  themeHex = "#7130F7",
}) {
  const uid = useId().replace(/:/g, "");
  const guideRef = useRef(null);

  const palette = useMemo(() => makePalette(themeHex), [themeHex]);
  const tones = useMemo(() => makeRopeTones(palette), [palette]);

  const list = useMemo(() => {
    return [...(activities || [])].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
  }, [activities]);

  const buttonSize = 110;
  const gap = 54;
  const topStemSpace = 84;
  const bottomPad = 14;
  const xOffsets = [0, 10, -6];

  const W = 196;
  const centerX = W / 2;

  const centers = list.map((_, idx) => ({
    x: centerX + (xOffsets[idx] ?? 0),
    y: topStemSpace + buttonSize / 2 + idx * (buttonSize + gap),
  }));

  const H =
    (centers[centers.length - 1]?.y ?? topStemSpace + buttonSize / 2) +
    buttonSize / 2 +
    bottomPad;

  const ropePath = useMemo(() => buildRopePath(centers, -34), [centers]);

  const ids = {
    shadow: `activity-rope-shadow-${uid}`,
    mask: `activity-rope-mask-${uid}`,
    braidCell: `activity-rope-braid-${uid}`,
  };

  const ropeKnots = centers.slice(0, -1).map((a, i) => {
    const b = centers[i + 1];
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
  });

  const stamps = useBraidStamps(guideRef, {
    step: 9.6,
    trimStart: 5,
    trimEnd: 5,
    sideOffset: 1.65,
  });

  const tailMeta = useTailMeta(guideRef, 0.965);

  return (
    <div className="relative flex w-full justify-center overflow-visible">
      <div className="relative w-[196px] overflow-visible">
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          <svg
            width={W}
            height={H}
            viewBox={`0 -74 ${W} ${H + 82}`}
            className="overflow-visible"
            aria-hidden="true">
            <defs>
              <filter
                id={ids.shadow}
                x="-70%"
                y="-60%"
                width="240%"
                height="240%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3.2"
                  floodColor="rgba(0,0,0,0.28)"
                />
              </filter>

              <g id={ids.braidCell}>
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
                  stroke="#4A2812"
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

              <mask id={ids.mask}>
                <rect
                  x="-120"
                  y="-110"
                  width="600"
                  height={H + 220}
                  fill="black"
                />
                <path
                  d={ropePath}
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
              d={ropePath}
              fill="none"
              stroke="transparent"
              strokeWidth="1"
              pointerEvents="none"
            />

            <path
              d={ropePath}
              fill="none"
              stroke={tones.shadow}
              strokeWidth="24.5"
              strokeLinecap="round"
              filter={`url(#${ids.shadow})`}
            />

            <path
              d={ropePath}
              fill="none"
              stroke={tones.support1}
              strokeWidth="15.5"
              strokeLinecap="round"
              opacity="0.72"
            />

            <path
              d={ropePath}
              fill="none"
              stroke={tones.support2}
              strokeWidth="8.9"
              strokeLinecap="round"
              opacity="0.52"
            />

            <g mask={`url(#${ids.mask})`}>
              {stamps.map((item, i) => (
                <use
                  key={i}
                  href={`#${ids.braidCell}`}
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
              d={ropePath}
              fill="none"
              stroke={tones.topLight}
              strokeWidth="0.9"
              strokeLinecap="round"
              transform="translate(0,-0.7)"
            />

            <TopBindKnot
              x={centers[0]?.x ?? centerX}
              y={-33}
              palette={tones.knotPalette}
            />

            {ropeKnots.map((k, i) => (
              <MidRopeKnot
                key={i}
                x={k.x}
                y={k.y}
                palette={tones.knotPalette}
              />
            ))}

            {tailMeta && (
              <TailKnot
                x={tailMeta.x}
                y={tailMeta.y}
                angle={tailMeta.angle}
                palette={tones.knotPalette}
              />
            )}
          </svg>
        </div>

        <div
          className="relative flex flex-col items-center overflow-visible"
          style={{
            paddingTop: `${topStemSpace}px`,
            paddingBottom: `${bottomPad}px`,
            gap: `${gap}px`,
          }}>
          {list.map((a, idx) => {
            const selected = String(a.activityId) === String(selectedId);
            const disabled = a.status === "locked";
            const img = iconForType(a.type);
            const x = xOffsets[idx] ?? 0;

            return (
              <div
                key={a.activityId}
                className="relative"
                style={{ transform: `translateX(${x}px)` }}>
                {selected && !disabled && (
                  <>
                    <span
                      className="pointer-events-none absolute -inset-4 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${themeHex}40 0%, transparent 72%)`,
                        filter: "blur(4px)",
                        animation: "qyPulseSoft 1.8s ease-out infinite",
                      }}
                    />
                    <span
                      className="pointer-events-none absolute -inset-[10px] rounded-full"
                      style={{
                        border: `3px solid ${themeHex}33`,
                        animation: "qyRingSoft 1.7s ease-out infinite",
                      }}
                    />
                  </>
                )}

                <button
                  onClick={() => {
                    onClickDot?.(a);
                    onSelect?.(a.activityId);
                  }}
                  disabled={disabled}
                  className={[
                    "group relative h-[110px] w-[110px] overflow-hidden rounded-full",
                    "transition-all duration-300",
                    disabled
                      ? "cursor-not-allowed opacity-55"
                      : "hover:scale-[1.045] active:scale-[1.015]",
                  ].join(" ")}
                  style={{
                    background:
                      "radial-gradient(circle at 28% 24%, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 45%, rgba(0,0,0,0.14) 100%)",
                    border: selected
                      ? "2px solid rgba(255,245,230,0.52)"
                      : "2px solid rgba(255,255,255,0.16)",
                    boxShadow: selected
                      ? `0 0 0 6px ${themeHex}18, 0 20px 60px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.22)`
                      : "0 16px 44px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14)",
                  }}
                  title={disabled ? "Bloqueada" : "Ver actividad"}>
                  <img
                    src={img}
                    alt={a.type}
                    draggable={false}
                    className="pointer-events-none absolute rounded-full object-cover"
                    style={{
                      top: 10,
                      left: 10,
                      right: 10,
                      bottom: 10,
                      width: "calc(100% - 20px)",
                      height: "calc(100% - 20px)",
                      filter: disabled
                        ? "grayscale(1) contrast(1.02) brightness(0.82)"
                        : selected
                          ? "contrast(1.12) saturate(1.18)"
                          : "contrast(1.05) saturate(1.06)",
                    }}
                  />

                  <div
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      top: 10,
                      left: 10,
                      right: 10,
                      bottom: 10,
                      background:
                        "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.24), transparent 58%), linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.38))",
                    }}
                  />

                  {selected && (
                    <div
                      className="pointer-events-none absolute rounded-full"
                      style={{
                        top: 10,
                        left: 10,
                        right: 10,
                        bottom: 10,
                        boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.12), inset 0 0 0 10px ${themeHex}12`,
                      }}
                    />
                  )}

                  <div
                    className="absolute left-[7px] top-[7px] flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-black"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(38,20,8,0.92), rgba(18,10,4,0.92))",
                      border: "1px solid rgba(255,227,190,0.26)",
                      color: "#F7E5C7",
                      zIndex: 5,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.28)",
                    }}>
                    {a.sortOrder}
                  </div>

                  <div
                    className="absolute bottom-[7px] right-[7px] flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-black"
                    style={{
                      background: statusBadgeBackground(a.status, themeHex),
                      border: "1px solid rgba(255,255,255,0.24)",
                      color: "white",
                      zIndex: 5,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.28)",
                    }}>
                    {stateGlyph(a.status)}
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.14), transparent 38%)",
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes qyPulseSoft {
            0%   { transform: scale(0.92); opacity: 0.72; }
            70%  { transform: scale(1.08); opacity: 0.10; }
            100% { transform: scale(1.12); opacity: 0; }
          }

          @keyframes qyRingSoft {
            0%   { transform: scale(0.90); opacity: 0.42; }
            70%  { transform: scale(1.12); opacity: 0.08; }
            100% { transform: scale(1.18); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
