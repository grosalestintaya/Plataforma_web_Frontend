import React, {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

  const a = parse(hex);
  const b = parse(target);

  const r = Math.round(a.r + (b.r - a.r) * amount);
  const g = Math.round(a.g + (b.g - a.g) * amount);
  const b2 = Math.round(a.b + (b.b - a.b) * amount);

  return `rgb(${r}, ${g}, ${b2})`;
}

function makeHeaderPalette(themeHex) {
  const accent = themeHex || "#8B5CF6";

  return {
    ropeBase: "#C1814B",
    ropeDark: "#4A2812",
    ropeSupport: "#7A4A28",
    ropeMid: "#B87744",
    knotFill: "#8D5A32",
    knotStroke: "#D8A96D",
    knotGlow: "#F4D4A9",
    lightSoft: "rgba(255,236,206,0.28)",
    lightEdge: "rgba(255,247,231,0.16)",
    lightLine: "rgba(255,243,225,0.11)",
    shadowMain: "rgba(82,46,22,0.32)",
    shadowInner: "rgba(70,39,19,0.13)",
    shadowGlobal: "rgba(20,11,5,0.14)",
    accent,
    accentGlow: hexToRgba(accent, 0.16),
    accentStroke: hexToRgba(accent, 0.08),
    accentLight: hexToRgba(mixHex(accent, "#ffffff", 0.5), 0.34),
  };
}

function useBraidStamps(
  pathRef,
  { step = 10.9, trimStart = 8, trimEnd = 8, sideOffset = 2.35 } = {},
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
          const prev = pathNode.getPointAtLength(Math.max(0, d - 1.9));
          const next = pathNode.getPointAtLength(Math.min(total, d + 1.9));

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
            scaleX: i % 2 === 0 ? 1.11 : 1.05,
            scaleY: i % 2 === 0 ? 1.09 : 1.03,
            opacity: i % 2 === 0 ? 1 : 0.95,
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

function HeaderEndKnot({ x, y, flip = 1, palette }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <ellipse cx="0" cy="0" rx="13.4" ry="9.8" fill="rgba(0,0,0,0.14)" />

      <ellipse
        cx="0"
        cy="0"
        rx="10.8"
        ry="7.6"
        fill={palette.knotFill}
        stroke={palette.knotStroke}
        strokeWidth="1.15"
      />

      <path
        d="M -5.8 -3.9 Q 0 -1.15 5.8 -3.9"
        fill="none"
        stroke="rgba(255,236,204,0.88)"
        strokeWidth="0.92"
        strokeLinecap="round"
      />

      <path
        d="M -5.8 3.9 Q 0 1.15 5.8 3.9"
        fill="none"
        stroke="rgba(92,49,22,0.22)"
        strokeWidth="0.82"
        strokeLinecap="round"
      />

      <circle cx="0" cy="0" r="1.25" fill={palette.knotGlow} />
    </g>
  );
}

