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
    dark: mixHex(base, "#24140B", 0.54),
    light: mixHex(base, "#FFFFFF", 0.54),
    shadow: hexToRgba(mixHex(base, "#120A05", 0.74), 0.24),
    topLight: hexToRgba(mixHex(base, "#FFFFFF", 0.82), 0.18),
    lowShade: hexToRgba("#4A2812", 0.18),
  };
}

function useBraidStamps(
  pathRef,
  { step = 12.9, trimStart = 10, trimEnd = 10, sideOffset = 1.75 } = {},
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
          const prev = pathNode.getPointAtLength(Math.max(0, d - 1.5));
          const next = pathNode.getPointAtLength(Math.min(total, d + 1.5));

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
            scaleX: i % 2 === 0 ? 1.04 : 1,
            scaleY: i % 2 === 0 ? 1.02 : 0.99,
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

function usePathMarkers(pathRef, ratios = []) {
  const [points, setPoints] = useState([]);

  useLayoutEffect(() => {
    const pathNode = pathRef.current;
    if (!pathNode || !ratios.length) return;

    let frame = 0;

    const build = () => {
      try {
        const total = pathNode.getTotalLength();
        const nextPoints = ratios.map((ratio) => {
          const d = total * ratio;
          const p = pathNode.getPointAtLength(d);
          return { x: p.x, y: p.y };
        });

        setPoints(nextPoints);
      } catch {
        setPoints([]);
      }
    };

    frame = requestAnimationFrame(build);
    return () => cancelAnimationFrame(frame);
  }, [pathRef, ratios]);

  return points;
}

function EndCap({ x, y, palette, flip = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <ellipse cx="0" cy="0" rx="11.8" ry="8.4" fill="rgba(0,0,0,0.14)" />
      <ellipse
        cx="0"
        cy="0"
        rx="9.6"
        ry="6.9"
        fill={palette.dark}
        stroke={hexToRgba(palette.light, 0.66)}
        strokeWidth="1.05"
      />
      <path
        d="M -4.8 -2.2 Q 0 -0.7 4.8 -2.2"
        fill="none"
        stroke={hexToRgba(palette.light, 0.82)}
        strokeWidth="0.78"
        strokeLinecap="round"
      />
      <path
        d="
          M 9.8 0
          C 15.2 -1.8, 20.6 -1.8, 24 0
          C 20.8 1.8, 15.4 1.8, 9.8 0
        "
        fill={palette.dark}
        opacity="0.95"
      />
    </g>
  );
}

function MidKnot({ x, y, palette }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="5.6" ry="4.2" fill="rgba(0,0,0,0.13)" />
      <ellipse
        cx="0"
        cy="0"
        rx="4.4"
        ry="3.25"
        fill={palette.dark}
        stroke={hexToRgba(palette.light, 0.56)}
        strokeWidth="0.82"
      />
      <path
        d="M -2.35 -1.2 Q 0 -0.25 2.35 -1.2"
        fill="none"
        stroke={hexToRgba(palette.light, 0.66)}
        strokeWidth="0.56"
        strokeLinecap="round"
      />
    </g>
  );
}

function SlimPendant({ x, y = 58, side = "left", palette }) {
  const dir = side === "left" ? -1 : 1;

  return (
    <g transform={`translate(${x} ${y})`} opacity="0.97">
      <ellipse cx="0" cy="0" rx="4.9" ry="3.7" fill={palette.dark} />
      <ellipse
        cx="0"
        cy="0"
        rx="4.9"
        ry="3.7"
        fill="none"
        stroke={hexToRgba(palette.light, 0.56)}
        strokeWidth="0.85"
      />

      <path
        d={`M ${-5.8 * dir} 1.8 C ${-6.8 * dir} 7.2, ${-6.1 * dir} 12.5, ${-4.6 * dir} 19.8`}
        fill="none"
        stroke={hexToRgba(palette.main, 0.76)}
        strokeWidth="2.35"
        strokeLinecap="round"
      />
      <path
        d="M 0 2 C 0 8.5, 0 15, 0 22.4"
        fill="none"
        stroke={hexToRgba(palette.dark, 0.98)}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d={`M ${5.8 * dir} 1.8 C ${6.8 * dir} 7.2, ${6.1 * dir} 12.5, ${4.6 * dir} 19.8`}
        fill="none"
        stroke={hexToRgba(palette.dark, 0.98)}
        strokeWidth="2.35"
        strokeLinecap="round"
      />

      <path
        d="M 0 2 C 0 8.5, 0 15, 0 22.4"
        fill="none"
        stroke={hexToRgba(palette.light, 0.22)}
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      <ellipse
        cx={-4.6 * dir}
        cy="10.2"
        rx="3.8"
        ry="3.1"
        fill={palette.main}
      />
      <ellipse cx="0" cy="14.7" rx="4.3" ry="3.4" fill={palette.dark} />
      <ellipse cx={4.6 * dir} cy="19.2" rx="3.6" ry="2.9" fill={palette.main} />

      <g transform="translate(0 29.2)">
        <path
          d="M 0 -4.9 L 4.9 0 L 0 4.9 L -4.9 0 Z"
          fill={palette.dark}
          stroke={hexToRgba(palette.light, 0.54)}
          strokeWidth="0.86"
        />
        <path
          d="M 0 -2.55 L 2.55 0 L 0 2.55 L -2.55 0 Z"
          fill={palette.main}
          opacity="0.9"
          stroke={hexToRgba("#ffffff", 0.32)}
          strokeWidth="0.45"
        />
      </g>
    </g>
  );
}

