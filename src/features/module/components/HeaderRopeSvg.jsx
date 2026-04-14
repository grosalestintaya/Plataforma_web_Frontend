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

function makePalette(themeHex) {
  const base = themeHex || "#8B5CF6";

  return {
    main: base,
    dark: mixHex(base, "#1f140d", 0.48),
    light: mixHex(base, "#ffffff", 0.52),
    shadow: hexToRgba(mixHex(base, "#1f140d", 0.7), 0.26),
    glowSoft: hexToRgba(base, 0.18),
  };
}

function useBraidStamps(
  pathRef,
  { step = 13, trimStart = 12, trimEnd = 12, sideOffset = 2.15 } = {},
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
          const prev = pathNode.getPointAtLength(Math.max(0, d - 1.6));
          const next = pathNode.getPointAtLength(Math.min(total, d + 1.6));

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
            scaleX: i % 2 === 0 ? 1.06 : 1,
            scaleY: i % 2 === 0 ? 1.03 : 0.99,
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

function EndKnot({ x, y, palette, flip = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <ellipse cx="0" cy="0" rx="13.8" ry="9.6" fill="rgba(0,0,0,0.14)" />

      <ellipse
        cx="0"
        cy="0"
        rx="11.4"
        ry="7.9"
        fill={palette.dark}
        stroke={hexToRgba(palette.light, 0.65)}
        strokeWidth="1.2"
      />

      <path
        d="M -5.8 -2.7 Q 0 -0.9 5.8 -2.7"
        fill="none"
        stroke={hexToRgba(palette.light, 0.8)}
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      <path
        d="
          M 11.2 0
          C 17.4 -2.1, 23.4 -2.1, 27.5 0
          C 23.7 2.1, 17.6 2.1, 11.2 0
        "
        fill={palette.dark}
        opacity="0.95"
      />
    </g>
  );
}

export default function HeaderRopeSvg({
  themeHex = "#7C3AED",
  className = "",
}) {
  const guideRef = useRef(null);
  const uid = useId().replace(/:/g, "");
  const palette = useMemo(() => makePalette(themeHex), [themeHex]);

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
    step: 13,
    trimStart: 14,
    trimEnd: 14,
    sideOffset: 2.15,
  });

  const braidCellId = `header-rope-braid-${uid}`;
  const maskId = `header-rope-mask-${uid}`;
  const glowId = `header-rope-glow-${uid}`;
  const shadowId = `header-rope-shadow-${uid}`;

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
          y="-120%"
          width="120%"
          height="300%"
          colorInterpolationFilters="sRGB">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="5"
            floodColor={hexToRgba("#000000", 0.22)}
          />
        </filter>

        <filter
          id={glowId}
          x="-10%"
          y="-150%"
          width="120%"
          height="400%"
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
              M -16.5 0
              C -13.4 -5.8, -7.9 -9.7, -0.4 -9.9
              C 7.2 -10.1, 12.8 -5.8, 16.2 0
              C 12.8 5.8, 7.2 10.1, -0.4 9.9
              C -7.9 9.7, -13.4 5.8, -16.5 0
              Z
            "
            fill={"#C1814B"}
            stroke={"#3e352b"}
            strokeWidth="1.26"
            strokeLinejoin="round"
          />

          <path
            d="M -10.6 6.3 C -6.6 3.5, -2.1 0.5, 9.3 -7"
            fill="none"
            stroke={hexToRgba(palette.dark, 0.32)}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          <path
            d="M -9.6 -5 C -5.2 -7.3, 0.2 -6.7, 8.9 -2.4"
            fill="none"
            stroke={hexToRgba(palette.light, 0.3)}
            strokeWidth="1.18"
            strokeLinecap="round"
          />

          <path
            d="M -11.6 -1.4 C -5.2 -4.1, 2.1 -3.3, 10.8 2.9"
            fill="none"
            stroke={hexToRgba(palette.dark, 0.14)}
            strokeWidth="0.86"
            strokeLinecap="round"
          />
        </g>

        <mask id={maskId}>
          <rect x="-120" y="-70" width="1500" height="240" fill="black" />
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth="36"
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
        stroke={palette.shadow}
        strokeWidth="9"
        strokeLinecap="round"
        filter={`url(#${shadowId})`}
      />

      <path
        d={path}
        fill="none"
        stroke={hexToRgba(palette.dark, 0.09)}
        strokeWidth="25"
        strokeLinecap="round"
        opacity="0.76"
      />

      <path
        d={path}
        fill="none"
        stroke={hexToRgba(palette.main, 0.55)}
        strokeWidth="15"
        strokeLinecap="round"
        opacity="0.86"
      />

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

      <path
        d={path}
        fill="none"
        stroke={hexToRgba(palette.light, 0.18)}
        strokeWidth="1.3"
        strokeLinecap="round"
        transform="translate(0,-0.9)"
      />

      <path
        d={path}
        fill="none"
        stroke={palette.glowSoft}
        strokeWidth="1.9"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        opacity="0.7"
      />

      <EndKnot x="24" y="46" palette={palette} flip={1} />
      <EndKnot x="1178" y="43.5" palette={palette} flip={-1} />
    </svg>
  );
}