export default function HeaderRopeSvg({
  themeHex = "#7C3AED",
  className = "",
  showEndKnots = true,
}) {
  const guideRef = useRef(null);
  const uid = useId().replace(/:/g, "");
  const palette = useMemo(() => makeHeaderPalette(themeHex), [themeHex]);

  const path = useMemo(
    () => `
      M -24 46
      C 90 39, 185 28, 300 36
      C 400 44, 515 57, 640 47
      C 770 37, 865 24, 985 35
      C 1090 44, 1178 47, 1236 43
    `,
    [],
  );

  const stamps = useBraidStamps(guideRef, {
    step: 10.9,
    trimStart: 8,
    trimEnd: 8,
    sideOffset: 2.35,
  });

  const braidCellId = `header-braid-cell-${uid}`;
  const maskId = `header-braid-mask-${uid}`;
  const shadowId = `header-rope-shadow-${uid}`;
  const glowId = `header-rope-glow-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 1200 92"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter
          id={shadowId}
          x="-10%"
          y="-140%"
          width="120%"
          height="340%"
          colorInterpolationFilters="sRGB">
          <feDropShadow
            dx="0"
            dy="4.6"
            stdDeviation="4.4"
            floodColor="rgba(0,0,0,0.22)"
          />
        </filter>

        <filter
          id={glowId}
          x="-10%"
          y="-180%"
          width="120%"
          height="430%"
          colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="4.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <g id={braidCellId}>
          <path
            d="
              M -20.6 0
              C -17.4 -7.4, -10.2 -12.2, -0.6 -12.5
              C 8.9 -12.7, 16.1 -7.4, 20.3 0
              C 16.2 7.4, 8.9 12.7, -0.6 12.5
              C -10.2 12.2, -17.4 7.4, -20.6 0
              Z
            "
            fill={palette.ropeBase}
            stroke={palette.ropeDark}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          <path
            d="
              M -13.2 8.1
              C -8.2 4.6, -2.7 0.7, 11.4 -8.7
            "
            fill="none"
            stroke={palette.shadowMain}
            strokeWidth="2.55"
            strokeLinecap="round"
          />

          <path
            d="
              M -12 -6.3
              C -6.4 -9.3, 0.1 -8.5, 10.9 -3.2
            "
            fill="none"
            stroke={palette.lightSoft}
            strokeWidth="1.55"
            strokeLinecap="round"
          />

          <path
            d="
              M -14.5 -1.8
              C -6.2 -5.1, 2.7 -4.3, 13.8 3.4
            "
            fill="none"
            stroke={palette.shadowInner}
            strokeWidth="1"
            strokeLinecap="round"
          />

          <path
            d="
              M 1.5 11
              C 7.3 9.2, 12.4 5.1, 16.2 0.2
            "
            fill="none"
            stroke={palette.lightEdge}
            strokeWidth="0.95"
            strokeLinecap="round"
          />
        </g>

        <mask id={maskId}>
          <rect x="-120" y="-80" width="1500" height="260" fill="black" />
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth="31"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      {/* guía invisible */}
      <path
        ref={guideRef}
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="1"
        pointerEvents="none"
      />

      {/* sombra global */}
      <path
        d={path}
        fill="none"
        stroke={palette.shadowGlobal}
        strokeWidth="33.5"
        strokeLinecap="round"
        filter={`url(#${shadowId})`}
      />

      {/* base de soporte */}
      <path
        d={path}
        fill="none"
        stroke={palette.ropeSupport}
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.56"
      />

      <path
        d={path}
        fill="none"
        stroke={palette.ropeMid}
        strokeWidth="13.6"
        strokeLinecap="round"
        opacity="0.24"
      />

      {/* trenzado principal */}
      <g mask={`url(#${maskId})`}>
        {stamps.map((item, i) => (
          <use
            key={i}
            href={`#${braidCellId}`}
            transform={`
              translate(${item.x} ${item.y})
              rotate(${item.angle + item.flip * 168})
              scale(${item.scaleX} ${item.flip * item.scaleY})
            `}
            opacity={item.opacity}
          />
        ))}
      </g>

      {/* brillo superior mínimo */}
      <path
        d={path}
        fill="none"
        stroke={palette.lightLine}
        strokeWidth="1.05"
        strokeLinecap="round"
        transform="translate(0,-0.9)"
      />

      {/* acento del theme, muy sutil */}
      <path
        d={path}
        fill="none"
        stroke={palette.accentStroke}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
        filter={`url(#${glowId})`}
      />

      {/* brillo de color del theme, casi ambiente */}
      <path
        d={path}
        fill="none"
        stroke={palette.accentGlow}
        strokeWidth="2"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        opacity="0.7"
      />

      {showEndKnots && (
        <>
          <HeaderEndKnot x="24" y="46" flip={1} palette={palette} />
          <HeaderEndKnot x="1178" y="43.5" flip={-1} palette={palette} />
        </>
      )}
    </svg>
  );
}
