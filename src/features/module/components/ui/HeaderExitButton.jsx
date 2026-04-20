import XpQuipuIcon from "@/shared/icons/XpQuipuIcon";

// function hexToRgba(hex, a = 1) {
//   const h = String(hex || "#000").replace("#", "");
//   const full =
//     h.length === 3
//       ? h
//           .split("")
//           .map((c) => c + c)
//           .join("")
//       : h.padEnd(6, "0");

//   const num = parseInt(full, 16);
//   const r = (num >> 16) & 255;
//   const g = (num >> 8) & 255;
//   const b = num & 255;

//   return `rgba(${r},${g},${b},${a})`;
// }

/**
 * Boton de salida de actividad:
 * - vive a la izquierda del titulo;
 * - devuelve al menu del modulo;
 * - usa el icono XP que ya pertenece al lenguaje visual del proyecto.
 */
export default function HeaderExitButton({
  onClick,
  themeHex = "#00c853",
  title = "Salir al menu",
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`group relative grid h-15 w-10 shrink-0 cursor-pointer place-items-center rounded-2xl transition duration-300 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97] sm:h-[44px] sm:w-[44px] md:h-[48px] md:w-[48px] ${className}`}>
      <span className="pointer-events-none absolute inset-1 rounded-2xl" />

      <XpQuipuIcon className="relative z-10 h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14" />
    </button>
  );
}
