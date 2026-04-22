import activityImage001 from "@/assets/activity/image001.png";
import { cn } from "@/shared/libs/utils";

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

const ACTIVITY_IMAGE_MODULES = import.meta.glob(
  "../../../../../assets/activity/**/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  {
    eager: true,
    import: "default",
  },
);

const IMAGE_FRAME_BASE_CLASS = "items-center justify-center overflow-hidden";

const IMAGE_SLOT_FRAME_CLASS = `inline-flex max-w-full ${IMAGE_FRAME_BASE_CLASS}`;
const IMAGE_RATIO_FRAME_CLASS = `flex w-full max-w-full ${IMAGE_FRAME_BASE_CLASS}`;
const IMAGE_INTRINSIC_FRAME_CLASS = `inline-flex max-w-full ${IMAGE_FRAME_BASE_CLASS}`;

const IMAGE_SLOT_CLASS =
  "block h-auto w-auto max-h-full max-w-full object-contain";

const IMAGE_RATIO_CLASS =
  "block h-full w-full max-h-full max-w-full object-contain";

const IMAGE_INTRINSIC_CLASS =
  "block h-auto w-auto max-h-full max-w-full object-contain";

function normalizeAssetPath(value) {
  return String(value ?? "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^src\/assets\/activity\//, "")
    .replace(/^assets\/activity\//, "")
    .replace(/^activity\//, "")
    .replace(/^assets\//, "");
}

const ACTIVITY_IMAGE_URLS = Object.entries(ACTIVITY_IMAGE_MODULES).reduce(
  (acc, [key, value]) => {
    const normalizedKey = normalizeAssetPath(
      key.replace(/^.*assets\/activity\//, ""),
    );
    const fileName = normalizedKey.split("/").pop();

    acc[normalizedKey] = value;

    if (fileName && !(fileName in acc)) {
      acc[fileName] = value;
    }

    return acc;
  },
  {},
);

function resolveActivityImageSrc(src) {
  if (!src) return activityImage001;

  const raw = String(src).trim();
  if (!raw) return activityImage001;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  const normalizedSrc = normalizeAssetPath(raw);
  return (
    ACTIVITY_IMAGE_URLS[normalizedSrc] ??
    ACTIVITY_IMAGE_URLS[normalizedSrc.split("/").pop()] ??
    activityImage001
  );
}

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

function resolveAspectRatio(value) {
  if (!value) return null;

  const mediaAspectRatio = getMediaAspectRatio(value);
  if (mediaAspectRatio) return mediaAspectRatio;

  const raw = String(value).trim().toLowerCase();

  if (/^\d+\s*\/\s*\d+$/.test(raw)) {
    const [w, h] = raw.split("/").map((part) => part.trim());
    return `${w} / ${h}`;
  }

  return null;
}

/**
 * Image:
 * - auto: si recibe variant/ratio, crea una caja proporcional; si no, usa tamaño natural.
 * - slot: el padre ya define el espacio.
 * - ratio: Image define su propia caja proporcional.
 * - intrinsic: comportamiento natural.
 */
export default function Image({
  src,
  alt = "Imagen",
  className = "",
  imgClassName = "",
  imgStyle,
  placeholderLabel = "Imagen",
  variant = null,
  ratio = null,
  mode = "auto",
  style,
}) {
  const resolvedSrc = resolveActivityImageSrc(src);
  const resolvedAlt = alt || placeholderLabel || "Imagen";

  const aspectHint = variant ?? ratio;
  const hasAspectHint = Boolean(aspectHint);

  const resolvedMode =
    mode === "auto"
      ? hasAspectHint
        ? "ratio"
        : "intrinsic"
      : mode;

  const shouldApplyAspectRatio = resolvedMode === "ratio";
  const aspectRatio = shouldApplyAspectRatio
    ? resolveAspectRatio(aspectHint)
    : null;

  const resolvedStyle =
    aspectRatio || style
      ? { ...(aspectRatio ? { aspectRatio } : {}), ...(style ?? {}) }
      : undefined;

  const frameClassName =
    resolvedMode === "slot"
      ? IMAGE_SLOT_FRAME_CLASS
      : resolvedMode === "ratio"
        ? IMAGE_RATIO_FRAME_CLASS
        : IMAGE_INTRINSIC_FRAME_CLASS;

  const imageClassName =
    resolvedMode === "slot"
      ? IMAGE_SLOT_CLASS
      : resolvedMode === "ratio"
        ? IMAGE_RATIO_CLASS
        : IMAGE_INTRINSIC_CLASS;

  return (
    <div className={cn(frameClassName, className)} style={resolvedStyle}>
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        className={cn(imageClassName, imgClassName)}
        style={imgStyle}
      />
    </div>
  );
}
