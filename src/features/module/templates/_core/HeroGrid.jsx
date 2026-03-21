/**
 * HeroGrid: crea el "canvas"y aplica el layout (cols/rows/areas).
 * Usa CSS vars porque Tailwind no compila clases dinámicas en runtime.
 */
import { cn } from "@/shared/libs/utils";

export default function HeroGrid({ layout, className, children }) {
  if (!layout) return null;

  const areasCss = layout.areas.map((r) => `"${r}"`).join(" ");
  const mdAreasCss = layout.md?.areas ? layout.md.areas.map((r) => `"${r}"`).join(" ") : null;

  return (
    <section
      className={cn(
        // Canvas base
        "w-full h-full max- overflow-hidden",
        // Grid base
        "grid p-4 md:p-6 place-items-center",
        "gap-(--gap) grid-cols-(--cols) grid-rows-(--rows) [grid-template-areas:var(--areas)]",
        // Overrides md (solo si existen)
        layout.md?.cols ? "md:grid-cols-(--cols-md)" : "",
        layout.md?.rows ? "md:grid-rows-(--rows-md)" : "",
        mdAreasCss ? "md:[grid-template-areas:var(--areas-md)]" : "",
        className
      )}
      style={{
        "--cols": layout.cols,
        "--rows": layout.rows,
        "--areas": areasCss,
        "--gap": layout.gap ?? "16px",
        ...(layout.md?.cols ? { "--cols-md": layout.md.cols } : {}),
        ...(layout.md?.rows ? { "--rows-md": layout.md.rows } : {}),
        ...(mdAreasCss ? { "--areas-md": mdAreasCss } : {})
      }}
    >
      {children}
    </section>
  );
}

// import { cn } from "@/shared/lib/utils";

// export default function HeroGrid({ layout, className, children }) {
//   if (!layout) return null;

//   return (
//     <section
//       className={cn(
//         "w-full h-full min-h-14 grid place-items-center box-border p-4",
//         className
//       )}

//     >
//       {children}
//     </section>
//   );
// }