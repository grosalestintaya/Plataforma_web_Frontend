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
    <div className="flex h-full w-full min-h-0 flex-col items-center justify-start">
      {/* Burbuja */}
      <div
        className="relative max-w-[210px] rounded-3xl border px-3 py-2.5 backdrop-blur-sm shadow-xl sm:max-w-[230px] sm:px-4 sm:py-3 md:max-w-[250px] lg:max-w-[270px] xl:max-w-[280px] xl:px-5 xl:py-4"
        style={bubbleStyle}>
        <div className="mb-1 text-center text-[10px] text-white/60 sm:text-xs">{name}</div>
        <div className="text-center text-[11px] leading-snug opacity-95 sm:text-xs md:text-sm md:leading-snug xl:leading-relaxed">
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

      {/* Mascota:
          Reducimos la altura visual en sm/md/lg para que el bloque inferior
          entre completo dentro del viewport antes de llegar a xl. */}
      <div className="relative mt-2 flex h-[110px] w-[180px] flex-1 items-start justify-center sm:mt-3 sm:h-[135px] sm:w-[210px] md:h-[160px] md:w-[240px] lg:h-[190px] lg:w-[285px] xl:mt-6 xl:h-[270px] xl:w-[360px]">
        {/* glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: hexToRgba(themeHex, 0.12) }}
        />
        {/* sombra base */}
        <div className="absolute bottom-3 z-[1] h-[14px] w-[130px] rounded-full bg-black/35 blur-md sm:h-[16px] sm:w-[150px] md:w-[165px] lg:bottom-4 lg:h-[18px] lg:w-[185px] xl:w-[170px]" />
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
          className="pointer-events-none absolute -bottom-1 z-[2] w-[125px] select-none object-contain sm:-bottom-2 sm:w-[150px] md:w-[175px] lg:-bottom-3 lg:w-[215px] xl:-bottom-4 xl:w-[260px]"
        />
      </div>
    </div>
  );
}
