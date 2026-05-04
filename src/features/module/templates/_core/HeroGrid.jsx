import { cn } from "@/shared/libs/utils";

/**
 * HeroGrid:
 * - Construye el canvas base del template usando CSS variables.
 * - Permite que cada config defina areas sin generar clases dinamicas.
 */
export default function HeroGrid({ layout, className, children }) {
  if (!layout) return null;

  const areasCss = layout.areas.map((row) => `"${row}"`).join(" ");
  const mdAreasCss = layout.md?.areas
    ? layout.md.areas.map((row) => `"${row}"`).join(" ")
    : null;

  return (
    <section
      className={cn(
        "grid min-h-full w-full overflow-visible px-4 sm:px-8 md:h-full md:min-h-0 md:overflow-hidden md:px-15",
        "gap-2 grid-cols-(--cols) grid-rows-(--rows) [grid-template-areas:var(--areas)]",
        layout.md?.cols ? "md:grid-cols-(--cols-md)" : "",
        layout.md?.rows ? "md:grid-rows-(--rows-md)" : "",
        mdAreasCss ? "md:[grid-template-areas:var(--areas-md)]" : "",
        className,
      )}
      style={{
        "--cols": layout.cols,
        "--rows": layout.rows,
        "--areas": areasCss,
        ...(layout.md?.cols ? { "--cols-md": layout.md.cols } : {}),
        ...(layout.md?.rows ? { "--rows-md": layout.md.rows } : {}),
        ...(mdAreasCss ? { "--areas-md": mdAreasCss } : {}),
      }}>
      {children}
    </section>
  );
}
