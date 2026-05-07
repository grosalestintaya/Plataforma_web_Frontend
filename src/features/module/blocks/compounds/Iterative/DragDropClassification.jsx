import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";
import Card from "@/features/module/blocks/compounds/container/Card";
import CollageCard from "@/features/module/blocks/compounds/grouper/CollageCard";
import { cn } from "@/shared/libs/utils";

const DEFAULT_CATEGORIES = [
  {
    id: "need",
    title: { text: "Necesidad", variant: "h4", align: "center" },
  },
  {
    id: "desire",
    title: { text: "Deseo", variant: "h4", align: "center" },
  },
];

function normalizeTextNode(value, fallbackVariant = "label") {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return {
      text: String(value),
      variant: fallbackVariant,
      align: "center",
    };
  }

  return value;
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
  return {
    id: category?.id ?? `category-${index + 1}`,
    title: normalizeTextNode(
      category?.title ?? category?.label ?? category?.name,
      "h4",
    ),
    emptyLabel:
      category?.emptyLabel ??
      "Arrastra o selecciona un objeto para clasificarlo aqui.",
  };
}

function normalizeItem(item, index) {
  return {
    id: item?.id ?? `object-${index + 1}`,
    title: normalizeTextNode(
      item?.title ?? item?.label ?? item?.name ?? `Obj ${index + 1}`,
      "caption",
    ),
    media: item?.media ?? item?.image ?? null,
    correctCategoryId:
      item?.correctCategoryId ??
      item?.correctCategory ??
      item?.categoryId ??
      item?.answer ??
      null,
  };
}

function emitClassificationResult(heroApi, view, payload) {
  heroApi?.setInteractiveState?.(view?.id ?? view?.viewId, {
    completed: true,
    type: "objectClassification",
    ...payload,
  });
}

function navigateAfterStateCommit(navigate) {
  if (typeof window === "undefined") {
    navigate?.();
    return;
  }

  window.requestAnimationFrame(() => {
    navigate?.();
  });
}

function ObjectTile({
  item,
  selected = false,
  compact = false,
  revealContentOnHover = false,
  onClick,
  onDragStart,
  onDragEnd,
}) {
  const compactTileSize =
    "calc(min(var(--card-slot-width, 100cqw), var(--dragdrop-zone-slot-height, var(--dragdrop-compact-slot-height, 100cqh))) - 8px)";
  const tileSize = compact
    ? null
    : "max(80px, calc(min(var(--card-slot-width, 100cqw), var(--dragdrop-zone-slot-height, var(--card-slot-height, 100cqh))) - 4px))";
  const hoverTitle = {
    ...(item?.title ?? {}),
    text: getDisplayText(item?.title, "Objeto"),
    variant: "caption",
    align: "center",
    className: cn(
      "text-white",
      compact ? "text-[11px] leading-[1.05]" : "text-xs leading-[1.05]",
    ),
  };
  const tileMedia = item?.media?.src
    ? {
        ...item.media,
        alt: item.media.alt ?? getDisplayText(item?.title, "Objeto"),
        variant: "square",
      }
    : null;

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 items-center justify-center p-0.5">
      <button
        type="button"
        draggable
        onClick={onClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          "inline-flex max-h-full max-w-full shrink-0 items-center justify-center border border-black/55 bg-transparent text-center transition",
          "cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          "rounded-none p-0.5",
          selected && "border-yellow-300 bg-yellow-300/15 text-yellow-50",
        )}
        style={
          compact
            ? {
                width: compactTileSize,
                height: compactTileSize,
              }
            : { width: tileSize, height: tileSize }
        }
      >
        <div
          className="aspect-square flex h-full w-full items-center justify-center overflow-hidden rounded-none border border-black/55 bg-transparent p-0.5"
        >
          <Card
            as="div"
            density="compact"
            fillContainer
            media={tileMedia}
            title={hoverTitle}
            revealContentOnHover={revealContentOnHover}
            className="h-full w-full rounded-none border-black/45 bg-black/5 p-0.5 shadow-none"
            mediaClassName="rounded-none border-black/45 bg-black/5 p-0"
            contentClassName="px-1 py-1"
          />
        </div>
      </button>
    </div>
  );
}

