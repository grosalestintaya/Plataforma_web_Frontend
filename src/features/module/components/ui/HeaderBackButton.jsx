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
      className={`group relative h-[58px] overflow-hidden rounded-2xl px-3 font-semibold text-white transition-all duration-300 hover:-translate-y-[1px] hover:scale-[1.02] active:scale-[0.98] md:px-4 ${className}`}
      style={{
        background: `linear-gradient(180deg, ${hexToRgba(themeHex, 0.34)} 0%, ${hexToRgba(themeHex, 0.16)} 100%)`,
        border: `1px solid ${hexToRgba("#ffffff", 0.18)}`,
        boxShadow: `
          0 10px 28px ${hexToRgba("#000000", 0.28)},
          0 0 18px ${hexToRgba(themeHex, 0.2)}
        `,
        backdropFilter: "blur(8px)",
      }}
      title={label}
    >
      <span
        className="pointer-events-none absolute inset-1 rounded-2xl"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${hexToRgba("#ffffff", 0.12)} 0%, ${hexToRgba(themeHex, 0)} 70%)`,
        }}
      />

      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-white/10 opacity-50" />

      <span className="relative z-10 flex items-center gap-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-300 group-hover:-translate-x-0.5"
          style={{
            background: `linear-gradient(180deg, ${hexToRgba("#ffffff", 0.18)}, ${hexToRgba("#ffffff", 0.06)})`,
            border: `1px solid ${hexToRgba("#ffffff", 0.14)}`,
            boxShadow: `inset 0 1px 0 ${hexToRgba("#ffffff", 0.1)}`,
          }}
        >
          <span className="relative block h-4 w-4">
            <span className="absolute left-[3px] top-1/2 h-[2.2px] w-[9px] -translate-y-1/2 rounded-full bg-white" />
            <span className="absolute left-0 top-1/2 h-[8px] w-[8px] -translate-y-1/2 rotate-45 rounded-[1px] border-b-[2.2px] border-l-[2.2px] border-white" />
          </span>
        </span>

        <span className="text-[15px] tracking-tight md:text-base">{label}</span>
      </span>

      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
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
