import React from "react";
import grassPng from "@/assets/mascots/grass/base2.png";

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
        <div className="mb-1 text-center text-xs text-white/60">{name}</div>
        <div className="text-center text-sm leading-relaxed opacity-95">
          {text}
        </div>

        {/* Pico */}
        <div
          className="absolute -bottom-3 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-b border-l"
          style={{
            background: hexToRgba(themeHex, 0.16),
            borderColor: hexToRgba(themeHex, 0.35),
          }}
        />
      </div>

      {/* Mascota */}
      <div className="relative mt-6 flex h-[270px] w-[360px] items-center justify-center">
        {/* glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: hexToRgba(themeHex, 0.12) }}
        />
        {/* sombra base */}
        <div className="absolute bottom-4 z-[1] h-[18px] w-[170px] rounded-full bg-black/35 blur-md" />
        {/* pasto */}
        {/* mascota */}
        <img
          src={gifSrc}
          alt={name}
          draggable={false}
          className="relative z-[3] max-h-full max-w-full object-contain drop-shadow-2xl contrast-110 saturate-110"
        />{" "}
        <img
          src={grassPng}
          alt="Base de pasto"
          draggable={false}
          className="absolute -bottom-4  z-[2] w-[260px] object-contain select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
