import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Image from "../../base/Media/Image";
import { getMediaVariant } from "../../base/Media/mediaVariant";
import Typography from "../../base/Typography";

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

function getBoardMetrics(width, height, cols, rows, gap) {
  if (!width || !height || !cols || !rows) return null;

  const availableWidth = Math.max(width - gap * (cols - 1), 0);
  const availableHeight = Math.max(height - gap * (rows - 1), 0);
  const cellSize = Math.floor(
    Math.min(availableWidth / cols, availableHeight / rows),
  );

  if (!Number.isFinite(cellSize) || cellSize <= 0) return null;

  return {
    cellSize,
    boardWidth: cellSize * cols + gap * (cols - 1),
    boardHeight: cellSize * rows + gap * (rows - 1),
  };
}

function getCardLabelContent(card) {
  const label = card?.label;

  if (label && typeof label === "object" && !Array.isArray(label)) {
    return {
      align: "center",
      variant: "subtitle2",
      ...label,
    };
  }

  const text =
    typeof label === "string" || typeof label === "number"
      ? String(label)
      : String(card?.alt ?? `Par ${card?.pairId ?? ""}`);

  return {
    text,
    variant: "subtitle2",
    align: "center",
  };
}

export default function MemoryPairs(props) {
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

  const cards = data?.cards ?? rawCards;
  const grid = data?.grid ?? rawGrid;
  const title = data?.title ?? rawTitle;
  const instruction = data?.instruction ?? rawInstruction;
  const finishLabel =
    data?.finishLabel ?? rawFinishLabel ?? view?.nav?.finishLabel ?? "Fin";
  const previewSeconds = normalizePositiveNumber(
    data?.previewSeconds ?? rawPreviewSeconds,
    4,
  );
  const previewDurationMs = normalizePositiveNumber(
    data?.previewDurationMs ?? rawPreviewDurationMs,
    previewSeconds * 1000,
  );
  const viewId = view?.id ?? view?.viewId;

  const deck = useMemo(() => shuffle(cards), [cards]);
  const totalPairs = useMemo(
    () => new Set(deck.map((card) => card.pairId)).size,
    [deck],
  );

  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [turns, setTurns] = useState(0);
  const [previewRemainingMs, setPreviewRemainingMs] =
    useState(previewDurationMs);
  const boardViewportRef = useRef(null);
  const [boardViewportSize, setBoardViewportSize] = useState({
    width: 0,
    height: 0,
  });

  const isComplete = matched.size === totalPairs && totalPairs > 0;
  const isPreviewActive = previewRemainingMs > 0;
  const previewSecondsLeft = Math.ceil(previewRemainingMs / 1000);
  const score =
    totalPairs && turns
      ? Math.max(0, Math.min(100, Math.round((totalPairs / turns) * 100)))
      : 0;

  useEffect(() => {
    if (!isComplete) return;

    const result = {
      completed: true,
      totalPairs,
      matchedPairs: matched.size,
      turns,
      score,
    };

    heroApi?.setInteractiveState?.(viewId, {
      ...result,
      type: "memoryGame",
    });
    onComplete?.(result);
  }, [heroApi, isComplete, matched.size, onComplete, score, totalPairs, turns, viewId]);

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

  useEffect(() => {
    if (typeof window === "undefined" || !boardViewportRef.current) {
      return undefined;
    }

    const updateViewportSize = () => {
      const rect = boardViewportRef.current?.getBoundingClientRect?.();

      setBoardViewportSize({
        width: Math.max(Math.floor(rect?.width ?? 0), 0),
        height: Math.max(Math.floor(rect?.height ?? 0), 0),
      });
    };

    updateViewportSize();

    const resizeObserver = new window.ResizeObserver(() => {
      updateViewportSize();
    });

    resizeObserver.observe(boardViewportRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const boardGap = 12;
  const boardMetrics = useMemo(
    () =>
      getBoardMetrics(
        boardViewportSize.width,
        boardViewportSize.height,
        grid.cols,
        grid.rows,
        boardGap,
      ),
    [
      boardViewportSize.height,
      boardViewportSize.width,
      boardGap,
      grid.cols,
      grid.rows,
    ],
  );

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
    <section className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-1 overflow-hidden">
      <div className="shrink-0 space-y-2">
        {title ? (
          <Typography
            content={title}
            variant={title?.variant ?? "h2"}
            component={title?.component ?? "h2"}
          />
        ) : null}

        {instruction ? (
          <Typography
            content={instruction}
            variant={instruction?.variant ?? "body2"}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <Typography
            content={{
              text: isPreviewActive
                ? `Memoriza las cartas ${previewSecondsLeft}`
                : "Encuentra los pares",
              variant: "bodySm",
            }}
            className="text-left text-white/85"
          />

          <Typography
            content={{
              text: `Parejas encontradas: ${matched.size} / ${totalPairs} · Turnos: ${turns}`,
              variant: "helper",
            }}
            className="text-left text-white/70"
          />
        </div>
      </div>
      <div className="shrink-0 space-y-2">
        <h3 className="text-lg md:text-xl font-medium leading-8 text-white/85 max-w-none text-center max-w-full break-words [overflow-wrap:anywhere] ">Necesidades</h3>
      </div>

      <div
        ref={boardViewportRef}
        className="flex min-h-0 flex-1 items-center justify-center overflow-hidden"
      >
        <div
          className="grid place-content-center"
          style={{
            gap: `${boardGap}px`,
            gridTemplateColumns: boardMetrics
              ? `repeat(${grid.cols}, ${boardMetrics.cellSize}px)`
              : `repeat(${grid.cols}, minmax(0, 1fr))`,
            gridTemplateRows: boardMetrics
              ? `repeat(${grid.rows}, ${boardMetrics.cellSize}px)`
              : undefined,
            width: boardMetrics ? `${boardMetrics.boardWidth}px` : "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {deck.map((card, index) => {
            const isFaceUp =
              isPreviewActive ||
              open.includes(index) ||
              matched.has(card.pairId);
            const media = card?.media ?? card?.image ?? null;
            const imageSrc = media?.src ?? card.img ?? "";
            const imageAlt = media?.alt ?? card.alt ?? `Par ${card.pairId}`;
            const imageVariant = getMediaVariant(media);
            const labelContent = getCardLabelContent(card);

            return (
              <button
                key={card.id ?? index}
                type="button"
                disabled={isPreviewActive}
                onClick={() => pick(index)}
                className={cn(
                  "h-full w-full rounded-sm border border-white/20 bg-black/10",
                  "flex items-center justify-center overflow-hidden transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  isPreviewActive
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:-translate-y-0.5 hover:bg-black/20 active:translate-y-0",
                )}
              >
                {isFaceUp ? (
                  imageSrc ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
                      <Image
                        src={imageSrc}
                        alt={imageAlt}
                        variant={imageVariant}
                        className="h-[64%] w-[64%]"
                      />
                      <Typography content={labelContent} className="px-2" />
                    </div>
                  ) : (
                    <Typography content={labelContent} className="px-2" />
                  )
                ) : (
                  <div className="text-xs text-white/40">?</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
}
