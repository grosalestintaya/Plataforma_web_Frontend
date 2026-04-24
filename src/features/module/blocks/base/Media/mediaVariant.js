const MEDIA_VARIANT_TO_RATIO = {
  square: "1 / 1",
  vertical: "2 / 3",
  horizontal: "3 / 2",
};

const MEDIA_VALUE_TO_VARIANT = {
  square: "square",
  "1:1": "square",
  "1 / 1": "square",
  vertical: "vertical",
  "2:3": "vertical",
  "2 / 3": "vertical",
  horizontal: "horizontal",
  "3:2": "horizontal",
  "3 / 2": "horizontal",
};

export function normalizeMediaVariant(value) {
  if (!value) return null;

  const normalized = String(value).trim().toLowerCase();
  return MEDIA_VALUE_TO_VARIANT[normalized] ?? null;
}

export function getMediaVariant(value) {
  if (!value) return null;

  if (typeof value === "object") {
    return normalizeMediaVariant(
      value.variant ?? value.orientation ?? value.layout ?? value.ratio,
    );
  }

  return normalizeMediaVariant(value);
}

export function getMediaAspectRatio(value) {
  const variant = getMediaVariant(value);
  return variant ? MEDIA_VARIANT_TO_RATIO[variant] : null;
}
