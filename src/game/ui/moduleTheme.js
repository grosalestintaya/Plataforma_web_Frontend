const MODULE_COLORS = {
  m01: "#049140",
  m02: "#1B46F5",
  m03: "#E29800",
  m04: "#F01253",
  m05: "#7130F7",
  m06: "#FF7000",
};

// Utilidades mínimas (sin libs)
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
function rgbToHex({ r, g, b }) {
  const to = (x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
// mezcla base con negro/blanco para sacar tonos
function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}
function darken(hex, t) {
  return mix(hex, "#000000", t);
}
function lighten(hex, t) {
  return mix(hex, "#ffffff", t);
}
function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/**
 * Theme tokens:
 * - primary: color principal
 * - bg: gradiente oscuro con tinte del primary
 * - surface: card background
 * - border: border suave
 * - chipBg / chipText: chips
 * - glow: sombra suave
 * - accentRing: ring del item seleccionado
 */
function buildTheme(moduleKey) {
  const primary = MODULE_COLORS[moduleKey] || "#64748b"; // slate fallback

  // Fondo: dark + un poquito del primary para el “tinte”
  const bg0 = darken(primary, 0.65);
  const bg1 = darken(primary, 0.78);
  const bg2 = "#05060a"; // casi negro para estabilizar

  const surface = withAlpha(lighten(primary, 0.15), 0.08); // glass
  const surface2 = withAlpha("#ffffff", 0.06);
  const border = withAlpha("#ffffff", 0.1);

  const chipBg = withAlpha(primary, 0.18);
  const chipText = lighten(primary, 0.55);

  const glow = `0 20px 60px ${withAlpha(primary, 0.18)}`;
  const accentRing = withAlpha(primary, 0.35);

  return {
    moduleKey,
    primary,
    bgGradient: `linear-gradient(135deg, ${bg0} 0%, ${bg1} 45%, ${bg2} 100%)`,
    tintRadial: `radial-gradient(800px circle at 20% 10%, ${withAlpha(primary, 0.25)}, transparent 55%)`,
    surface,
    surface2,
    border,
    chipBg,
    chipText,
    glow,
    accentRing,
  };
}

export function getModuleTheme(moduleKey) {
  return buildTheme(moduleKey);
}

export const MODULE_COLORS_HEX = MODULE_COLORS;
