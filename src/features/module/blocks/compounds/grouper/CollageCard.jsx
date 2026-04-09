import Typography from "../../base/Typography";
import Card from "../container/Card";
import FlipCard from "../Iterative/FlipCard";
import { cn } from "@/shared/libs/utils";
import { useEffect, useMemo, useState } from "react";

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
 * Busca una grilla lo mas cuadrada posible para que el collage se acople mejor.
 * Ejemplos:
 * - 4 items -> 2x2
 * - 9 items -> 3x3
 * - 16 items -> 4x4
 * En cantidades intermedias usamos la raiz para acercarnos a un cuadrado.
 */
function getPreferredColumns(requestedColumns, itemCount) {
  if (!Number.isFinite(itemCount) || itemCount <= 0) return 1;

  const squareColumns = Math.ceil(Math.sqrt(itemCount));
  const normalizedRequested =
    Number.isFinite(requestedColumns) && requestedColumns > 0
      ? requestedColumns
      : 1;

  return Math.max(normalizedRequested, Math.min(4, squareColumns));
}

/**
 * Traduce el numero ideal de columnas a una grilla responsive.
 * En pantallas chicas se compacta, y cuando el ancho lo permite
 * recupera la distribucion cuadrada.
 */
function getResponsiveColsClassName(preferredColumns) {
  if (preferredColumns <= 1) return "grid-cols-1";
  if (preferredColumns === 2) return "grid-cols-1 sm:grid-cols-2";
  if (preferredColumns === 3) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
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
  const preferredColumns = useMemo(
    () => getPreferredColumns(columns, items.length),
    [columns, items.length],
  );

  const colsClassName = useMemo(
    () => getResponsiveColsClassName(preferredColumns),
    [preferredColumns],
  );
  const mediaScaleStyle = useMemo(
    () => ({
      // Cuando el collage tiene varias tarjetas, reducimos la media maxima
      // para que todas entren en desktop sin cortar el hero.
      // En una grilla 2x2 dejamos crecer mas la media porque el collage
      // ya tiene una distribucion cuadrada y puede aprovechar mejor el area.
      "--card-media-max-height":
        preferredColumns === 2
          ? "min(190px, calc(var(--hero-height, 100vh) * 0.22))"
          : preferredColumns >= 3
            ? "min(145px, calc(var(--hero-height, 100vh) * 0.17))"
          : "min(190px, calc(var(--hero-height, 100vh) * 0.24))",
      // Las flip cards del collage usan una altura comun mas compacta.
      // Asi dos filas de tarjetas pueden convivir con titulo e instruccion.
      "--flip-card-height":
        preferredColumns === 2
          ? "min(280px, calc(var(--hero-height, 100vh) * 0.27))"
          : preferredColumns >= 3
            ? "min(210px, calc(var(--hero-height, 100vh) * 0.2))"
          : "min(260px, calc(var(--hero-height, 100vh) * 0.25))",
    }),
    [preferredColumns],
  );
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
      className={cn("grid h-full min-h-0 content-start gap-3 md:gap-4", colsClassName, className)}
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
            <div key={itemId} className="min-w-0">
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
                containerClassName="w-full"
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
