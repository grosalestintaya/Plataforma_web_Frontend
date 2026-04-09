import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";

/**
 * WhatWouldYouDoTemplate:
 * - Base temporal para escenarios de decision.
 */
export default function WhatWouldYouDoTemplate({ view, heroApi, data }) {
  const options = data?.options ?? [];
  const viewId = view?.id ?? view?.viewId;

  return (
    <section className="mx-auto flex h-full w-full max-w-4xl items-center px-6 py-6 text-white">
      <div className="w-full rounded-2xl  p-6">
        <Typography content={data?.title ?? { text: "WhatWouldYouDo", variant: "h3" }} />
        <Typography
          content={
            data?.text ?? {
              text: "Template base para situaciones de decision.",
              variant: "bodySm",
            }
          }
          className="mt-3"
        />

        <div className="mt-4 space-y-2">
          {options.map((option, index) => (
            <div key={option?.id ?? index} className="rounded-xl border border-white/20 bg-black/10 px-3 py-2">
              {option?.label ?? option?.text ?? `Opcion ${index + 1}`}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Button
            variant="primary"
            onClick={() =>
              heroApi?.setInteractiveState?.(viewId, {
                completed: true,
                type: "whatWouldYouDo",
                score: 100,
              })
            }
          >
            Confirmar decision
          </Button>
        </div>
      </div>
    </section>
  );
}
