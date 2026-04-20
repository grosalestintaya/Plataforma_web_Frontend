import Typography from "../../base/Typography";
import Image, { getMediaVariant } from "../../base/Media/Image";
import { cn } from "@/shared/libs/utils";

/**
 * Card:
 * - Superficie simple para titulo, media y texto corto.
 * - Sirve como base de agrupadores como showCard, CompareCard y CollageCard.
 */
export default function Card({
  as,
  title,
  text,
  media,
  footer,
  className = "",
  mediaClassName = "",
  contentClassName = "",
  style,
  onClick,
  disabled = false,
  fitToMedia = false,
  selected = false,
  children,
}) {
  const Component = as ?? (onClick ? "button" : "article");
  const mediaVariant = getMediaVariant(media);
  const hasContent = Boolean(title || text || children || footer);
  const shouldFitToMedia = fitToMedia || Boolean(media);

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      onClick={onClick}
      disabled={Component === "button" ? disabled : undefined}
      aria-pressed={Component === "button" ? selected : undefined}
      style={style}
      className={cn(
        "relative flex min-h-0 max-h-full max-w-full flex-col items-center gap-2 overflow-hidden rounded-2xl border border-white/15 p-3 text-left",
        shouldFitToMedia ? "mx-auto h-fit w-fit" : "h-full w-full",
        "transition disabled:cursor-not-allowed disabled:opacity-60",
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:translate-y-0"
          : "",
        className,
      )}
    >
      {media ? (
        <Image
          src={media?.src ?? media?.img}
          alt={media?.alt ?? "Imagen"}
          className={cn(
            "flex min-h-0 max-w-full items-center justify-center rounded-xl border border-white/12 p-1.5",
            shouldFitToMedia ? "w-fit shrink" : "w-full shrink",
            hasContent ? "max-h-full" : "h-full max-h-full",
            mediaClassName,
          )}
          variant={mediaVariant}
          ratio={media?.ratio}
          fitToContent={shouldFitToMedia}
          imgClassName={cn(
            "rounded-md object-contain",
            shouldFitToMedia ? "h-auto w-auto max-w-full" : "",
          )}
        />
      ) : null}

      {hasContent ? (
        <div className="flex min-h-0 min-w-0 w-full shrink-0 flex-col items-center gap-1.5">
          {title ? (
            <div className={cn("flex min-w-0 w-full shrink-0 items-center justify-center", contentClassName)}>
              <Typography
                content={title}
                variant={title?.variant ?? "h3"}
                align={title?.align ?? "center"}
                className={title?.className}
              />
            </div>
          ) : null}

          {text ? (
            <div className={cn("flex min-h-0 min-w-0 w-full shrink-0 items-start justify-center", contentClassName)}>
              <Typography
                content={text}
                variant={text?.variant ?? "bodySm"}
                align={text?.align ?? "center"}
                className={text?.className}
              />
            </div>
          ) : null}

          {children ? (
            <div className={cn("flex min-h-0 min-w-0 flex-col gap-1.5", contentClassName)}>
              {children}
            </div>
          ) : null}

          {footer ? <div className="mt-auto">{footer}</div> : null}
        </div>
      ) : null}
    </Component>
  );
}