function getRegularSlotMetrics(rowCount = 1) {
  if (rowCount >= 4) {
    return {
      slotClassName: "min-h-[102px] self-start",
      slotHeight: "102px",
      mediaMaxHeight: "80px",
    };
  }

  if (rowCount >= 3) {
    return {
      slotClassName: "min-h-[104px] self-start",
      slotHeight: "104px",
      mediaMaxHeight: "80px",
    };
  }

  return {
    slotClassName: "min-h-[112px] self-start",
    slotHeight: "112px",
    mediaMaxHeight: "88px",
  };
}

function getCompactCategoryMetrics(visibleRows = 2) {
  if (visibleRows <= 1) {
    return {
      slotClassName: "min-h-0 h-full self-start",
      overflowSlotClassName:
        "h-[var(--dragdrop-zone-slot-height)] min-h-[var(--dragdrop-zone-slot-height)] self-start",
      mediaMaxHeight: "calc(var(--dragdrop-zone-slot-height, 100cqh) - 28px)",
    };
  }

  return {
    slotClassName: "min-h-0 h-full self-start",
    overflowSlotClassName:
      "h-[var(--dragdrop-zone-slot-height)] min-h-[var(--dragdrop-zone-slot-height)] self-start",
    mediaMaxHeight: "calc(var(--dragdrop-zone-slot-height, 100cqh) - 28px)",
  };
}

