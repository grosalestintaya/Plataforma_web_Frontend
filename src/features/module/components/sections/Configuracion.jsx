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

  // Enfocar el modal cuando abre (mejora accesibilidad)
  useEffect(() => {
    if (open) {
      // pequeño delay para asegurar montaje
      setTimeout(() => panelRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Configuración"
      onMouseDown={(e) => {
        // click fuera cierra
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-xl rounded-[40px] bg-[#FFC400] shadow-2xl outline-none"
      >
        {/* Header del modal */}
        <div className="relative px-10 pt-10 pb-6">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800">
            {title}
          </h2>

          {/* Botón cerrar (X rosada) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-8 top-8 grid h-14 w-14 place-items-center rounded-2xl
                       active:scale-95 transition"
          >
            <span className="relative block h-11 w-11">
              {/* X estilo cartoon */}
              <span className="absolute left-1/2 top-1/2 h-2 w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-pink-500 shadow-[0_2px_0_rgba(0,0,0,0.25)]" />
              <span className="absolute left-1/2 top-1/2 h-2 w-12 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-pink-500 shadow-[0_2px_0_rgba(0,0,0,0.25)]" />
              {/* borde oscuro */}
              <span className="absolute left-1/2 top-1/2 h-[10px] w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full border-2 border-slate-900/70" />
              <span className="absolute left-1/2 top-1/2 h-[10px] w-12 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full border-2 border-slate-900/70" />
            </span>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-10 pb-12 space-y-10">
          {/* SFX */}
          <SettingRow
            icon={<SpeakerIcon />}
            value={sfx}
            onChange={onChangeSfx}
            ariaLabel="Volumen de efectos"
          />

          {/* MUSIC */}
          <SettingRow
            icon={<MusicIcon />}
            value={music}
            onChange={onChangeMusic}
            ariaLabel="Volumen de música"
          />
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, value, onChange, ariaLabel }) {
  return (
    <div className="flex items-center gap-8">
      <div className="w-14 h-14 grid place-items-center text-black">{icon}</div>

      {/* Barra estilo imagen: track oscuro + knob circular */}
      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          aria-label={ariaLabel}
          className="w-full h-4 appearance-none bg-transparent"
          style={{
            // Para que el track se vea como barra “recta” del ejemplo
            WebkitAppearance: "none",
          }}
        />

        {/* Estilos del range (solo con Tailwind no alcanza; usamos CSS inline via <style>) */}
        <style>{`
          input[type="range"]::-webkit-slider-runnable-track {
            height: 10px;
            background: rgba(15, 23, 42, 0.85);
            border-radius: 999px;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 26px;
            width: 26px;
            margin-top: -8px;
            background: #111827;
            border: 3px solid rgba(0,0,0,0.35);
            border-radius: 999px;
            box-shadow: 0 3px 0 rgba(0,0,0,0.25);
          }
          input[type="range"]::-moz-range-track {
            height: 10px;
            background: rgba(15, 23, 42, 0.85);
            border-radius: 999px;
          }
          input[type="range"]::-moz-range-thumb {
            height: 26px;
            width: 26px;
            background: #111827;
            border: 3px solid rgba(0,0,0,0.35);
            border-radius: 999px;
            box-shadow: 0 3px 0 rgba(0,0,0,0.25);
          }
        `}</style>
      </div>
    </div>
  );
}

/** Iconos simples en HTML (sin librerías) **/
function SpeakerIcon() {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute left-1 top-4 w-3 h-4 bg-black rounded-sm" />
      <div className="absolute left-3 top-2 w-7 h-8 bg-black [clip-path:polygon(0_20%,55%_0,55%_100%,0_80%)]" />
      <div className="absolute right-1 top-4 w-2 h-4 border-4 border-l-0 border-black rounded-r-full" />
    </div>
  );
}

function MusicIcon() {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute left-7 top-2 w-2 h-8 bg-black rounded" />
      <div className="absolute left-7 top-2 w-8 h-2 bg-black rounded" />
      <div className="absolute left-2 top-8 w-6 h-6 bg-black rounded-full" />
    </div>
  );
}
