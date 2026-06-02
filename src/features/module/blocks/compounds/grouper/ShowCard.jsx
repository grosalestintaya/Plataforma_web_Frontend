import Card from "../container/Card";
import { getCardItemId } from "../iteractive/cardIteraction/cardInteractionRegistry";
import { cn } from "@/shared/libs/utils";

function getItemText(item) {
  return item?.text ?? item?.description ?? item?.subtitle ?? item?.label ?? null;
}

function getItemZoomable(item) {
  if (item?.zoomable === false) return false;
  if (item?.media?.zoomable === false) return false;

  return undefined;
}

export default function ShowCard({
  items = [],
  selectedIds = [],
  onSelect,
  onComplete,
}) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section
      className={cn(
        "grid w-full min-w-0 place-items-center p-1",
        "overflow-visible",
        "lg:h-full lg:min-h-0 lg:overflow-hidden",
      )}
    >
      <div
        className={cn(
          "grid w-full min-w-0 max-w-[67rem]",
          "grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]",
          "auto-rows-[minmax(11rem,auto)]",
          "items-center justify-items-center content-center gap-3",
          "overflow-visible",
          "lg:h-full lg:min-h-0 lg:auto-rows-fr lg:overflow-hidden",
        )}
      >
        {items.map((item, index) => {
          const itemId = getCardItemId(item, index);
          const isSelected = selectedIds.includes(itemId);

          return (
            <div
              key={itemId}
              className={cn(
                "flex w-full min-w-0 items-center justify-center overflow-visible p-1",
                "min-h-[11rem]",
                "lg:h-full lg:min-h-0 lg:overflow-hidden",
              )}
            >
              <Card
                title={item?.title}
                text={getItemText(item)}
                media={item?.media}
                interaction={item?.interaction}
                selected={isSelected}
                zoomable={getItemZoomable(item)}
                variant={item?.cardVariant ?? item?.variant}
                size={item?.size}
                onSelect={() => onSelect?.(item, index)}
                onComplete={() => onComplete?.(itemId, item, index)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
