import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
import ZoomableFrame from "../../base/Media/ZoomableFrame";
import { getMediaAspectRatio } from "../../base/Media/mediaVariant";
import { cn } from "@/shared/libs/utils";

const CARD_BASE_CLASS = "module-card";

const CARD_MEDIA_WRAPPER_CLASS = "module-card__media";

const CARD_CONTENT_STACK_CLASS = "module-card__content";

const CARD_CONTENT_ROW_CLASS = "module-card__row";

const CARD_DENSITY_CLASS = {
  normal: "module-card--normal",
  compact: "module-card--compact",
};

const CARD_SLOT_HEIGHT =
  "var(--card-slot-height, min(340px, calc(var(--hero-height, 100vh) * 0.38)))";

const CARD_SLOT_MAX_HEIGHT = "var(--card-slot-height, none)";

const CARD_MEDIA_MAX_HEIGHT =
  "var(--card-media-max-height, min(270px, calc(var(--hero-height, 100vh) * 0.29)))";

const CARD_CONTENT_RESERVE = "var(--card-content-reserve, 64px)";

const CARD_CHROME_HEIGHT = "var(--card-chrome-height, 28px)";

const CARD_AVAILABLE_MEDIA_HEIGHT = `max(72px, calc(${CARD_SLOT_HEIGHT} - ${CARD_CONTENT_RESERVE} - ${CARD_CHROME_HEIGHT}))`;

const CARD_MEDIA_BOX_HEIGHT = `min(${CARD_MEDIA_MAX_HEIGHT}, ${CARD_AVAILABLE_MEDIA_HEIGHT})`;

const CARD_FILL_MEDIA_BOX_HEIGHT = `min(${CARD_MEDIA_MAX_HEIGHT}, var(--card-media-height-from-width, ${CARD_SLOT_HEIGHT}), ${CARD_AVAILABLE_MEDIA_HEIGHT})`;

const CARD_MEDIA_CONTENT_WIDTH = "var(--card-media-box-width)";

const CARD_FILL_MEDIA_CONTENT_WIDTH =
  "min(var(--card-media-box-width), var(--card-slot-width, 100cqw))";

const CARD_MEDIA_BOX_WIDTH_BY_RATIO = {
  "3 / 2":
    "var(--card-media-horizontal-width, calc(var(--card-media-box-height) * 3 / 2))",
  "1 / 1": "var(--card-media-square-width, var(--card-media-box-height))",
  "2 / 3":
    "var(--card-media-vertical-width, calc(var(--card-media-box-height) * 2 / 3))",
};

const CARD_MEDIA_HEIGHT_FROM_WIDTH_BY_RATIO = {
  "3 / 2": "calc(var(--card-slot-width, 100cqw) * 2 / 3)",
  "1 / 1": "var(--card-slot-width, 100cqw)",
  "2 / 3": "calc(var(--card-slot-width, 100cqw) * 3 / 2)",
};

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

function getCardMediaAspectRatio(mediaVariant, media) {
  return (
    getMediaAspectRatio(mediaVariant) ??
    getMediaAspectRatio(media) ??
    getMediaAspectRatio("horizontal")
  );
}

function getCardMediaBoxStyle(aspectRatio) {
  return {
    aspectRatio,
    maxHeight: "var(--card-media-box-height)",
    width: "var(--card-media-content-width)",
  };
}

