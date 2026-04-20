import React, {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildBranchCurve } from "./rope.variants";
import {
  clamp,
  curveToPath,
  getCurvePointAtLengthRatio,
  tangentAngleDeg,
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
  { step = 10.4, trimStart = 4, trimEnd = 4, sideOffset = 1.05 } = {},
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
          const prev = pathNode.getPointAtLength(Math.max(0, d - 1.2));
          const next = pathNode.getPointAtLength(Math.min(total, d + 1.2));

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
            scaleX: i % 2 === 0 ? 1.02 : 0.98,
            scaleY: i % 2 === 0 ? 1.0 : 0.96,
            opacity: i % 2 === 0 ? 0.96 : 0.9,
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

function DecorativeKnot({ x, y, angle = 0, scale = 1, palette }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="6.4" ry="4.7" fill="rgba(0,0,0,0.11)" />
      <ellipse
        cx="0"
        cy="0"
        rx="5"
        ry="3.7"
        fill={palette.dark}
        stroke={hexToRgba(palette.light, 0.54)}
        strokeWidth="0.78"
      />
      <path
        d="M -2.4 -1.2 Q 0 -0.3 2.4 -1.2"
        fill="none"
        stroke={hexToRgba(palette.light, 0.72)}
        strokeWidth="0.52"
        strokeLinecap="round"
      />
    </g>
  );
}

function getMiddleRatios(count) {
  if (count <= 1) return [0.54];
  return [0.36, 0.66];
}

export default function DecorativeSubRope({
  point,
  index = 0,
  curveVariant,
  defsIds,
  palette = {
    main: "#A56A3B",
    dark: "#744520",
    light: "#E6BF95",
  },
  opacity = 0.9,
}) {
  const guideRef = useRef(null);
  const uid = useId().replace(/:/g, "");

  const curve = useMemo(
    () => buildBranchCurve(point, curveVariant),
    [point, curveVariant],
  );

  const path = useMemo(() => curveToPath(curve), [curve]);

  const widthScale = curveVariant?.widthScale ?? 0.62;
  const stampStep = curveVariant?.stampStep ?? 10.4;
  const topKnotScale = curveVariant?.topKnotScale ?? 0.76;
  const tailKnotScale = curveVariant?.tailKnotScale ?? 0.76;
  const middleKnotCount = curveVariant?.middleKnotCount ?? 1;
  const middleKnotScale = curveVariant?.middleKnotScale ?? [0.66];

  const maskId = `decor-subrope-mask-${uid}`;
  const braidCellId = `decor-subrope-braid-cell-${uid}`;

  const stamps = useBraidStamps(guideRef, {
    step: stampStep,
    trimStart: 4,
    trimEnd: 4,
    sideOffset: 1.05 * clamp(widthScale, 0.5, 0.8),
  });

  const tailAnchor = getCurvePointAtLengthRatio(curve, 0.95);
  const tailAngle = tangentAngleDeg(tailAnchor.tangent);

  const middleKnots = useMemo(() => {
    const ratios = getMiddleRatios(middleKnotCount);

    return ratios.map((ratio, i) => {
      const anchor = getCurvePointAtLengthRatio(curve, ratio);
      return {
        x: anchor.point.x,
        y: anchor.point.y,
        angle: tangentAngleDeg(anchor.tangent),
        scale: middleKnotScale[i] ?? 0.66,
      };
    });
  }, [curve, middleKnotCount, middleKnotScale]);

  return (
    <g
      opacity={opacity}
      pointerEvents="none"
      style={{
        transformOrigin: `${curve.start.x}px ${curve.start.y}px`,
        transformBox: "view-box",
        "--decor-duration": `${7.2 + index * 0.33}s`,
      }}>
      <defs>
        <g id={braidCellId} transform={`scale(${widthScale} ${widthScale})`}>
          <path
            d="
              M -14.8 0
              C -12.4 -5.2, -7.2 -8.8, -0.5 -9
              C 6.2 -9.2, 11.3 -5.3, 14.6 0
              C 11.4 5.3, 6.2 9.2, -0.5 9
              C -7.2 8.8, -12.4 5.2, -14.8 0
              Z
            "
            fill={palette.main}
            stroke="#4A2812"
            strokeWidth="1.04"
            strokeLinejoin="round"
          />

          <path
            d="
              M -9.5 5.8
              C -5.9 3.2, -1.8 0.4, 8.2 -6.3
            "
            fill="none"
            stroke={hexToRgba(palette.dark, 0.26)}
            strokeWidth="1.72"
            strokeLinecap="round"
          />

          <path
            d="
              M -8.7 -4.7
              C -4.8 -6.8, 0.1 -6.2, 7.9 -2.2
            "
            fill="none"
            stroke={hexToRgba(palette.light, 0.22)}
            strokeWidth="0.92"
            strokeLinecap="round"
          />

          <path
            d="
              M -10.9 -1.4
              C -4.8 -3.8, 2 -3.2, 9.8 2.5
            "
            fill="none"
            stroke={hexToRgba(palette.dark, 0.12)}
            strokeWidth="0.7"
            strokeLinecap="round"
          />
        </g>

        <mask id={maskId}>
          <rect x="-120" y="-60" width="1100" height="800" fill="black" />
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth={18 * widthScale}
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
      />

      <path
        d={path}
        fill="none"
        stroke={hexToRgba(palette.dark, 0.12)}
        strokeWidth={18.5 * widthScale}
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
        stroke={hexToRgba(palette.dark, 0.88)}
        strokeWidth={10.8 * widthScale}
        strokeLinecap="round"
        opacity="0.66"
      />

      <path
        d={path}
        fill="none"
        stroke={hexToRgba(palette.main, 0.56)}
        strokeWidth={5.8 * widthScale}
        strokeLinecap="round"
        opacity="0.48"
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

      {middleKnots.map((knot, i) => (
        <DecorativeKnot
          key={`decor-knot-${i}`}
          x={knot.x}
          y={knot.y}
          angle={knot.angle}
          scale={knot.scale}
          palette={palette}
        />
      ))}

      <path
        d={path}
        fill="none"
        stroke={hexToRgba(palette.light, 0.14)}
        strokeWidth={0.7 * widthScale}
        strokeLinecap="round"
        transform="translate(0,-0.6)"
      />

      <DecorativeKnot
        x={curve.start.x}
        y={curve.start.y + 1}
        scale={topKnotScale}
        palette={palette}
      />

      <DecorativeKnot
        x={tailAnchor.point.x}
        y={tailAnchor.point.y}
        angle={tailAngle}
        scale={tailKnotScale}
        palette={palette}
      />
    </g>
  );
}
