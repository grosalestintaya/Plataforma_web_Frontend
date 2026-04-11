import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
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
  onClick,
  disabled = false,
  children,
}) {
  const Component = as ?? (onClick ? "button" : "article");
  const mediaSizingStyle = {
    // La media usa un maximo configurable por el contenedor padre.
    // Si el padre no define nada, usa un limite general del hero.
    maxHeight:
      "var(--card-media-max-height, min(220px, calc(var(--hero-height, 100vh) * 0.3)))",
  };

  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      onClick={onClick}
      disabled={Component === "button" ? disabled : undefined}
      className={cn(
        // La card ocupa su area, pero no fuerza alturas internas innecesarias.
        "flex h-full min-h-0 w-full max-h-full max-w-full flex-col gap-2.5 overflow-hidden rounded-2xl border border-white/15 p-3 text-left",
        "transition disabled:cursor-not-allowed disabled:opacity-60",
        onClick ? "hover:border-white/25" : "",
        className,
      )}
    >
      {media ? (
        <div
          className={cn(
            // La media usa un marco sutil para que la imagen siempre se lea
            // como una pieza dentro de la card sin competir con el contenido.
            "flex min-h-0 w-full shrink-0 items-center justify-center rounded-xl border border-white/12 p-1.5",
            mediaClassName,
          )}
          style={mediaSizingStyle}
        >
          <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/10 p-1">
            <Image
              src={media?.src ?? media?.img}
              alt={media?.alt ?? "Imagen"}
              className="h-full w-full"
              imgClassName="max-h-full max-w-full rounded-md object-contain"
            />
          </div>
        </div>
      ) : null}

      {title ? (
        <div className={cn("flex min-w-0 w-full items-center justify-center", contentClassName)}>
          <Typography
            content={title}
            variant={title?.variant ?? "h3"}
            align={title?.align ?? "center"}
          />
        </div>
      ) : null}

      {text ? (
        <div className={cn("flex min-h-0 min-w-0 w-full items-start justify-center", contentClassName)}>
          <Typography
            content={text}
            variant={text?.variant ?? "bodySm"}
            align={text?.align ?? "center"}
          />
        </div>
      ) : null}

      {children ? (
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-1.5", contentClassName)}>
          {children}
        </div>
      ) : null}

      {footer ? <div className="mt-auto">{footer}</div> : null}
    </Component>
  );
}
