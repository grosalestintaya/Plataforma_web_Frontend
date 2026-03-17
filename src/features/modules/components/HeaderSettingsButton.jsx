// components/ui/HeaderSettingsButton.jsx
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
  title = "Configuración",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`group relative w-[64px] h-[64px] rounded-2xl grid place-items-center transition duration-300 hover:scale-[1.05] active:scale-[0.97] ${className}`}
      title={title}
      style={{
        background: `linear-gradient(180deg, ${hexToRgba(themeHex, 0.3)}, ${hexToRgba(themeHex, 0.14)})`,
        border: `1px solid ${hexToRgba("#ffffff", 0.18)}`,
        boxShadow: `
          0 8px 24px ${hexToRgba("#000000", 0.28)},
          0 0 18px ${hexToRgba(themeHex, 0.22)}
        `,
        backdropFilter: "blur(8px)",
      }}>
      {/* halo de fondo */}
      <span
        className="absolute inset-1 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${hexToRgba(themeHex, 0.3)} 0%, ${hexToRgba(themeHex, 0)} 75%)`,
        }}
      />

      {/* brillo superior */}
      <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-60 pointer-events-none" />

      <img
        src={iconSrc}
        alt={title}
        draggable={false}
        className="relative z-10 w-[42px] h-[42px] object-contain transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
      />

      {/* glow hover */}
      <span
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
        style={{
          boxShadow: `
            0 0 0 1px ${hexToRgba("#ffffff", 0.12)},
            0 0 24px ${hexToRgba(themeHex, 0.45)},
            0 0 40px ${hexToRgba(themeHex, 0.2)}
          `,
        }}
      />
    </button>
  );
}
