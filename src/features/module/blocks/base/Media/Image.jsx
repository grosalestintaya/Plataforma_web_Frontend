import { cn } from "@/shared/libs/utils";
import ZoomableFrame from "./ZoomableFrame";

const FALLBACK_IMAGE = "/activity/image001.png";

function resolveImageSrc(src) {
  const value = String(src ?? "").trim();

  if (!value) return FALLBACK_IMAGE;

  if (/^(https?:|data:|blob:)/.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/activity/${value.replace(/^activity\//, "")}`;
}

export default function Image({
  src,
  alt = "Imagen",
  className = "",
  imageClassName = "",
  zoomable = false,
}) {
  const resolvedSrc = resolveImageSrc(src);

  const imageNode = (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        "block h-auto w-auto max-h-full max-w-full object-contain rounded-2xl",
        imageClassName,
      )}
    />
  );

  return (
    <figure
      className={cn(
        "flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden",
        className,
      )}
    >
      <ZoomableFrame
        enabled={zoomable}
        label={`Ampliar ${alt}`}
        triggerClassName="flex h-full w-full items-center justify-center overflow-hidden"
        modalClassName="rounded-2xl"
        modalChildren={
          <img
            src={resolvedSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="block max-h-[86vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl"
          />
        }
      >
        {imageNode}
      </ZoomableFrame>
    </figure>
  );
}