import { cn } from "@/shared/libs/utils";

export default function HeroGrid({ layout, className, children }) {
  if (!layout) return null;

  const areas = layout.areas.map((r) => `"${r}"`).join(" ");
  const mdAreas = layout.md?.areas ? layout.md.areas.map((r) => `"${r}"`).join(" ") : null;

  return (
    <div
      className={cn(
        // canvas responsive
        "w-full max-w-[95vw] grid p-4 sm:p-6 md:p-8 overflow-hidden",
        // grid via CSS vars
        "gap-[var(--gap)] [grid-template-columns:var(--cols)] [grid-template-rows:var(--rows)] [grid-template-areas:var(--areas)]",
        // md overrides si existen
        layout.md?.cols ? "md:[grid-template-columns:var(--cols-md)]" : "",
        layout.md?.rows ? "md:[grid-template-rows:var(--rows-md)]" : "",
        mdAreas ? "md:[grid-template-areas:var(--areas-md)]" : "",
        className
      )}
      style={{
        "--cols": layout.cols,
        "--rows": layout.rows,
        "--areas": areas,
        "--gap": layout.gap ?? "16px",
        ...(layout.md?.cols ? { "--cols-md": layout.md.cols } : {}),
        ...(layout.md?.rows ? { "--rows-md": layout.md.rows } : {}),
        ...(mdAreas ? { "--areas-md": mdAreas } : {}),
      }}
    >
      {children}
    </div>
  );
}