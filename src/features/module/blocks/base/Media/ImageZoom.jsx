import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export default function ImageZoom({
  enabled = true,
  label = "Ampliar imagen",
  modalChildren,
}) {
  const dialogTitleId = useId();
  const [isOpen, setIsOpen] = useState(false);

  function openZoom(event) {
    event.stopPropagation();
    setIsOpen(true);
  }

  function closeZoom() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeZoom();
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={openZoom}
        aria-label={label}
        className="absolute inset-0 z-10 rounded-2xl bg-transparent cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      />

      {isOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
              onClick={closeZoom}>
              <h2 id={dialogTitleId} className="sr-only">
                {label}
              </h2>

              <button
                type="button"
                onClick={closeZoom}
                aria-label="Cerrar imagen ampliada"
                className="absolute right-2 top-2 z-20 inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                ×
              </button>

              <div
                className="relative flex max-h-[90vh] max-w-[92vw] items-center justify-center overflow-visible"
                onClick={(event) => event.stopPropagation()}>
                {modalChildren}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
