import { useEffect, useMemo, useRef } from "react";
import closeIcon from "@/shared/icons/icon-close.svg";
import musicOffIcon from "@/shared/icons/icon-music-off.svg";
import musicOnIcon from "@/shared/icons/icon-music-on.svg";
import volumeDownIcon from "@/shared/icons/icon-volume-down.svg";
import volumeOffIcon from "@/shared/icons/icon-volume-off.svg";
import volumeUpIcon from "@/shared/icons/icon-volume-up.svg";

function getEffectsIcon(value) {
  const volume = Number(value ?? 0);

  if (volume <= 0) return volumeOffIcon;
  if (volume <= 50) return volumeDownIcon;
  return volumeUpIcon;
}

function getMusicIcon(value) {
  const volume = Number(value ?? 0);
  return volume <= 0 ? musicOffIcon : musicOnIcon;
}

/**
 * Modal de configuracion compartido por menu y actividad.
 * Los iconos cambian segun el volumen actual y tambien sirven para mute/unmute.
 */
export default function ConfiguracionModal({
  open,
  onRequestClose,
  onRequestAbandon,
  description = "Saldras de la vista actual y volveras al inicio.",
  showAbandonAction = true,
  sfx = 70,
  music = 10,
  onChangeSfx,
  onChangeMusic,
  title = "Opciones",
  abandonLabel = "Abandonar actividad",
  audioState,
}) {
  const panelRef = useRef(null);
  const lastNonZeroSfxRef = useRef(Number(sfx) > 0 ? Number(sfx) : 80);
  const lastNonZeroMusicRef = useRef(Number(music) > 0 ? Number(music) : 50);

  const effectsIcon = useMemo(() => getEffectsIcon(sfx), [sfx]);
  const musicIcon = useMemo(() => getMusicIcon(music), [music]);

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

  useEffect(() => {
    if (Number(sfx) > 0) {
      lastNonZeroSfxRef.current = Number(sfx);
    }
  }, [sfx]);

  useEffect(() => {
    if (Number(music) > 0) {
      lastNonZeroMusicRef.current = Number(music);
    }
  }, [music]);

  if (!open) return null;

  function playVolumeClick() {
    audioState?.playSfx?.("clickDot");
  }

  function handleToggleSfx() {
    if (Number(sfx) > 0) {
      // Debe sonar antes de mutear para que el clic siga siendo audible.
      playVolumeClick();
      onChangeSfx?.(0);
      return;
    }

    onChangeSfx?.(lastNonZeroSfxRef.current || 80);
    playVolumeClick();
  }

  function handleToggleMusic() {
    playVolumeClick();

    if (Number(music) > 0) {
      onChangeMusic?.(0);
      return;
    }

    onChangeMusic?.(lastNonZeroMusicRef.current || 50);
  }

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
          <div className="relative px-6 pb-5 pt-8 sm:px-10 sm:pb-6 sm:pt-10">
            <h2
              id="config-modal-title"
              className="text-3xl font-extrabold text-slate-800 sm:text-5xl">
              {title}
            </h2>

            <button
              type="button"
              onClick={onRequestClose}
              aria-label="Cerrar"
              className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl border-2 border-slate-900/20 bg-white/35 transition hover:bg-white/50 active:scale-95 sm:right-8 sm:top-8 sm:h-14 sm:w-14">
              <img
                src={closeIcon}
                alt=""
                aria-hidden="true"
                className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                draggable={false}
              />
            </button>
          </div>

          <div className="space-y-8 px-6 pb-8 sm:space-y-10 sm:px-10 sm:pb-12">
            <SettingRow
              icon={effectsIcon}
              label="Efectos"
              value={sfx}
              onChange={onChangeSfx}
              onToggle={handleToggleSfx}
              onReleaseSlider={playVolumeClick}
              isMuted={Number(sfx) <= 0}
              ariaLabel="Volumen de efectos"
            />

            <SettingRow
              icon={musicIcon}
              label="Musica"
              value={music}
              onChange={onChangeMusic}
              onToggle={handleToggleMusic}
              onReleaseSlider={playVolumeClick}
              isMuted={Number(music) <= 0}
              ariaLabel="Volumen de musica"
            />

            {showAbandonAction ? (
              <div className="pt-2">
                <div className="mb-3 text-sm font-semibold text-slate-800/80">
                  {description}
                </div>

                <button
                  type="button"
                  onClick={onRequestAbandon}
                  className="w-full rounded-2xl border-2 border-red-950/20 bg-red-500 px-5 py-4 text-lg font-black text-white shadow-[0_5px_0_rgba(0,0,0,0.18)] transition hover:brightness-105 active:translate-y-[1px]">
                  {abandonLabel}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onChange,
  onToggle,
  isMuted = false,
  ariaLabel,
  onReleaseSlider,
}) {
  return (
    <div className="flex items-center gap-4 sm:gap-8">
      <button
        type="button"
        onClick={onToggle}
        aria-label={isMuted ? `Activar ${label}` : `Silenciar ${label}`}
        aria-pressed={!isMuted}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-slate-900/15 bg-white/25 transition hover:bg-white/40 active:scale-95 sm:h-14 sm:w-14">
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          draggable={false}
        />
      </button>

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
          onMouseUp={onReleaseSlider}
          onTouchEnd={onReleaseSlider}
          onKeyUp={(e) => {
            if (
              e.key === "ArrowLeft" ||
              e.key === "ArrowRight" ||
              e.key === "Home" ||
              e.key === "End"
            ) {
              onReleaseSlider?.();
            }
          }}
          aria-label={ariaLabel}
          className="game-slider"
        />
      </div>
    </div>
  );
}
