import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Image from "../../base/Media/Image";
import { getMediaVariant } from "../../base/Media/mediaVariant";
import Typography from "../../base/Typography";
import Card from "../container/Card";

const DEFAULT_GRID = { cols: 4, rows: 3 };
const MEMORY_CARD_FALLBACK = {
  width: 104,
  height: 142,
  mediaHeight: 88,
  contentReserve: 40,
};

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
  const cellWidth = Math.floor(availableWidth / cols);
  const cellHeight = Math.floor(availableHeight / rows);

  if (
    !Number.isFinite(cellWidth) ||
    !Number.isFinite(cellHeight) ||
    cellWidth <= 0 ||
    cellHeight <= 0
  ) {
    return null;
  }

  return {
    cellWidth,
    cellHeight,
    boardWidth: cellWidth * cols + gap * (cols - 1),
    boardHeight: cellHeight * rows + gap * (rows - 1),
  };
}

function getMemoryMediaRatio(variant) {
  if (variant === "horizontal") return 3 / 2;
  if (variant === "vertical") return 2 / 3;
  return 1;
}

function getMemoryCardLayout({
  cellWidth,
  cellHeight,
  mediaVariant,
  labelLength = 0,
  prioritizeMedia = false,
}) {
  if (!cellWidth || !cellHeight) {
    if (prioritizeMedia && mediaVariant === "square") {
      const side = MEMORY_CARD_FALLBACK.width;

      return {
        width: side,
        height: side,
        mediaHeight: side,
        contentReserve: 0,
      };
    }

    return {
      ...MEMORY_CARD_FALLBACK,
      contentReserve:
        labelLength > 14 ? 46 : MEMORY_CARD_FALLBACK.contentReserve,
    };
  }

  const contentReserve = labelLength > 14 ? 46 : 40;
  const chromeHeight = 14;
  const cellInset = 16;
  const mediaRatio = getMemoryMediaRatio(mediaVariant);
  const maxWidth = Math.max(cellWidth - cellInset, 76);
  const maxHeight = Math.max(cellHeight - cellInset, 112);

  if (prioritizeMedia && mediaVariant === "square") {
    const side = Math.max(76, Math.min(maxWidth, maxHeight));

    return {
      width: side,
      height: side,
      mediaHeight: side,
      contentReserve: 0,
    };
  }

  const widthFromHeight = Math.floor(
    Math.max(maxHeight - contentReserve - chromeHeight, 56) * mediaRatio,
  );
  const width = Math.max(76, Math.min(maxWidth, widthFromHeight));
  const mediaHeight = Math.max(56, Math.floor(width / mediaRatio));
  const height = Math.min(
    maxHeight,
    mediaHeight + contentReserve + chromeHeight,
  );

  return {
    width,
    height,
    mediaHeight,
    contentReserve,
  };
}

