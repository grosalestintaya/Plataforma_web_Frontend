import modulesCatalog from "../content/modulos.json";

const FALLBACK_PRIMARY = "#64748b";
const LIGHT_BASE = "#f8fafc";
const LIGHT_WARM = "#fffaf5";
const LIGHT_NEUTRAL = "#ffffff";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeHex(hex, fallback = FALLBACK_PRIMARY) {
  const raw = String(hex || "").trim();
  if (!raw) return fallback;
  return raw.startsWith("#") ? raw : `#${raw}`;
}

function normalizeModuleKey(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) return "";

  if (/^m\d+$/.test(raw)) {
    return `m${raw.slice(1).padStart(2, "0")}`;
  }

  if (/^\d+$/.test(raw)) {
    return `m${raw.padStart(2, "0")}`;
  }

  return raw;
}

function hexToRgb(hex) {
  const safeHex = normalizeHex(hex).replace("#", "");
  const full =
    safeHex.length === 3
      ? safeHex
          .split("")
          .map((c) => c + c)
          .join("")
      : safeHex.padEnd(6, "0");

  const num = parseInt(full, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (x) =>
    clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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

function findModule(moduleKey) {
  const normalizedTarget = normalizeModuleKey(moduleKey);

  return (
    modulesCatalog.modules.find((moduleItem) => {
      const code = normalizeModuleKey(moduleItem.code);
      const legacyCodes = Array.isArray(moduleItem.legacyCodes)
        ? moduleItem.legacyCodes.map(normalizeModuleKey)
        : [];

      return (
        code === normalizedTarget || legacyCodes.includes(normalizedTarget)
      );
    }) || null
  );
}

function buildTheme(moduleKey) {
  const moduleItem = findModule(moduleKey);
  const primary = normalizeHex(moduleItem?.theme?.color, FALLBACK_PRIMARY);

  // Fondo claro, teñido por el color del módulo.
  const bgTop = mix(primary, LIGHT_NEUTRAL, 0.86);
  const bgMiddle = mix(primary, LIGHT_BASE, 0.9);
  const bgBottom = mix(primary, LIGHT_WARM, 0.93);
  const bgSoft = mix(primary, LIGHT_NEUTRAL, 0.92);

  // Capas UI
  const surface = withAlpha("#ffffff", 0.72);
  const surface2 = withAlpha(lighten(primary, 0.24), 0.16);
  const border = withAlpha(primary, 0.18);
  const borderStrong = withAlpha(primary, 0.28);

  // Chips / tags
  const chipBg = withAlpha(primary, 0.12);
  const chipText = darken(primary, 0.18);

  // Efectos suaves
  const glow = `0 20px 60px ${withAlpha(primary, 0.14)}`;
  const accentRing = withAlpha(primary, 0.24);

  // Para el patrón, ya no blanco, sino un tono derivado del módulo
  const patternDot = withAlpha(darken(primary, 0.12), 0.12);

  const tintRadial = [
    `radial-gradient(920px circle at 14% 10%, ${withAlpha(primary, 0.18)} 0%, transparent 58%)`,
    `radial-gradient(760px circle at 88% 16%, ${withAlpha(lighten(primary, 0.08), 0.14)} 0%, transparent 60%)`,
    `linear-gradient(135deg, ${withAlpha(primary, 0.08)} 0%, transparent 52%)`,
  ].join(", ");

  return {
    moduleKey: moduleItem?.code || moduleKey,
    primary,
    secondary: lighten(primary, 0.18),

    // Fondo principal
    bgFlat: bgSoft,
    bgGradient: `linear-gradient(180deg, ${bgTop} 0%, ${bgMiddle} 54%, ${bgBottom} 100%)`,
    tintRadial,

    // UI tokens
    surface,
    surface2,
    border,
    borderStrong,
    chipBg,
    chipText,
    glow,
    accentRing,
    patternDot,

    // Texto recomendado sobre fondos claros
    textStrong: "#0f172a",
    textSoft: "#334155",
  };
}

export function getModuleTheme(moduleKey) {
  return buildTheme(moduleKey);
}

export const MODULE_COLORS_HEX = Object.fromEntries(
  modulesCatalog.modules.map((moduleItem) => [
    moduleItem.code,
    normalizeHex(moduleItem.theme?.color, FALLBACK_PRIMARY),
  ]),
);
