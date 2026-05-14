import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
import { cn } from "@/shared/libs/utils";

const CARD_VARIANT_CLASS = {
  default: "border border-white/15 bg-white/5",
  ghost: "border border-white/10 bg-transparent",
  solid: "border border-white/15 bg-white/10",
};

function normalizeContent(content) {
  if (!content) return null;

  if (typeof content === "object") {
    return content;
  }

  return {
    text: content,
  };
}

function normalizeMediaVariant(variant) {
  if (variant === "square") return "square";
  if (variant === "vertical") return "vertical";
  if (variant === "auto") return "auto";

  return "horizontal";
}

function normalizeMediaMode(mode) {
  if (mode === "cover") return "cover";

  return "contain";
}

function getCardMedia(media) {
  const src = media?.src ?? media?.img;

  if (!src) return null;

  return {
    src,
    alt: media?.alt ?? "Imagen",
    variant: normalizeMediaVariant(media?.variant ?? media?.ratio),
    mode: normalizeMediaMode(media?.mode),
  };
}

function getCardWidthClass(media, size = "normal") {
  const variant = media?.variant ?? "horizontal";

  if (size === "modal") {
    if (variant === "vertical") return "w-[min(100%,22rem)]";
    if (variant === "square") return "w-[min(100%,34rem)]";

    return "w-[min(100%,48rem)]";
  }

  if (!media?.src) {
    return "w-[min(100%,18rem)]";
  }

  if (variant === "vertical") {
    return "w-[min(100%,13rem)]";
  }

  if (variant === "square") {
    return "w-[min(100%,17rem)]";
  }

  return "w-[min(100%,24rem)]";
}

function CardBody({
  media,
  title,
  text,
  isBackFace = false,
  contentClassName = "",
  titleClassName = "",
  textClassName = "",
}) {
  const hasMedia = Boolean(media?.src);
  const hasTitle = Boolean(title);
  const hasText = Boolean(text);
  const hasContent = hasTitle || hasText;

  return (
    <div
      className={cn(
        "grid h-full min-h-0 w-full min-w-0 overflow-hidden",
        hasMedia && hasContent
          ? "grid-rows-[minmax(0,1fr)_auto]"
          : "grid-rows-[minmax(0,1fr)]",
      )}
    >
      {hasMedia ? (
        <figure className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden rounded-xl">
          <Image
            src={media.src}
            alt={media.alt}
            variant={media.variant}
            mode={media.mode}
            size="card"
          />
        </figure>
      ) : null}

      {hasContent ? (
        <div
          className={cn(
            "flex w-full min-w-0 flex-col items-center justify-center text-center",
            hasMedia
              ? "shrink-0 gap-0.5 px-2 py-1"
              : "h-full min-h-0 gap-3 p-4",
            contentClassName,
          )}
        >
          {hasTitle ? (
            <Typography
              content={title}
              variant={isBackFace ? "cardBackTitle" : "cardTitle"}
              align={title?.align ?? "center"}
              color={title?.color}
              clamp={title?.clamp ?? (isBackFace ? 3 : 2)}
              className={titleClassName}
            />
          ) : null}

          {hasText ? (
            <Typography
              content={text}
              variant={isBackFace ? "cardBackText" : "cardText"}
              align={text?.align ?? "center"}
              color={text?.color}
              clamp={text?.clamp ?? (isBackFace ? 5 : 3)}
              className={textClassName}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function CardBase({
  title,
  text,
  media,
  variant = "default",
  selected = false,
  size = "normal",
  isBackFace = false,
  interactive = false,
  overlay = null,

  /**
   * Estas clases quedan sólo para usos internos controlados,
   * como FlipCard, donde el reverso necesita color/fondo distinto.
   * No deberían usarse desde ShowCard o CollageCard.
   */
  className = "",
  contentClassName = "",
  titleClassName = "",
  textClassName = "",
}) {
  const resolvedMedia = getCardMedia(media);
  const resolvedTitle = normalizeContent(title);
  const resolvedText = normalizeContent(text);

  return (
    <article
      className={cn(
        "relative mx-auto grid min-h-0 min-w-0 max-w-full self-center justify-self-center overflow-hidden rounded-2xl p-1.5",
        "lg:h-full",
        "[container-type:inline-size]",
        getCardWidthClass(resolvedMedia, size),
        CARD_VARIANT_CLASS[selected ? "solid" : variant] ??
          CARD_VARIANT_CLASS.default,
        interactive &&
          "transition-transform duration-200 hover:scale-[1.015]",
        className,
      )}
    >
      <div className="h-full min-h-0 w-full min-w-0 transition-transform duration-300">
        <CardBody
          media={resolvedMedia}
          title={resolvedTitle}
          text={resolvedText}
          isBackFace={isBackFace}
          contentClassName={contentClassName}
          titleClassName={titleClassName}
          textClassName={textClassName}
        />
      </div>

      {overlay}
    </article>
  );
}
