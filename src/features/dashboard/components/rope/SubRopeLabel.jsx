import React from "react";
import { clamp } from "./rope.utils";

export default function SubRopeLabel({
  x,
  y,
  lines,
  palette,
  locked,
  active,
  side = "left",
  defsIds,
}) {
  const maxLineLength = Math.max(...lines.map((line) => line.length), 6);
  const width = clamp(maxLineLength * 8.6 + 44, 132, 240);
  const height = lines.length === 1 ? 38 : 56;

  // Centrado horizontalmente sobre x, flotando arriba de y
  const boxX = clamp(x - width / 2, 10, 810 - width);
  const boxY = clamp(y - height - 28, 14, 470 - height - 12);

  // Línea conectora: desde el punto de la cuerda hacia el borde inferior del label
  const connectorX = x;
  const connectorTopY = boxY + height;
  const connectorBottomY = y;

  return (
    <g className="side-branch-label">
      {/* línea vertical centrada */}
      <path
        d={`M ${connectorX} ${connectorBottomY} Q ${connectorX} ${(connectorTopY + connectorBottomY) / 2} ${connectorX} ${connectorTopY}`}
        fill="none"
        stroke={locked ? "rgba(205,214,230,0.18)" : palette.main}
        strokeWidth={active ? "2.15" : "1.35"}
        strokeLinecap="round"
        opacity={active ? 0.95 : 0.72}
      />

      <rect
        x={boxX}
        y={boxY}
        width={width}
        height={height}
        rx="17"
        fill={locked ? "rgba(53,61,76,0.94)" : palette.labelBg}
        stroke={locked ? "rgba(205,214,230,0.20)" : palette.main}
        strokeWidth={active ? "2.25" : "1.2"}
        filter={`url(#${active ? defsIds.labelGlowStrong : defsIds.labelGlow})`}
      />

      {lines.map((line, index) => {
        const firstLineY = lines.length === 1 ? boxY + 24 : boxY + 22;
        const lineY = firstLineY + index * 16;

        return (
          <text
            key={`${line}-${index}`}
            x={boxX + width / 2}
            y={lineY}
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fill={locked ? "rgba(233,238,248,0.82)" : "#F8FAFC"}
            style={{ userSelect: "none", letterSpacing: "0.2px" }}>
            {line}
          </text>
        );
      })}
    </g>
  );
}
