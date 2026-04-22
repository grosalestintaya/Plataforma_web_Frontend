import Typography from "../../base/Typography";
import Image, { getMediaAspectRatio } from "../../base/Media/Image";
import { cn } from "@/shared/libs/utils";

const CARD_BASE_CLASS =
  "relative flex min-h-0 max-w-full flex-col overflow-visible rounded-2xl border border-white/15 text-left transition disabled:cursor-not-allowed disabled:opacity-60";

const CARD_INTERACTIVE_CLASS =
  "cursor-pointer hover:-translate-y-0.5 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:translate-y-0";

const CARD_MEDIA_WRAPPER_CLASS =
  "inline-flex w-fit max-w-full items-center justify-center self-center overflow-hidden rounded-xl border border-white/12";

const CARD_CONTENT_STACK_CLASS =
  "flex min-h-0 min-w-0 w-full max-w-full flex-col items-center";

const CARD_CONTENT_ROW_CLASS =
  "flex min-w-0 w-full max-w-full justify-center";

const CARD_DENSITY_CLASS = {
  normal: {
    root: "gap-1.5 p-3",
    media: "p-1 md:p-1.5",
    content: "gap-1.5",
  },
  compact: {
    root: "gap-0.5 p-1.5 md:gap-1 md:p-2",
    media: "p-1",
    content: "gap-0.5",
  },
};

const CARD_SLOT_MAX_HEIGHT =
  "var(--card-slot-height, var(--choose-one-card-slot-height, var(--flip-card-slot-height, none)))";

const CARD_MEDIA_MAX_HEIGHT =
  "var(--card-media-max-height, var(--choose-one-card-media-max-height, var(--flip-card-media-max-height, none)))";

const CARD_CONTENT_RESERVE =
  "var(--card-content-reserve, var(--choose-one-card-content-reserve, var(--flip-card-content-reserve, auto)))";

function normalizeTypographyContent(content, fallbackVariant) {
  if (!content) return null;

  if (typeof content === "object") {
    return {
      ...content,
      variant: content.variant ?? fallbackVariant,
      align: content.align ?? "center",
    };
  }

  return {
    text: content,
    variant: fallbackVariant,
    align: "center",
  };
}

/**
 * Card:
 * - Usa horizontal por defecto.
 * - Respeta media.variant si viene.
 * - El slot de media lo controla Card.
 * - La imagen se muestra completa con object-contain.
 * - `density="compact"` sirve para grids densos.
 */
export default function Card({
  ass,
  as,
  title,
  text,
  media,
  mediaVariant,
  footer,
  className = "",
  mediaClassName = "",
  contentClassName = "",
  style,
  onClick,
  disabled = false,
  selected = false,
  children,
  density = "normal",
}) {
  const Component = as ?? ass ?? (onClick ? "button" : "article");
  const hasMedia = Boolean(media);

  const resolvedDensity =
    CARD_DENSITY_CLASS[density] ?? CARD_DENSITY_CLASS.normal;

  const hasContent = Boolean(title || text || children || footer);
  const resolvedTitle = normalizeTypographyContent(
    title,
    hasMedia ? "label" : "h3",
  );
  const resolvedText = normalizeTypographyContent(
    text,
    hasMedia ? "label" : "bodySm",
  );
  const resolvedStyle = {
    ...(hasMedia ? { maxHeight: CARD_SLOT_MAX_HEIGHT } : {}),
    ...(style ?? {}),
  };

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      onClick={onClick}
      disabled={Component === "button" ? disabled : undefined}
      aria-pressed={Component === "button" ? selected : undefined}
      style={resolvedStyle}
      className={cn(
        CARD_BASE_CLASS,
        hasMedia ? "w-fit h-fit" : "w-full",
        resolvedDensity.root,
        onClick ? CARD_INTERACTIVE_CLASS : "",
        className,
      )}
    >
      {media ? (
        <div
          className={cn(
            CARD_MEDIA_WRAPPER_CLASS,
            resolvedDensity.media,
            mediaClassName,
          )}
          style={{
            aspectRatio:
              getMediaAspectRatio(mediaVariant) ??
              getMediaAspectRatio(media) ??
              undefined,
          }}
        >
          <Image
            src={media?.src ?? media?.img}
            alt={media?.alt ?? "Imagen"}
            mode="intrinsic"
            className="w-fit max-w-full"
            imgClassName="block h-auto w-auto max-w-full object-contain"
            imgStyle={{
              maxHeight: CARD_MEDIA_MAX_HEIGHT,
            }}
          />
        </div>
      ) : null}

      {hasContent ? (
        <div
          className={cn(
            CARD_CONTENT_STACK_CLASS,
            resolvedDensity.content,
            media ? "pt-1" : "",
            contentClassName,
          )}
          style={{ minHeight: CARD_CONTENT_RESERVE }}
        >
          {resolvedTitle ? (
            <div className={cn(CARD_CONTENT_ROW_CLASS, "items-center")}>
              <Typography
                content={resolvedTitle}
                variant={resolvedTitle?.variant}
                align={resolvedTitle?.align}
                className={resolvedTitle?.className}
              />
            </div>
          ) : null}

          {resolvedText ? (
            <div className={cn(CARD_CONTENT_ROW_CLASS, "items-start")}>
              <Typography
                content={resolvedText}
                variant={resolvedText?.variant}
                align={resolvedText?.align}
                className={resolvedText?.className}
              />
            </div>
          ) : null}

          {children ? (
            <div className="flex min-h-0 min-w-0 w-full max-w-full flex-col gap-1">
              {children}
            </div>
          ) : null}

          {footer ? <div className="mt-auto w-full">{footer}</div> : null}
        </div>
      ) : null}
    </Component>
  );
}
