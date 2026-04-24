import { useCallback, useEffect, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Typography from "../../base/Typography";
import { getMediaVariant } from "../../base/Media/mediaVariant";
import Card from "../container/Card";

const FLIP_BUTTON_BASE_CLASS =
  "relative flex min-h-0 min-w-0 w-fit max-w-full cursor-pointer overflow-visible rounded-2xl bg-transparent text-left [perspective:1000px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 disabled:cursor-not-allowed disabled:opacity-70";

const FLIP_CARD_INNER_CLASS =
  "relative w-fit min-w-0 max-w-full transition-transform duration-500 [transform-style:preserve-3d]";

const FLIP_FACE_CLASS = "rounded-2xl [backface-visibility:hidden]";

const FLIP_BACK_FACE_CLASS =
  "absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]";

const CORRECT_SELECTION_CLASS =
  "border-amber-200/95 bg-amber-300/10 shadow-[0_0_28px_rgba(251,191,36,0.38)] ring-4 ring-inset ring-amber-300/90";

function resolveRevealVariant(reveal) {
  const text = String(
    typeof reveal === "object" && reveal?.text ? reveal.text : (reveal ?? ""),
  );
  const declaredVariant = typeof reveal === "object" ? reveal?.variant : null;

  if (declaredVariant && declaredVariant !== "subtitle1") {
    return declaredVariant;
  }

  return text.length > 18 ? "body" : "h3";
}

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

function normalizeFlipMedia(
  media,
  fallbackAlt = "Carta",
  variantSource = null,
) {
  return {
    ...(media ?? {}),
    alt: media?.alt ?? fallbackAlt,
    variant:
      getMediaVariant(media) ?? getMediaVariant(variantSource) ?? "horizontal",
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

function getFlipMedia(item) {
  return {
    ...(item.image ?? {}),
    src: item.image?.src ?? item.src,
    alt: item.image?.alt ?? item.alt ?? item.caption ?? "Carta",
    variant: getMediaVariant(item.image) ?? getMediaVariant(item),
  };
}

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
    frontCardClassName = "",
    style,
    allowFlipBack = true,
    reportToHeroApi = true,
    fillContainer = false,
    selectedId: controlledSelectedId,
    onItemClick,
    onComplete,
  } = props;

  const mode = data?.mode ?? rawMode;
  const items = data?.items ?? rawItems;
  const locked = data?.locked ?? rawLocked;
  const columns = data?.columns ?? rawColumns;
  const countsTowardScore =
    data?.countsTowardScore ?? rawCountsTowardScore ?? mode !== "revealGrid";
  const viewId = view?.id ?? view?.viewId;

  const [revealedMap, setRevealedMap] = useState({});
  const [flippedMap, setFlippedMap] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const revealedCount = Object.values(revealedMap).filter(Boolean).length;

  const emitComplete = useCallback(
    (result) => {
      if (reportToHeroApi) {
        heroApi?.setInteractiveState?.(viewId, {
          ...result,
          type: "flipCard",
          countsTowardScore,
        });
      }
      onComplete?.(result);
    },
    [countsTowardScore, heroApi, onComplete, reportToHeroApi, viewId],
  );

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
  }, [countsTowardScore, emitComplete, items.length, mode, revealedCount]);

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

  const gridColsClassName =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-2"
        : columns === 4
          ? "grid-cols-2 xl:grid-cols-4"
          : "grid-cols-2 xl:grid-cols-3";

  const shouldRenderSingleInline =
    compact && columns === 1 && items.length === 1;

  function getFrontCardProps(item) {
    const media = getFlipMedia(item);

    return {
      media: normalizeFlipMedia(
        media,
        item.alt ?? item.caption ?? "Carta",
        item,
      ),
      title: normalizeFrontTitle(item),
    };
  }

  function getSelectionClass(item, isSelected) {
    if (!isSelected || !item.correct) return "";
    return CORRECT_SELECTION_CLASS;
  }

  function renderBackCard(reveal, className = "") {
    const revealContent =
      typeof reveal === "object" && reveal?.text
        ? {
            text: reveal.text,
            variant: resolveRevealVariant(reveal),
            align: reveal.align ?? "center",
          }
        : {
            text: String(reveal ?? ""),
            variant: resolveRevealVariant(reveal),
            align: "center",
          };

    return (
      <Card
        as="div"
        density="compact"
        className={cn(
          "h-full w-full overflow-hidden rounded-2xl shadow-none",
          getRevealTone(reveal),
          className,
        )}
        contentClassName="h-full items-center justify-center px-2 py-3 text-center"
      >
        <Typography
          content={revealContent}
          className={cn(
            "w-full text-balance font-bold leading-tight",
            reveal?.className,
          )}
        />
      </Card>
    );
  }

  function renderFlipButton(item, { inline = false } = {}) {
    const isFlipped = Boolean(flippedMap[item.id]);
    const isSelected = (controlledSelectedId ?? selectedId) === item.id;
    const shouldFillInline = inline && fillContainer;
    const selectionClassName = getSelectionClass(item, isSelected);

    const reveal = item.reveal ?? {
      text: item.correct ? "Correcto" : "Incorrecto",
      tone: item.correct ? "success" : "error",
    };

    const button = (
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
          FLIP_BUTTON_BASE_CLASS,
          shouldFillInline
            ? "max-h-full max-w-full items-center justify-center p-1"
            : "",
          containerClassName,
        )}
        style={style}
      >
        <div
          className={cn(
            FLIP_CARD_INNER_CLASS,
            shouldFillInline ? "h-fit max-h-full w-fit max-w-full" : "",
          )}
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <Card
            as="div"
            density="compact"
            {...getFrontCardProps(item)}
            fitToMedia={inline}
            fillContainer={shouldFillInline}
            selected={isSelected && item.correct}
            className={cn(
              FLIP_FACE_CLASS,
              shouldFillInline ? "max-h-full max-w-full" : "",
              selectionClassName,
              frontCardClassName,
            )}
            contentClassName="gap-0.5 px-1 pt-1"
          />

          {renderBackCard(reveal, cn(FLIP_BACK_FACE_CLASS, selectionClassName))}
        </div>
      </button>
    );

    if (inline) {
      return (
        <div
          className={cn(
            "flex min-h-0 min-w-0 max-w-full items-center justify-center overflow-hidden",
            fillContainer ? "h-full w-full" : "w-fit",
          )}
        >
          {button}
        </div>
      );
    }

    return button;
  }

  if (shouldRenderSingleInline) {
    return renderFlipButton(items[0], { inline: true });
  }

  return (
    <section
      className={cn(
        compact
          ? "w-fit max-w-full overflow-visible text-white"
          : "mx-auto min-h-full w-full max-w-5xl overflow-visible px-6 py-8 text-white md:h-full md:min-h-0",
      )}
      style={style}
    >
      <div
        className={cn(
          compact
            ? "grid h-fit w-fit max-w-full gap-3 overflow-visible"
            : "mx-auto grid min-h-full max-w-[760px] gap-4 rounded-xl border p-4 md:h-full md:min-h-0",
          gridColsClassName,
          gridContainerClassName,
        )}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex min-h-0 min-w-0 w-fit max-w-full items-start justify-center overflow-visible"
          >
            {renderFlipButton(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
