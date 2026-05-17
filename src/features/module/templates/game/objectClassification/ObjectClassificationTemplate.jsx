import Typography from "@/features/module/blocks/base/Typography";
import Card from "@/features/module/blocks/compounds/container/Card";
import DragDropClassification from "@/features/module/blocks/compounds/Iterative/DragDropClassification";
import { cn } from "@/shared/libs/utils";
import { getObjectClassificationRuntime } from "./objectClassification.config";

export default function ObjectClassificationTemplate({ view, heroApi, data }) {
  const { config, title, assessment, media } = getObjectClassificationRuntime({
    view,
    data,
  });

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-3 overflow-y-auto rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(5,29,56,0.14))] p-2 text-white shadow-[0_24px_60px_rgba(7,24,52,0.18)] backdrop-blur-[2px] sm:gap-2 lg:overflow-hidden">
      <div className="shrink-0">
        {media?.src ? (
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,16rem)] lg:items-start">
            <div className="flex min-w-0 flex-col gap-2">
              {title ? (
                <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                  <Typography
                    content={{
                      ...title,
                      variant: title?.variant ?? "eyebrow",
                    }}
                  />
                </div>
              ) : null}

              {assessment ? (
                <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  <Typography
                    content={{
                      ...assessment,
                      variant: assessment?.variant ?? "h3",
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div className="flex min-w-0 items-start justify-center lg:justify-end">
              <div className="h-[7.5rem] w-full max-w-[15rem] sm:h-[8.5rem] lg:h-[8rem]">
                <Card
                  media={{
                    ...media,
                    variant: media.variant ?? "horizontal",
                    mode: media.mode ?? "contain",
                  }}
                  variant="ghost"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {title ? (
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <Typography
                  content={{
                    ...title,
                    variant: title?.variant ?? "eyebrow",
                  }}
                />
              </div>
            ) : null}

            {assessment ? (
              <div
                className={cn(
                  "rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
                  title?.text ? "py-2" : "py-3",
                )}
              >
                <Typography
                  content={{
                    ...assessment,
                    variant: assessment?.variant ?? "body1",
                  }}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
      <DragDropClassification config={config} view={view} heroApi={heroApi} />
    </section>
  );
}
