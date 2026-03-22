import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Image from "../Image";
import Typografia from "../Typografia";

function shuffle(items) {
  const next = [...items];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

function normalizePositiveNumber(value, fallback = 0) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export default function MemoryPairsGame(props) {
  const {
    data,
    heroApi,
    view,
    cards: rawCards = [],
    grid: rawGrid = { cols: 4, rows: 3 },
    title: rawTitle,
    instruction: rawInstruction,
    finishLabel: rawFinishLabel = "Fin",
    previewSeconds: rawPreviewSeconds = 4,
    previewDurationMs: rawPreviewDurationMs,
    onComplete,
    onFinish,
  } = props;

  // Permite usar el mismo componente como vista directa del player.
  const cards = data?.cards ?? rawCards;
  const grid = data?.grid ?? rawGrid;
  const title = data?.title ?? rawTitle;
  const instruction = data?.instruction ?? rawInstruction;
  const finishLabel = data?.finishLabel ?? rawFinishLabel ?? view?.nav?.finishLabel ?? "Fin";
  const previewSeconds = normalizePositiveNumber(
    data?.previewSeconds ?? rawPreviewSeconds,
    4,
  );
  const previewDurationMs = normalizePositiveNumber(
    data?.previewDurationMs ?? rawPreviewDurationMs,
    previewSeconds * 1000,
  );

  // Baraja el tablero una sola vez por set de cartas.
  const deck = useMemo(() => shuffle(cards), [cards]);
  // Cada pairId representa un match valido del juego.
  const totalPairs = useMemo(() => new Set(deck.map((card) => card.pairId)).size, [deck]);

  // Guarda las dos cartas que estan temporalmente abiertas.
  const [open, setOpen] = useState([]);
  // Guarda los pares que ya fueron resueltos.
  const [matched, setMatched] = useState(() => new Set());
  // Cuenta los turnos reales del jugador.
  const [turns, setTurns] = useState(0);
  // Muestra todas las cartas unos segundos antes de habilitar el tablero.
  const [previewRemainingMs, setPreviewRemainingMs] = useState(previewDurationMs);

  const isComplete = matched.size === totalPairs && totalPairs > 0;
  const isPreviewActive = previewRemainingMs > 0;
  const previewSecondsLeft = Math.ceil(previewRemainingMs / 1000);
  const score = useMemo(() => {
    if (!totalPairs || !turns) return 0;

    // El score premia resolver el juego con la menor cantidad de turnos.
    return Math.max(0, Math.min(100, Math.round((totalPairs / turns) * 100)));
  }, [totalPairs, turns]);

  useEffect(() => {
    if (!isComplete) return;

    const result = {
      completed: true,
      totalPairs,
      matchedPairs: matched.size,
      turns,
      score,
    };

    // Reporta el progreso al flujo principal y conserva soporte para uso aislado.
    heroApi?.setInteractiveState?.(view?.id, {
      ...result,
      type: "memoryGame",
    });
    onComplete?.(result);
  }, [heroApi, isComplete, matched.size, onComplete, score, totalPairs, turns, view?.id]);

  useEffect(() => {
    setOpen([]);
    setMatched(new Set());
    setTurns(0);
    setPreviewRemainingMs(previewDurationMs);
  }, [deck, previewDurationMs]);

  useEffect(() => {
    if (!previewDurationMs) return;

    const previewStartedAt = Date.now();
    const intervalId = window.setInterval(() => {
      const remaining = Math.max(
        previewDurationMs - (Date.now() - previewStartedAt),
        0,
      );

      if (remaining === 0) {
        window.clearInterval(intervalId);
      }

      setPreviewRemainingMs(remaining);
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [deck, previewDurationMs]);

  function pick(index) {
    if (isPreviewActive) return;

    const card = deck[index];
    if (!card) return;
    if (matched.has(card.pairId)) return;
    if (open.includes(index)) return;
    if (open.length === 2) return;

    const nextOpen = [...open, index];
    setOpen(nextOpen);

    if (nextOpen.length === 2) {
      // Un turno se cierra cuando el jugador revela dos cartas.
      setTurns((prev) => prev + 1);

      const [firstIndex, secondIndex] = nextOpen;
      const firstCard = deck[firstIndex];
      const secondCard = deck[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        const nextMatched = new Set(matched);
        nextMatched.add(firstCard.pairId);

        setTimeout(() => {
          setMatched(nextMatched);
          setOpen([]);
        }, 200);
      } else {
        setTimeout(() => setOpen([]), 650);
      }
    }
  }

  return (
    <section className="mx-auto flex h-full w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        {title ? (
          <Typografia
            content={title}
            variant={title?.variant ?? "h2"}
            component={title?.component ?? "h2"}
          />
        ) : null}

        {instruction ? (
          <Typografia
            content={instruction}
            variant={instruction?.variant ?? "body2"}
          />
        ) : null}

        {isPreviewActive ? (
          <Typografia
            content={{
              text: `Memoriza las cartas. El juego empieza en ${previewSecondsLeft}s.`,
              variant: "body2",
            }}
          />
        ) : null}
      </div>

      <div
        className="grid place-content-center gap-3"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
      >
        {deck.map((card, index) => {
          const isFaceUp =
            isPreviewActive || open.includes(index) || matched.has(card.pairId);

          return (
            <button
              key={card.id ?? index}
              type="button"
              disabled={isPreviewActive}
              onClick={() => pick(index)}
              className={cn(
                "aspect-square rounded-sm border border-white/20 bg-black/10",
                "flex items-center justify-center transition",
                isPreviewActive ? "cursor-default" : "hover:bg-black/20",
              )}
            >
              {isFaceUp ? (
                card.img ? (
                  <Image
                    src={card.img}
                    alt={card.alt ?? `Par ${card.pairId}`}
                    className="h-[70%]"
                  />
                ) : (
                  <Typografia
                    content={{
                      text: card.label ?? card.alt ?? `Par ${card.pairId}`,
                      variant: "subtitle2",
                      align: "center",
                    }}
                    className="px-2"
                  />
                )
              ) : (
                <div className="text-xs text-white/40">?</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <Typografia
          content={{
            text: `Parejas encontradas: ${matched.size} / ${totalPairs} · Turnos: ${turns}`,
            variant: "body2",
          }}
        />

        <button
          type="button"
          disabled={!isComplete}
          onClick={() => {
            const result = {
              completed: isComplete,
              totalPairs,
              matchedPairs: matched.size,
              turns,
              score,
            };

            heroApi?.setInteractiveState?.(view?.id, {
              ...result,
              type: "memoryGame",
            });
            onFinish?.(result);
          }}
          className="h-9 rounded border border-white/20 bg-black/20 px-5 font-semibold text-white disabled:opacity-40"
        >
          {finishLabel}
        </button>
      </div>
    </section>
  );
}
