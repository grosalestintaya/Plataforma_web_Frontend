import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/libs/utils";
import { getMediaVariant } from "../../base/Media/mediaVariant";
import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";
import Card from "../container/Card";

const DEFAULT_GRID = { cols: 4, rows: 3 };

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
        "bg-gradient-to-br from-[#f6ca43] via-[#dea514] to-[#b97808] shadow-[0_18px_34px_rgba(112,52,0,0.22)] ring-1 ring-white/25 hover:from-[#ffd55a] hover:via-[#e6af1f] hover:to-[#c7850e] disabled:hover:from-[#f6ca43] disabled:hover:via-[#dea514] disabled:hover:to-[#b97808]",
      innerClassName:
        "bg-gradient-to-br from-[#fff0a7] via-[#f8d76a] to-[#d79c18] ring-1 ring-[#8b5e00]/25",
    };
  }

  return {
    shellClassName:
      "bg-gradient-to-br from-[#7ed8f7] via-[#4bb6e8] to-[#227ebf] shadow-[0_18px_34px_rgba(9,74,119,0.22)] ring-1 ring-white/25 hover:from-[#97e2fb] hover:via-[#61c5f1] hover:to-[#2b8fce] disabled:hover:from-[#7ed8f7] disabled:hover:via-[#4bb6e8] disabled:hover:to-[#227ebf]",
    innerClassName:
      "bg-gradient-to-br from-[#d5f3ff] via-[#a7e1f8] to-[#69b8e3] ring-1 ring-[#1e5f86]/20",
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

function getBoardGridClass(columns) {
  if (columns <= 2) return "grid-cols-2";
  if (columns === 3) return "grid-cols-3";
  return "grid-cols-3 sm:grid-cols-4";
}

function getBoardMaxWidthClass(columns) {
  if (columns <= 2) return "max-w-xl";
  if (columns === 3) return "max-w-3xl";
  if (columns === 4) return "max-w-4xl";
  return "max-w-6xl";
}

function getBoardRowsClass(rows) {
  if (rows <= 1) return "lg:grid-rows-1";
  if (rows === 2) return "lg:grid-rows-2";
  if (rows === 3) return "lg:grid-rows-3";
  if (rows === 4) return "lg:grid-rows-4";

  return null;
}

function getBoardCardFrameClass(columns) {
  if (columns <= 2) {
    return "aspect-[1.02] lg:h-full lg:aspect-auto";
  }

  if (columns === 3) {
    return "aspect-[0.92] sm:aspect-[0.98] lg:h-full lg:aspect-auto";
  }

  return "aspect-[0.9] min-[420px]:aspect-[0.82] sm:aspect-[0.82] lg:h-full lg:aspect-auto";
}

function getMemoryCardView({
  isFaceUp,
  media,
  imageSrc,
  imageAlt,
  imageVariant,
  labelContent,
  labelText,
}) {
  const hiddenMedia = {
    src: "/icon.webp",
    alt: "Quipu Yachay",
    variant: "square",
    mode: "contain",
  };

  const revealedTitle = media
    ? {
        ...labelContent,
        text: labelText,
      }
    : labelContent;

  if (isFaceUp) {
    return {
      title: null,
      text: null,
      media: media
        ? {
            ...media,
            src: imageSrc,
            alt: imageAlt,
            variant: imageVariant,
          }
        : null,
      hoverLabel: labelText,
      interaction: {
        type: "flipCard",
        backCard: {
          title: {
            text: "Quipu Yachay",
            variant: "label",
            align: "center",
          },
        },
      },
    };
  }

  return {
    title: null,
    text: null,
    media: hiddenMedia,
    hoverLabel: null,
    interaction: {
      type: "flipCard",
      backCard: {
        title: revealedTitle,
        text: media ? null : null,
      },
    },
  };
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
      cols: 4,
      rows: 3,
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
    <section className="mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col gap-3 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(107,15,0,0.14))] p-2.5 shadow-[0_22px_60px_rgba(102,24,5,0.18)] backdrop-blur-[2px] sm:gap-4 sm:p-3 lg:p-4">
      {instruction ? (
        <div className="shrink-0 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:px-5">
          <Typography
            content={instruction}
            variant={instruction?.variant ?? "body2"}
          />
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-2.5 overflow-hidden lg:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)]">
        <aside className="flex min-h-0 w-full shrink-0 flex-col gap-2.5 overflow-y-auto overscroll-contain rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(159,29,9,0.18),rgba(95,13,4,0.24))] p-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_rgba(99,21,5,0.14)] sm:gap-3 sm:p-3.5 lg:overflow-visible lg:p-4">
          <div className="grid min-h-[5.5rem] place-items-center rounded-[1.4rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_62%)] px-3 py-3 text-center sm:min-h-[8rem] sm:px-4 sm:py-5 lg:min-h-[11rem] lg:rounded-[1.6rem] lg:px-4 lg:py-6">
            <div className="max-w-[16rem] text-[clamp(1.45rem,5.2vw,2.2rem)] font-black leading-[1.02] sm:text-[clamp(1.65rem,5.8vw,2.6rem)] lg:text-4xl">
              {titleText}
            </div>
          </div>

          {sectionTitleText ? (
            <div className="rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-3 py-2.5 text-center text-[0.7rem] font-black uppercase tracking-[0.22em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.28em]">
              {sectionTitleText}
            </div>
          ) : null}
          <div className="rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] px-3 py-2.5 text-center text-base font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] sm:px-4 sm:py-3 sm:text-xl lg:rounded-[1.5rem] lg:py-4 lg:text-2xl">
            Parejas: {matchedPairsInSection}/{totalPairs}
          </div>

          <Button
            onClick={restartBoard}
            disabled={restartRemaining <= 0 || isComplete || isPreviewActive}
            variant="simple"
            size="normal"
            fullWidth
            className="min-h-[3.7rem] justify-start rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(121,24,8,0.32),rgba(72,10,3,0.26))] px-3 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_30px_rgba(93,18,5,0.14)] hover:bg-[linear-gradient(180deg,rgba(121,24,8,0.42),rgba(72,10,3,0.34))] sm:min-h-[4.5rem] sm:px-4 sm:py-3 lg:min-h-[4.75rem] lg:rounded-[1.5rem]"
          >
            <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">
              <span className="text-3xl leading-none text-white/80">↻</span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="break-words text-[0.9rem] font-black leading-tight sm:text-base lg:text-lg">
                  Girar de nuevo: {restartRemaining}
                </div>
                <div className="break-words text-[0.72rem] leading-tight text-white/70 sm:text-sm">
                  {statusText}
                </div>
              </div>
            </div>
          </Button>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(126,23,6,0.16))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_44px_rgba(101,19,5,0.16)]">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.55rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0.01)_60%)] p-2.5 sm:p-3 lg:p-4">
            <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain lg:overflow-hidden">
              <div
                className={cn(
                  "mx-auto grid min-h-0 w-full place-content-center justify-items-stretch gap-2.5 sm:gap-3 lg:h-full lg:place-content-stretch lg:gap-4",
                  getBoardGridClass(sectionGrid.cols),
                  getBoardRowsClass(sectionGrid.rows),
                  getBoardMaxWidthClass(sectionGrid.cols),
                )}
              >
                {deck.map((card, index) => {
                  const isFaceUp =
                    isPreviewActive ||
                    open.includes(index) ||
                    matched.has(card.pairId);
                  const media = card?.media ?? card?.image ?? null;
                  const imageSrc = media?.src ?? card.img ?? "";
                  const imageAlt =
                    media?.alt ?? card.alt ?? `Par ${card.pairId}`;
                  const imageVariant = getMediaVariant(media);
                  const labelContent = getCardLabelContent(card);
                  const labelText = getDisplayText(labelContent, imageAlt);
                  const cardView = getMemoryCardView({
                    isFaceUp,
                    media,
                    imageSrc,
                    imageAlt,
                    imageVariant,
                    labelContent,
                    labelText,
                  });

                  return (
                    <div
                      key={card.id ?? index}
                      className={cn(
                        "h-auto min-h-0 w-full min-w-0 lg:h-full",
                        getBoardCardFrameClass(sectionGrid.cols),
                      )}
                    >
                      <button
                        type="button"
                        disabled={isPreviewActive}
                        onClick={() => pick(index)}
                        className={cn(
                          "group/memory relative grid h-full min-h-0 w-full min-w-0 place-items-center overflow-hidden rounded-[1.7rem] p-[3px]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                          hiddenCardTheme.shellClassName,
                          isPreviewActive
                            ? "cursor-not-allowed"
                            : "cursor-pointer",
                        )}
                      >
                        <div
                          className={cn(
                            "pointer-events-none flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden",
                            "[&>div]:h-full [&>div]:w-full [&>div]:min-h-0 [&>div]:min-w-0",
                            "[&_*]:max-w-full",
                            "[&_article]:h-full [&_article]:w-full [&_article]:min-h-0",
                            "[&_article]:overflow-hidden [&_article]:rounded-[1.45rem] [&_article]:bg-transparent [&_article]:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
                          )}
                        >
                          <Card
                            title={cardView.title}
                            text={cardView.text}
                            media={cardView.media}
                            interaction={cardView.interaction}
                            zoomable={false}
                            variant="ghost"
                          />
                        </div>

                        {isFaceUp && cardView.hoverLabel ? (
                          <div
                            className={cn(
                              "pointer-events-none absolute inset-x-2 bottom-2 z-20",
                              "translate-y-3 opacity-0 transition duration-200",
                              "group-hover/memory:translate-y-0 group-hover/memory:opacity-100",
                              "group-focus-visible/memory:translate-y-0 group-focus-visible/memory:opacity-100",
                            )}
                          >
                            <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(37,26,7,0.78),rgba(16,12,6,0.62))] px-3 py-2 text-center text-sm font-bold text-white shadow-[0_14px_28px_rgba(0,0,0,0.26)] backdrop-blur-sm">
                              {cardView.hoverLabel}
                            </div>
                          </div>
                        ) : null}
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
        <div className="mt-1 flex shrink-0 items-center justify-end gap-4">
          <Button
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
            variant="simple"
            size="sm"
            className="rounded-full bg-[linear-gradient(180deg,rgba(69,14,4,0.44),rgba(28,7,3,0.34))] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_26px_rgba(77,17,5,0.18)] hover:bg-[linear-gradient(180deg,rgba(69,14,4,0.58),rgba(28,7,3,0.42))]"
          >
            {finishLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
