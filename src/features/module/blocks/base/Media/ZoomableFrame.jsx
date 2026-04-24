import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/shared/libs/utils";

const ZOOM_TRANSITION_MS = 180;

function handleActivation(event, open) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  open();
}

export default function ZoomableFrame({
  enabled = false,
  label = "Ampliar contenido",
  triggerClassName = "",
  triggerStyle,
  modalClassName = "",
  children,
  modalChildren,
}) {
  const closeTimerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isRendered) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isRendered]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!enabled && triggerClassName) {
    return (
      <div className={triggerClassName} style={triggerStyle}>
        {children}
      </div>
    );
  }

  if (!enabled) return children;

  function open() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setIsRendered(true);
    window.requestAnimationFrame(() => setIsVisible(true));
  }

  function close() {
    setIsVisible(false);

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
    }, ZOOM_TRANSITION_MS);
  }

  const modal =
    isRendered && typeof document !== "undefined"
      ? createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out",
              isVisible ? "opacity-100" : "opacity-0",
            )}
            onClick={close}
          >
            <div
              className={cn(
                "relative flex max-h-[90vh] max-w-[92vw] items-center justify-center transition duration-200 ease-out",
                isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
                modalClassName,
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Cerrar vista ampliada"
                className="absolute right-2 top-2 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                onClick={close}
              >
                <X className="size-5" aria-hidden="true" />
              </button>

              {modalChildren ?? children}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        className={cn(
          "cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
          triggerClassName,
        )}
        style={triggerStyle}
        onClick={open}
        onKeyDown={(event) => handleActivation(event, open)}
      >
        {children}
      </div>
      {modal}
    </>
  );
}
