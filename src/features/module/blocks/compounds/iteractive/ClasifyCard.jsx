import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";
import Card from "../container/Card";

function getViewId(view) {
  return view?.id ?? view?.viewId ?? null;
}

function normalizeTextNode(value, fallbackVariant = "caption") {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return {
      text: String(value),
      variant: fallbackVariant,
      align: "center",
    };
  }

  return {
    ...value,
    variant: value?.variant ?? fallbackVariant,
    align: value?.align ?? "center",
  };
}

function normalizeMedia(media, title) {
  const source = media?.src ?? media?.img;
  if (!source) return null;

  return {
    ...media,
    src: source,
    alt: media?.alt ?? title?.text ?? "Objeto",
    variant: media?.variant ?? "square",
    mode: media?.mode ?? "contain",
  };
}

function normalizeCategory(category, index) {
  return {
    ...category,
    id: category?.id ?? `category-${index + 1}`,
    title: normalizeTextNode(
      category?.title ?? category?.label ?? category?.name ?? `Categoria ${index + 1}`,
      "body",
    ),
  };
}

function getCategoryTone(categoryId) {
  if (String(categoryId).toLowerCase().includes("des")) {
    return {
      shell:
        "bg-[linear-gradient(180deg,rgba(132,31,15,0.24),rgba(80,14,5,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
      chip:
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.15),rgba(255,255,255,0.07))] text-[#fff2dd]",
      empty: "border border-dashed border-white/12 bg-white/[0.04]",
    };
  }

  return {
    shell:
      "bg-[linear-gradient(180deg,rgba(17,98,106,0.20),rgba(7,57,72,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
    chip:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.15),rgba(255,255,255,0.07))] text-[#ebfffe]",
    empty: "border border-dashed border-white/12 bg-white/[0.04]",
  };
}

function getDraggedItemId(event, fallbackId) {
  return (
    fallbackId ??
    event?.dataTransfer?.getData("application/x-item-id") ??
    event?.dataTransfer?.getData("text/plain") ??
    null
  );
}

function buildSlots(items = [], minSlots = 0) {
  const slots = [...items];
  const missing = Math.max(0, minSlots - slots.length);

  for (let i = 0; i < missing; i += 1) {
    slots.push(null);
  }

  return slots;
}

function ObjectTile({
  item,
  selected = false,
  compact = false,
  draggable = true,
  onClick,
  onDragStart,
  onDragEnd,
}) {
  const title = normalizeTextNode(
    item?.title ?? item?.label ?? item?.name,
    "caption",
  );
  const media = normalizeMedia(item?.media ?? item?.image, title);

  return (
    <div
      draggable={draggable}
      onDragStart={(event) => {
        event.stopPropagation();
        onDragStart?.(event, item?.id);
      }}
      onDragEnd={(event) => {
        event.stopPropagation();
        onDragEnd?.(event, item?.id);
      }}
      className={cn(
        "group relative mx-auto aspect-square h-[min(100cqw,100cqh)] w-[min(100cqw,100cqh)] max-h-full max-w-full min-h-0 min-w-0",
        "[&>article]:h-full [&>article]:w-full [&>article]:max-w-full",
        "[&>article]:rounded-[0.9rem] [&>article]:p-1",
        compact && "[&>article]:p-1",
      )}
      title={title?.text ?? media?.alt ?? "Objeto"}
    >
      <Card
        media={media}
        interaction={{ type: "selectable" }}
        selected={selected}
        zoomable={false}
        variant="ghost"
        size="normal"
        onSelect={() => onClick?.(item?.id)}
      />
      {title?.text ? (
        <div className="pointer-events-none absolute inset-x-1 bottom-1 z-20 translate-y-2 rounded-lg bg-black/60 px-2 py-1 text-center text-[0.68rem] font-black leading-tight text-white opacity-0 shadow-[0_8px_18px_rgba(0,0,0,0.22)] backdrop-blur-sm transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {title.text}
        </div>
      ) : null}
    </div>
  );
}

