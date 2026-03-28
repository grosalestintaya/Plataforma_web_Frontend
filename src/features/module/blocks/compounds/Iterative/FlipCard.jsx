import { useEffect, useMemo, useState } from "react";
import Image from "../../base/Media/Image";
import { cn } from "@/shared/libs/utils";
import Typography from "../../base/Typography";
/**
 * Traduce el tono semantico del reveal a clases visuales.
 */
function getRevealTone(reveal) {
  if (reveal?.tone === "success") return "bg-emerald-500 text-white";
  if (reveal?.tone === "error") return "bg-rose-600 text-white";
  return "bg-white/15 text-white";
}

/**
 * FlipCard:
 * - Modo `revealGrid`: revela todas las tarjetas para completar.
 * - Modo `singleChoice`: permite elegir una opcion correcta.
 */
export default function FlipCard(props) {
  const {
    data,
    heroApi,
    view,
    mode: rawMode = "revealGrid",
    items: rawItems = [],
    locked: rawLocked = false,
    columns: rawColumns = 2,
    countsTowardScore: rawCountsTowardScore,
    compact = false,
    containerClassName = "",
    gridContainerClassName = "",
    onComplete,
  } = props;

  // Lee desde `data` y usa fallback cuando no existe.
  const mode = data?.mode ?? rawMode;
  const items = data?.items ?? rawItems;
  const locked = data?.locked ?? rawLocked;
  const columns = data?.columns ?? rawColumns;
  const countsTowardScore =
    data?.countsTowardScore ?? rawCountsTowardScore ?? mode !== "revealGrid";
  const viewId = view?.id ?? view?.viewId;

  // Estado para reveal grid.
  const [revealedMap, setRevealedMap] = useState({});
  // Estado para seleccion unica.
  const [selectedId, setSelectedId] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const revealedCount = useMemo(
    () => Object.values(revealedMap).filter(Boolean).length,
    [revealedMap],
  );

  /**
   * Reporta completitud al flujo principal y conserva callback externo.
   */
  function emitComplete(result) {
    heroApi?.setInteractiveState?.(viewId, {
      ...result,
      type: "flipCard",
      countsTowardScore,
    });
    onComplete?.(result);
  }

  useEffect(() => {
    if (mode !== "revealGrid") return;
    if (!items.length) return;
    if (revealedCount !== items.length) return;

    emitComplete({
      completed: true,
      total: items.length,
      revealedCount,
      score: countsTowardScore ? 100 : null,
    });
  }, [countsTowardScore, items.length, mode, revealedCount]);

  function revealGridCard(cardId) {
    if (locked) return;

    setRevealedMap((prev) => ({
      ...prev,
      [cardId]: true,
    }));
  }

  function pickSingleChoice(item) {
    if (locked || !item) return;

    setSelectedId(item.id);
    setAttempts((prev) => prev + 1);

    if (!item.correct) return;

    const score = Math.max(50, 100 - attempts * 50);

    emitComplete({
      completed: true,
      selectedId: item.id,
      attempts: attempts + 1,
      score,
    });
  }

  // Ajusta la grilla segun cantidad de columnas pedida por la vista.
  const gridColsClassName =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-2"
        : columns === 4
          ? "grid-cols-2 xl:grid-cols-4"
          : "grid-cols-2 xl:grid-cols-3";
  const mediaSizingStyle = {
    // La media de flip card tambien puede ser afinada por el contenedor padre.
    // Eso permite que collages densos entren sin escalar toda la vista.
    maxHeight:
      "var(--card-media-max-height, min(220px, calc(var(--hero-height, 100vh) * 0.26)))",
  };

  return (
    <section
      className={cn(
        compact ? "w-full text-white" : "mx-auto w-full max-w-5xl px-6 py-8 text-white",
        containerClassName,
      )}
    >
      <div
        className={cn(
          compact
            ? "grid h-full gap-3"
            : "mx-auto grid max-w-[760px] gap-4 rounded-xl border border-white/15 p-4",
          gridColsClassName,
          gridContainerClassName,
        )}
      >
        {items.map((item) => {
          const isRevealed =
            mode === "revealGrid"
              ? Boolean(revealedMap[item.id])
              : selectedId === item.id;

          const reveal = item.reveal ?? {
            text: item.correct ? "Correcto" : "Incorrecto",
            tone: item.correct ? "success" : "error",
          };

          return (
            <button
              key={item.id}
              type="button"
              disabled={locked}
              onClick={() =>
                mode === "singleChoice"
                  ? pickSingleChoice(item)
                  : revealGridCard(item.id)
              }
              className="relative flex min-h-0 flex-col overflow-hidden rounded-sm border border-white/20 bg-white/5 text-left disabled:opacity-70"
            >
              {isRevealed ? (
                <div
                  className={cn(
                    "flex min-h-[140px] items-center justify-center px-4 py-6 text-center text-base font-bold md:text-lg",
                    getRevealTone(reveal),
                  )}
                  style={mediaSizingStyle}
                >
                  {reveal.text}
                </div>
              ) : (
                <div className="flex min-h-0 flex-col">
                  <div
                    className="flex w-full items-center justify-center"
                    style={mediaSizingStyle}
                  >
                    <Image
                      src={item.image?.src ?? item.src}
                      alt={item.image?.alt ?? item.alt ?? item.label?.text ?? item.caption ?? "Carta"}
                      className="h-full w-full"
                      imgClassName="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {(item.label || item.caption) ? (
                    <Typography
                      content={
                        item.label ?? {
                          text: item.caption,
                          variant: "subtitle2",
                          align: "center",
                        }
                      }
                      className="px-2 py-2"
                    />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
