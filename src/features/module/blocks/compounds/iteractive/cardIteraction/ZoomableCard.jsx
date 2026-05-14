import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CardBase from "../../container/CardBase";
import { cn } from "@/shared/libs/utils";

function getZoomLabel(title, media, interaction) {
  const text =
    interaction?.label ??
    title?.text ??
    (typeof title === "string" ? title : null) ??
    media?.alt ??
    "tarjeta";

  return `Ampliar ${text}`;
}

export default function ZoomableFrame({
  title,
  text,
  media,
  interaction,
  selected = false,
  variant = "default",
  size = "normal",
  onComplete,
}) {
  const dialogTitleId = useId();
  const completedRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  const zoomLabel = getZoomLabel(title, media, interaction);

  function closeZoom() {
    setIsOpen(false);
  }

  function completeOnce() {
    if (completedRef.current) return;

    completedRef.current = true;
    onComplete?.();
  }

  function openZoom() {
    setIsOpen(true);
    completeOnce();
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeZoom();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const overlay = (
    <button
      type="button"
      onClick={openZoom}
      aria-label={zoomLabel}
      className={cn(
        "absolute inset-0 z-10 rounded-2xl bg-transparent",
        "cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
      )}
    />
  );

  return (
    <>
      <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-visible">
        <CardBase
          title={title}
          text={text}
          media={media}
          variant={selected ? "solid" : variant}
          selected={selected}
          size={size}
          interactive
          overlay={overlay}
        />
      </div>

      {isOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
              onClick={closeZoom}
            >
              <h2 id={dialogTitleId} className="sr-only">
                {zoomLabel}
              </h2>

              <button
                type="button"
                onClick={closeZoom}
                aria-label="Cerrar vista ampliada"
                className={cn(
                  "absolute right-2 top-2 z-20 inline-flex size-10 items-center justify-center rounded-full",
                  "border border-white/20 bg-black/55 text-white transition hover:bg-black/75",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                )}
              >
                ×
              </button>

              <div
                className="flex h-[min(90vh,42rem)] w-[min(92vw,48rem)] min-h-0 min-w-0 items-center justify-center"
                onClick={(event) => event.stopPropagation()}
              >
                <CardBase
                  title={title}
                  text={text}
                  media={{
                    ...media,
                    mode:
                      interaction?.modalMediaMode ?? media?.mode ?? "contain",
                  }}
                  variant="ghost"
                  size="modal"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
