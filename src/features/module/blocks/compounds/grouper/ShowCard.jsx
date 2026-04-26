import Card from "../container/Card";
import { getMediaVariant } from "../../base/Media/mediaVariant";
import { cn } from "@/shared/libs/utils";

function getShowCardMedia(item) {
  const media = item?.media ?? item?.image ?? {};
  const src = media?.src ?? item?.src;

  if (!src) return null;

  return {
    ...media,
    src,
    alt: media?.alt ?? item?.alt ?? item?.caption,
    variant: getMediaVariant(media) ?? getMediaVariant(item),
  };
}

/**
 * ShowCard:
 * - El slot distribuye.
 * - Card define el ancho desde su imagen.
 */
export default function ShowCard({ items = [], zoomable = true }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const isPair = items.length === 2;
  const isFourUp = items.length === 4;

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden">
      <div
        className={
          isPair
            ? "mx-auto grid h-full min-h-0 w-full max-w-[920px] grid-cols-1 place-items-center gap-4 overflow-hidden p-1 md:auto-rows-fr md:grid-cols-2"
            : isFourUp
              ? "grid h-full min-h-0 w-full grid-cols-1 place-items-center gap-4 overflow-hidden p-1 sm:grid-cols-2 md:auto-rows-fr lg:grid-cols-4"
              : "grid h-full min-h-0 w-full grid-cols-1 place-items-center gap-4 overflow-hidden p-1 sm:grid-cols-2 md:auto-rows-fr lg:grid-cols-3"
        }
      >
        {items.map((item, index) => (
          <div
            key={item?.id ?? index}
            className="module-card-grid-slot w-full"
          >
            <Card
              density="compact"
              media={getShowCardMedia(item)}
              title={item?.title ?? null}
              text={
                item?.text ??
                item?.description ??
                item?.subtitle ??
                item?.label ??
                null
              }
              className={cn("max-w-full", item?.cardClassName)}
              mediaClassName={item?.mediaClassName}
              contentClassName={cn("gap-0", item?.contentClassName)}
              titleRowClassName={item?.titleRowClassName}
              autoContentLayout
              zoomable={zoomable && item?.zoomable !== false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
