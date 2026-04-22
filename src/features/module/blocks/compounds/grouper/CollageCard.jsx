import { useEffect, useState } from "react";
import Typography from "../../base/Typography";
import { getMediaVariant } from "../../base/Media/Image";
import Card from "../container/Card";
import FlipCard from "../Iterative/FlipCard";
import { cn } from "@/shared/libs/utils";

const GRID_COLUMNS_CLASS = {
  1: "grid-cols-[auto]",
  2: "grid-cols-[auto_auto]",
  3: "grid-cols-[auto_auto_auto]",
  4: "grid-cols-[auto_auto_auto_auto]",
};

const GRID_ROWS_CLASS = {
  1: "grid-rows-[auto]",
  2: "grid-rows-[auto_auto]",
  3: "grid-rows-[auto_auto_auto]",
  4: "grid-rows-[auto_auto_auto_auto]",
};

const COLLAGE_ROOT_CLASS =
  "flex h-full min-h-0 w-full items-center justify-center overflow-visible";

const COLLAGE_GRID_CLASS =
  "grid h-fit min-h-0 w-fit max-w-full place-items-center content-center justify-center gap-3 overflow-visible";

const COLLAGE_ITEM_SLOT_CLASS =
  "flex min-h-0 min-w-0 w-fit max-w-full items-start justify-center overflow-visible";

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

function clampGridAxisSize(value) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(4, Math.round(value)));
}

function getGridLayout(requestedColumns, requestedRows, itemCount) {
  if (!Number.isFinite(itemCount) || itemCount <= 0) {
    return { columns: 1, rows: 1 };
  }

  const resolvedColumns =
    Number.isFinite(requestedColumns) && requestedColumns > 0
      ? clampGridAxisSize(requestedColumns)
      : clampGridAxisSize(Math.sqrt(itemCount));

  const resolvedRows =
    Number.isFinite(requestedRows) && requestedRows > 0
      ? clampGridAxisSize(requestedRows)
      : clampGridAxisSize(Math.ceil(itemCount / resolvedColumns));

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
  const gridColumnsClassName =
    GRID_COLUMNS_CLASS[gridLayout.columns] ?? GRID_COLUMNS_CLASS[1];
  const gridRowsClassName =
    GRID_ROWS_CLASS[gridLayout.rows] ?? GRID_ROWS_CLASS[1];
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
        className={cn(
          COLLAGE_GRID_CLASS,
          gridColumnsClassName,
          gridRowsClassName,
        )}
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
                        reveal:
                          item?.reveal ??
                          item?.back ?? {
                            text: "Sin contenido",
                            variant: "bodySm",
                            align: "center",
                          },
                      },
                    ],
                  }}
                  selectedId={isSelected ? itemId : null}
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
                onClick={selectable ? () => onSelect?.(item, index) : undefined}
                selected={selectable && isSelected}
                className={cn(
                  "max-w-full",
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
                contentClassName="gap-0.5"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
