import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Typography from "../../base/Typography";
import CollageCard from "../grouper/CollageCard";

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
  const src = media?.src ?? media?.img;

  if (!src) return null;

  return {
    ...media,
    src,
    alt: media?.alt ?? title?.text ?? "Objeto",
    variant: media?.variant ?? "square",
    mode: media?.mode ?? "contain",
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

function normalizeCategory(category, index) {
  const title = normalizeTextNode(
    category?.title ??
      category?.label ??
      category?.name ??
      `Categoría ${index + 1}`,
    "body",
  );

  return {
    ...category,
    id: category?.id ?? `category-${index + 1}`,
    title,
  };
}

function buildHoverLabel(title, fallback) {
  return getDisplayText(title, fallback);
}

function normalizeClasifyItem(
  item,
  {
    compact = false,
    draggable = true,
    selectedItemId,
    revealContentOnHover = false,
    onItemClick,
    onItemDragStart,
    onItemDragEnd,
  },
) {
  const title = normalizeTextNode(
    item?.title ?? item?.label ?? item?.name,
    "caption",
  );

  const media = normalizeMedia(item?.media ?? item?.image, title);

  const hoverLabel = revealContentOnHover
    ? buildHoverLabel(title, media?.alt ?? "Objeto")
    : null;

  return {
    ...item,
    title: revealContentOnHover ? null : title,
    text: revealContentOnHover ? null : (item?.text ?? null),
    hoverLabel,
    media,
    interaction: {
      type: "dragDrop",
      itemId: item?.id,
      compact,
      draggable,
      onClick: () => onItemClick?.(item?.id),
      onDragStart: (event) => onItemDragStart?.(event, item?.id),
      onDragEnd: (event) => onItemDragEnd?.(event, item?.id),
    },
    zoomable: false,
    selected: selectedItemId === item?.id,
  };
}

function getRowsForCount(totalItems, columns, fallbackRows = 1) {
  if (!totalItems) return fallbackRows;
  if (!columns || columns <= 0) return fallbackRows;

  return Math.max(fallbackRows, Math.ceil(totalItems / columns));
}

function getCategoryTone(categoryId) {
  if (String(categoryId).toLowerCase().includes("des")) {
    return {
      shell:
        "bg-[linear-gradient(180deg,rgba(132,31,15,0.28),rgba(80,14,5,0.22))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
      chip: "bg-[linear-gradient(90deg,rgba(255,221,166,0.18),rgba(255,160,122,0.10))] text-[#fff2dd]",
      empty:
        "border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]",
    };
  }

  return {
    shell:
      "bg-[linear-gradient(180deg,rgba(17,98,106,0.26),rgba(7,57,72,0.22))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
    chip: "bg-[linear-gradient(90deg,rgba(182,255,245,0.16),rgba(132,219,255,0.10))] text-[#ebfffe]",
    empty:
      "border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]",
  };
}

/**
 * Hook simple para que CollageCard reciba columnas reales según viewport.
 * Mobile: compacto.
 * Desktop: banco horizontal como el segundo mockup.
 */
function useResponsiveColumns({
  totalItems,
  mobile = 2,
  tablet = 4,
  desktop = 8,
}) {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return "desktop";

    if (window.innerWidth < 640) return "mobile";
    if (window.innerWidth < 1024) return "tablet";

    return "desktop";
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleResize() {
      if (window.innerWidth < 640) {
        setViewport("mobile");
        return;
      }

      if (window.innerWidth < 1024) {
        setViewport("tablet");
        return;
      }

      setViewport("desktop");
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxColumns =
    viewport === "mobile" ? mobile : viewport === "tablet" ? tablet : desktop;

  return Math.max(1, Math.min(totalItems || 1, maxColumns));
}

function getOuterClass() {
  return cn(
    "h-full min-h-0 w-full min-w-0 overflow-y-auto overflow-x-hidden text-white",
    "px-2 py-2",
    "lg:overflow-hidden lg:px-4 lg:py-3",
  );
}

function getMainPanelClass() {
  return cn(
    "mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-2 rounded-[1.6rem]",
    "bg-[linear-gradient(180deg,rgba(122,30,20,0.22),rgba(70,12,6,0.22))]",
    " shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
    "sm:gap-3 ",
    "lg:h-full lg:min-h-0 lg:overflow-hidden lg:rounded-[1.9rem] pb-0",
  );
}

function getPanelTitleClass() {
  return cn(
    "shrink-0 rounded-[1.15rem]",
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))]",
    "px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]",
    "sm:rounded-[1.35rem] sm:px-4",
  );
}

