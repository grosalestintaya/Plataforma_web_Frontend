import { useEffect, useRef } from "react";

/**
 * Modal de confirmacion para abandonar la actividad.
 * Lo usan el boton XP del header y el boton atras del navegador.
 */
export default function ActivityExitConfirmModal({
  open,
  onRequestClose,
  onConfirmExit,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onRequestClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onRequestClose]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-exit-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onRequestClose?.();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-[36px] bg-[#FFC400] p-6 shadow-2xl outline-none sm:p-8"
      >
        <div className="space-y-4">
          <h2
            id="activity-exit-title"
            className="text-2xl font-extrabold text-slate-900 sm:text-4xl"
          >
            Salir de la actividad
          </h2>

          <p className="text-base font-semibold leading-relaxed text-slate-800 sm:text-lg">
            Estas seguro de dejar la actividad? Perderas lo avanzado y se te
            considerara un intento perdido.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onRequestClose}
            className="cursor-pointer rounded-2xl bg-slate-800 px-5 py-4 text-base font-black text-white shadow-[0_5px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40 active:translate-y-[1px]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmExit}
            className="cursor-pointer rounded-2xl border-2 border-red-950/20 bg-red-500 px-5 py-4 text-base font-black text-white shadow-[0_5px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-950/40 active:translate-y-[1px]"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
