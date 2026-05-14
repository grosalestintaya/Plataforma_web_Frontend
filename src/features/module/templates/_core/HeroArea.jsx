import { cn } from "@/shared/libs/utils";

export default function HeroArea({ area, className, children }) {
  return (
    <div
      style={{ gridArea: area }}
      className={cn(
        /**
         * Base:
         * - No recorta.
         * - Permite que el contenido crezca.
         */
        "flex min-h-0 min-w-0 w-full items-center justify-center overflow-visible ",

        /**
         * Desktop/laptop:
         * - El slot respeta el alto del grid.
         * - Los componentes deben adaptarse dentro.
         */
        "lg:h-full lg:overflow-hidden",

        "[&>*]:w-full [&>*]:min-w-0 [&>*]:max-w-full lg:[&>*]:max-h-full",
        className,
      )}
    >
      {children}
    </div>
  );
}