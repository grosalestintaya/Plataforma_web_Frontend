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

  const desiredCenterX = x + (side === "left" ? -112 : 112);
  const desiredCenterY = y - 4;

  const boxX = clamp(desiredCenterX - width / 2, 10, 810 - width);
  const boxY = clamp(desiredCenterY - height / 2, 14, 470 - height - 12);

  const ropeEdgeX = side === "left" ? x - 12 : x + 12;
  const labelEdgeX = side === "left" ? boxX + width : boxX;
  const labelEdgeY = boxY + height / 2;

  return (
    <g className="side-branch-label">
      <path
        d={`M ${ropeEdgeX} ${y} Q ${(ropeEdgeX + labelEdgeX) / 2} ${y - 10} ${labelEdgeX} ${labelEdgeY}`}
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
