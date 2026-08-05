import { isValidElement } from "react";
import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
import Button from "../../base/Action/Button";
import { X } from "lucide-react";
import { cn } from "@/shared/libs/utils";

/**
 * Modal:
 * - Ventana emergente reutilizable para mostrar detalle.
 * - No controla su propio estado global; solo renderiza si `open` es true.
 */
export default function Modal({
  open = false,
  title,
  text,
  media,
  primaryAction,
  secondaryAction,
  onClose,
  children,
  className = "",
  backdropClassName = "",
  headerClassName = "",
  contentClassName = "",
  closeLabel = "Cerrar",
  labelledBy,
}) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-black/55 p-4",
        backdropClassName,
      )}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "w-full max-w-xl rounded-2xl border border-white/20 bg-slate-900 p-5 text-white shadow-2xl",
          className,
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-3",
            headerClassName,
          )}
        >
          {title ? (
            <div className="min-w-0 flex-1">
              {isValidElement(title) ? (
                title
              ) : (
                <Typography content={title} variant={title?.variant ?? "h3"} />
              )}
            </div>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-current/25 bg-black/10 transition hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50 active:scale-95"
          >
            <X className="size-6" aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </button>
        </div>

        {text ? (
          <Typography
            content={text}
            variant={text?.variant ?? "bodySm"}
            className="mt-3"
          />
        ) : null}

        {children !== undefined ? (
          <div className={contentClassName}>{children}</div>
        ) : null}

        {media ? (
          <div className="mt-4 rounded-xl border border-white/15 bg-black/15 p-3">
            <Image
              src={media?.src}
              alt={media?.alt ?? "Detalle"}
              className="h-[180px] w-full"
            />
          </div>
        ) : null}

        {primaryAction || secondaryAction ? (
          <div className="mt-5 flex justify-end gap-2">
            {secondaryAction ? (
              <Button
                variant={secondaryAction?.variant ?? "ghost"}
                label={secondaryAction?.label ?? "Cancelar"}
                onClick={secondaryAction?.onClick ?? onClose}
              />
            ) : null}
            {primaryAction ? (
              <Button
                variant={primaryAction?.variant ?? "primary"}
                label={primaryAction?.label ?? "Aceptar"}
                onClick={primaryAction?.onClick}
              />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
