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
    alt: media?.alt ?? item?.alt ?? item?.caption ?? item?.title ?? "Imagen",
    variant: getMediaVariant(media) ?? getMediaVariant(item),
  };
}

function getShowCardText(item) {
  return (
    item?.text ??
    item?.description ??
    item?.subtitle ??
    item?.label ??
    null
  );
}

/**
 * ShowCard:
 * - Renderiza 2 o más Cards.
 * - Las distribuye de izquierda a derecha.
 * - Cada Card conserva su tamaño visual.
 * - Si hay poco alto, reduce el ancho para que la Card completa entre.
 */
export default function ShowCard({
  items = [],
  zoomable = true,
  className = "",
  gridClassName = "",
  cardClassName = "",
  cardWrapperClassName = "",
}) {
  if (!Array.isArray(items) || items.length < 2) return null;

  return (
    <section
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden",
        "[container-type:size]",
        className,
      )}
    >
      <div
        className={cn(
          "grid h-full min-h-0 w-full min-w-0 overflow-hidden p-1",

          /**
           * Distribución izquierda a derecha.
           */
          "grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))]",

          /**
           * Centra cada Card dentro de su celda.
           */
          "auto-rows-fr place-items-center gap-3 sm:gap-4",

          gridClassName,
        )}
      >
        {items.map((item, index) => (
          <div
            key={item?.id ?? index}
            className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden"
          >
            <div
              className={cn(
                /**
                 * Wrapper visual de la Card.
                 *
                 * Esta es la parte importante:
                 * antes reservábamos poco alto para título/texto.
                 * Ahora restamos más espacio: 7rem.
                 *
                 * Eso hace que la Card se haga un poco más pequeña
                 * y entre completa dentro del slot.
                 */
                "w-[min(100%,clamp(9rem,28cqw,26rem),calc((100cqh-7rem)*1.5))]",

                "max-h-full",

                cardWrapperClassName,
                item?.cardWrapperClassName,
              )}
            >
              <Card
                media={getShowCardMedia(item)}
                title={item?.title ?? null}
                text={getShowCardText(item)}
                zoomable={zoomable && item?.zoomable !== false}
                className={cn(
                  "h-fit w-full max-h-full max-w-full",
                  cardClassName,
                  item?.cardClassName,
                )}
                mediaClassName={item?.mediaClassName}
                contentClassName={item?.contentClassName}
                titleClassName={item?.titleClassName}
                textClassName={item?.textClassName}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 