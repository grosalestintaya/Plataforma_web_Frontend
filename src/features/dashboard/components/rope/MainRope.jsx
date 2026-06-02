import React, { useId, useLayoutEffect, useRef, useState } from "react";

function useBraidStamps(
  pathRef,
  { step = 10.9, trimStart = 7, trimEnd = 7, sideOffset = 2.35 } = {},
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

// Obtiene el punto central del path SVG
function useMidPoint(pathRef) {
  const [mid, setMid] = useState(null);

  useLayoutEffect(() => {
    const node = pathRef.current;
    if (!node) return;

    let frame = requestAnimationFrame(() => {
      try {
        const total = node.getTotalLength();
        const p = node.getPointAtLength(total / 2);
        setMid({ x: p.x, y: p.y });
      } catch {
        setMid(null);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [pathRef]);

  return mid;
}

function MainRopeEndKnot({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="13.4" ry="9.8" fill="rgba(0,0,0,0.14)" />
      <ellipse
        cx="0"
        cy="0"
        rx="10.8"
        ry="7.6"
        fill="#8D5A32"
        stroke="#D8A96D"
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
      <circle cx="0" cy="0" r="1.25" fill="#F4D4A9" />
    </g>
  );
}

function RopeTitle({ mid, title }) {
  if (!mid || !title) return null;

  const padX = 18;
  const padY = 9;
  const fontSize = 13;
  // estimación del ancho del texto
  const estWidth = title.length * 7.8 + padX * 2;
  const boxH = fontSize + padY * 2;
  const boxW = estWidth;
  const bx = mid.x - boxW / 2;
  const by = mid.y - 52 - boxH; // flota encima de la cuerda

  return (
    <g>
      {/* línea conectora vertical */}
      <line
        x1={mid.x}
        y1={mid.y - 18}
        x2={mid.x}
        y2={by + boxH}
        stroke="rgba(255,236,204,0.30)"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />

      {/* cápsula de fondo */}
      <rect
        x={bx}
        y={by}
        width={boxW}
        height={boxH}
        rx={boxH / 2}
        fill="rgba(30,18,8,0.78)"
        stroke="rgba(255,210,140,0.28)"
        strokeWidth="1.2"
      />

      {/* brillo superior */}
      <rect
        x={bx + 8}
        y={by + 1}
        width={boxW - 16}
        height={2}
        rx="1"
        fill="rgba(255,243,210,0.14)"
      />

      {/* texto */}
      <text
        x={mid.x}
        y={by + padY + fontSize - 1}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="800"
        letterSpacing="0.6"
        fill="rgba(255,225,160,0.92)"
        style={{ userSelect: "none" }}>
        {title}
      </text>
    </g>
  );
}

export default function MainRope({
  path,
  ids,
  accent = "#B092FF",
  showPendants = true,
  showEndKnots = true,
  stampStep = 10.9,
  title, // ← prop para el título
}) {
  const guideRef = useRef(null);
  const uid = useId().replace(/:/g, "");
  const braidCellId = `main-braid-cell-${uid}`;
  const ropeMaskId = `main-braid-mask-${uid}`;

  const stamps = useBraidStamps(guideRef, {
    step: stampStep,
    trimStart: 7,
    trimEnd: 7,
    sideOffset: 2.35,
  });

  const mid = useMidPoint(guideRef);

  return (
    <>
      <defs>
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
            fill="#C1814B"
            stroke="#4A2812"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M -13.2 8.1 C -8.2 4.6, -2.7 0.7, 11.4 -8.7"
            fill="none"
            stroke="rgba(82,46,22,0.32)"
            strokeWidth="2.55"
            strokeLinecap="round"
          />
          <path
            d="M -12 -6.3 C -6.4 -9.3, 0.1 -8.5, 10.9 -3.2"
            fill="none"
            stroke="rgba(255,236,206,0.28)"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
          <path
            d="M -14.5 -1.8 C -6.2 -5.1, 2.7 -4.3, 13.8 3.4"
            fill="none"
            stroke="rgba(70,39,19,0.13)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M 1.5 11 C 7.3 9.2, 12.4 5.1, 16.2 0.2"
            fill="none"
            stroke="rgba(255,247,231,0.16)"
            strokeWidth="0.95"
            strokeLinecap="round"
          />
        </g>

        <mask id={ropeMaskId}>
          <rect x="0" y="0" width="780" height="470" fill="black" />
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
        stroke="rgba(20,11,5,0.14)"
        strokeWidth="33.5"
        strokeLinecap="round"
        filter={
          ids?.ropeShadowImperial
            ? `url(#${ids.ropeShadowImperial})`
            : undefined
        }
      />
      <path
        d={path}
        fill="none"
        stroke="#7A4A28"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.56"
      />
      <path
        d={path}
        fill="none"
        stroke="#B87744"
        strokeWidth="13.6"
        strokeLinecap="round"
        opacity="0.24"
      />

      <g mask={`url(#${ropeMaskId})`}>
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
        stroke="rgba(255,243,225,0.11)"
        strokeWidth="1.05"
        strokeLinecap="round"
        transform="translate(0,-0.9)"
      />
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.05"
        filter={
          ids?.ropeGlowImperial ? `url(#${ids.ropeGlowImperial})` : undefined
        }
      />

      {[
        [180, 84],
        [360, 112],
        [590, 98],
        [705, 82],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="5" fill="#996033" />
          <circle cx={cx} cy={cy} r="1.7" fill="#F3D29F" />
        </g>
      ))}

      {showEndKnots && (
        <>
          <MainRopeEndKnot x={42} y={76} />
          <MainRopeEndKnot x={780} y={64} />
        </>
      )}

      {/* título flotante centrado encima de la cuerda */}
      <RopeTitle mid={mid} title={title} />
    </>
  );
}
