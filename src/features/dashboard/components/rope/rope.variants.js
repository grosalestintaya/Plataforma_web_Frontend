export const MAIN_ROPE_PATH = `
  M 40 76
  C 104 64, 176 74, 248 100
  C 328 129, 404 132, 480 118
  C 568 102, 646 79, 780 64
`;

export const ANCHOR_POINTS = [
  { x: 126, y: 88 },
  { x: 272, y: 110 },
  { x: 416, y: 122 },
  { x: 560, y: 108 },
  { x: 700, y: 84 },
];

export const BRANCH_COLORS = [
  {
    main: "#00c853",
    dark: "#1F7F67",
    light: "#DFFFF3",
    glow: "rgba(105, 226, 181, 0.34)",
    labelBg: "rgba(16, 31, 28, 0.95)",
  },
  {
    main: "#F54927",
    dark: "#B53C50",
    light: "#FFE3E8",
    glow: "rgba(255, 116, 131, 0.32)",
    labelBg: "rgba(40, 21, 27, 0.95)",
  },
  {
    main: "#0000FF",
    dark: "#3555C9",
    light: "#E3EAFF",
    glow: "rgba(107, 143, 255, 0.34)",
    labelBg: "rgba(19, 25, 43, 0.95)",
  },
  {
    main: "#00ffff",
    dark: "#C76F1D",
    light: "#FFF0DF",
    glow: "rgba(255, 177, 93, 0.34)",
    labelBg: "rgba(46, 29, 14, 0.95)",
  },
  {
    main: "#7130F7",
    dark: "#6E50D6",
    light: "#EEE7FF",
    glow: "rgba(176, 146, 255, 0.34)",
    labelBg: "rgba(27, 20, 43, 0.95)",
  },
];

export const SUBROPE_CURVE_VARIANTS = [
  {
    name: "left-wide",
    c1: { x: 18, y: 24 },
    c2: { x: -92, y: 152 },
    end: { x: -92, y: 298 },
  },
  {
    name: "left-soft",
    c1: { x: 16, y: 28 },
    c2: { x: -62, y: 156 },
    end: { x: -64, y: 292 },
  },
  {
    name: "center",
    c1: { x: 8, y: 30 },
    c2: { x: -10, y: 166 },
    end: { x: -4, y: 294 },
  },
  {
    name: "right-soft",
    c1: { x: -12, y: 28 },
    c2: { x: 14, y: 160 },
    end: { x: 26, y: 292 },
  },
  {
    name: "right-wide",
    c1: { x: -24, y: 24 },
    c2: { x: 42, y: 154 },
    end: { x: 64, y: 298 },
  },
];

export const ROPE_VISUAL_VARIANTS = {
  imperial: {
    braidOpacity: 0.48,
    accentOpacity: 0.26,
    highlightScale: 0.16,
    shadowExtra: 9,
  },
  ceremonial: {
    braidOpacity: 0.56,
    accentOpacity: 0.2,
    highlightScale: 0.18,
    shadowExtra: 10,
  },
  clean: {
    braidOpacity: 0.18,
    accentOpacity: 0.18,
    highlightScale: 0.12,
    shadowExtra: 7,
  },
};

export function buildBranchCurve(point, variant) {
  const preset = variant || SUBROPE_CURVE_VARIANTS[0];

  return {
    start: { x: point.x, y: point.y - 4 },
    c1: { x: point.x + preset.c1.x, y: point.y + preset.c1.y },
    c2: { x: point.x + preset.c2.x, y: point.y + preset.c2.y },
    end: { x: point.x + preset.end.x, y: point.y + preset.end.y },
  };
}

export function getRopeDefsIds(prefix = "modules-rope") {
  return {
    ropeMaskImperial: `${prefix}-rope-mask-imperial`,
    ropeShadowImperial: `${prefix}-rope-shadow-imperial`,
    ropeGlowImperial: `${prefix}-rope-glow-imperial`,
    ropeGlow: `${prefix}-rope-glow`,
    labelGlow: `${prefix}-label-glow`,
    labelGlowStrong: `${prefix}-label-glow-strong`,
  };
}
