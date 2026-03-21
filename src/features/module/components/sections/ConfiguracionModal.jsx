import { useEffect, useRef } from "react";

export default function ConfiguracionModal({
  open,
  onClose,
  sfx = 80,
  music = 50,
  onChangeSfx,
  onChangeMusic,
  title = "Opciones",
}) {
  const panelRef = useRef(null);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Bloquear scroll del body al abrir
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Enfocar el panel al abrir
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* estilos del range una sola vez */}
      <style>{`
        .game-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 16px;
          background: transparent;
          cursor: pointer;
        }

        .game-slider::-webkit-slider-runnable-track {
          height: 10px;
          background: rgba(15, 23, 42, 0.88);
          border-radius: 999px;
        }

        .game-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 26px;
          width: 26px;
          margin-top: -8px;
          background: #111827;
          border: 3px solid rgba(0, 0, 0, 0.35);
          border-radius: 999px;
          box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
        }

        .game-slider::-moz-range-track {
          height: 10px;
          background: rgba(15, 23, 42, 0.88);
          border-radius: 999px;
        }

        .game-slider::-moz-range-thumb {
          height: 26px;
          width: 26px;
          background: #111827;
          border: 3px solid rgba(0, 0, 0, 0.35);
          border-radius: 999px;
          box-shadow: 0 3px 0 rgba(0, 0, 0, 0.25);
        }
      `}</style>

      <div
        className="fixed inset-0 z-[999] grid place-items-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-modal-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}>
        <div
          ref={panelRef}
          tabIndex={-1}
          className="w-full max-w-xl rounded-[40px] bg-[#FFC400] shadow-2xl outline-none">
          {/* Header */}
          <div className="relative px-6 sm:px-10 pt-8 sm:pt-10 pb-5 sm:pb-6">
            <h2
              id="config-modal-title"
              className="text-3xl sm:text-5xl font-extrabold text-slate-800">
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-5 top-5 sm:right-8 sm:top-8 grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl transition active:scale-95">
              <span className="relative block h-10 w-10 sm:h-11 sm:w-11">
                <span className="absolute left-1/2 top-1/2 h-2 w-10 sm:w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-pink-500 shadow-[0_2px_0_rgba(0,0,0,0.25)]" />
                <span className="absolute left-1/2 top-1/2 h-2 w-10 sm:w-12 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-pink-500 shadow-[0_2px_0_rgba(0,0,0,0.25)]" />
                <span className="absolute left-1/2 top-1/2 h-[10px] w-10 sm:w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full border-2 border-slate-900/70" />
                <span className="absolute left-1/2 top-1/2 h-[10px] w-10 sm:w-12 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full border-2 border-slate-900/70" />
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-10 pb-8 sm:pb-12 space-y-8 sm:space-y-10">
            <SettingRow
              icon={<SpeakerIcon />}
              label="Efectos"
              value={sfx}
              onChange={onChangeSfx}
              ariaLabel="Volumen de efectos"
            />

            <SettingRow
              icon={<MusicIcon />}
              label="Música"
              value={music}
              onChange={onChangeMusic}
              ariaLabel="Volumen de música"
            />
          </div>
        </div>
      </div>
    </>
  );
}

function SettingRow({ icon, label, value, onChange, ariaLabel }) {
  return (
    <div className="flex items-center gap-4 sm:gap-8">
      <div className="grid w-12 h-12 sm:w-14 sm:h-14 place-items-center text-black shrink-0">
        {icon}
      </div>

      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900">
            {label}
          </span>
          <span className="min-w-[48px] text-right text-base sm:text-lg font-black text-slate-900">
            {value}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          aria-label={ariaLabel}
          className="game-slider"
        />
      </div>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12">
      <div className="absolute left-1 top-4 w-3 h-4 bg-black rounded-sm" />
      <div className="absolute left-3 top-2 w-7 h-8 bg-black [clip-path:polygon(0_20%,55%_0,55%_100%,0_80%)]" />
      <div className="absolute right-1 top-4 w-2 h-4 border-4 border-l-0 border-black rounded-r-full" />
    </div>
  );
}

function MusicIcon() {
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12">
      <div className="absolute left-7 top-2 w-2 h-8 bg-black rounded" />
      <div className="absolute left-7 top-2 w-8 h-2 bg-black rounded" />
      <div className="absolute left-2 top-8 w-6 h-6 bg-black rounded-full" />
    </div>
  );
}
