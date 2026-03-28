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

export default function HeaderSettingsButton({
  onClick,
  themeHex = "#7130F7",
  iconSrc,
  title = "Configuracion",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`group relative grid h-[64px] w-[64px] place-items-center rounded-2xl transition duration-300 hover:scale-[1.05] active:scale-[0.97] ${className}`}
      title={title}>
      <span
        className="pointer-events-none absolute inset-1 rounded-2xl"
        style={{}}
      />

      <img
        src={iconSrc}
        alt={title}
        draggable={false}
        className="relative z-10 h-[62px] w-[62px] object-contain transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
      />

      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100" />
    </button>
  );
}
