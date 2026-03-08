import React from "react";

function hexToRgba(hex, a = 1) {
  const h = String(hex || "#000").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Props:
 * - gifSrc: string
 * - name: string
 * - text: string
 * - themeHex: string (ej: "#7130F7") -> lo manda el componente que usa esto
 */
export default function MascotTutorDemo({
  gifSrc = "/mascots/guide.gif",
  name = "Guía",
  text = "Selecciona una actividad para empezar.",
  themeHex = "#7130F7",
}) {
  const bubbleStyle = {
    borderColor: hexToRgba(themeHex, 0.35),
    background: `linear-gradient(180deg,
      ${hexToRgba(themeHex, 0.16)},
      ${hexToRgba("#000000", 0.18)} 70%
    )`,
    color: "rgba(255,255,255,0.96)",
    boxShadow: `0 18px 45px ${hexToRgba("#000000", 0.35)}`,
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Burbuja */}
      <div
        className="relative max-w-[280px] rounded-3xl border px-5 py-4 backdrop-blur-sm shadow-xl"
        style={bubbleStyle}>
        <div className="text-xs text-white/60 mb-1 text-center">{name}</div>
        <div className="text-sm leading-relaxed opacity-95 text-center">
          {text}
        </div>

        {/* Pico */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 rotate-45 border-l border-b"
          style={{
            background: hexToRgba(themeHex, 0.16),
            borderColor: hexToRgba(themeHex, 0.35),
          }}
        />
      </div>

      {/* Contenedor fijo para evitar desproporción */}
      <div className="mt-6 relative w-[260px] h-[260px] flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: hexToRgba(themeHex, 0.12) }}
        />

        <img
          src={gifSrc}
          alt={name}
          draggable={false}
          className="max-w-full max-h-full object-contain drop-shadow-2xl contrast-110 saturate-110"
        />

        <div className="absolute bottom-3 w-[160px] h-[18px] rounded-full bg-black/40 blur-md" />
      </div>
    </div>
  );
}
