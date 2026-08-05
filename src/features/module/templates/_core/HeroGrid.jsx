import { cn } from "@/shared/libs/utils";

export default function HeroGrid({ layout, className, children }) {
  if (!layout) return null;

  const areasCss = layout.areas.map((row) => `"${row}"`).join(" ");

  const mdAreasCss = layout.md?.areas
    ? layout.md.areas.map((row) => `"${row}"`).join(" ")
    : null;

  /**
   * `fit` era el contrato histórico para ajustar el layout en escritorio.
   * `lg` es el contrato explícito actual y tiene prioridad cuando ambos existen.
   */
  const desktopLayout = {
    cols: layout.lg?.cols ?? layout.fit?.cols ?? layout.md?.cols ?? layout.cols,
    rows: layout.lg?.rows ?? layout.fit?.rows ?? layout.md?.rows ?? layout.rows,
    areas:
      layout.lg?.areas ??
      layout.fit?.areas ??
      layout.md?.areas ??
      layout.areas,
  };
  const desktopAreasCss = desktopLayout.areas
    .map((row) => `"${row}"`)
    .join(" ");

  return (
    <section
      className={cn(
        /**
         * Base:
         * - Puede crecer.
         * - El scroll lo controla ActivityHero.
         */
        "grid min-h-full w-full min-w-0 overflow-visible",

        /**
         * Desktop/laptop:
         * - Debe entrar dentro del alto disponible.
         * - No debe generar scroll interno.
         */
        "lg:h-full lg:min-h-0 lg:overflow-hidden",

        "grid-cols-[var(--cols)] grid-rows-[var(--rows)] [grid-template-areas:var(--areas)]",
        "gap-1 px-4 py-2 sm:gap-1.5 sm:px-6 md:gap-2 md:px-8 lg:px-12",

        layout.md?.cols && "md:grid-cols-[var(--cols-md)]",
        layout.md?.rows && "md:grid-rows-[var(--rows-md)]",
        mdAreasCss && "md:[grid-template-areas:var(--areas-md)]",

        "lg:grid-cols-[var(--cols-lg)] lg:grid-rows-[var(--rows-lg)]",
        "lg:[grid-template-areas:var(--areas-lg)]",

        className,
      )}
      style={{
        "--cols": layout.cols,
        "--rows": layout.rows,
        "--areas": areasCss,

        ...(layout.md?.cols ? { "--cols-md": layout.md.cols } : {}),
        ...(layout.md?.rows ? { "--rows-md": layout.md.rows } : {}),
        ...(mdAreasCss ? { "--areas-md": mdAreasCss } : {}),

        "--cols-lg": desktopLayout.cols,
        "--rows-lg": desktopLayout.rows,
        "--areas-lg": desktopAreasCss,
      }}
    >
      {children}
    </section>
  );
}
