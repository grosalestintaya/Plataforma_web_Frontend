import { useEffect, useMemo, useState } from "react";
import Button from "@/features/module/blocks/base/Action/Button";
import Image from "@/features/module/blocks/base/Media/Image";
import { getMediaAspectRatio } from "@/features/module/blocks/base/Media/mediaVariant";
import Typography from "@/features/module/blocks/base/Typography";
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
  onClick,
  onDragStart,
  onDragEnd,
}) {
  const imageAspectRatio =
    getMediaAspectRatio(item?.media) ?? getMediaAspectRatio("square") ?? "1 / 1";

  return (
    <button
      type="button"
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "flex h-full w-full min-h-0 items-center justify-center border border-black/55 bg-transparent text-center transition",
        "cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        "rounded-none p-0.5",
        selected && "border-yellow-300 bg-yellow-300/15 text-yellow-50",
      )}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-none border border-black/55 bg-transparent p-0.5">
        <div
          className="group/tile relative aspect-square h-full max-w-full overflow-hidden border border-black/45 bg-black/5"
          style={{ aspectRatio: imageAspectRatio }}
        >
          {item?.media?.src ? (
            <Image
              src={item.media.src}
              alt={item.media.alt ?? getDisplayText(item?.title, "Objeto")}
              variant={item.media.variant ?? "square"}
              className="h-full w-full"
              imgClassName="block h-full w-full object-cover"
            />
          ) : null}

          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 flex items-end border-t border-black/45",
              "bg-gradient-to-t from-black/60 via-black/35 to-transparent px-1 py-1 backdrop-blur-[1px]",
              "translate-y-[74%] transition-transform duration-200 ease-out group-hover/tile:translate-y-0 group-focus-within/tile:translate-y-0",
            )}
          >
            <Typography
              content={{
                ...(item?.title ?? {}),
                variant: "caption",
                align: "center",
              }}
              variant="caption"
              align="center"
              className={cn(
                "block w-full truncate text-center text-white",
                compact ? "text-[11px] leading-[1.05]" : "text-xs leading-[1.05]",
              )}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

function ObjectDropZone({
  category,
  items,
  compact = false,
  slotCount,
  rowCount,
  slotClassName = "",
  dragOver = false,
  onDrop,
  onDragEnter,
  onDragOver,
  onClick,
  renderTile,
}) {
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

      <CollageCard
        items={items}
        columns={compact ? 3 : 2}
        rows={rowCount}
        slotCount={slotCount}
        rowMode="fr"
        trackProgress={false}
        className="mt-0.5 flex-1 min-h-0 items-stretch justify-start"
        gridClassName="h-full content-start place-items-stretch gap-1 overflow-auto pr-0.5"
        itemSlotClassName={cn("h-full min-h-0", slotClassName)}
        renderItem={renderTile}
        renderEmptySlot={() => <EmptyCollageSlot />}
        style={{
          "--card-slot-height": compact ? "108px" : "132px",
          "--card-media-max-height": compact ? "84px" : "102px",
          "--card-content-reserve": "14px",
        }}
      />
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
  const bankSlotCount = bankColumns * initialBankRows;
  const bankTopHeight = `${initialBankRows * 112 + Math.max(0, initialBankRows - 1) * 4 + 6}px`;
  const bankTopSlotClassName = "min-h-[112px]";
  const bankLeftSlotClassName = "min-h-[98px]";
  const categorySlotClassName = "";

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
    const sharedItemCapacity = Math.max(
      ...categories.map((category) => {
        const baselineCount = items.filter(
          (item) => item.correctCategoryId === category.id,
        ).length;
        const currentCount = groupedItems[category.id]?.length ?? 0;
        return Math.max(baselineCount, currentCount, columnCount);
      }),
    );
    const sharedRows = Math.max(
      1,
      categoryRowsOverride || Math.ceil(sharedItemCapacity / columnCount),
    );
    const slotCount = sharedRows * columnCount;

    return Object.fromEntries(
      categories.map((category) => [
        category.id,
        {
          columns: columnCount,
          rows: sharedRows,
          slotCount,
        },
      ]),
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
    selectedItemId,
    handleItemClick,
    handleTileDragStart,
    handleTileDragEnd,
  });

  const renderRegularTile = renderTileFactory({
    compact: false,
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
          <CollageCard
            items={unassignedItems}
            columns={bankColumns}
            rows={initialBankRows}
            slotCount={bankSlotCount}
            rowMode="auto"
            trackProgress={false}
            className="h-full min-h-0 items-stretch justify-start"
            gridClassName="h-full content-start place-items-stretch gap-1 overflow-hidden"
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

        <div className="min-h-0 flex-1 border border-black/55 p-0.5">
          <div className="grid h-full min-h-0 gap-1 md:grid-cols-2">
            {categories.map((category) => (
              <ObjectDropZone
                key={category.id}
                category={category}
                items={groupedItems[category.id] ?? []}
                compact
                slotCount={categorySlotMeta[category.id]?.slotCount}
                rowCount={categorySlotMeta[category.id]?.rows}
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
    <div className="mt-1 grid min-h-0 flex-1 gap-1.5 lg:grid-cols-[0.22fr_0.78fr]">
      <div
        onDragEnter={() => setDragOverZone("bank")}
        onDragOver={(event) => handleZoneDragOver(event, "bank")}
        onDrop={handleBankDrop}
        className={cn(
          "flex min-h-0 flex-col overflow-hidden border border-black/55 p-0.5 transition",
          dragOverZone === "bank" && "bg-white/10",
        )}
      >
        <CollageCard
          items={unassignedItems}
          columns={2}
          rows={initialBankRows}
          slotCount={bankSlotCount}
          rowMode="fr"
          trackProgress={false}
          className="h-full min-h-0 items-stretch justify-start"
          gridClassName="h-full content-start place-items-stretch gap-1 overflow-hidden"
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
            "--card-slot-height": "94px",
            "--card-media-max-height": "74px",
            "--card-content-reserve": "14px",
          }}
        />
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
                slotCount={categorySlotMeta[category.id]?.slotCount}
                rowCount={categorySlotMeta[category.id]?.rows}
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
