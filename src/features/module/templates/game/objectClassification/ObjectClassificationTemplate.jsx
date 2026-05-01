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
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 overflow-hidden px-2 py-2 text-white md:px-3 md:py-2.5">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1.5 md:p-2">
        <div className="shrink-0">
          {media?.src ? (
            <div className="grid gap-1.5 lg:grid-cols-[1fr_236px]">
              <div className="flex flex-col gap-1.5">
                {title ? (
                  <div className="rounded-none border border-black/55 bg-transparent px-3 py-1">
                    <Typography
                      content={{
                        ...title,
                        variant: title?.variant ?? "eyebrow",
                      }}
                    />
                  </div>
                ) : null}

                {assessment ? (
                  <div className="rounded-none border border-black/55 bg-transparent px-3 py-1">
                    <Typography
                      content={{
                        ...assessment,
                        variant: assessment?.variant ?? "bodySm",
                      }}
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex min-h-[132px] items-center justify-center overflow-hidden rounded-none border border-black/55 bg-transparent p-1">
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
            <>
              {title ? (
                <div className="rounded-none border border-black/55 bg-transparent px-3 py-1">
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
                    "mt-1.5 rounded-none border border-black/55 bg-transparent px-3",
                    title?.text ? "py-1.5" : "py-2",
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
            </>
          )}
        </div>

        <div className="mt-1.5 flex min-h-0 flex-1 flex-col overflow-hidden border border-black/55 bg-transparent p-1">
          <DragDropClassification config={config} view={view} heroApi={heroApi} />
        </div>
      </div>
    </section>
  );
}
