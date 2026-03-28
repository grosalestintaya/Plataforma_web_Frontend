import activityImage001 from "@/assets/activity/image001.png";
import { cn } from "@/shared/libs/utils";

/**
 * Image:
 * - Renderiza una imagen simple del sistema.
 * - Si no existe `src`, usa una imagen base para evitar huecos visuales.
 * - Siempre respeta el espacio que el bloque padre ya le asigno.
 */
export default function Image({
  src = "",
  alt = "Imagen",
  className = "",
  imgClassName = "",
  placeholderLabel = "Imagen",
}) {
  const resolvedSrc = src || activityImage001;
  const resolvedAlt = alt || placeholderLabel || "Imagen";

  return (
    <div className={cn("flex h-full w-full items-center justify-center overflow-hidden", className)}>
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        className={cn(
          // La imagen se adapta solo al espacio disponible del contenedor.
          // Nunca define por si sola el tamano del layout.
          "max-h-full max-w-full object-contain",
          imgClassName,
        )}
      />
    </div>
  );
}