function getZoomLabel(title, media) {
  const text =
    title?.text ??
    (typeof title === "string" ? title : null) ??
    media?.alt ??
    "tarjeta";

  return `Ampliar ${text}`;
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
  fitToMedia = false,
  fillContainer = false,
  selected = false,
  children,
  density = "normal",
  zoomable = false,
  zoomLabel,
}) {
  const isInteractive = Boolean(onClick) || as === "button";
  const canZoom = zoomable && !isInteractive && !disabled;
  const Component = as ?? (onClick ? "button" : "article");
  const hasMedia = Boolean(media);
  const shouldFitToMedia = fitToMedia || (hasMedia && !fillContainer);
  const mediaAspectRatio = hasMedia
    ? getCardMediaAspectRatio(mediaVariant, media)
    : null;

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
    ...(hasMedia && !fillContainer ? { maxHeight: CARD_SLOT_MAX_HEIGHT } : {}),
    ...(hasMedia
      ? {
          "--card-media-box-height": CARD_MEDIA_BOX_HEIGHT,
          "--card-media-box-width":
            CARD_MEDIA_BOX_WIDTH_BY_RATIO[mediaAspectRatio] ??
            CARD_MEDIA_BOX_WIDTH_BY_RATIO["3 / 2"],
          "--card-media-content-width": fillContainer
            ? CARD_FILL_MEDIA_CONTENT_WIDTH
            : CARD_MEDIA_CONTENT_WIDTH,
          ...(fillContainer
            ? {
                "--card-media-box-height": CARD_FILL_MEDIA_BOX_HEIGHT,
                "--card-media-height-from-width":
                  CARD_MEDIA_HEIGHT_FROM_WIDTH_BY_RATIO[mediaAspectRatio] ??
                  CARD_MEDIA_HEIGHT_FROM_WIDTH_BY_RATIO["3 / 2"],
              }
            : {}),
        }
      : {}),
    ...(style ?? {}),
  };
  const sizeClass = fillContainer
    ? "module-card--fit module-card--within-slot"
    : shouldFitToMedia
      ? "module-card--fit"
      : "module-card--full";

  function renderCardShell({ modal = false } = {}) {
    const shellStyle = modal
      ? {
          ...resolvedStyle,
          "--card-slot-height": "min(78vh, 760px)",
          "--card-media-max-height": "min(64vh, 640px)",
          "--card-content-reserve": "104px",
        }
      : resolvedStyle;

    return (
      <Component
        type={Component === "button" ? "button" : undefined}
        onClick={onClick}
        disabled={Component === "button" ? disabled : undefined}
        aria-pressed={Component === "button" ? selected : undefined}
        style={shellStyle}
        className={cn(
          CARD_BASE_CLASS,
          sizeClass,
          resolvedDensity,
          hasMedia ? "module-card--has-media" : "",
          onClick ? "module-card--interactive" : "",
          modal
            ? "max-h-[86vh] max-w-[88vw] bg-black/35 shadow-2xl backdrop-blur-sm"
            : "",
          className,
        )}
      >
        {media ? (
          <div
            className={cn(CARD_MEDIA_WRAPPER_CLASS, mediaClassName)}
            style={getCardMediaBoxStyle(mediaAspectRatio)}
          >
            <Image
              src={media?.src ?? media?.img}
              alt={media?.alt ?? "Imagen"}
              mode="slot"
              className="h-full w-full"
              imgClassName="block h-full w-full object-contain"
            />
          </div>
        ) : null}

        {hasContent ? (
          <div
            className={cn(
              CARD_CONTENT_STACK_CLASS,
              media ? "module-card__content--with-media" : "",
              contentClassName,
            )}
            style={{
              minHeight: fillContainer ? undefined : CARD_CONTENT_RESERVE,
            }}
          >
            {resolvedTitle ? (
              <div
                className={cn(
                  CARD_CONTENT_ROW_CLASS,
                  "module-card__row--title",
                )}
              >
                <Typography
                  content={resolvedTitle}
                  variant={resolvedTitle?.variant}
                  align="center"
                  className={cn(
                    resolvedTitle?.className,
                    "block w-full text-center",
                  )}
                />
              </div>
            ) : null}

            {resolvedText ? (
              <div
                className={cn(CARD_CONTENT_ROW_CLASS, "module-card__row--text")}
              >
                <Typography
                  content={resolvedText}
                  variant={resolvedText?.variant}
                  align="center"
                  className={cn(
                    resolvedText?.className,
                    "block w-full text-center",
                  )}
                />
              </div>
            ) : null}

            {children ? (
              <div className="module-card__children">{children}</div>
            ) : null}

            {footer ? (
              <div className="module-card__footer">{footer}</div>
            ) : null}
          </div>
        ) : null}
      </Component>
    );
  }

  const cardShell = renderCardShell();

  if (!canZoom) return cardShell;

  return (
    <ZoomableFrame
      enabled
      label={zoomLabel ?? getZoomLabel(resolvedTitle, media)}
      triggerClassName={
        fillContainer
          ? "flex h-full min-h-0 w-full min-w-0 items-center justify-center"
          : "inline-flex max-w-full"
      }
      modalClassName="rounded-2xl"
      modalChildren={renderCardShell({ modal: true })}
    >
      {cardShell}
    </ZoomableFrame>
  );
}
