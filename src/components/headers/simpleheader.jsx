import React from "react";
import rope from "../../assets/rope1.png"; // tu cuerda

export default function QuipuHeader({ title, subtitle, themeHex = "#7130F7" }) {
  return (
    <div className="relative  w-full overflow-hidden">
      <div className="relative pt-3 pb-10 px-1 md:px-0 text-center">
        <h1 className="mt- text-white text-2xl md:text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        <div className="flex justify-center">
          <img
            src={rope}
            alt="Cuerda del Quipu"
            className="w-full relative w-full h-[78px] "
            draggable={false}
          />
        </div>

        {subtitle && (
          <p className="mt-2 text-white/70 text-sm md:text-base">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// util
function hexToRgba(hex, a = 1) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${a})`;
}