function EmptySlot({ className = "" }) {
  return (
    <div
      className={cn(
        "h-full w-full rounded-[0.9rem] border border-dashed border-white/12 bg-white/[0.04]",
        className,
      )}
    />
  );
}

export default function ClasifyCard({
  config,
  view,
  heroApi,
  items: legacyItems = [],
  categories: legacyCategories = [],
  selectedItemId: controlledSelectedItemId,
  draggable = true,
  onComplete,
}) {
  const runtime = config ?? {};
  const viewId = getViewId(view);
  const layoutVariant = runtime?.layoutVariant ?? "bankTop";
  const isBankLeftLayout = layoutVariant === "bankLeft";

  const panelTitle = normalizeTextNode(
    runtime?.panelTitle ?? "Arrastra los diferentes objetos a uno de los contenedores",
    "body2",
  );

  const items = runtime?.items ?? legacyItems;

  const categories = useMemo(
    () => (runtime?.categories ?? legacyCategories).map(normalizeCategory),
    [runtime?.categories, legacyCategories],
  );

  const persistedState = heroApi?.getInteractiveState?.(viewId);

  const [placements, setPlacements] = useState(
    () => persistedState?.placements ?? {},
  );
  const [selectedItemId, setSelectedItemId] = useState(
    () => controlledSelectedItemId ?? persistedState?.selectedItemId ?? null,
  );
  const [draggingItemId, setDraggingItemId] = useState(null);

  const completionSentRef = useRef(false);

  useEffect(() => {
    setPlacements(persistedState?.placements ?? {});
    setSelectedItemId(
      controlledSelectedItemId ?? persistedState?.selectedItemId ?? null,
    );
    completionSentRef.current = Boolean(persistedState?.completed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId, controlledSelectedItemId]);

  const itemMap = useMemo(
    () => new Map((Array.isArray(items) ? items : []).map((item) => [item?.id, item])),
    [items],
  );

  const bankItems = useMemo(
    () => (Array.isArray(items) ? items : []).filter((item) => !placements[item?.id]),
    [items, placements],
  );

  const categorizedItems = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = (Array.isArray(items) ? items : []).filter(
        (item) => placements[item?.id] === category.id,
      );
      return acc;
    }, {});
  }, [categories, items, placements]);

  const totalItems = Array.isArray(items) ? items.length : 0;
  const allPlaced = totalItems > 0 && bankItems.length === 0;

  const correctCount = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter(
      (item) => placements[item?.id] === item?.correctCategoryId,
    ).length;
  }, [items, placements]);

  const completed = allPlaced;
  const countsTowardScore = runtime?.countsTowardScore !== false;
  const score =
    completed && totalItems > 0
      ? Math.round((correctCount / totalItems) * Number(runtime?.score ?? view?.score ?? 100))
      : 0;
  const classifiedCount = Math.max(0, totalItems - bankItems.length);
  const incorrectCount = Math.max(0, classifiedCount - correctCount);
  const bankSlots = buildSlots(
    bankItems,
    isBankLeftLayout ? Math.max(8, bankItems.length) : Math.max(6, bankItems.length),
  );
  const actionLabel = runtime?.submitLabel ?? heroApi?.advanceLabel ?? "Continuar";

  function buildClassificationState(forceCompleted = completed) {
    const isFinished = Boolean(forceCompleted);
    const finalScore =
      isFinished && totalItems > 0
        ? Math.round((correctCount / totalItems) * Number(runtime?.score ?? view?.score ?? 100))
        : 0;

    return {
      type: "objectClassification",
      completed: isFinished,
      terminado: isFinished,
      finished: isFinished,
      status: isFinished ? "terminado" : "in_progress",
      score: finalScore,
      countsTowardScore,
      selectedItemId,
      placements,
      correctCount,
      incorrectCount,
      totalCount: totalItems,
      bankCount: bankItems.length,
      classifiedCount,
      payload: {
        completed: isFinished,
        terminado: isFinished,
        status: isFinished ? "terminado" : "in_progress",
        placements,
        correctCount,
        incorrectCount,
        totalCount: totalItems,
        bankCount: bankItems.length,
        classifiedCount,
        categoryCount: categories.length,
        layoutVariant,
      },
    };
  }

  function reportClassificationState(forceCompleted = completed) {
    const nextState = buildClassificationState(forceCompleted);
    heroApi?.setInteractiveState?.(viewId, nextState);
    return nextState;
  }

  function updatePlacements(itemId, categoryId = null) {
    if (!itemId || !itemMap.has(itemId)) return;

    setPlacements((prev) => {
      const next = { ...prev };

      if (categoryId) {
        next[itemId] = categoryId;
      } else {
        delete next[itemId];
      }

      return next;
    });

    setSelectedItemId(null);
  }

  function handleItemClick(itemId) {
    setSelectedItemId((current) => (current === itemId ? null : itemId));
  }

  function handleItemDragStart(event, itemId) {
    event?.dataTransfer?.setData("text/plain", itemId);
    event?.dataTransfer?.setData("application/x-item-id", itemId);
    setDraggingItemId(itemId);
    setSelectedItemId(itemId);
  }

  function handleItemDragEnd() {
    setDraggingItemId(null);
  }

  function handleCategoryDrop(event, categoryId) {
    event.preventDefault();
    const itemId = getDraggedItemId(event, draggingItemId);
    updatePlacements(itemId, categoryId);
    setDraggingItemId(null);
  }

  function handleBankDrop(event) {
    event.preventDefault();
    const itemId = getDraggedItemId(event, draggingItemId);
    updatePlacements(itemId, null);
    setDraggingItemId(null);
  }

  function handleCategoryClick(categoryId) {
    if (!selectedItemId) return;
    updatePlacements(selectedItemId, categoryId);
  }

  function handleBankClick() {
    if (!selectedItemId) return;
    updatePlacements(selectedItemId, null);
  }

  function handleContinue(event) {
    event.stopPropagation();
    reportClassificationState(true);
    heroApi?.advanceCurrentView?.();
  }

  function preventDropDefault(event) {
    event.preventDefault();
  }

  useEffect(() => {
    if (!heroApi?.setInteractiveState || !viewId) return;

    reportClassificationState();
  }, [
    heroApi,
    viewId,
    completed,
    countsTowardScore,
    selectedItemId,
    placements,
    correctCount,
    incorrectCount,
    totalItems,
    bankItems.length,
    classifiedCount,
    categories.length,
    layoutVariant,
  ]);

  useEffect(() => {
    if (!completed || completionSentRef.current) return;

    completionSentRef.current = true;

    onComplete?.(buildClassificationState(true));
  }, [
    completed,
    score,
    correctCount,
    incorrectCount,
    totalItems,
    placements,
    countsTowardScore,
    selectedItemId,
    bankItems.length,
    classifiedCount,
    categories.length,
    layoutVariant,
    onComplete,
  ]);

  function renderPanelTitle() {
    if (!panelTitle) return null;

    return (
      <div className="shrink-0 rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <Typography
          content={{
            ...panelTitle,
            variant: panelTitle?.variant ?? "body2",
          }}
        />
      </div>
    );
  }

  function renderBank() {
    return (
      <section
        onDrop={handleBankDrop}
        onDragOver={preventDropDefault}
        onClick={handleBankClick}
        className={cn(
          "rounded-[1.2rem] bg-white/[0.03] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
          isBankLeftLayout ? "min-h-0 lg:h-full" : "shrink-0",
          selectedItemId && "ring-2 ring-white/20",
        )}
      >
        {completed ? (
          <div className="grid h-full min-h-[6.25rem] place-items-center rounded-[1rem] bg-white/[0.04] px-4 py-3">
            <Button
              variant="primary"
              size="lg"
              label={actionLabel}
              disabled={heroApi?.canAdvance === false}
              onClick={handleContinue}
              className="min-w-[12rem] rounded-2xl border-white/25 bg-white/15 px-8 font-black text-white shadow-[0_16px_28px_rgba(0,0,0,0.20)] hover:bg-white/22"
            />
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-3",
              isBankLeftLayout
                ? "grid-cols-2 auto-rows-[5.6rem] overflow-y-auto overflow-x-hidden pr-1 sm:auto-rows-[6rem] lg:h-full lg:auto-rows-[5.5rem]"
                : "grid-flow-col auto-cols-[40%] grid-rows-1 overflow-x-auto overflow-y-hidden pb-1 sm:grid-flow-row sm:grid-cols-4 sm:overflow-visible sm:pb-0 lg:grid-cols-8",
            )}
          >
            {bankSlots.map((item, index) => (
              <div
                key={item?.id ?? `bank-empty-${index}`}
                className={cn(
                  "grid min-w-0 place-items-center [container-type:size]",
                  isBankLeftLayout
                    ? "h-full min-h-0"
                    : "h-[6.25rem] w-full sm:h-[6.5rem] lg:h-[5.75rem] xl:h-[6.1rem]",
                )}
              >
                {item ? (
                  <ObjectTile
                    item={item}
                    compact
                    draggable={draggable}
                    selected={selectedItemId === item?.id}
                    onClick={handleItemClick}
                    onDragStart={handleItemDragStart}
                    onDragEnd={handleItemDragEnd}
                  />
                ) : (
                  <EmptySlot />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderCategories() {
    return (
      <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-2 md:grid-cols-2 lg:h-full">
        {categories.map((category) => {
          const tone = getCategoryTone(category.id);
          const placedItems = categorizedItems[category.id] ?? [];
          const slots = buildSlots(placedItems, 6);

          return (
            <section
              key={category.id}
              onDrop={(event) => handleCategoryDrop(event, category.id)}
              onDragOver={preventDropDefault}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "flex min-h-[20rem] min-w-0 flex-col gap-2 rounded-[1.2rem] p-2",
                "md:min-h-[18rem] lg:h-full lg:min-h-0",
                tone.shell,
                selectedItemId && "ring-2 ring-white/20",
              )}
            >
              <div
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                  tone.chip,
                )}
              >
                <Typography
                  content={{
                    ...category.title,
                    variant: category.title?.variant ?? "body",
                  }}
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-[1rem] scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20">
                <div className="grid grid-cols-3 gap-2 auto-rows-[6rem] sm:auto-rows-[6.5rem] lg:h-full lg:auto-rows-[calc(50%_-_0.25rem)]">
                  {slots.map((item, index) => (
                    <div
                      key={item?.id ?? `${category.id}-empty-${index}`}
                      className="grid h-full min-h-0 min-w-0 place-items-center [container-type:size]"
                    >
                      {item ? (
                        <ObjectTile
                          item={item}
                          compact
                          draggable={draggable}
                          selected={selectedItemId === item?.id}
                          onClick={handleItemClick}
                          onDragStart={handleItemDragStart}
                          onDragEnd={handleItemDragEnd}
                        />
                      ) : (
                        <EmptySlot className={tone.empty} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <section
      className={cn(
        "flex min-h-0 w-full min-w-0 flex-col gap-2 overflow-y-auto rounded-[1.45rem] p-1 text-white",
        "lg:h-full lg:overflow-hidden",
        "bg-[linear-gradient(180deg,rgba(17,98,106,0.26),rgba(7,57,72,0.22))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
      )}
    >
      {isBankLeftLayout ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[minmax(9rem,13rem)_minmax(0,1fr)]">
          {renderBank()}
          <div className="flex min-h-0 min-w-0 flex-col gap-2">
            {renderPanelTitle()}
            {renderCategories()}
          </div>
        </div>
      ) : (
        <>
          {renderPanelTitle()}
          {renderBank()}
          {renderCategories()}
        </>
      )}
    </section>
  );
}
