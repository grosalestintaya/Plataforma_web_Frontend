import Card from "../container/Card";
import { getMediaVariant } from "../../base/Media/mediaVariant";

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
  const cardMediaStyle = {
    "--card-media-max-height":
      "min(270px, calc(var(--hero-height, 100vh) * 0.29))",
  };

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden">
      <div
        className={
          isPair
            ? "mx-auto grid h-full min-h-0 w-full max-w-[920px] grid-cols-1 place-items-center gap-4 overflow-hidden p-1 md:grid-cols-2"
            : "grid h-full min-h-0 w-full grid-cols-1 place-items-center gap-4 overflow-hidden p-1 sm:grid-cols-2 lg:grid-cols-3"
        }
        style={cardMediaStyle}
      >
        {items.map((item, index) => (
          <div
            key={item?.id ?? index}
            className="flex h-full min-h-0 min-w-0 w-full max-w-full items-center justify-center overflow-hidden"
          >
            <Card
              density="compact"
              media={getShowCardMedia(item)}
              title={item?.title}
              text={
                item?.text ??
                item?.description ??
                item?.subtitle ??
                item?.label ??
                null
              }
              className="max-w-full"
              contentClassName="gap-0"
              zoomable={zoomable && item?.zoomable !== false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
