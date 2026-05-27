import fallbackImage from "/activity/image001.webp";
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

const FRAME_BASE_CLASS =
  "min-h-0 min-w-0 items-center justify-center overflow-hidden";

const FRAME_CLASS_BY_MODE = {
  slot: `flex h-full w-full max-h-full max-w-full ${FRAME_BASE_CLASS}`,
  ratio: `flex w-full max-w-full ${FRAME_BASE_CLASS}`,
  intrinsic: `inline-flex max-h-full max-w-full ${FRAME_BASE_CLASS}`,
};

const IMAGE_CLASS_BY_MODE = {
  slot: "block h-full w-full max-h-full max-w-full object-contain",
  ratio: "block h-full w-full max-h-full max-w-full object-contain",
  intrinsic: "block h-auto w-auto max-h-full max-w-full object-contain",
};

const IMAGE_SURFACE_CLASS = "rounded-xl border border-white/0";

function normalizeMediaVariant(value) {
  if (!value) return null;

  const normalized = String(value).trim().toLowerCase();
  return MEDIA_VALUE_TO_VARIANT[normalized] ?? null;
}

function getMediaVariant(value) {
  if (!value) return null;

  if (typeof value === "object") {
    return normalizeMediaVariant(
      value.variant ?? value.orientation ?? value.layout ?? value.ratio,
    );
  }

  return normalizeMediaVariant(value);
}

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

function resolveActivityImageSrc(src) {
  if (!src) return fallbackImage;

  const raw = String(src).trim();
  if (!raw) return fallbackImage;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:") ||
    raw.startsWith("/")
  ) {
    return raw;
  }

  const normalizedSrc = normalizeAssetPath(raw);

  return normalizedSrc ? `/activity/${normalizedSrc}` : fallbackImage;
}

function resolveAspectRatio(value) {
  if (!value) return undefined;

  const variant = getMediaVariant(value);
  if (variant) return MEDIA_VARIANT_TO_RATIO[variant];

  const raw = String(value).trim().toLowerCase();

  if (/^\d+\s*\/\s*\d+$/.test(raw)) {
    const [width, height] = raw.split("/").map((part) => part.trim());
    return `${width} / ${height}`;
  }

  return undefined;
}

function getResolvedMode({ mode, fitToContent, hasAspectHint }) {
  if (fitToContent) return "intrinsic";

  if (mode === "auto") {
    return hasAspectHint ? "ratio" : "intrinsic";
  }

  if (mode === "slot" || mode === "ratio" || mode === "intrinsic") {
    return mode;
  }

  return "intrinsic";
}

/**
 * Image
 *
 * mode:
 * - auto: usa ratio si recibe variant/ratio; si no, usa tamaño natural.
 * - slot: el padre define el espacio; la imagen se centra y se contiene.
 * - ratio: el componente crea una caja proporcional.
 * - intrinsic: usa el tamaño natural de la imagen.
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
  fitToContent = false,
  style,
}) {
  const resolvedSrc = resolveActivityImageSrc(src);
  const resolvedAlt = alt || placeholderLabel || "Imagen";

  const aspectHint = variant ?? ratio;
  const hasAspectHint = Boolean(aspectHint);

  const resolvedMode = getResolvedMode({
    mode,
    fitToContent,
    hasAspectHint,
  });

  const shouldApplyAspectRatio =
    resolvedMode === "ratio" || (resolvedMode === "slot" && hasAspectHint);

  const aspectRatio = shouldApplyAspectRatio
    ? resolveAspectRatio(aspectHint)
    : undefined;

  const figureStyle = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(style ?? {}),
  };

  return (
    <figure
      className={cn(FRAME_CLASS_BY_MODE[resolvedMode], className)}
      style={Object.keys(figureStyle).length ? figureStyle : undefined}
    >
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        loading="lazy"
        decoding="async"
        className={cn(
          IMAGE_CLASS_BY_MODE[resolvedMode],
          IMAGE_SURFACE_CLASS,
          imgClassName,
        )}
        style={imgStyle}
      />
    </figure>
  );
}