function ObjectDropZone({
  category,
  items,
  compact = false,
  columnCount,
  slotCount,
  rowCount,
  visibleRows,
  overflowing = false,
  slotClassName = "",
  dragOver = false,
  onDrop,
  onDragEnter,
  onDragOver,
  onClick,
  renderTile,
}) {
  const viewportRef = useRef(null);
  const [compactSlotPixels, setCompactSlotPixels] = useState(null);
  const hasFixedViewportRows =
    Number.isFinite(Number(visibleRows)) && Number(visibleRows) > 0;
  const regularMetrics = getRegularSlotMetrics(rowCount);
  const compactMetrics = getCompactCategoryMetrics(visibleRows);
  const viewportMetrics =
    compact || hasFixedViewportRows
      ? compactMetrics
      : regularMetrics;
  const resolvedSlotClassName =
    compact || hasFixedViewportRows
      ? overflowing
        ? viewportMetrics.overflowSlotClassName
        : viewportMetrics.slotClassName
      : regularMetrics.slotClassName;
  const slotHeight = compact ? "100cqh" : regularMetrics.slotHeight;
  const mediaMaxHeight =
    compact || hasFixedViewportRows
      ? viewportMetrics.mediaMaxHeight
      : regularMetrics.mediaMaxHeight;

  useEffect(() => {
    if (!(compact || hasFixedViewportRows)) return undefined;

    const element = viewportRef.current;
    if (!element) return undefined;

    const rows = Math.max(1, Number(visibleRows) || 1);
    const gap = 4;

    const updateSlotPixels = () => {
      const height = element.getBoundingClientRect().height;
      if (!Number.isFinite(height) || height <= 0) return;

      const nextSlotPixels = Math.max(
        96,
        Math.floor((height - Math.max(0, rows - 1) * gap) / rows),
      );
      setCompactSlotPixels((prev) =>
        prev === nextSlotPixels ? prev : nextSlotPixels,
      );
    };

    updateSlotPixels();

    const observer = new ResizeObserver(() => {
      updateSlotPixels();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [compact, hasFixedViewportRows, visibleRows]);

  const compactViewportStyle = compactSlotPixels
    ? {
        "--dragdrop-zone-slot-height": `${compactSlotPixels}px`,
        "--dragdrop-compact-slot-height": `${compactSlotPixels}px`,
      }
    : undefined;

  return (
    <div
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "flex h-full min-h-0 cursor-pointer flex-col overflow-hidden border border-black/55 bg-transparent p-1 transition",
        dragOver && "bg-white/10",
      )}
    >
      <div className="shrink-0 border border-black/55 px-2.5 py-0.5 text-center">
        <Typography
          content={{
            ...category.title,
            variant: category.title?.variant ?? "label",
          }}
          variant={category.title?.variant ?? "label"}
          align={category.title?.align ?? "center"}
        />
      </div>

      <div
        ref={viewportRef}
        className="mt-0.5 min-h-0 flex-1 overflow-hidden"
        style={compactViewportStyle}
      >
        <div
          className={cn(
            "h-full min-h-0",
            compact || hasFixedViewportRows
              ? overflowing
                ? "overflow-y-auto overflow-x-hidden pr-0.5"
                : "overflow-hidden"
              : "overflow-hidden",
          )}
        >
          <CollageCard
            items={items}
            columns={Math.max(1, Number(columnCount) || (compact ? 3 : 2))}
            rows={rowCount}
            slotCount={slotCount}
            rowMode={
              compact || hasFixedViewportRows
                ? overflowing
                  ? "auto"
                  : "fr"
                : "auto"
            }
            trackProgress={false}
            className={cn(
              "min-h-0 items-stretch justify-start",
              compact || hasFixedViewportRows
                ? overflowing
                  ? "h-auto overflow-visible"
                  : "h-full overflow-hidden"
                : "",
            )}
            gridClassName={cn(
              "content-start place-items-start gap-1",
              compact || hasFixedViewportRows
                ? overflowing
                  ? "h-auto overflow-visible"
                  : "h-full overflow-hidden"
                : "h-full overflow-y-auto overflow-x-hidden pr-0.5",
            )}
            itemSlotClassName={cn("min-h-0", resolvedSlotClassName)}
            renderItem={renderTile}
            renderEmptySlot={() => <EmptyCollageSlot />}
            style={{
              ...(
                compact || hasFixedViewportRows
                  ? {}
                  : { "--card-slot-height": slotHeight }
              ),
              ...(
                compact || hasFixedViewportRows
                  ? {}
                  : { "--card-media-max-height": mediaMaxHeight }
              ),
              "--card-content-reserve": "14px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function CompletedBankNotice({ continueLabel, onClear, onContinue }) {
  return (
    <div className="pointer-events-auto sticky top-0 relative z-20 col-span-full flex min-h-[96px] flex-col items-center justify-center gap-3 border border-dashed border-black/55 bg-[rgba(255,88,44,0.92)] px-2 py-3 text-center">
      <div className="text-sm text-white/80">
        Todos los objetos ya fueron clasificados.
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" label="Limpiar" onClick={onClear} />
        <Button variant="primary" label={continueLabel} onClick={onContinue} />
      </div>
    </div>
  );
}

function EmptyCollageSlot() {
  return <div className="h-full w-full rounded-none border border-black/35 bg-transparent" />;
}

function renderTileFactory({
  compact = false,
  revealContentOnHover = false,
  selectedItemId,
  handleItemClick,
  handleTileDragStart,
  handleTileDragEnd,
}) {
  return function renderTile({ item }) {
    return (
      <ObjectTile
        item={item}
        compact={compact}
        revealContentOnHover={revealContentOnHover}
        selected={selectedItemId === item.id}
        onClick={() => handleItemClick(item.id)}
        onDragStart={(event) => handleTileDragStart(event, item.id)}
        onDragEnd={handleTileDragEnd}
      />
    );
  };
}

export default function DragDropClassification({ config, view, heroApi }) {
  const viewId = view?.id ?? view?.viewId;

  const categories = useMemo(() => {
    const source =
      Array.isArray(config?.categories) && config.categories.length > 0
        ? config.categories
        : DEFAULT_CATEGORIES;

    return source.map(normalizeCategory);
  }, [config?.categories]);

  const items = useMemo(
    () => (Array.isArray(config?.items) ? config.items.map(normalizeItem) : []),
    [config?.items],
  );

  const layoutVariant = config?.layoutVariant ?? "bankLeft";
  const compactTiles = layoutVariant === "bankTop";
  const panelTitle = config?.panelTitle ?? "Clasifica los diferentes objetos";
  const bankColumnsOverride = Number(config?.bankColumns);
  const bankRowsOverride = Number(config?.bankRows);
  const categoryColumnsOverride = Number(config?.categoryColumns);
  const categoryRowsOverride = Number(config?.categoryRows);
  const revealContentOnHover = Boolean(config?.revealContentOnHover);

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);
  const [placements, setPlacements] = useState({});

  useEffect(() => {
    setSelectedItemId(null);
    setDraggedItemId(null);
    setDragOverZone(null);
    setPlacements({});
  }, [viewId]);

  const unassignedItems = useMemo(
    () => items.filter((item) => !placements[item.id]),
    [items, placements],
  );

  const bankColumns =
    layoutVariant === "bankTop"
      ? Math.max(1, bankColumnsOverride || items.length || 1)
      : Math.max(1, bankColumnsOverride || 2);
  const initialBankRows = Math.max(
    1,
    bankRowsOverride || Math.ceil(items.length / bankColumns),
  );
  const bankRows =
    layoutVariant === "bankTop"
      ? initialBankRows
      : Math.max(
          1,
          bankRowsOverride || Math.ceil(Math.max(unassignedItems.length, 1) / bankColumns),
        );
  const bankSlotCount = bankColumns * bankRows;
  const bankTopHeight = `${initialBankRows * 112 + Math.max(0, initialBankRows - 1) * 4 + 24}px`;
  const bankTopSlotClassName = "min-h-[112px] self-start";
  const bankLeftMetrics = getRegularSlotMetrics(bankRows);
  const bankLeftSlotClassName = bankLeftMetrics.slotClassName;
  const categorySlotClassName = compactTiles
    ? "min-h-[112px] self-start"
    : "min-h-[112px] self-start";

  const groupedItems = useMemo(() => {
    const groups = Object.fromEntries(categories.map((category) => [category.id, []]));

    items.forEach((item) => {
      const categoryId = placements[item.id];
      if (!categoryId) return;
      if (!groups[categoryId]) groups[categoryId] = [];
      groups[categoryId].push(item);
    });

    return groups;
  }, [categories, items, placements]);

  const categorySlotMeta = useMemo(() => {
    const columnCount = Math.max(
      1,
      categoryColumnsOverride || (compactTiles ? 3 : 2),
    );
    if (compactTiles) {
      const configuredVisibleRows = Math.max(1, categoryRowsOverride || 2);
      const baseVisibleSlotCount = configuredVisibleRows * columnCount;

      return Object.fromEntries(
        categories.map((category) => {
          const currentCount = groupedItems[category.id]?.length ?? 0;
          const requiredRows = Math.max(
            configuredVisibleRows,
            Math.ceil(Math.max(currentCount, 1) / columnCount),
          );
          const overflowing = requiredRows > configuredVisibleRows;

          return [
            category.id,
            {
              columns: columnCount,
              rows: overflowing ? requiredRows : configuredVisibleRows,
              visibleRows: configuredVisibleRows,
              slotCount: Math.max(currentCount, baseVisibleSlotCount),
              overflowing,
            },
          ];
        }),
      );
    }

    return Object.fromEntries(
      categories.map((category) => {
        const currentCount = groupedItems[category.id]?.length ?? 0;
        const configuredVisibleRows = Math.max(1, categoryRowsOverride || 1);
        const baseVisibleSlotCount = configuredVisibleRows * columnCount;
        const requiredRows = Math.max(
          configuredVisibleRows,
          Math.ceil(Math.max(currentCount, 1) / columnCount),
        );
        const overflowing = requiredRows > configuredVisibleRows;

        return [
          category.id,
          {
            columns: columnCount,
            rows: overflowing ? requiredRows : configuredVisibleRows,
            visibleRows: configuredVisibleRows,
            slotCount: Math.max(currentCount, baseVisibleSlotCount),
            overflowing,
          },
        ];
      }),
    );
  }, [
    categories,
    categoryColumnsOverride,
    categoryRowsOverride,
    compactTiles,
    groupedItems,
    items,
  ]);

  const assignedCount = Object.keys(placements).length;
  const totalItems = items.length;
  const allAssigned = totalItems > 0 && assignedCount === totalItems;
  const correctCount = items.filter(
    (item) => placements[item.id] === item.correctCategoryId,
  ).length;
  const incorrectCount = assignedCount - correctCount;
  const score = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;

  function resolveDraggedItemId(event) {
    const fromTransfer = event?.dataTransfer?.getData?.("text/plain");
    return fromTransfer || draggedItemId || selectedItemId || null;
  }

  function assignItem(itemId, categoryId) {
    if (!itemId || !categoryId) return;

    setPlacements((prev) => ({
      ...prev,
      [itemId]: categoryId,
    }));
    setSelectedItemId(null);
    setDraggedItemId(null);
    setDragOverZone(null);
  }

  function unassignItem(itemId) {
    if (!itemId) return;

    setPlacements((prev) => {
      if (!prev[itemId]) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setSelectedItemId(null);
    setDraggedItemId(null);
    setDragOverZone(null);
  }

  function handleItemClick(itemId) {
    setSelectedItemId((prev) => {
      if (prev !== itemId) return itemId;

      if (placements[itemId]) {
        unassignItem(itemId);
      }

      return null;
    });
  }

  function placeSelectedItem(categoryId) {
    if (!selectedItemId) return;
    assignItem(selectedItemId, categoryId);
  }

  function clearPlacements() {
    setSelectedItemId(null);
    setDraggedItemId(null);
    setDragOverZone(null);
    setPlacements({});
  }

  function continueFlow() {
    if (!allAssigned) return;

    const result = {
      assignedCount,
      correctCount,
      incorrectCount,
      totalItems,
      score,
      placements,
    };

    emitClassificationResult(heroApi, view, result);
    navigateAfterStateCommit(() => {
      heroApi?.advanceCurrentView?.();
    });
  }

  function handleTileDragStart(event, itemId) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);
    setDraggedItemId(itemId);
    setSelectedItemId(itemId);
  }

  function handleTileDragEnd() {
    setDraggedItemId(null);
    setDragOverZone(null);
  }

  function handleZoneDragOver(event, zoneId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverZone !== zoneId) {
      setDragOverZone(zoneId);
    }
  }

  function handleCategoryDrop(event, categoryId) {
    event.preventDefault();
    const itemId = resolveDraggedItemId(event);
    assignItem(itemId, categoryId);
  }

  function handleBankDrop(event) {
    event.preventDefault();
    const itemId = resolveDraggedItemId(event);
    unassignItem(itemId);
  }

  const renderCompactTile = renderTileFactory({
    compact: true,
    revealContentOnHover,
    selectedItemId,
    handleItemClick,
    handleTileDragStart,
    handleTileDragEnd,
  });

  const renderRegularTile = renderTileFactory({
    compact: false,
    revealContentOnHover,
    selectedItemId,
    handleItemClick,
    handleTileDragStart,
    handleTileDragEnd,
  });

  if (layoutVariant === "bankTop") {
    return (
      <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        <div className="shrink-0 border border-black/55 px-3 py-1 text-center">
          <Typography
            content={{ text: panelTitle, variant: "label", align: "center" }}
          />
        </div>

        <div
          onDragEnter={() => setDragOverZone("bank")}
          onDragOver={(event) => handleZoneDragOver(event, "bank")}
          onDrop={handleBankDrop}
          className={cn(
            "shrink-0 overflow-hidden border border-black/55 p-0.5 transition",
            dragOverZone === "bank" && "bg-white/10",
          )}
          style={{ height: bankTopHeight }}
        >
          <div className="h-full min-h-0 overflow-hidden">
            <CollageCard
              items={unassignedItems}
              columns={bankColumns}
              rows={initialBankRows}
              slotCount={bankSlotCount}
              rowMode="auto"
              trackProgress={false}
              className="min-h-0 items-stretch justify-start"
              gridClassName="h-full content-start place-items-start gap-1 overflow-x-auto overflow-y-hidden pb-0.5"
              itemSlotClassName={bankTopSlotClassName}
              emptyState={
                <CompletedBankNotice
                  continueLabel={
                    config?.submitLabel ?? heroApi?.advanceLabel ?? "Continuar"
                  }
                  onClear={clearPlacements}
                  onContinue={continueFlow}
                />
              }
              renderItem={renderCompactTile}
              renderEmptySlot={() => <EmptyCollageSlot />}
              style={{
                "--card-slot-height": "108px",
                "--card-media-max-height": "86px",
                "--card-content-reserve": "14px",
              }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 border border-black/55 p-0.5">
          <div className="grid h-full min-h-0 gap-1 md:grid-cols-2">
            {categories.map((category) => (
              <ObjectDropZone
                key={category.id}
                category={category}
                items={groupedItems[category.id] ?? []}
                compact
                columnCount={categorySlotMeta[category.id]?.columns}
                slotCount={categorySlotMeta[category.id]?.slotCount}
                rowCount={categorySlotMeta[category.id]?.rows}
                visibleRows={categorySlotMeta[category.id]?.visibleRows}
                overflowing={categorySlotMeta[category.id]?.overflowing}
                slotClassName={categorySlotClassName}
                dragOver={dragOverZone === category.id}
                onClick={() => placeSelectedItem(category.id)}
                onDragEnter={() => setDragOverZone(category.id)}
                onDragOver={(event) => handleZoneDragOver(event, category.id)}
                onDrop={(event) => handleCategoryDrop(event, category.id)}
                renderTile={renderCompactTile}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 grid min-h-0 flex-1 gap-1.5 lg:grid-cols-[minmax(300px,_0.3fr)_minmax(0,_0.7fr)]">
      <div
        onDragEnter={() => setDragOverZone("bank")}
        onDragOver={(event) => handleZoneDragOver(event, "bank")}
        onDrop={handleBankDrop}
        className={cn(
          "flex min-h-0 flex-col overflow-hidden border border-black/55 p-0.5 transition",
          dragOverZone === "bank" && "bg-white/10",
        )}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <CollageCard
            items={unassignedItems}
            columns={2}
            rows={bankRows}
            slotCount={bankSlotCount}
            rowMode="auto"
            trackProgress={false}
            className="min-h-0 items-stretch justify-start"
            gridClassName="h-full content-start place-items-start gap-1 overflow-y-auto overflow-x-hidden pr-0.5"
            itemSlotClassName={bankLeftSlotClassName}
            emptyState={
              <CompletedBankNotice
                continueLabel={
                  config?.submitLabel ?? heroApi?.advanceLabel ?? "Continuar"
                }
                onClear={clearPlacements}
                onContinue={continueFlow}
              />
            }
            renderItem={renderRegularTile}
            renderEmptySlot={() => <EmptyCollageSlot />}
            style={{
              "--card-slot-height": bankLeftMetrics.slotHeight,
              "--card-media-max-height": bankLeftMetrics.mediaMaxHeight,
              "--card-content-reserve": "14px",
            }}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden border border-black/55 p-0.5">
        <div className="shrink-0 border border-black/55 px-3 py-1 text-center">
          <Typography
            content={{ text: panelTitle, variant: "label", align: "center" }}
          />
        </div>

        <div className="mt-0.5 min-h-0 flex-1 border border-black/55 p-0.5">
          <div className="grid h-full min-h-0 gap-1 md:grid-cols-2">
            {categories.map((category) => (
              <ObjectDropZone
                key={category.id}
                category={category}
                items={groupedItems[category.id] ?? []}
                columnCount={categorySlotMeta[category.id]?.columns}
                slotCount={categorySlotMeta[category.id]?.slotCount}
                rowCount={categorySlotMeta[category.id]?.rows}
                visibleRows={categorySlotMeta[category.id]?.visibleRows}
                overflowing={categorySlotMeta[category.id]?.overflowing}
                slotClassName={categorySlotClassName}
                dragOver={dragOverZone === category.id}
                onClick={() => placeSelectedItem(category.id)}
                onDragEnter={() => setDragOverZone(category.id)}
                onDragOver={(event) => handleZoneDragOver(event, category.id)}
                onDrop={(event) => handleCategoryDrop(event, category.id)}
                renderTile={renderRegularTile}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
