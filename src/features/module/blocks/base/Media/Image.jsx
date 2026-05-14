function resolveImageSrc(src) {
  const value = String(src ?? "").trim();

  if (!value) return "/activity/image001.png";

  if (/^(https?:|data:|blob:)/.test(value)) return value;

  if (value.startsWith("/")) return value;

  return `/activity/${value.replace(/^activity\//, "")}`;
const IMAGE_RATIO_CLASS = "block h-full w-auto max-w-full object-contain";

const IMAGE_INTRINSIC_CLASS =
  "block h-auto w-auto max-h-full max-w-full object-contain";

const IMAGE_SURFACE_CLASS = "rounded-xl border border-white/0";

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

export default function Image({
  src,
  alt = "Imagen",
  mode = "contain",
  size = "slot",
}) {
  const resolvedSrc = resolveImageSrc(src);

  const isCard = size === "card";
  const isModal = size === "modal";

  return (
    <figure className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
      <div
        className={
          isModal
            ? "flex h-[min(86vh,42rem)] w-[min(88vw,56rem)] items-center justify-center overflow-hidden rounded-2xl"
            : isCard
              ? "flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden rounded-2xl"
              : "flex h-full min-h-0 w-full min-w-0 max-h-full max-w-full items-center justify-center overflow-hidden rounded-2xl"
        }
      >
    <div className={cn(frameClassName, className)} style={resolvedStyle}>
      <ZoomableFrame
        enabled={zoomable}
        label={zoomLabel ?? `Ampliar ${resolvedAlt}`}
        triggerClassName={triggerClassName}
        modalClassName="rounded-2xl"
        modalChildren={
          <img
            src={resolvedSrc}
            alt={resolvedAlt}
            className={cn(
              "block max-h-[86vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl",
              IMAGE_SURFACE_CLASS,
            )}
          />
        }>
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={
            isCard
              ? mode === "cover"
                ? "block h-full w-full min-h-0 min-w-0 rounded-2xl object-cover"
                : "block h-full w-full min-h-0 min-w-0 rounded-2xl object-contain"
              : mode === "cover"
                ? "block max-h-full max-w-full rounded-2xl object-cover"
                : "block max-h-full max-w-full rounded-2xl object-contain"
          }
        />
      </div>
    </figure>
  );
}