function getBankClass(selectedItemId) {
  return cn(
    "flex shrink-0 flex-col gap-2 rounded-[1.35rem]",
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]",
    "p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
    "sm:rounded-[1.55rem] sm:p-3",
    selectedItemId && "ring-2 ring-white/25",
  );
}

function getBankSlotClass() {
  return cn(
    "min-h-[5.8rem] p-0.5",
    "sm:min-h-[6.6rem] sm:p-1",
    "lg:min-h-[6.2rem]",
  );
}

function getCategoryGridClass() {
  return cn(
    "grid min-h-0 w-full min-w-0 flex-1 gap-2",
    "grid-cols-1",
    "md:grid-cols-2",
    "lg:overflow-hidden",
  );
}

function getCategoryClass(tone, selectedItemId) {
  return cn(
    "flex min-h-[12rem] min-w-0 flex-col gap-2 rounded-[1.45rem] p-2 text-white",
    "sm:min-h-[13rem] sm:p-3",
    "lg:min-h-0 lg:overflow-hidden",
    tone.shell,
    selectedItemId && "ring-2 ring-white/25",
  );
}

function getCategorySlotClass() {
  return cn(
    "min-h-[5.8rem] p-0.5",
    "sm:min-h-[6.8rem] sm:p-1",
    "lg:min-h-[6.7rem]",
  );
}

function getStatusClass() {
  return cn(
    "mx-auto flex w-full max-w-6xl flex-col gap-2 rounded-[1.2rem]",
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]",
    "px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
    "sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4",
  );
}

