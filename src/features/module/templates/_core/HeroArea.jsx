import { cn } from "@/shared/libs/utils";

/**
 * HeroArea:
 * - Posiciona cada slot dentro del grid principal del template.
 * - Centra el contenido dentro de su celda por defecto.
 * - Permite sobrescribir alineacion con clases Tailwind desde `className`.
 */
export default function HeroArea({ area, className, children }) {
  return (
    <div
      style={{ gridArea: area }}
      className={cn(
        // El area ocupa toda su celda y centra su contenido por defecto.
        // Luego cada variante puede cambiarlo con `place-*`, `justify-*`, `items-*`, etc.
        // Tambien limita al hijo directo para que no desborde el slot.
        "grid h-full w-full min-h-0 min-w-0 overflow-hidden place-items-center place-content-center p-2",
        "[&>*]:min-h-0 [&>*]:min-w-0 [&>*]:max-h-full [&>*]:max-w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}
