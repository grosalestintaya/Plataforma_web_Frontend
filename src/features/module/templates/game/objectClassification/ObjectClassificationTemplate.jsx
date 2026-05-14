import Typography from "@/features/module/blocks/base/Typography";
import Image from "@/features/module/blocks/base/Media/Image";
import DragDropClassification from "@/features/module/blocks/compounds/Iterative/DragDropClassification";
import { cn } from "@/shared/libs/utils";
import { getObjectClassificationRuntime } from "./objectClassification.config";

export default function ObjectClassificationTemplate({ view, heroApi, data }) {
  const { config, title, assessment, media } = getObjectClassificationRuntime({
    view,
    data,
  });

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-4 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(5,29,56,0.14))] p-3 text-white shadow-[0_24px_60px_rgba(7,24,52,0.18)] backdrop-blur-[2px] sm:gap-2 sm:pb-0">
      <div className="shrink-0">
        {media?.src ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,21rem)]">
            <div className="flex flex-col ">
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

            <div className="flex min-h-[14rem] items-center justify-center overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_34px_rgba(7,24,52,0.12)]">
              <Image
                src={media.src}
                alt={media.alt ?? "Situacion"}
                variant={media.variant ?? "horizontal"}
                className="h-full w-full"
                imgClassName="block h-full w-full object-contain"
                zoomable
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
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
              <div
                className={cn(
                  "rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
                  title?.text ? "py-4" : "py-5",
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
