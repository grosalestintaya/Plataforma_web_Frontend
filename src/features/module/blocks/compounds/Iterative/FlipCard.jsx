import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Typography from "../../base/Typography";
import Card from "../container/Card";
/**
 * Traduce el tono semantico del reveal a clases visuales.
 */
function getRevealTone(reveal) {
  if (reveal?.tone === "income") {
    return "border border-emerald-200/35 bg-emerald-600 text-white";
  }
  if (reveal?.tone === "expense") {
    return "border border-rose-200/35 bg-rose-600 text-white";
  }
  if (reveal?.tone === "success") {
    return "border border-emerald-200/35 bg-emerald-600 text-white";
  }
  if (reveal?.tone === "error") {
    return "border border-rose-200/35 bg-rose-600 text-white";
  }
  return "border border-white/15 bg-white/15 text-white";
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
    allowFlipBack = true,
    reportToHeroApi = true,
    onItemClick,
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

  // Guarda las tarjetas que ya fueron reveladas al menos una vez.
  const [revealedMap, setRevealedMap] = useState({});
  // Guarda la cara visible actual para permitir girar ida y vuelta.
  const [flippedMap, setFlippedMap] = useState({});
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
    if (reportToHeroApi) {
      heroApi?.setInteractiveState?.(viewId, {
        ...result,
        type: "flipCard",
        countsTowardScore,
      });
    }
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

    setFlippedMap((prev) => ({
      ...prev,
      [cardId]: allowFlipBack ? !prev[cardId] : true,
    }));

    setRevealedMap((prev) => ({
      ...prev,
      [cardId]: true,
    }));
  }

  function pickSingleChoice(item) {
    if (locked || !item) return;

    const isCurrentlyFlipped = Boolean(flippedMap[item.id]);
    const nextFlipped = allowFlipBack ? !isCurrentlyFlipped : true;

    setFlippedMap((prev) => ({
      ...prev,
      [item.id]: nextFlipped,
    }));

    // Solo evaluamos cuando el usuario abre la respuesta.
    if (isCurrentlyFlipped) return;

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
    // La tarjeta usa una altura comun para que frente y reverso coincidan.
    // El valor por defecto es mas contenido para que varias flip cards entren
    // dentro del hero sin empujar el footer.
    height:
      "var(--flip-card-height, min(230px, calc(var(--hero-height, 100vh) * 0.22)))",
  };

  /**
   * FlipCard usa Card como base visual del frente.
   * Asi CollageCard solo reune FlipCards y cada FlipCard sigue el mismo
   * lenguaje visual del resto del sistema.
   */
  function getFrontCardProps(item) {
    return {
      media: item.image ?? { src: item.src, alt: item.alt ?? item.caption ?? "Carta" },
      title:
        item.label ??
        (item.caption
          ? {
              text: item.caption,
              variant: "subtitle2",
              align: "center",
            }
          : null),
    };
  }

  /**
   * El reverso tambien reutiliza Card para mantener el mismo marco y proporciones.
   */
  function renderBackCard(reveal) {
    const revealContent =
      typeof reveal === "object" && reveal?.text
        ? {
            text: reveal.text,
            variant: reveal.variant ?? "subtitle1",
            align: reveal.align ?? "center",
          }
        : {
            text: String(reveal ?? ""),
            variant: "subtitle1",
            align: "center",
          };

    return (
      <Card
        as="div"
        className={cn(
          "h-full p-0 shadow-none",
          getRevealTone(reveal),
        )}
        contentClassName="items-center justify-center px-4 py-6 text-center"
      >
        <Typography
          content={revealContent}
          className={cn("w-full font-bold", reveal?.className)}
        />
      </Card>
    );
  }

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
              ? "grid gap-3"
              : "mx-auto grid max-w-[760px] gap-4 rounded-xl border border-white/15 p-4",
            gridColsClassName,
            gridContainerClassName,
        )}
      >
        {items.map((item) => {
          const isFlipped = Boolean(flippedMap[item.id]);

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
                {
                  if (mode === "singleChoice") {
                    pickSingleChoice(item);
                  } else {
                    revealGridCard(item.id);
                  }

                  onItemClick?.(item);
                }
              }
              className="relative overflow-hidden rounded-sm border border-white/20 bg-white/5 text-left [perspective:1000px] disabled:opacity-70"
              style={mediaSizingStyle}
            >
              <div
                className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <Card
                    as="div"
                    {...getFrontCardProps(item)}
                    className="h-full border-0 bg-transparent p-0"
                    mediaClassName="border-0 bg-transparent p-0"
                    contentClassName="px-2 pb-2"
                  />
                </div>

                <div
                  className={cn(
                    "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                  )}
                >
                  {renderBackCard(reveal)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
