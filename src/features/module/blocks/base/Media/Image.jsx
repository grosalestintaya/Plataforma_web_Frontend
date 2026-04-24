import activityImage001 from "/activity/image001.png";
import { cn } from "@/shared/libs/utils";
import { getMediaAspectRatio } from "./mediaVariant";
import ZoomableFrame from "./ZoomableFrame";

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

  if (raw.startsWith("/activity/")) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  const normalizedSrc = normalizeAssetPath(raw);
  return normalizedSrc ? `/activity/${normalizedSrc}` : activityImage001;
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
  fitToContent = false,
  zoomable = false,
  zoomLabel,
  style,
}) {
  const resolvedSrc = resolveActivityImageSrc(src);
  const resolvedAlt = alt || placeholderLabel || "Imagen";

  const aspectHint = variant ?? ratio;
  const hasAspectHint = Boolean(aspectHint);

  const resolvedMode = fitToContent
    ? "intrinsic"
    : mode === "auto"
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
    <ZoomableFrame
      enabled={zoomable}
      label={zoomLabel ?? `Ampliar ${resolvedAlt}`}
      triggerClassName={cn(frameClassName, className)}
      triggerStyle={resolvedStyle}
      modalClassName="rounded-2xl"
      modalChildren={
        <img
          src={resolvedSrc}
          alt={resolvedAlt}
          className="block max-h-[86vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl"
        />
      }
    >
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        className={cn(imageClassName, imgClassName)}
        style={imgStyle}
      />
    </ZoomableFrame>
  );
}