export default function ContentRopeSvg({
  className = "",
  themeHex = "#7130F7",
}) {
  const uid = useId().replace(/:/g, "");
  const guideRef = useRef(null);
  const palette = useMemo(() => makePalette(themeHex), [themeHex]);

  const ids = {
    braidCell: `content-rope-braid-${uid}`,
    mask: `content-rope-mask-${uid}`,
    shadow: `content-rope-shadow-${uid}`,
  };

  const ropePath = useMemo(
    () => `
      M -100 58
      C 170 48, 430 69, 710 58
      C 990 47, 1245 69, 1525 58
      C 1805 47, 2060 69, 2340 58
      C 2580 49, 2775 62, 2920 58
    `,
    [],
  );

  const stamps = useBraidStamps(guideRef, {
    step: 12.9,
    trimStart: 12,
    trimEnd: 12,
    sideOffset: 1.75,
  });

  const ropeKnots = usePathMarkers(guideRef, [0.18, 0.34, 0.5, 0.66, 0.82]);

  return (
    <svg
      viewBox="0 0 2500 116"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true">
      <defs>
        <filter
          id={ids.shadow}
          x="-12%"
          y="-150%"
          width="124%"
          height="400%"
          colorInterpolationFilters="sRGB">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="4.2"
            floodColor="rgba(0,0,0,0.22)"
          />
        </filter>

        <g id={ids.braidCell}>
          <path
            d="
              M -15.2 0
              C -12.3 -5.4, -7.2 -9.1, -0.4 -9.2
              C 6.6 -9.4, 11.8 -5.4, 14.9 0
              C 11.8 5.4, 6.6 9.4, -0.4 9.2
              C -7.2 9.1, -12.3 5.4, -15.2 0
              Z
            "
            fill={palette.main}
            stroke={palette.dark}
            strokeWidth="1.16"
            strokeLinejoin="round"
          />

          <path
            d="M -9.8 5.8 C -6 3.2, -1.9 0.4, 8.5 -6.4"
            fill="none"
            stroke={hexToRgba(palette.dark, 0.32)}
            strokeWidth="2.02"
            strokeLinecap="round"
          />

          <path
            d="M -8.9 -4.6 C -4.8 -6.8, 0.2 -6.2, 8.1 -2.2"
            fill="none"
            stroke={hexToRgba(palette.light, 0.3)}
            strokeWidth="1.05"
            strokeLinecap="round"
          />

          <path
            d="M -10.6 -1.3 C -4.8 -3.85, 1.9 -3.15, 9.9 2.55"
            fill="none"
            stroke={hexToRgba(palette.dark, 0.14)}
            strokeWidth="0.78"
            strokeLinecap="round"
          />
        </g>

        <mask id={ids.mask}>
          <rect x="-200" y="-80" width="3350" height="260" fill="black" />
          <path
            d={ropePath}
            fill="none"
            stroke="white"
            strokeWidth="32"
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
        stroke={palette.shadow}
        strokeWidth="34"
        strokeLinecap="round"
        filter={`url(#${ids.shadow})`}
      />

      <path
        d={ropePath}
        fill="none"
        stroke={hexToRgba(palette.dark, 0.92)}
        strokeWidth="17"
        strokeLinecap="round"
        opacity="0.76"
      />

      <path
        d={ropePath}
        fill="none"
        stroke={hexToRgba(palette.main, 0.54)}
        strokeWidth="10.2"
        strokeLinecap="round"
        opacity="0.86"
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
        stroke={palette.topLight}
        strokeWidth="0.96"
        strokeLinecap="round"
        transform="translate(0,-0.72)"
      />

      <path
        d={ropePath}
        fill="none"
        stroke={palette.lowShade}
        strokeWidth="1.24"
        strokeLinecap="round"
        transform="translate(0,0.98)"
      />

      <g opacity="0.96">
        {ropeKnots.map((k, i) => (
          <MidKnot key={i} x={k.x} y={k.y} palette={palette} />
        ))}
      </g>

      <SlimPendant x={112} y={58} side="left" palette={palette} />
      <SlimPendant x={2716} y={58} side="right" palette={palette} />

      <EndCap x={34} y={58} palette={palette} flip={1} />
      <EndCap x={2792} y={58} palette={palette} flip={-1} />
    </svg>
  );
}
