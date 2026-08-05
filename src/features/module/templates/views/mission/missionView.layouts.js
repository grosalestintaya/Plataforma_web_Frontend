const MISSION_REGION_NAMES = Object.freeze([
  "heading",
  "support",
  "primary",
  "secondary",
  "feedback",
]);

const MISSION_SIDE_PANEL_WIDTH = "clamp(18rem,23vw,22rem)";

function canRenderSlot(slot, payload, context) {
  if (!slot) return false;

  if (slot.when && !slot.when(payload, context)) {
    return Boolean(
      slot.reserveSpace &&
      (!slot.reserveWhen || slot.reserveWhen(payload, context)),
    );
  }

  if (Array.isArray(slot.items)) {
    return slot.items.some((item) => canRenderSlot(item, payload, context));
  }

  if (Array.isArray(slot.slots) && !slot.block && !slot.render) {
    return slot.slots.some((item) => canRenderSlot(item, payload, context));
  }

  return true;
}

function getActiveRegions(slots, payload, context) {
  const activeRegions = new Set();

  slots.forEach((slot) => {
    if (
      MISSION_REGION_NAMES.includes(slot?.area) &&
      canRenderSlot(slot, payload, context)
    ) {
      activeRegions.add(slot.area);
    }
  });

  return activeRegions;
}

function createVerticalSection(regions, activeRegions, desktop = false) {
  const visibleRegions = regions.filter((region) => activeRegions.has(region));

  if (visibleRegions.length === 0) return null;

  return {
    cols: "minmax(0,1fr)",
    rows: visibleRegions
      .map((region) =>
        desktop && region === "primary" ? "minmax(0,1fr)" : "auto",
      )
      .join(" "),
    areas: visibleRegions,
  };
}

function createBalancedSection(activeRegions, desktop = false) {
  const rows = [];
  const rowSizes = [];

  ["heading", "support"].forEach((region) => {
    if (activeRegions.has(region)) {
      rows.push(desktop ? `${region} ${region}` : region);
      rowSizes.push("auto");
    }
  });

  const hasPrimary = activeRegions.has("primary");
  const hasSecondary = activeRegions.has("secondary");

  if (hasPrimary && hasSecondary && desktop) {
    rows.push("primary secondary");
    rowSizes.push("minmax(0,1fr)");
  } else {
    if (hasPrimary) {
      rows.push(desktop ? "primary primary" : "primary");
      rowSizes.push(desktop ? "minmax(0,1fr)" : "auto");
    }

    if (hasSecondary) {
      rows.push(desktop ? "secondary secondary" : "secondary");
      rowSizes.push(desktop ? "minmax(0,1fr)" : "auto");
    }
  }

  if (activeRegions.has("feedback")) {
    rows.push(desktop ? "feedback feedback" : "feedback");
    rowSizes.push("auto");
  }

  if (rows.length === 0) return null;

  return {
    cols: desktop ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr)",
    rows: rowSizes.join(" "),
    areas: rows,
  };
}

function createSecondaryEmphasisSection(activeRegions, desktop = false) {
  const hasHeading = activeRegions.has("heading");
  const hasPrimary = activeRegions.has("primary");

  if (!desktop || !hasHeading || !hasPrimary) {
    return createVerticalSection(
      ["heading", "primary"],
      activeRegions,
      desktop,
    );
  }

  return {
    cols: `${MISSION_SIDE_PANEL_WIDTH} minmax(0,1fr)`,
    rows: "minmax(0,1fr)",
    areas: ["heading primary"],
  };
}

const MISSION_LAYOUTS = Object.freeze({
  focus: Object.freeze({
    required: Object.freeze(["primary"]),
    optional: Object.freeze([]),
    resolve: (activeRegions) => ({
      base: createVerticalSection(["primary"], activeRegions),
      lg: createVerticalSection(["primary"], activeRegions, true),
    }),
  }),

  guided: Object.freeze({
    required: Object.freeze(["primary"]),
    optional: Object.freeze(["heading", "support", "feedback"]),
    resolve: (activeRegions) => ({
      base: createVerticalSection(
        ["heading", "support", "primary", "feedback"],
        activeRegions,
      ),
      lg: createVerticalSection(
        ["heading", "support", "primary", "feedback"],
        activeRegions,
        true,
      ),
    }),
  }),

  balanced: Object.freeze({
    required: Object.freeze(["primary"]),
    optional: Object.freeze(["heading", "support", "secondary", "feedback"]),
    resolve: (activeRegions) => ({
      base: createBalancedSection(activeRegions),
      md: createBalancedSection(activeRegions, true),
    }),
  }),

  primaryEmphasis: Object.freeze({
    required: Object.freeze(["primary"]),
    optional: Object.freeze(["heading"]),
    resolve: (activeRegions) => ({
      base: createVerticalSection(["heading", "primary"], activeRegions),
      lg: createVerticalSection(["heading", "primary"], activeRegions, true),
    }),
  }),

  secondaryEmphasis: Object.freeze({
    required: Object.freeze(["primary"]),
    optional: Object.freeze(["heading"]),
    resolve: (activeRegions) => ({
      base: createSecondaryEmphasisSection(activeRegions),
      md: createSecondaryEmphasisSection(activeRegions, true),
    }),
  }),
});

export function resolveMissionLayout({
  layoutVariant = "focus",
  slots = [],
  payload = {},
  context = {},
}) {
  const layout = MISSION_LAYOUTS[layoutVariant];

  if (!layout) return null;

  const activeRegions = getActiveRegions(slots, payload, context);
  const hasRequiredRegions = layout.required.every((region) =>
    activeRegions.has(region),
  );

  if (!hasRequiredRegions) return null;

  const resolvedLayout = layout.resolve(activeRegions);

  if (!resolvedLayout?.base) return null;

  return resolvedLayout;
}
