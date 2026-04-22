import Card from "../container/Card";
import { getMediaVariant } from "../../base/Media/Image";

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
export default function ShowCard({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const isPair = items.length === 2;

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-visible">
      <div
        className={
          isPair
            ? "mx-auto grid w-full max-w-[920px] grid-cols-1 place-items-center gap-4 overflow-visible p-1 md:grid-cols-2"
            : "grid w-full grid-cols-1 place-items-center gap-4 overflow-visible p-1 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((item, index) => (
          <div
            key={item?.id ?? index}
            className="flex min-h-0 min-w-0 w-fit max-w-full items-start justify-center overflow-visible"
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
              contentClassName="gap-0.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