function normalizeSectionKey(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getHiddenCardTheme(section) {
  const sectionKey = normalizeSectionKey(
    section?.id ??
      section?.sectionTitle?.text ??
      section?.sectionTitle ??
      section?.title?.text ??
      section?.title,
  );

  if (sectionKey.includes("deseo")) {
    return {
      shellClassName:
        "bg-[#d7a317] border-[#8b5e00] hover:bg-[#e0b12c] disabled:hover:bg-[#d7a317]",
      innerClassName: "bg-[#f0c94d] border-[#8b5e00]",
    };
  }

  return {
    shellClassName:
      "bg-[#73bfe8] border-[#1e5f86] hover:bg-[#86cbee] disabled:hover:bg-[#73bfe8]",
    innerClassName: "bg-[#a8daf6] border-[#1e5f86]",
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

function getDisplayText(content, fallback = "") {
  if (!content) return fallback;

  if (typeof content === "string" || typeof content === "number") {
    return String(content);
  }

  if (typeof content?.text === "string" || typeof content?.text === "number") {
    return String(content.text);
  }

  return fallback;
}

function buildSections({ cards, grid, sectionTitle, sections }) {
  if (Array.isArray(sections) && sections.length > 0) {
    return sections.map((section) => ({
      sectionTitle: section?.sectionTitle ?? sectionTitle ?? null,
      cards: Array.isArray(section?.cards) ? section.cards : [],
      grid: section?.grid ?? grid,
    }));
  }

  return [
    {
      sectionTitle: sectionTitle ?? null,
      cards: Array.isArray(cards) ? cards : [],
      grid,
    },
  ];
}

export default function MemoryPairs({
  data = {},
  heroApi,
  view,
  onComplete,
  onFinish,
}) {
  const cards = data?.cards ?? [];
  const grid = data?.grid ?? DEFAULT_GRID;
  const title = data?.title ?? null;
  const instruction = data?.instruction ?? null;
  const sectionTitle = data?.sectionTitle ?? null;
  const finishLabel = data?.finishLabel ?? view?.nav?.finishLabel ?? "Fin";
  const revealContentOnHover = Boolean(data?.revealContentOnHover);
  const previewSeconds = normalizePositiveNumber(data?.previewSeconds, 4);
  const previewDurationMs = normalizePositiveNumber(
    data?.previewDurationMs,
    previewSeconds * 1000,
  );
  const restartLimit = normalizePositiveNumber(data?.restartLimit, 1);
  const sectionAdvanceDelayMs = normalizePositiveNumber(
    data?.sectionAdvanceDelayMs,
    1400,
  );
  const showFinishButton = Boolean(data?.showFinishButton);
  const viewId = view?.id ?? view?.viewId;
  const normalizedGrid = useMemo(
    () => ({
      cols: Math.max(1, normalizePositiveNumber(grid?.cols, 4)),
      rows: Math.max(1, normalizePositiveNumber(grid?.rows, 3)),
    }),
    [grid?.cols, grid?.rows],
  );
  const sectionsConfigKey = JSON.stringify({
    cards,
    grid: normalizedGrid,
    sectionTitle,
    sections: data?.sections ?? null,
  });

  const sections = useMemo(
    () =>
      buildSections({
        cards,
        grid: normalizedGrid,
        sectionTitle,
        sections: data?.sections,
      }),
    [sectionsConfigKey],
  );

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [turns, setTurns] = useState(0);
  const [previewRemainingMs, setPreviewRemainingMs] =
    useState(previewDurationMs);
  const [previewCycle, setPreviewCycle] = useState(0);
  const [restartRemaining, setRestartRemaining] = useState(restartLimit);
  const boardViewportRef = useRef(null);
  const [boardViewportSize, setBoardViewportSize] = useState({
    width: 0,
    height: 0,
  });

  const activeSection = sections[activeSectionIndex] ?? {
    sectionTitle: null,
    cards: [],
    grid: normalizedGrid,
  };

  const sectionGrid = activeSection?.grid ?? normalizedGrid;
  const deck = useMemo(
    () => shuffle(activeSection?.cards ?? []),
    [activeSection?.cards],
  );
  const sectionPairIds = useMemo(
    () => [...new Set(deck.map((card) => card.pairId).filter(Boolean))],
    [deck],
  );
  const totalPairs = useMemo(() => sectionPairIds.length, [sectionPairIds]);
  const matchedPairsInSection = useMemo(
    () => sectionPairIds.filter((pairId) => matched.has(pairId)).length,
    [matched, sectionPairIds],
  );
  const isComplete = matchedPairsInSection === totalPairs && totalPairs > 0;
  const isPreviewActive = previewRemainingMs > 0;
  const previewSecondsLeft = Math.ceil(previewRemainingMs / 1000);
  const isLastSection = activeSectionIndex >= sections.length - 1;
  const score =
    totalPairs && turns
      ? Math.max(0, Math.min(100, Math.round((totalPairs / turns) * 100)))
      : 0;

  useEffect(() => {
    setActiveSectionIndex(0);
    setOpen([]);
    setMatched(new Set());
    setTurns(0);
    setPreviewRemainingMs(previewDurationMs);
    setPreviewCycle((prev) => prev + 1);
    setRestartRemaining(restartLimit);
  }, [previewDurationMs, restartLimit, sectionsConfigKey]);

  useEffect(() => {
    setOpen([]);
    setMatched(new Set());
    setTurns(0);
    setPreviewRemainingMs(previewDurationMs);
    setPreviewCycle((prev) => prev + 1);
    setRestartRemaining(restartLimit);
  }, [activeSectionIndex, previewDurationMs, restartLimit]);

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
  }, [activeSectionIndex, previewDurationMs, previewCycle]);

  useEffect(() => {
    heroApi?.setInteractiveState?.(viewId, {
      completed: isComplete && isLastSection,
      totalPairs,
      matchedPairs: matchedPairsInSection,
      turns,
      score: isComplete && isLastSection ? score : 0,
      sectionIndex: activeSectionIndex,
      sectionCount: sections.length,
      type: "memoryGame",
    });

    if (!isComplete) return undefined;

    if (!isLastSection) {
      const timeoutId = window.setTimeout(() => {
        setActiveSectionIndex((prev) =>
          Math.min(prev + 1, sections.length - 1),
        );
      }, sectionAdvanceDelayMs);

      return () => window.clearTimeout(timeoutId);
    }

    const result = {
      completed: true,
      totalPairs,
      matchedPairs: matchedPairsInSection,
      turns,
      score,
      sectionIndex: activeSectionIndex,
      sectionCount: sections.length,
    };
    onComplete?.(result);

    return undefined;
  }, [
    activeSectionIndex,
    heroApi,
    isComplete,
    isLastSection,
    matchedPairsInSection,
    onComplete,
    score,
    sectionAdvanceDelayMs,
    sections.length,
    totalPairs,
    turns,
    viewId,
  ]);

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

    return () => resizeObserver.disconnect();
  }, []);

  const boardGap = 4;
  const boardMetrics = useMemo(
    () =>
      getBoardMetrics(
        boardViewportSize.width,
        boardViewportSize.height,
        sectionGrid.cols,
        sectionGrid.rows,
        boardGap,
      ),
    [
      boardViewportSize.height,
      boardViewportSize.width,
      boardGap,
      sectionGrid.cols,
      sectionGrid.rows,
    ],
  );

  function restartBoard() {
    if (restartRemaining <= 0 || isPreviewActive || isComplete) return;

    setRestartRemaining((prev) => Math.max(prev - 1, 0));
    setOpen([]);
    setPreviewRemainingMs(previewDurationMs);
    setPreviewCycle((prev) => prev + 1);
  }

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

  const titleText = getDisplayText(title, "Encuentra las parejas");
  const sectionTitleText = getDisplayText(
    activeSection?.sectionTitle,
    getDisplayText(sectionTitle),
  );
  const statusText = isPreviewActive
    ? `Empieza en ${previewSecondsLeft}s`
    : `${activeSectionIndex + 1}/${sections.length}`;
  const hiddenCardTheme = getHiddenCardTheme(activeSection);

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col overflow-hidden border border-black/70 bg-transparent p-1">
      {instruction ? (
        <div className="mb-1 shrink-0 px-1 text-center">
          <Typography
            content={instruction}
            variant={instruction?.variant ?? "body2"}
          />
        </div>
      ) : null}

      <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1 overflow-hidden md:flex-row">
        <aside className="flex w-full shrink-0 flex-col border border-black/70 p-3 text-white md:w-[270px]">
          <div className="flex min-h-[180px] flex-1 items-center justify-center border border-black/70 px-4 py-8 text-center">
            <div className="max-w-[210px] text-3xl font-black leading-tight md:text-4xl">
              {titleText}
            </div>
          </div>

          <div className="mt-3 space-y-3 md:mt-4">
            <div className="border border-black/70 px-3 py-2 text-center text-2xl font-black md:text-[2rem]">
              Parejas: {matched.size}/{totalPairs}
            </div>

            <button
              type="button"
              onClick={restartBoard}
              disabled={restartRemaining <= 0 || isComplete || isPreviewActive}
              className="flex w-full items-center gap-3 border border-black/70 px-3 py-3 text-left text-white transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="text-4xl leading-none">Ã¢â€ Â»</span>
              <div className="min-w-0">
                <div className="text-2xl font-black leading-tight">
                  Girar de nuevo:{restartRemaining}
                </div>
                <div className="text-sm text-white/70 md:text-base">
                  {statusText}
                </div>
              </div>
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 overflow-hidden border border-black/70 p-1">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-black/70 p-2 md:flex-row">
            {sectionTitleText ? (
              <>
                <div className="mb-2 flex shrink-0 items-center justify-center border border-black/70 px-3 py-1 text-center text-sm font-black uppercase tracking-[0.18em] text-white md:hidden">
                  {sectionTitleText}
                </div>
                <div className="mr-2 hidden w-10 shrink-0 items-center justify-center border border-black/70 px-1 py-2 text-white md:flex">
                  <span
                    className="text-center text-[0.85rem] font-black uppercase tracking-[0.35em]"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {sectionTitleText}
                  </span>
                </div>
              </>
            ) : null}

            <div
              ref={boardViewportRef}
              className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden"
            >
              <div
                className="grid place-content-center"
                style={{
                  gap: `${boardGap}px`,
                  gridTemplateColumns: boardMetrics
                    ? `repeat(${sectionGrid.cols}, ${boardMetrics.cellWidth}px)`
                    : `repeat(${sectionGrid.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: boardMetrics
                    ? `repeat(${sectionGrid.rows}, ${boardMetrics.cellHeight}px)`
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
                  const labelText = getDisplayText(labelContent, imageAlt);
                  const shouldUseHoverRevealCard =
                    revealContentOnHover && imageVariant === "square";
                  const cardLayout = getMemoryCardLayout({
                    cellWidth: boardMetrics?.cellWidth,
                    cellHeight: boardMetrics?.cellHeight,
                    mediaVariant: imageVariant,
                    labelLength: labelText.length,
                    prioritizeMedia: shouldUseHoverRevealCard,
                  });
                  const cardStyle = {
                    
                  };

                  return (
                    <div
                      key={card.id ?? index}
                      className="flex h-full w-full items-center justify-center overflow-hidden"
                    >
                      <button
                        type="button"
                        disabled={isPreviewActive}
                        onClick={() => pick(index)}
                        style={cardStyle}
                        className={cn(
                          "border p-0.5",
                          "flex items-center justify-center overflow-hidden transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                          hiddenCardTheme.shellClassName,
                          isPreviewActive
                            ? "cursor-not-allowed"
                            : "cursor-pointer",
                        )}
                      >
                        {isFaceUp ? (
                          media ? (
                            shouldUseHoverRevealCard ? (
                              <Card
                                as="div"
                                density="compact"
                                fillContainer
                                media={{
                                  ...media,
                                  src: imageSrc,
                                  alt: imageAlt,
                                  variant: imageVariant,
                                }}
                                title={{
                                  ...labelContent,
                                  text: labelText,
                                  className: cn(
                                    "text-white",
                                    labelContent?.className,
                                  ),
                                }}
                                revealContentOnHover
                                className="h-full w-full rounded-none border-black/60 bg-transparent p-0.5 shadow-none"
                                mediaClassName="rounded-none border-black/45 bg-transparent p-0"
                                contentClassName="px-1 py-1"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col gap-0.5">
                                <div className="flex min-h-0 flex-1 items-center justify-center border border-black/60 p-0.5">
                                  <Image
                                    src={imageSrc}
                                    alt={imageAlt}
                                    variant={imageVariant}
                                    className="h-full w-full"
                                    imgClassName="block h-full w-full object-contain"
                                  />
                                </div>
                                <div className="border border-black/60 px-1 py-0.5">
                                  <Typography
                                    content={labelContent}
                                    className="text-center"
                                  />
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="flex h-full w-full items-center justify-center border border-black/60 px-1.5 py-0.5">
                              <Typography
                                content={labelContent}
                                className="text-center"
                              />
                            </div>
                          )
                        ) : (
                          <div
                            className={cn(
                              "flex h-full w-full items-center justify-center border p-2",
                              hiddenCardTheme.innerClassName,
                            )}
                          >
                            <div className="flex h-full w-full items-center justify-center border border-black/35 bg-white/10 p-3">
                              <Image
                                src="/iconcolor.png"
                                alt="Quipu Yachay"
                                className="h-full w-full"
                                imgClassName="block h-full w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFinishButton ? (
        <div className="mt-2 flex shrink-0 items-center justify-end gap-4">
          <button
            type="button"
            disabled={!isComplete || !isLastSection}
            onClick={() => {
              const result = {
                completed: isComplete && isLastSection,
                totalPairs,
                matchedPairs: matchedPairsInSection,
                turns,
                score,
                sectionIndex: activeSectionIndex,
                sectionCount: sections.length,
              };

              heroApi?.setInteractiveState?.(viewId, {
                ...result,
                type: "memoryGame",
              });
              onFinish?.(result);
            }}
            className="h-9 cursor-pointer rounded border border-white/20 bg-black/20 px-5 font-semibold text-white transition hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {finishLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
