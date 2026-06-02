import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
import { cn } from "@/shared/libs/utils";

// Para revisar si eliminar o no
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
        "grid h-full min-h-0 w-full min-w-0  overflow-hidden transition-transform duration-300",
        // hasMedia ? "w-fit max-w-full justify-self-center" : "w-full",
        hasMedia && hasContent
          ? "grid-rows-[minmax(0,1fr)_auto]"
          : "grid-rows-[minmax(0,1fr)]",
      )}
    >
      {hasMedia ? (
        <Image
          src={media.src}
          alt={media.alt}
          variant={media.variant}
          mode="slot"
          size="card"
          className="max-h-full max-w-full"
        />
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
        "relative mx-auto grid w-full max-w-full h-fit max-h-full min-w-0 min-h-0 self-center justify-self-center overflow-hidden rounded-2xl p-1.5",
        "[container-type:inline-size]",
        CARD_VARIANT_CLASS[selected ? "solid" : variant] ||
          CARD_VARIANT_CLASS.default,
        interactive && "transition-transform duration-200 hover:scale-[1.015]",
        className,
      )}
    >
      <CardBody
        media={resolvedMedia}
        title={resolvedTitle}
        text={resolvedText}
        isBackFace={isBackFace}
        contentClassName={contentClassName}
        titleClassName={titleClassName}
        textClassName={textClassName}
      />
      {overlay}
    </article>
  );
}
