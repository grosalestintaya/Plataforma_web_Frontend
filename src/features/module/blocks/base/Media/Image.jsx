function resolveImageSrc(src) {
  const value = String(src ?? "").trim();

  if (!value) return "/activity/image001.png";

  if (/^(https?:|data:|blob:)/.test(value)) return value;

  if (value.startsWith("/")) return value;

  return `/activity/${value.replace(/^activity\//, "")}`;
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