import XpQuipuIcon from "@/shared/icons/XpQuipuIcon";

const EXIT_BUTTON_CLASS =
  "group relative grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-2xl transition duration-300 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97] sm:h-11 sm:w-11 md:h-12 md:w-12";
const EXIT_ICON_CLASS =
  "relative z-10 h-7 w-7 text-white transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8 md:h-9 md:w-9";

/**
 * Boton de salida de actividad:
 * - vive a la izquierda del titulo;
 * - devuelve al menu del modulo;
 * - usa el icono XP que ya pertenece al lenguaje visual del proyecto.
 */
export default function HeaderExitButton({
  onClick,
  title = "Salir al menu",
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`${EXIT_BUTTON_CLASS} ${className}`}>
      <XpQuipuIcon className={EXIT_ICON_CLASS} />
    </button>
  );
}
