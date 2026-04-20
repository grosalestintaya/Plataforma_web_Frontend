import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Typography from "../../base/Typography";
import Card from "../container/Card";
/**
 * Traduce el tono semantico del reveal a clases visuales.
 */
function getRevealTone(reveal) {
  if (reveal?.tone === "income") {
    return "border border-emerald-200/35 bg-emerald-600 text-white rounded-2xl";
  }
  if (reveal?.tone === "expense") {
    return "border border-rose-200/35 bg-rose-600 text-white rounded-2xl";
  }
  if (reveal?.tone === "success") {
    return "border border-emerald-200/35 bg-emerald-600 text-white rounded-2xl";
  }
  if (reveal?.tone === "error") {
    return "border border-rose-200/35 bg-rose-600 text-white rounded-2xl";
  }
  return "border border-white/15 bg-white/15 text-white rounded-xl";
}

function toHorizontalMedia(media, fallbackAlt = "Carta") {
  return {
    ...(media ?? {}),
    alt: media?.alt ?? fallbackAlt,
    variant: "horizontal",
  };
}

function normalizeFrontTitle(item) {
  const content =
    item.label ??
    (item.caption
      ? {
          text: item.caption,
        }
      : null);

  if (!content) return null;

  if (typeof content === "object") {
    return {
      ...content,
      variant: "label",
      align: content.align ?? "center",
      className: cn("font-bold leading-tight", content.className),
    };
  }

  return {
    text: content,
    variant: "label",
    align: "center",
    className: "font-bold leading-tight",
  };
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
    style,
    allowFlipBack = true,
    reportToHeroApi = true,
    fillContainer = false,
    selectedId: controlledSelectedId,
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
      "var(--flip-card-height, min(340px, calc(var(--hero-height, 100vh) * 0.34)))",
    aspectRatio: "var(--flip-card-aspect-ratio, auto)",
    maxHeight: "var(--flip-card-max-height, none)",
  };
  const mediaFitStyle = {
    "--card-media-max-height":
      "var(--flip-card-media-max-height, calc(min(340px, calc(var(--hero-height, 100vh) * 0.34)) - var(--flip-card-content-reserve, 78px)))",
  };
  const shouldRenderSingleInline = compact && columns === 1 && items.length === 1;

  /**
   * FlipCard usa Card como base visual del frente.
   * Asi CollageCard solo reune FlipCards y cada FlipCard sigue el mismo
   * lenguaje visual del resto del sistema.
   */
  function getFrontCardProps(item) {
    const media =
      item.image ??
      { src: item.src, alt: item.alt ?? item.caption ?? "Carta" };

    return {
      media: toHorizontalMedia(media, item.alt ?? item.caption ?? "Carta"),
      title: normalizeFrontTitle(item),
    };
  }

  /**
   * El reverso tambien reutiliza Card para mantener el mismo marco y proporciones.
   */
  function getSelectionClass(item, isSelected) {
    if (!isSelected || !item.correct) return "";

    return "border-amber-200/95 bg-amber-300/10 shadow-[0_0_28px_rgba(251,191,36,0.38)] ring-4 ring-inset ring-amber-300/90";
  }

  function renderBackCard(reveal, className = "") {
    const revealContent =
      typeof reveal === "object" && reveal?.text
        ? {
            text: reveal.text,
            variant: "h3",
            align: reveal.align ?? "center",
          }
        : {
            text: String(reveal ?? ""),
            variant: "h3",
            align: "center",
          };

    return (
      <Card
        as="div"
        className={cn(
          "h-full rounded-2xl p-3 shadow-none",
          getRevealTone(reveal),
          className,
        )}
        contentClassName="items-center justify-center px-2 py-4 text-center"
      >
        <Typography
          content={revealContent}
          className={cn("w-full font-bold", reveal?.className)}
        />
      </Card>
    );
  }

  function renderFlipButton(item, { inline = false } = {}) {
    const isFlipped = Boolean(flippedMap[item.id]);
    const isSelected = (controlledSelectedId ?? selectedId) === item.id;
    const shouldFitToMedia = inline && fillContainer;
    const selectionClassName = getSelectionClass(item, isSelected);

    const reveal = item.reveal ?? {
      text: item.correct ? "Correcto" : "Incorrecto",
      tone: item.correct ? "success" : "error",
    };

    return (
      <button
        key={item.id}
        type="button"
        disabled={locked}
        onClick={() => {
          if (mode === "singleChoice") {
            pickSingleChoice(item);
          } else {
            revealGridCard(item.id);
          }

          onItemClick?.(item);
        }}
        className={cn(
          "relative min-h-0 w-full cursor-pointer overflow-visible rounded-2xl bg-transparent p-1 text-left [perspective:1000px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 disabled:cursor-not-allowed disabled:opacity-70",
          inline && !fillContainer ? "h-auto max-h-none" : "h-full max-h-full",
          inline ? "text-white" : "",
          inline && fillContainer ? "flex items-center justify-center" : "",
          inline ? containerClassName : "",
        )}
        style={inline ? { ...mediaFitStyle, ...(style ?? {}) } : { ...mediaSizingStyle, ...mediaFitStyle }}
      >
        <div
          className={cn(
            "relative transition-transform duration-500 [transform-style:preserve-3d]",
            shouldFitToMedia ? "mx-auto w-fit max-w-full" : "w-full",
            shouldFitToMedia ? "h-fit" : inline && !fillContainer ? "" : "h-full max-h-full",
          )}
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <Card
            as="div"
            {...getFrontCardProps(item)}
            fitToMedia={shouldFitToMedia}
            selected={isSelected && item.correct}
            className={cn(
              "rounded-2xl p-2 [backface-visibility:hidden]",
              selectionClassName,
              inline
                ? shouldFitToMedia
                  ? "relative w-fit max-h-full"
                  : "relative w-full"
                : "absolute inset-0 h-full",
            )}
            mediaClassName={cn(
              "p-0",
              shouldFitToMedia ? "border-transparent" : "",
            )}
            contentClassName="gap-1 px-1"
          />

          {renderBackCard(
            reveal,
            cn(
              "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]",
              selectionClassName,
            ),
          )}
        </div>
      </button>
    );
  }

  if (shouldRenderSingleInline) {
    return renderFlipButton(items[0], { inline: true });
  }

  return (
    <section
      className={cn(
        compact
          ? "min-h-full w-full max-w-full overflow-visible text-white md:h-full md:min-h-0 md:max-h-full md:overflow-hidden"
          : "mx-auto min-h-full w-full max-w-5xl overflow-visible px-6 py-8 text-white md:h-full md:min-h-0 md:overflow-hidden",
        containerClassName,
      )}
      style={style}
    >
        <div
          className={cn(
            compact
              ? "grid min-h-full gap-3 md:h-full md:min-h-0 md:max-h-full"
              : "mx-auto grid min-h-full max-w-[760px] gap-4 rounded-xl border p-4 md:h-full md:min-h-0",
            gridColsClassName,
            gridContainerClassName,
        )}
      >
        {items.map((item) => renderFlipButton(item))}
      </div>
    </section>
  );
}
