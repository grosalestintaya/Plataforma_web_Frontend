// components/ui/HeaderBackButton.jsx
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

export default function HeaderBackButton({
  onClick,
  themeHex = "#7130F7",
  label = "Volver",
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`group relative overflow-hidden px-3 md:px-4 h-[58px] rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-[1px] hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{
        background: `linear-gradient(180deg, ${hexToRgba(themeHex, 0.34)} 0%, ${hexToRgba(themeHex, 0.16)} 100%)`,
        border: `1px solid ${hexToRgba("#ffffff", 0.18)}`,
        boxShadow: `
          0 10px 28px ${hexToRgba("#000000", 0.28)},
          0 0 18px ${hexToRgba(themeHex, 0.2)}
        `,
        backdropFilter: "blur(8px)",
      }}
      title={label}>
      {/* halo interno */}
      <span
        className="absolute inset-1 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${hexToRgba("#ffffff", 0.12)} 0%, ${hexToRgba(themeHex, 0)} 70%)`,
        }}
      />

      {/* brillo superior */}
      <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-50 pointer-events-none" />

      {/* contenido */}
      <span className="relative z-10 flex items-center gap-3">
        {/* cápsula del icono */}
        <span
          className="w-9 h-9 rounded-xl grid place-items-center shrink-0 transition-all duration-300 group-hover:-translate-x-0.5"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba("#ffffff", 0.18)}, ${hexToRgba("#ffffff", 0.06)})`,
            border: `1px solid ${hexToRgba("#ffffff", 0.14)}`,
            boxShadow: `inset 0 1px 0 ${hexToRgba("#ffffff", 0.1)}`,
          }}>
          <span className="relative block w-4 h-4">
            <span className="absolute left-[3px] top-1/2 -translate-y-1/2 w-[9px] h-[2.2px] rounded-full bg-white" />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[8px] h-[8px] border-l-[2.2px] border-b-[2.2px] border-white rotate-45 rounded-[1px]" />
          </span>
        </span>

        <span className="text-[15px] md:text-base tracking-tight">{label}</span>
      </span>

      {/* glow hover */}
      <span
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
        style={{
          boxShadow: `
            inset 0 1px 0 ${hexToRgba("#ffffff", 0.1)},
            0 0 24px ${hexToRgba(themeHex, 0.34)}
          `,
        }}
      />
    </button>
  );
}
