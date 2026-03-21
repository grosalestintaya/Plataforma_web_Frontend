import modulesCatalog from "../content/modulos.json";

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
  return (
    modulesCatalog.modules.find(
      (moduleItem) =>
        moduleItem.code === moduleKey ||
        moduleItem.legacyCodes?.includes(moduleKey),
    ) || null
  );
}

function buildTheme(moduleKey) {
  const moduleItem = findModule(moduleKey);
  const primary = moduleItem?.theme?.color || "#64748b";

  const bg0 = darken(primary, 0.65);
  const bg1 = darken(primary, 0.78);
  const bg2 = "#05060a";

  const surface = withAlpha(lighten(primary, 0.15), 0.08);
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

export const MODULE_COLORS_HEX = Object.fromEntries(
  modulesCatalog.modules.map((moduleItem) => [
    moduleItem.code,
    moduleItem.theme?.color || "#64748b",
  ]),
);
