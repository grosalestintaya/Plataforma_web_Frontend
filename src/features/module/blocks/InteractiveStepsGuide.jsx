import { useState } from "react";
import Typografia from "./Typografia";
import Image from "./Image";
import { cn } from "@/shared/libs/utils";

function StepModal({ step, onClose }) {
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/20 p-5 backdrop-blur-md md:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/20 px-3 py-1 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
        >
          Cerrar
        </button>

        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Typografia
              variant="overline"
              align="left"
              className="text-white/70"
            >
              Paso {step.number}
            </Typografia>

            <Typografia
              content={step.detail?.title ?? step.label}
              variant={step.detail?.title?.variant ?? "h2"}
              align="left"
              className="text-left"
            />

            <Typografia
              content={step.detail?.text}
              variant={step.detail?.text?.variant ?? "body1"}
              align="left"
              className="py-0 text-left"
            />

            {step.detail?.note && (
              <Typografia
                content={step.detail.note}
                variant={step.detail.note?.variant ?? "body2"}
                align="left"
                className="py-0 text-left"
              />
            )}
          </div>

          <div className="flex items-center justify-center">
            <Image
              src={step.detail?.image?.src}
              alt={step.detail?.image?.alt ?? step.label?.text ?? "Paso"}
              placeholderLabel={
                step.detail?.image?.placeholderLabel ?? "IMAGEN DE REFERENCIA"
              }
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveStepsGuide({
  steps = [],
  className = "",
}) {
  const [activeStepId, setActiveStepId] = useState(null);

  const activeStep =
    steps.find((step) => String(step.id ?? step.number) === String(activeStepId)) ??
    null;

  return (
    <>
      <div
        className={cn(
          "grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-5",
          className,
        )}
      >
        {steps.map((step, index) => (
          <button
            key={step?.id ?? index}
            type="button"
            onClick={() => setActiveStepId(step?.id ?? step?.number ?? index)}
            className="flex min-h-[180px] flex-col justify-center rounded-2xl border border-white/20 px-4 py-5 text-left transition hover:border-white/40 hover:bg-white/5"
          >
            <Typografia
              variant="h2"
              align="center"
              className="pb-2 text-3xl md:text-4xl"
            >
              {step?.number ?? index + 1}
            </Typografia>

            <Typografia
              content={
                step?.label ?? {
                  text: "",
                  variant: "body1",
                }
              }
              variant={step?.label?.variant ?? "body1"}
              align={step?.label?.align ?? "center"}
              className="py-0 text-sm md:text-base"
            />
          </button>
        ))}
      </div>

      <StepModal step={activeStep} onClose={() => setActiveStepId(null)} />
    </>
  );
}
