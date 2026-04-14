export function normalizeStatus(status) {
  if (status === "completed") return "completed";
  if (status === "unlocked") return "unlocked";
  return "locked";
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getModuleLabelTitle(title, sortOrder) {
  if (!title) return `Módulo ${sortOrder}`;

  const cleaned = String(title)
    .replace(/^m[oó]dulo\s*\d+\s*:?\s*/i, "")
    .trim();

  return cleaned || `Módulo ${sortOrder}`;
}

export function wrapLabelText(text, maxCharsPerLine = 18, maxLines = 2) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return [""];

  const lines = [];
  let current = "";

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;

    if (lines.length === maxLines - 1) {
      const rest = [current, ...words.slice(i + 1)].join(" ");
      current = rest;
      break;
    }
  }

  if (current) lines.push(current);

  return lines.slice(0, maxLines).map((line, index) => {
    if (index === maxLines - 1 && line.length > maxCharsPerLine + 5) {
      return `${line.slice(0, maxCharsPerLine + 1).trimEnd()}…`;
    }
    return line;
  });
}

export function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

export function cubicBezierTangent(p0, p1, p2, p3, t) {
  const mt = 1 - t;

  return {
    x:
      3 * mt * mt * (p1.x - p0.x) +
      6 * mt * t * (p2.x - p1.x) +
      3 * t * t * (p3.x - p2.x),
    y:
      3 * mt * mt * (p1.y - p0.y) +
      6 * mt * t * (p2.y - p1.y) +
      3 * t * t * (p3.y - p2.y),
  };
}

export function tangentAngleDeg(tangent) {
  return (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
}

export function distance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

export function getCurvePointAtLengthRatio(curve, ratio, samples = 180) {
  const { start, c1, c2, end } = curve;

  const points = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    points.push({
      t,
      point: cubicBezierPoint(start, c1, c2, end, t),
    });
  }

  let totalLength = 0;
  const cumulative = [0];

  for (let i = 1; i < points.length; i += 1) {
    totalLength += distance(points[i - 1].point, points[i].point);
    cumulative.push(totalLength);
  }

  const target = totalLength * clamp(ratio, 0, 1);

  for (let i = 1; i < cumulative.length; i += 1) {
    const prevLen = cumulative[i - 1];
    const nextLen = cumulative[i];

    if (target <= nextLen) {
      const localRatio =
        nextLen === prevLen ? 0 : (target - prevLen) / (nextLen - prevLen);

      const prev = points[i - 1];
      const next = points[i];
      const t = prev.t + (next.t - prev.t) * localRatio;

      return {
        t,
        point: cubicBezierPoint(start, c1, c2, end, t),
        tangent: cubicBezierTangent(start, c1, c2, end, t),
      };
    }
  }

  return {
    t: 1,
    point: cubicBezierPoint(start, c1, c2, end, 1),
    tangent: cubicBezierTangent(start, c1, c2, end, 1),
  };
}

export function chooseLabelSide(pointX, labelWidth, viewWidth = 820) {
  const margin = 16;
  const leftCenterX = pointX - 108;
  const rightCenterX = pointX + 108;

  const leftFits = leftCenterX - labelWidth / 2 >= margin;
  const rightFits = rightCenterX + labelWidth / 2 <= viewWidth - margin;

  if (rightFits && !leftFits) return "right";
  if (leftFits && !rightFits) return "left";
  if (leftFits && rightFits) return pointX < viewWidth / 2 ? "right" : "left";

  return pointX < viewWidth / 2 ? "right" : "left";
}

export function curveToPath(curve) {
  const { start, c1, c2, end } = curve;
  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
}
