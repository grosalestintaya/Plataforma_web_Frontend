import { cn } from "@/shared/libs/utils";

/**
 * HeroArea:
 * - Posiciona cada slot dentro del grid principal del template.
 * - Mantiene una superficie minima para que el contenido no colapse.
 */
export default function HeroArea({ area, className, children }) {
  return (
    <div
      style={{ gridArea: area }}
      className={cn(
        // Cada area debe poder encogerse dentro del grid sin empujar el canvas.
        "min-h-0 min-w-0 p-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
