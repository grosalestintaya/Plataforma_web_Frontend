import { cn } from "@/shared/libs/utils";

const AREA_ALIGN_CLASS = {
  center: "items-center",
  stretch: "items-stretch",
};

export default function HeroArea({
  area,
  align = "center",
  className,
  children,
}) {
  return (
    <div
      style={{ gridArea: area }}
      className={cn(
        /**
         * Base:
         * - No recorta.
         * - Permite que el contenido crezca.
         */
        "flex min-h-0 min-w-0 w-full justify-center overflow-visible ",
        AREA_ALIGN_CLASS[align] ?? AREA_ALIGN_CLASS.center,

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