export default function ClasifyCard({
  config,
  view,
  heroApi,
  items: legacyItems = [],
  categories: legacyCategories = [],
  selectedIds = [],
  selectedItemId: controlledSelectedItemId,
  compact = false,
  draggable = true,
  columns,
  rows,
  slotCount,
  onComplete,
}) {
  const runtime = config ?? {};
  const viewId = getViewId(view);

  const revealContentOnHover = runtime?.revealContentOnHover !== false;

  const bankTitle = normalizeTextNode(runtime?.bankTitle ?? "Objetos", "label");

  const panelTitle = normalizeTextNode(
    runtime?.panelTitle ?? "Clasifica los diferentes objetos",
    "body2",
  );

  const items = runtime?.items ?? legacyItems;

  const categories = useMemo(
    () => (runtime?.categories ?? legacyCategories).map(normalizeCategory),
    [runtime?.categories, legacyCategories],
  );

  const totalItems = Array.isArray(items) ? items.length : 0;

  /**
   * Segundo mockup:
   * - Banco arriba como fila horizontal.
   * - En desktop intenta usar hasta 8 columnas.
   */
  const bankColumns = useResponsiveColumns({
    totalItems,
    mobile: runtime?.bankMobileColumns ?? 2,
    tablet: runtime?.bankTabletColumns ?? 4,
    desktop: runtime?.bankColumns ?? columns ?? Math.min(totalItems || 8, 8),
  });

  const bankRows =
    runtime?.bankRows ?? getRowsForCount(totalItems, bankColumns, 1);

  /**
   * Categorías:
   * - 2 columnas de categorías en desktop/tablet.
   * - Dentro de cada categoría: 3 columnas en desktop, 2 en móvil.
   */
  const categoryColumns = useResponsiveColumns({
    totalItems: Math.max(
      1,
      Math.ceil(totalItems / Math.max(categories.length, 1)),
    ),
    mobile: runtime?.categoryMobileColumns ?? 2,
    tablet: runtime?.categoryTabletColumns ?? 2,
    desktop: runtime?.categoryColumns ?? 3,
  });

  const categoryRows = runtime?.categoryRows ?? rows ?? 2;

  const totalCategorySlots =
    slotCount ??
    Math.max(
      categoryColumns * categoryRows,
      Math.ceil(totalItems / Math.max(categories.length, 1)),
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
    () =>
      new Map(
        (Array.isArray(items) ? items : []).map((item) => [item?.id, item]),
      ),
    [items],
  );

  const bankItems = useMemo(
    () =>
      (Array.isArray(items) ? items : []).filter(
        (item) => !placements[item?.id],
      ),
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

  const allPlaced = totalItems > 0 && bankItems.length === 0;

  const correctCount = useMemo(
    () =>
      (Array.isArray(items) ? items : []).filter(
        (item) => placements[item?.id] === item?.correctCategoryId,
      ).length,
    [items, placements],
  );

  const completed = allPlaced && correctCount === totalItems;
  const countsTowardScore = runtime?.countsTowardScore !== false;
  const score = completed ? Number(runtime?.score ?? view?.score ?? 100) : 0;

  function updatePlacements(itemId, nextCategoryId = null) {
    if (!itemId || !itemMap.has(itemId)) return;

    setPlacements((prev) => {
      const next = { ...prev };

      if (nextCategoryId) {
        next[itemId] = nextCategoryId;
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
    event?.dataTransfer?.setData?.("text/plain", itemId);
    event?.dataTransfer?.setData?.("application/x-item-id", itemId);

    setDraggingItemId(itemId);
    setSelectedItemId(itemId);
  }

  function handleItemDragEnd() {
    setDraggingItemId(null);
  }

  function resolveDraggedItemId(event) {
    return (
      draggingItemId ??
      event?.dataTransfer?.getData("application/x-item-id") ??
      event?.dataTransfer?.getData("text/plain") ??
      selectedItemId
    );
  }

  function handleCategoryDrop(event, categoryId) {
    event.preventDefault();

    const itemId = resolveDraggedItemId(event);

    updatePlacements(itemId, categoryId);
    setDraggingItemId(null);
  }

  function handleBankDrop(event) {
    event.preventDefault();

    const itemId = resolveDraggedItemId(event);

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

  function preventDropDefault(event) {
    event.preventDefault();
  }

  const normalizedBankItems = useMemo(
    () =>
      bankItems.map((item) =>
        normalizeClasifyItem(item, {
          compact: true,
          draggable,
          selectedItemId,
          revealContentOnHover,
          onItemClick: handleItemClick,
          onItemDragStart: handleItemDragStart,
          onItemDragEnd: handleItemDragEnd,
        }),
      ),
    [bankItems, draggable, selectedItemId, revealContentOnHover],
  );

  const normalizedCategoryItems = useMemo(
    () =>
      categories.reduce((acc, category) => {
        acc[category.id] = (categorizedItems[category.id] ?? []).map((item) =>
          normalizeClasifyItem(item, {
            compact: true,
            draggable,
            selectedItemId,
            revealContentOnHover,
            onItemClick: handleItemClick,
            onItemDragStart: handleItemDragStart,
            onItemDragEnd: handleItemDragEnd,
          }),
        );

        return acc;
      }, {}),
    [
      categories,
      categorizedItems,
      draggable,
      selectedItemId,
      revealContentOnHover,
    ],
  );

  useEffect(() => {
    if (!heroApi?.setInteractiveState || !viewId) return;

    heroApi.setInteractiveState(viewId, {
      type: "objectClassification",
      completed,
      score,
      countsTowardScore,
      selectedItemId,
      placements,
      correctCount,
      totalCount: totalItems,
      bankCount: bankItems.length,
      payload: {
        placements,
        correctCount,
        totalCount: totalItems,
        bankCount: bankItems.length,
        categoryCount: categories.length,
        layoutVariant: "bankTop",
      },
    });
  }, [
    heroApi,
    viewId,
    completed,
    score,
    countsTowardScore,
    selectedItemId,
    placements,
    correctCount,
    totalItems,
    bankItems.length,
    categories.length,
  ]);

  useEffect(() => {
    if (!completed || completionSentRef.current) return;

    completionSentRef.current = true;

    onComplete?.({
      completed: true,
      score,
      correctCount,
      totalCount: totalItems,
      placements,
      countsTowardScore,
    });
  }, [
    completed,
    score,
    correctCount,
    totalItems,
    placements,
    countsTowardScore,
    onComplete,
  ]);

  const activeSelectionLabel = selectedItemId
    ? buildHoverLabel(itemMap.get(selectedItemId)?.title, "Objeto seleccionado")
    : null;

  return (
    <section className={getMainPanelClass()}>
      {panelTitle ? (
        <div className={getPanelTitleClass()}>
          <Typography
            content={{
              ...panelTitle,
              variant: panelTitle?.variant ?? "body2",
            }}
          />
        </div>
      ) : null}

      <section
        onDrop={handleBankDrop}
        onDragOver={preventDropDefault}
        onClick={handleBankClick}
        className={getBankClass(selectedItemId)}
      >
        {/* <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
            {bankTitle ? (
              <div className="rounded-full bg-[linear-gradient(90deg,rgba(190,236,255,0.18),rgba(124,188,255,0.08))] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                <Typography
                  content={{
                    ...bankTitle,
                    variant: bankTitle?.variant ?? "label",
                  }}
                />
              </div>
            ) : null}

            <div className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/80 sm:text-xs">
              {bankItems.length} disponibles
            </div>
          </div> */}

        <div className="min-h-0 w-full min-w-0 overflow-visible lg:overflow-hidden">
          <CollageCard
            items={normalizedBankItems}
            selectedIds={
              selectedIds.length
                ? selectedIds
                : selectedItemId
                  ? [selectedItemId]
                  : []
            }
            columns={bankColumns}
            rows={bankRows}
            slotCount={Math.max(bankItems.length, bankColumns)}
            className="p-0"
            gridClassName="max-w-none items-stretch justify-items-stretch"
            slotClassName={getBankSlotClass()}
            emptySlotClassName="rounded-[1rem] border-white/10 bg-white/[0.035]"
          />
        </div>
      </section>

      <div className={getCategoryGridClass()}>
        {categories.map((category) => {
          const tone = getCategoryTone(category.id);
          const categoryItems = normalizedCategoryItems[category.id] ?? [];

          return (
            <section
              key={category.id}
              onDrop={(event) => handleCategoryDrop(event, category.id)}
              onDragOver={preventDropDefault}
              onClick={() => handleCategoryClick(category.id)}
              className={getCategoryClass(tone, selectedItemId)}
            >
              <div
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
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

              <div className="min-h-0 flex-1 overflow-visible lg:overflow-hidden">
                <CollageCard
                  items={categoryItems}
                  selectedIds={selectedItemId ? [selectedItemId] : []}
                  columns={categoryColumns}
                  rows={categoryRows}
                  slotCount={totalCategorySlots}
                  className="h-full p-0"
                  gridClassName="max-w-none items-stretch justify-items-stretch"
                  slotClassName={getCategorySlotClass()}
                  emptySlotClassName={cn(
                    "rounded-[1rem] sm:rounded-[1.25rem]",
                    tone.empty,
                  )}
                />
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
