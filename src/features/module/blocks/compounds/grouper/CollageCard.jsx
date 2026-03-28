import Typography from "../../base/Typography";
import Card from "../container/Card";
import FlipCard from "../Iterative/FlipCard";
import { cn } from "@/shared/libs/utils";
import { useMemo, useState } from "react";

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

/**
 * CollageCard:
 * - Organiza multiples tarjetas en una grilla.
 * - Cada item puede mostrarse como Card simple o como FlipCard dentro del collage.
 */
export default function CollageCard({
  items = [],
  selectable = false,
  selectedIds = [],
  onSelect,
  columns = 2,
  heroApi,
  view,
  className = "",
  style = undefined,
}) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const [revealedIds, setRevealedIds] = useState([]);

  const colsClassName =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-2 xl:grid-cols-3";
  const mediaScaleStyle = useMemo(
    () => ({
      // Cuando el collage tiene varias tarjetas, reducimos la media maxima
      // para que todas entren en desktop sin cortar el hero.
      "--card-media-max-height":
        columns >= 2
          ? "min(150px, calc(var(--hero-height, 100vh) * 0.18))"
          : "min(190px, calc(var(--hero-height, 100vh) * 0.24))",
    }),
    [columns],
  );

  /**
   * Registra las flip cards ya reveladas y completa la vista cuando todas abrieron.
   */
  function handleFlipComplete(itemId) {
    if (!itemId) return;

    setRevealedIds((prev) => {
      if (prev.includes(itemId)) return prev;

      const next = [...prev, itemId];
      const interactiveViewId = view?.id ?? view?.viewId;

      heroApi?.setInteractiveState?.(interactiveViewId, {
        completed: next.length === items.length,
        type: "collageCard",
        revealedIds: next,
        revealedCount: next.length,
        total: items.length,
        countsTowardScore: false,
        score: next.length === items.length ? 100 : 0,
      });

      return next;
    });
  }

  return (
    <div
      className={cn("grid gap-3 md:gap-4", colsClassName, className)}
      style={{
        ...mediaScaleStyle,
        ...style,
      }}
    >
      {items.map((item, index) => {
        const itemId = getItemId(item, index);
        const isSelected = selectedIds.includes(itemId);

        if (isFlipItem(item)) {
          return (
            <div key={itemId} className="h-full">
              <FlipCard
                compact
                data={{
                  mode: item?.mode ?? "revealGrid",
                  columns: 1,
                  countsTowardScore: false,
                  items: [
                    {
                      id: itemId,
                      src: item?.src ?? item?.image?.src ?? item?.media?.src,
                      alt: item?.alt ?? item?.image?.alt ?? item?.media?.alt,
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
                // El collage ya es la grilla.
                // No envolvemos el FlipCard con otra card para no duplicar espacio.
                containerClassName="h-full"
                gridContainerClassName="grid-cols-1"
                onComplete={() => handleFlipComplete(itemId)}
              />
            </div>
          );
        }

        return (
          <Card
            key={itemId}
            as={selectable ? "button" : "article"}
            onClick={selectable ? () => onSelect?.(item, index) : undefined}
            className={cn(
              "h-full",
              selectable && isSelected ? "border-emerald-300/50 bg-emerald-500/10" : "",
            )}
            media={item?.media ?? item?.image ?? { src: item?.src, alt: item?.alt }}
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
  );
}
