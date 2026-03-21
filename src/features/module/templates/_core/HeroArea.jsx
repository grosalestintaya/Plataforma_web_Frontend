/**
 * HeroArea: posiciona el contenido en un área del grid (grid-area).
 *
 * ✅ Responsabilidad:
 * - Recibir un nombre de área (ej. "title", "text", "image", "examples")
 * - Aplicar `grid-area` para que el browser lo coloque en esa zona.
 */
import { cn } from "@/shared/libs/utils";

export default function HeroArea({ area, className, children }) {
  return (
    <div
      style={{ gridArea: area }} //posicionamiento de los slots dentro del grid
      className={cn(
        "min-w-0 p-2", className
      )}
    >
      {children}
    </div>
  );
}