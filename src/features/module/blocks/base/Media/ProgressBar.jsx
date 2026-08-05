import { cn } from "@/shared/libs/utils";

export default function ProgressBar({
  progress,
  value,
  max,
  mode = "segments",
  ariaLabel = "Progreso",
  className = "",
  trackClassName = "",
  fillClassName = "",
}) {
  if (mode === "continuous") {
    const safeMax = Math.max(1, Number(max ?? progress?.total ?? 100));
    const safeValue = Math.min(
      safeMax,
      Math.max(0, Number(value ?? progress?.current ?? 0)),
    );
    const percent = (safeValue / safeMax) * 100;

    return (
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        className={cn("w-full", className)}
      >
        <div className={cn("h-3 overflow-hidden rounded-full bg-white/10", trackClassName)}>
          <div
            className={cn(
              "h-full rounded-full bg-white/90 transition-[width] duration-300",
              fillClassName,
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  const current = Math.max(1, Number(progress?.current ?? 1));
  const total = Math.max(current, Number(progress?.total ?? 1));
  const segments = Array.from({ length: total }, (_, index) => index + 1);

  return (
    <section
      className={cn(
        "mx-auto w-full rounded-md border border-white/20 p-4",
        className,
      )}
    >
      <div className={cn("grid w-full gap-5 md:gap-8", trackClassName)}>
        <div
          className="grid w-full gap-5 md:gap-8"
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        >
          {segments.map((step) => {
            const isFilled = step <= current;

            return (
              <div
                key={step}
                className={cn(
                  "h-1 rounded-full transition-colors duration-300",
                  isFilled ? "bg-white/90" : "bg-white/20",
                  isFilled && fillClassName,
                )}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
