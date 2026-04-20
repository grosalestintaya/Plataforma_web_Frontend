import Typography from "../../base/Typography";
import Card from "../container/Card";
import FlipCard from "../Iterative/FlipCard";
import { cn } from "@/shared/libs/utils";
import { useEffect, useState } from "react";

const GRID_COLUMNS_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const GRID_ROWS_CLASS = {
  1: "grid-rows-1",
  2: "grid-rows-2",
  3: "grid-rows-3",
  4: "grid-rows-4",
};

/**
 * Detecta si un item del collage debe comportarse como flip card.
 */
function isFlipItem(item) {
  return (
    item?.component === "flipCard" ||
    item?.type === "flipCard" ||
    item?.renderAs === "flipCard"
  );
}

/**
 * Obtiene un identificador estable para cada tarjeta del collage.
 */
function getItemId(item, index) {
  return item?.id ?? `collage-item-${index + 1}`;
}

function clampGridAxisSize(value) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(4, Math.round(value)));
}

function getGridLayout(requestedColumns, requestedRows, itemCount) {
  if (!Number.isFinite(itemCount) || itemCount <= 0) {
    return {
      columns: 1,
      rows: 1,
    };
  }

  const columns =
    Number.isFinite(requestedColumns) && requestedColumns > 0
      ? clampGridAxisSize(requestedColumns)
      : clampGridAxisSize(Math.sqrt(itemCount));
  const rows =
    Number.isFinite(requestedRows) && requestedRows > 0
      ? clampGridAxisSize(requestedRows)
      : columns;

  return { columns, rows };
}

/**
 * En Collage, FlipCard y ChooseOne las imagenes siempre son horizontales.
 */
function getItemMedia(item, fallbackAlt = "Tarjeta") {
  const media = item?.media ?? item?.image ?? {};

  return {
    ...media,
    src: media?.src ?? item?.src,
    alt: media?.alt ?? item?.alt ?? item?.caption ?? fallbackAlt,
    variant: "horizontal",
  };
}

/**
 * CollageCard:
 * - Organiza tarjetas en grillas de hasta 4 columnas y 4 filas.
 * - Si `rows` no se declara, mantiene la grilla cuadrada anterior.
 * - Solo compone. El tamano visual lo resuelven FlipCard/Card/Image.
 */
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
  if (!Array.isArray(items) || items.length === 0) return null;
  const [revealedIds, setRevealedIds] = useState([]);
  const gridLayout = getGridLayout(columns, rows, items.length);
  const gridColumnsClassName =
    GRID_COLUMNS_CLASS[gridLayout.columns] ?? GRID_COLUMNS_CLASS[1];
  const gridRowsClassName = GRID_ROWS_CLASS[gridLayout.rows] ?? GRID_ROWS_CLASS[1];
  const interactiveViewId = view?.id ?? view?.viewId;

  /**
   * Sincroniza el progreso del collage con el runtime principal.
   * Este efecto corre despues del render para evitar setState cruzado.
   */
  useEffect(() => {
    if (!interactiveViewId || !Array.isArray(items) || items.length === 0) return;

    heroApi?.setInteractiveState?.(interactiveViewId, {
      completed: revealedIds.length === items.length,
      type: "collageCard",
      revealedIds,
      revealedCount: revealedIds.length,
      total: items.length,
      countsTowardScore: false,
      score: revealedIds.length === items.length ? 100 : 0,
    });
  }, [heroApi, interactiveViewId, items, revealedIds]);

  /**
   * Registra las flip cards ya abiertas sin disparar efectos en pleno render.
   */
  function handleFlipComplete(itemId) {
    if (!itemId) return;

    setRevealedIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={style}
    >
      <div
        className={cn(
          "grid h-fit max-h-full w-fit max-w-full place-items-center content-center justify-center gap-4 overflow-hidden",
          gridColumnsClassName,
          gridRowsClassName,
        )}
      >
        {items.map((item, index) => {
          const itemId = getItemId(item, index);
          const isSelected = selectedIds.includes(itemId);
          const media = getItemMedia(item, item?.caption ?? "Tarjeta");

          if (isFlipItem(item)) {
            return (
              <FlipCard
                key={itemId}
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
                containerClassName="h-full w-fit max-w-full"
                gridContainerClassName="grid-cols-1"
                onComplete={() => handleFlipComplete(itemId)}
              />
            );
          }

          return (
            <Card
              key={itemId}
              as={selectable ? "button" : "article"}
              onClick={selectable ? () => onSelect?.(item, index) : undefined}
              fitToMedia
              selected={selectable && isSelected}
              className={cn(
                "max-h-full",
                selectable && isSelected
                  ? "border-emerald-200/90 bg-emerald-500/15 shadow-[0_0_26px_rgba(52,211,153,0.32)] ring-4 ring-inset ring-emerald-300/80"
                  : "",
              )}
              media={media}
              title={item?.title ?? item?.label}
              text={item?.text}
              footer={
                item?.footer ? (
                  <Typography content={item.footer} variant="label" align="center" />
                ) : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}
