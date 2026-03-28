import { useEffect, useRef } from "react";

export default function ConfiguracionModal({
  open,
  onRequestClose,
  onRequestAbandon,
  sfx = 80,
  music = 50,
  onChangeSfx,
  onChangeMusic,
  title = "Opciones",
  abandonLabel = "Abandonar actividad",
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onRequestClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onRequestClose]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

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
          if (e.target === e.currentTarget) onRequestClose?.();
        }}>
        <div
          ref={panelRef}
          tabIndex={-1}
          className="w-full max-w-xl rounded-[40px] bg-[#FFC400] shadow-2xl outline-none">
          <div className="relative px-6 pt-8 pb-5 sm:px-10 sm:pt-10 sm:pb-6">
            <h2
              id="config-modal-title"
              className="text-3xl font-extrabold text-slate-800 sm:text-5xl">
              {title}
            </h2>

            <button
              type="button"
              onClick={onRequestClose}
              aria-label="Cerrar"
              className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl transition active:scale-95 sm:right-8 sm:top-8 sm:h-14 sm:w-14">
              <span className="relative block h-10 w-10 sm:h-11 sm:w-11">
                <span className="absolute left-1/2 top-1/2 h-2 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-pink-500 shadow-[0_2px_0_rgba(0,0,0,0.25)] sm:w-12" />
                <span className="absolute left-1/2 top-1/2 h-2 w-10 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-pink-500 shadow-[0_2px_0_rgba(0,0,0,0.25)] sm:w-12" />
                <span className="absolute left-1/2 top-1/2 h-[10px] w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full border-2 border-slate-900/70 sm:w-12" />
                <span className="absolute left-1/2 top-1/2 h-[10px] w-10 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full border-2 border-slate-900/70 sm:w-12" />
              </span>
            </button>
          </div>

          <div className="space-y-8 px-6 pb-8 sm:space-y-10 sm:px-10 sm:pb-12">
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

            <div className="pt-2">
              <div className="mb-3 text-sm font-semibold text-slate-800/80">
                Saldrás de la actividad actual y volverás al inicio.
              </div>

              <button
                type="button"
                onClick={onRequestAbandon}
                className="w-full rounded-2xl border-2 border-red-950/20 bg-red-500 px-5 py-4 text-lg font-black text-white shadow-[0_5px_0_rgba(0,0,0,0.18)] transition hover:brightness-105 active:translate-y-[1px]">
                {abandonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingRow({ icon, label, value, onChange, ariaLabel }) {
  return (
    <div className="flex items-center gap-4 sm:gap-8">
      <div className="grid h-12 w-12 shrink-0 place-items-center text-black sm:h-14 sm:w-14">
        {icon}
      </div>

      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-lg font-extrabold text-slate-900 sm:text-xl">
            {label}
          </span>
          <span className="min-w-[48px] text-right text-base font-black text-slate-900 sm:text-lg">
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
    <div className="relative h-10 w-10 sm:h-12 sm:w-12">
      <div className="absolute left-1 top-4 h-4 w-3 rounded-sm bg-black" />
      <div className="absolute left-3 top-2 h-8 w-7 bg-black [clip-path:polygon(0_20%,55%_0,55%_100%,0_80%)]" />
      <div className="absolute right-1 top-4 h-4 w-2 rounded-r-full border-4 border-l-0 border-black" />
    </div>
  );
}

function MusicIcon() {
  return (
    <div className="relative h-10 w-10 sm:h-12 sm:w-12">
      <div className="absolute left-7 top-2 h-8 w-2 rounded bg-black" />
      <div className="absolute left-7 top-2 h-2 w-8 rounded bg-black" />
      <div className="absolute left-2 top-8 h-6 w-6 rounded-full bg-black" />
    </div>
  );
}
