import { cn } from "@/shared/libs/utils";

const ASIDE_CONTENT_CLASS = Object.freeze({
  default:
    "flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden",
  heading:
    "grid min-h-0 min-w-0 flex-1 grid-cols-1 items-stretch gap-2 overflow-hidden md:grid-cols-2 md:grid-rows-1 [&>*]:min-h-0 [&>*]:min-w-0 [&>*]:max-w-full [&>*]:overflow-hidden",
});

/**
 * Superficie agrupadora para información complementaria de una misión.
 *
 * No interpreta contenido ni instancia otros bloques. La misión decide qué
 * componentes componer y los entrega mediante `children`.
 */
export default function InteractiveInfoAside({
  children,
  variant = "default",
  className = "",
  contentClassName = "",
}) {
  return (
    <aside
      className={cn(
        "flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden rounded-[2rem] border border-white/18 p-5",
        className,
      )}
    >
      <div
        className={cn(
          ASIDE_CONTENT_CLASS[variant] ?? ASIDE_CONTENT_CLASS.default,
          contentClassName,
        )}
      >
        {children}
      </div>
    </aside>
  );
}
