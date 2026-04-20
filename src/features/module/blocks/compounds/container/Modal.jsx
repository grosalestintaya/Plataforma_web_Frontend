
import Typography from "../../base/Typography";
import Image from "../../base/Media/Image";
import Button from "../../base/Action/Button";

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
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
      <section className="w-full max-w-xl rounded-2xl border border-white/20 bg-slate-900 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          {title ? <Typography content={title} variant={title?.variant ?? "h3"} /> : null}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-white/20 px-2 py-1 text-xs transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95"
          >
            Cerrar
          </button>
        </div>

        {text ? (
          <Typography
            content={text}
            variant={text?.variant ?? "bodySm"}
            className="mt-3"
          />
        ) : null}

        {media ? (
          <div className="mt-4 rounded-xl border border-white/15 bg-black/15 p-3">
            <Image src={media?.src} alt={media?.alt ?? "Detalle"} className="h-[180px] w-full" />
          </div>
        ) : null}

        {(primaryAction || secondaryAction) ? (
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
