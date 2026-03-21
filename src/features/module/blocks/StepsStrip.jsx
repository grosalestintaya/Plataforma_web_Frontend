import Typografia from "./Typografia";
import { cn } from "@/shared/libs/utils";

export default function StepsStrip({ steps = [], className = "" }) {
  return (
    <div
      className={cn(
        "grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-5",
        className,
      )}
    >
      {steps.map((step, index) => (
        <article
          key={step?.id ?? index}
          className="flex min-h-[180px] flex-col justify-center rounded-2xl border border-white/15 px-4 py-5"
        >
          <Typografia
            variant="hero"
            align="center"
            className="pb-2 text-3xl md:text-4xl"
          >
            {step?.number ?? index + 1}
          </Typografia>

          <Typografia
            content={
              step?.label ?? {
                text: "",
                variant: "body",
              }
            }
            variant={step?.label?.variant ?? "body"}
            align={step?.label?.align ?? "center"}
            className="py-0 text-sm md:text-base"
          />
        </article>
      ))}
    </div>
  );
}
