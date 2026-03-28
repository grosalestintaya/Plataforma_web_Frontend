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
 * Boton de configuracion:
 * - Usa un tamaño mas contenido para que el header no gane altura extra.
 * - Mantiene la misma jerarquia visual del dashboard.
 */
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
      className={`group relative grid h-[48px] w-[48px] place-items-center rounded-2xl transition duration-300 hover:scale-[1.05] active:scale-[0.97] sm:h-[54px] sm:w-[54px] md:h-[60px] md:w-[60px] ${className}`}
      title={title}
      style={{
        background: `linear-gradient(180deg, ${hexToRgba(themeHex, 0.3)}, ${hexToRgba(themeHex, 0.14)})`,
        border: `1px solid ${hexToRgba("#ffffff", 0.18)}`,
        boxShadow: `
          0 8px 24px ${hexToRgba("#000000", 0.28)},
          0 0 18px ${hexToRgba(themeHex, 0.22)}
        `,
        backdropFilter: "blur(8px)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-1 rounded-2xl"
        style={{
          background: `radial-gradient(circle, ${hexToRgba(themeHex, 0.3)} 0%, ${hexToRgba(themeHex, 0)} 75%)`,
        }}
      />

      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-white/10 opacity-60" />

      <img
        src={iconSrc}
        alt={title}
        draggable={false}
        className="relative z-10 h-[28px] w-[28px] object-contain transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110 sm:h-[32px] sm:w-[32px] md:h-[38px] md:w-[38px]"
      />

      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
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
