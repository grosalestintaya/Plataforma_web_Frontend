import React, { useMemo } from "react";
import { getModuleTheme } from "../../utils/moduleTheme";

export default function SceneBackground({
  moduleCode,
  themeHex = "#7130F7",
  backgroundHex = "#141B2D", // antes: #0B1020
  children,
  pattern = true,
  patternOpacity = 0.06,
  patternSize = 52,
  t1 = 0.62,
  t2 = 0.45,
  t3 = 0.26,
  className = "",
}) {
  const theme = useMemo(() => {
    if (moduleCode) {
      const moduleTheme = getModuleTheme(moduleCode);
      return {
        bgImage: `${moduleTheme.tintRadial}, ${moduleTheme.bgGradient}`,
        patternImage:
          "radial-gradient(circle at 18% 22%, white 1px, transparent 1px), radial-gradient(circle at 82% 64%, white 1px, transparent 1px)",
      };
    }

    const base = `linear-gradient(
      180deg,
      ${hexToRgba("#182033", 1)} 0%,
      ${hexToRgba(backgroundHex, 1)} 100%,
      ${hexToRgba("#101726", 1)} 100%
    )`;

    const _t1 = hexToRgba(themeHex, t1);
    const _t2 = hexToRgba(themeHex, t2);
    const _t3 = hexToRgba(themeHex, t3);

    const tint = [
      `linear-gradient(135deg, ${_t3} 0%, transparent 55%)`,
      `radial-gradient(900px 520px at 15% 10%, ${_t1} 0%, transparent 62%)`,
      `radial-gradient(900px 520px at 85% 15%, ${_t2} 0%, transparent 60%)`,
    ].join(", ");

    return {
      bgImage: `${tint}, ${base}`,
      patternImage:
        "radial-gradient(circle at 18% 22%, white 1px, transparent 1px), radial-gradient(circle at 82% 64%, white 1px, transparent 1px)",
    };
  }, [moduleCode, themeHex, backgroundHex, t1, t2, t3]);

  return (
    <div
      className={`relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden ${className}`}
      style={{ backgroundImage: theme.bgImage }}>
      {pattern && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: patternOpacity }}>
          <div
            className="w-full h-full"
            style={{
              backgroundImage: theme.patternImage,
              backgroundSize: `${patternSize}px ${patternSize}px`,
            }}
          />
        </div>
      )}

      <div
        className="relative h-full"
        style={{
          "--activity-header-height": "clamp(96px, 13vh, 132px)",
          "--activity-footer-height": "clamp(56px, 8vh, 72px)",
          "--activity-shell-gutter": "clamp(12px, 2vw, 10px)",
        }}>
        {children}
      </div>
    </div>
  );
}

function hexToRgba(hex, a = 1) {
  const h = String(hex || "").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${a})`;
}
