import Card from "../container/Card";
import { getCardItemId } from "../iteractive/cardIteraction/cardInteractionRegistry";
import { cn } from "@/shared/libs/utils";

function getItemText(item) {
  return (
    item?.text ?? item?.description ?? item?.subtitle ?? item?.label ?? null
  );
}

function getItemZoomable(item) {
  if (item?.zoomable === false) return false;
  if (item?.media?.zoomable === false) return false;

  return undefined;
}

function getGridColumnsClass(columns) {
  if (columns <= 1) return "grid-cols-1";
  if (columns == 2) return "grid-cols-2";
  if (columns == 3) return "grid-cols-2 sm:grid-cols-3";
  if (columns == 4) return "grid-cols-2 sm:grid-cols-4";
  if (columns <= 6) return "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6";
  if (columns <= 8) return "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8";

  return "grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))]";
}

function getGridRowsClass(rows) {
  if (rows === 1) return "grid-rows-1";
  if (rows === 2) return "grid-rows-2";
  if (rows === 3) return "grid-rows-3";
  if (rows === 4) return "grid-rows-4";
  if (rows === 5) return "grid-rows-5";
  if (rows === 6) return "grid-rows-6";

  return null;
}

export default function CollageCard({
  items = [],
  columns,
  rows,
  selectedIds = [],
  onSelect,
  onComplete,
  slotCount,
  renderEmptySlot,
  className,
  gridClassName,
  slotClassName,
  emptySlotClassName,
}) {
  if (!Array.isArray(items) || items.length === 0) {
    if (!slotCount || slotCount <= 0) return null;
  }

  const resolvedColumns = columns ?? Math.min(Math.max(items.length, 1), 4);
  const resolvedSlotCount = Math.max(
    slotCount ?? items.length,
    items.length,
    1,
  );
  const slots = Array.from(
    { length: resolvedSlotCount },
    (_, index) => items[index] ?? null,
  );

  return (
    <section
      className={cn(
        "grid w-full min-w-0 place-items-center p-1",
        "overflow-visible",
        "lg:h-full lg:min-h-0 lg:overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "grid w-full min-w-0",
          getGridColumnsClass(resolvedColumns),
          rows ? getGridRowsClass(rows) : null,
          "items-center justify-items-center content-center gap-3",
          "overflow-visible",
          "auto-rows-[minmax(10rem,auto)]",
          rows ? "lg:auto-rows-fr" : "lg:auto-rows-fr",
          "lg:h-full lg:min-h-0 lg:overflow-hidden",
          gridClassName,
        )}
      >
        {slots.map((item, index) => {
          if (!item) {
            return (
              <div
                key={`empty-slot-${index}`}
                className={cn(
                  "flex h-full min-h-[10rem] w-full min-w-0 items-center justify-center p-2",
                  "lg:min-h-0",
                  slotClassName,
                )}
              >
                {renderEmptySlot ? (
                  renderEmptySlot(index)
                ) : (
                  <div
                    className={cn(
                      "h-full min-h-[10rem] w-full rounded-[1.6rem] border border-dashed border-white/15 bg-white/5",
                      "lg:min-h-0",
                      emptySlotClassName,
                    )}
                  />
                )}
              </div>
            );
          }

          const itemId = getCardItemId(item, index);
          const isSelected = selectedIds.includes(itemId);

          return (
            <div
              key={itemId}
              className={cn(
                "flex w-full min-w-0 items-center justify-center overflow-visible p-2",
                "min-h-[10rem]",
                "lg:h-full lg:min-h-0 lg:overflow-hidden",
                slotClassName,
              )}
            >
              <div className="group/collage relative h-full w-full min-w-0">
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

                {item?.hoverLabel ? (
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 translate-y-3 opacity-0 transition duration-200 group-hover/collage:translate-y-0 group-hover/collage:opacity-100 group-focus-within/collage:translate-y-0 group-focus-within/collage:opacity-100">
                    <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(25,18,11,0.82),rgba(12,9,6,0.64))] px-3 py-2 text-center text-sm font-bold text-white shadow-[0_14px_28px_rgba(0,0,0,0.24)] backdrop-blur-sm">
                      {item.hoverLabel}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
