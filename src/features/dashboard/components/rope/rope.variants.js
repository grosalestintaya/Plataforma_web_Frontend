export const MAIN_ROPE_PATH = `
  M 40 76
  C 106 62, 180 74, 252 101
  C 332 131, 408 135, 484 120
  C 572 102, 652 78, 780 64
`;

export const ANCHOR_POINTS = [
  { x: 126, y: 88 },
  { x: 272, y: 111 },
  { x: 416, y: 123 },
  { x: 560, y: 108 },
  { x: 700, y: 84 },
];

export const BRANCH_COLORS = [
  {
    main: "#00C853",
    // dark: "#1F7F67",
    light: "#DFFFF3",
    glow: "rgba(105, 226, 181, 0.34)",
    labelBg: "rgba(16, 31, 28, 0.95)",
  },
  {
    main: "#F54927",
    // dark: "#B53C50",
    light: "#FFE3E8",
    glow: "rgba(255, 116, 131, 0.32)",
    labelBg: "rgba(40, 21, 27, 0.95)",
  },
  {
    main: "#FFA500",
    //dark: "#3555C9",
    light: "#E3EAFF",
    glow: "rgba(107, 143, 255, 0.34)",
    labelBg: "rgba(19, 25, 43, 0.95)",
  },
  {
    main: "#00ffff",
    /// dark: "#C76F1D",
    light: "#FFF0DF",
    glow: "rgba(255, 177, 93, 0.34)",
    labelBg: "rgba(46, 29, 14, 0.95)",
  },
  {
    main: "#7130F7",
    //dark: "#6E50D6",
    light: "#EEE7FF",
    glow: "rgba(176, 146, 255, 0.34)",
    labelBg: "rgba(27, 20, 43, 0.95)",
  },
];

export const SUBROPE_CURVE_VARIANTS = [
  {
    name: "left-grand",
    c1: { x: 18, y: 22 },
    c2: { x: -108, y: 146 },
    end: { x: -108, y: 332 },
    widthScale: 1.06,
    stampStep: 9.4,
    topKnotScale: 1.04,
    tailKnotScale: 1.06,
    middleKnotCount: 4,
    middleKnotScale: [0.92, 1.18, 0.96, 1.08],
  },
  {
    name: "left-short",
    c1: { x: 14, y: 26 },
    c2: { x: -56, y: 132 },
    end: { x: -58, y: 244 },
    widthScale: 0.9,
    stampStep: 9.9,
    topKnotScale: 0.92,
    tailKnotScale: 0.9,
    middleKnotCount: 2,
    middleKnotScale: [0.82, 0.96],
  },
  {
    name: "center-tall",
    c1: { x: 8, y: 32 },
    c2: { x: -14, y: 170 },
    end: { x: -8, y: 314 },
    widthScale: 1,
    stampStep: 9.6,
    topKnotScale: 1,
    tailKnotScale: 1.02,
    middleKnotCount: 3,
    middleKnotScale: [0.86, 1.12, 0.98],
  },
  {
    name: "right-medium",
    c1: { x: -12, y: 26 },
    c2: { x: 18, y: 146 },
    end: { x: 34, y: 276 },
    widthScale: 0.95,
    stampStep: 9.8,
    topKnotScale: 0.94,
    tailKnotScale: 0.96,
    middleKnotCount: 3,
    middleKnotScale: [0.8, 1.02, 0.9],
  },
  {
    name: "right-grand",
    c1: { x: -24, y: 24 },
    c2: { x: 54, y: 156 },
    end: { x: 78, y: 338 },
    widthScale: 1.08,
    stampStep: 9.3,
    topKnotScale: 1.06,
    tailKnotScale: 1.1,
    middleKnotCount: 4,
    middleKnotScale: [0.9, 1.16, 0.98, 1.06],
  },
];
export const DECORATIVE_SUBROPE_CURVE_VARIANTS = [
  {
    name: "decor-left-short-clean",
    c1: { x: 12, y: 18 },
    c2: { x: -40, y: 86 },
    end: { x: -44, y: 166 },
    widthScale: 0.58,
    stampStep: 10.8,
    topKnotScale: 0.72,
    tailKnotScale: 0.7,
    middleKnotCount: 0,
    middleKnotScale: [],
    middleKnotRatios: [],
  },
  {
    name: "decor-left-medium-knot",
    c1: { x: 14, y: 20 },
    c2: { x: -56, y: 102 },
    end: { x: -60, y: 212 },
    widthScale: 0.62,
    stampStep: 10.4,
    topKnotScale: 0.76,
    tailKnotScale: 0.76,
    middleKnotCount: 1,
    middleKnotScale: [0.64],
    middleKnotRatios: [0.52],
  },
  {
    name: "decor-center-long-clean",
    c1: { x: 6, y: 22 },
    c2: { x: -8, y: 118 },
    end: { x: -4, y: 248 },
    widthScale: 0.66,
    stampStep: 10.2,
    topKnotScale: 0.78,
    tailKnotScale: 0.8,
    middleKnotCount: 0,
    middleKnotScale: [],
    middleKnotRatios: [],
  },
  {
    name: "decor-right-medium-clean",
    c1: { x: -10, y: 20 },
    c2: { x: 20, y: 96 },
    end: { x: 30, y: 198 },
    widthScale: 0.6,
    stampStep: 10.6,
    topKnotScale: 0.72,
    tailKnotScale: 0.72,
    middleKnotCount: 0,
    middleKnotScale: [],
    middleKnotRatios: [],
  },
  {
    name: "decor-right-long-double",
    c1: { x: -18, y: 20 },
    c2: { x: 30, y: 114 },
    end: { x: 42, y: 238 },
    widthScale: 0.64,
    stampStep: 10.3,
    topKnotScale: 0.76,
    tailKnotScale: 0.78,
    middleKnotCount: 2,
    middleKnotScale: [0.58, 0.74],
    middleKnotRatios: [0.34, 0.68],
  },
  {
    name: "decor-center-soft-single",
    c1: { x: 4, y: 20 },
    c2: { x: -10, y: 108 },
    end: { x: -12, y: 224 },
    widthScale: 0.63,
    stampStep: 10.2,
    topKnotScale: 0.78,
    tailKnotScale: 0.78,
    middleKnotCount: 1,
    middleKnotScale: [0.68],
    middleKnotRatios: [0.58],
  },
  {
    name: "decor-center-tall-double",
    c1: { x: 6, y: 24 },
    c2: { x: -6, y: 132 },
    end: { x: 2, y: 286 },
    widthScale: 0.68,
    stampStep: 10.0,
    topKnotScale: 0.82,
    tailKnotScale: 0.84,
    middleKnotCount: 2,
    middleKnotScale: [0.62, 0.82],
    middleKnotRatios: [0.36, 0.7],
  },
  {
    name: "decor-right-tall-clean",
    c1: { x: -16, y: 20 },
    c2: { x: 24, y: 120 },
    end: { x: 36, y: 270 },
    widthScale: 0.66,
    stampStep: 10.0,
    topKnotScale: 0.8,
    tailKnotScale: 0.82,
    middleKnotCount: 0,
    middleKnotScale: [],
    middleKnotRatios: [],
  },
];

export const DECORATIVE_ANCHOR_POINTS = [
  { x: 86, y: 80 },
  { x: 154, y: 90 },
  { x: 222, y: 100 },
  { x: 308, y: 116 },
  { x: 404, y: 123 },
  { x: 506, y: 116 },
  { x: 616, y: 94 },
  { x: 724, y: 78 },
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
    start: { x: point.x, y: point.y + 4 },
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
