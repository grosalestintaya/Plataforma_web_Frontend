import { useEffect, useMemo, useState } from "react";
import Image from "../Image";
import Typografia from "../Typografia";
import { cn } from "@/shared/libs/utils";

function getRevealTone(reveal) {
  // Traduce el color semantico del contenido a clases directas del overlay.
  if (reveal?.tone === "success") return "bg-emerald-500 text-white";
  if (reveal?.tone === "error") return "bg-rose-600 text-white";
  return "bg-white/15 text-white";
}

/**
 * FlipCard usa un solo contrato: title, instruction e items.
 * El modo cambia el comportamiento, pero no la forma de la vista.
 */
export default function FlipCard(props) {
  const {
    data,
    heroApi,
    view,
    mode: rawMode = "revealGrid",
    items: rawItems = [],
    title: rawTitle,
    instruction: rawInstruction,
    locked: rawLocked = false,
    columns: rawColumns = 2,
    countsTowardScore: rawCountsTowardScore,
    onComplete,
  } = props;

  // Lee el contrato del JSON sin necesitar wrapper adicional.
  const mode = data?.mode ?? rawMode;
  const items = data?.items ?? rawItems;
  const title = data?.title ?? rawTitle;
  const instruction = data?.instruction ?? rawInstruction;
  const locked = data?.locked ?? rawLocked;
  const columns = data?.columns ?? rawColumns;
  // Las vistas de ejemplo desbloquean, pero no suman score.
  const countsTowardScore =
    data?.countsTowardScore ?? rawCountsTowardScore ?? mode !== "revealGrid";

  // Guarda las cartas reveladas en vistas tipo ejemplo.
  const [revealedMap, setRevealedMap] = useState({});
  // Guarda la opcion elegida en preguntas de una sola respuesta.
  const [selectedId, setSelectedId] = useState(null);
  // Cuenta cuantos intentos tomó encontrar la respuesta correcta.
  const [attempts, setAttempts] = useState(0);

  const revealedCount = useMemo(
    () => Object.values(revealedMap).filter(Boolean).length,
    [revealedMap],
  );

  function emitComplete(result) {
    // Reporta completado al flujo principal y conserva uso aislado.
    heroApi?.setInteractiveState?.(view?.id, {
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

    // La vista ejemplo solo desbloquea la siguiente pantalla.
    emitComplete({
      completed: true,
      total: items.length,
      revealedCount,
      score: countsTowardScore ? 100 : null,
    });
  }, [countsTowardScore, items.length, mode, revealedCount]);

  function revealGridCard(cardId) {
    if (locked) return;

    // Cada tarjeta queda descubierta de forma permanente.
    setRevealedMap((prev) => ({
      ...prev,
      [cardId]: true,
    }));
  }

  function pickSingleChoice(item) {
    if (locked) return;
    if (!item) return;

    setSelectedId(item.id);
    setAttempts((prev) => prev + 1);

    if (!item.correct) return;

    // Premia acertar rapido; desde el segundo intento baja el puntaje.
    const score = Math.max(50, 100 - attempts * 50);

    emitComplete({
      completed: true,
      selectedId: item.id,
      attempts: attempts + 1,
      score,
    });
  }

  // Ajusta la grilla segun la cantidad visual de columnas.
  const gridClassName =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-2"
        : columns === 4
          ? "grid-cols-2 xl:grid-cols-4"
          : "grid-cols-2 xl:grid-cols-3";

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-8 text-white">
      <div className="mb-6 flex flex-col gap-4">
        {title ? (
          <Typografia
            content={title}
            variant={title?.variant ?? "h2"}
            component={title?.component ?? "h2"}
            containerClassName={cn(
              "mx-auto w-full max-w-[760px] rounded-xl border border-white/20 px-6 py-3",
              title?.containerClassName,
            )}
          />
        ) : null}

        {instruction ? (
          <Typografia
            content={instruction}
            variant={instruction?.variant ?? "h5"}
            containerClassName={cn(
              "mx-auto w-full max-w-[760px] rounded-xl border border-white/15 px-6 py-4",
              instruction?.containerClassName,
            )}
            align={instruction?.align ?? "center"}
          />
        ) : null}
      </div>

      <div
        className={cn(
          "mx-auto grid max-w-[760px] gap-4 rounded-xl border border-white/15 p-4",
          gridClassName,
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
              className="relative overflow-hidden rounded-sm border border-white/20 bg-white/5 text-left disabled:opacity-70"
            >
              {isRevealed ? (
                <div
                  className={cn(
                    "flex aspect-square items-center justify-center px-4 text-center text-base font-bold md:text-lg",
                    getRevealTone(reveal),
                  )}
                >
                  {reveal.text}
                </div>
              ) : (
                <div className="flex flex-col">
                  <Image
                    src={item.image?.src ?? item.src}
                    alt={
                      item.image?.alt ??
                      item.alt ??
                      item.label?.text ??
                      item.caption ??
                      "Carta"
                    }
                    className="aspect-square"
                  />

                  {(item.label || item.caption) && (
                    <Typografia
                      content={
                        item.label ?? {
                          text: item.caption,
                          variant: "subtitle2",
                          align: "center",
                        }
                      }
                      className="px-2 py-2"
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-sm text-white/65">
        {mode === "singleChoice"
          ? `Intentos: ${attempts}`
          : `Progreso: ${revealedCount} / ${items.length} tarjetas reveladas`}
      </div>
    </section>
  );
}
