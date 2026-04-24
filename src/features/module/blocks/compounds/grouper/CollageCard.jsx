import { useEffect, useState } from "react";
import Typography from "../../base/Typography";
import { getMediaVariant } from "../../base/Media/mediaVariant";
import Card from "../container/Card";
import FlipCard from "../Iterative/FlipCard";
import { cn } from "@/shared/libs/utils";

const COLLAGE_ROOT_CLASS =
  "flex h-full min-h-0 w-full items-center justify-center overflow-hidden";

const COLLAGE_GRID_CLASS =
  "grid h-full min-h-0 w-full max-w-full place-items-center content-center justify-center gap-3 overflow-hidden";

const COLLAGE_ITEM_SLOT_CLASS = "module-card-grid-slot";

const SELECTED_CARD_CLASS =
  "border-emerald-200/90 bg-emerald-500/15 shadow-[0_0_26px_rgba(52,211,153,0.32)] ring-4 ring-inset ring-emerald-300/80";

function isFlipItem(item) {
  return (
    item?.component === "flipCard" ||
    item?.type === "flipCard" ||
    item?.renderAs === "flipCard"
  );
}

function getItemId(item, index) {
  return item?.id ?? `collage-item-${index + 1}`;
}

function getGridAxisSize(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  return Math.max(1, Math.min(6, Math.round(numericValue)));
}

function getGridLayout(requestedColumns, requestedRows, itemCount) {
  if (!Number.isFinite(itemCount) || itemCount <= 0) {
    return { columns: 1, rows: 1 };
  }

  const explicitColumns = getGridAxisSize(requestedColumns);
  const resolvedColumns =
    explicitColumns ?? getGridAxisSize(Math.sqrt(itemCount));

  const explicitRows = getGridAxisSize(requestedRows);
  const resolvedRows =
    explicitRows ?? getGridAxisSize(Math.ceil(itemCount / resolvedColumns));

  return { columns: resolvedColumns, rows: resolvedRows };
}

function getItemMedia(item, fallbackAlt = "Tarjeta") {
  const media = item?.media ?? item?.image ?? {};
  const src = media?.src ?? item?.src;

  if (!src) return null;

  return {
    ...media,
    src,
    alt: media?.alt ?? item?.alt ?? item?.caption ?? fallbackAlt,
    variant: getMediaVariant(media) ?? getMediaVariant(item) ?? "horizontal",
  };
}

export default function CollageCard({
  items = [],
  selectable = false,
  selectedIds = [],
  onSelect,
  columns = 2,
  rows,
  heroApi,
  view,
  className = "",
  style = undefined,
}) {
  const [revealedIds, setRevealedIds] = useState([]);
  const hasItems = Array.isArray(items) && items.length > 0;
  const gridLayout = getGridLayout(columns, rows, hasItems ? items.length : 0);
  const interactiveViewId = view?.id ?? view?.viewId;

  useEffect(() => {
    if (!interactiveViewId || !hasItems) {
      return;
    }

    heroApi?.setInteractiveState?.(interactiveViewId, {
      completed: revealedIds.length === items.length,
      type: "collageCard",
      revealedIds,
      revealedCount: revealedIds.length,
      total: items.length,
      countsTowardScore: false,
      score: revealedIds.length === items.length ? 100 : 0,
    });
  }, [hasItems, heroApi, interactiveViewId, items, revealedIds]);

  if (!hasItems) return null;

  function handleFlipComplete(itemId) {
    if (!itemId) return;
    setRevealedIds((prev) =>
      prev.includes(itemId) ? prev : [...prev, itemId],
    );
  }

  return (
    <div className={cn(COLLAGE_ROOT_CLASS, className)} style={style}>
      <div
        className={COLLAGE_GRID_CLASS}
        style={{
          gridTemplateColumns: `repeat(${gridLayout.columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridLayout.rows}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item, index) => {
          const isFlip = isFlipItem(item);
          const itemId = getItemId(item, index);
          const isSelected = selectedIds.includes(itemId);
          const media = getItemMedia(item, item?.caption ?? "Tarjeta");

          if (isFlip) {
            return (
              <div key={itemId} className={COLLAGE_ITEM_SLOT_CLASS}>
                <FlipCard
                  compact
                  fillContainer
                  data={{
                    mode: item?.mode ?? "revealGrid",
                    columns: 1,
                    countsTowardScore: false,
                    items: [
                      {
                        id: itemId,
                        image: media,
                        label: item?.title ?? item?.label,
                        caption: item?.caption,
                        correct: item?.correct,
                        reveal: item?.reveal ??
                          item?.back ?? {
                            text: "Sin contenido",
                            variant: "bodySm",
                            align: "center",
                          },
                      },
                    ],
                  }}
                  selectedId={isSelected ? itemId : null}
                  containerClassName="max-w-full"
                  gridContainerClassName="grid-cols-1"
                  onComplete={() => handleFlipComplete(itemId)}
                />
              </div>
            );
          }

          return (
            <div key={itemId} className={COLLAGE_ITEM_SLOT_CLASS}>
              <Card
                as={selectable ? "button" : "article"}
                density="compact"
                fillContainer
                onClick={selectable ? () => onSelect?.(item, index) : undefined}
                selected={selectable && isSelected}
                className={cn(
                  "max-h-full max-w-full",
                  selectable && isSelected ? SELECTED_CARD_CLASS : "",
                )}
                media={media}
                title={item?.title ?? item?.label}
                text={item?.text}
                footer={
                  item?.footer ? (
                    <Typography
                      content={item.footer}
                      variant="label"
                      align="center"
                    />
                  ) : null
                }
                contentClassName="gap-0"
                zoomable={!selectable && item?.zoomable !== false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
