import { useMemo } from "react";
import CollageCard from "../grouper/CollageCard";
import Calculator from "./Calculator";

function normalizeShoppingItem(item) {
  return {
    ...item,
    interaction: item?.interaction ?? { type: "selectable" },
    zoomable: false,
  };
}

export default function Shopping({
  items = [],
  selectedIds = [],
  selectedItems = [],
  calculatorData,
  initialBalance = 0,
  total = 0,
  balance = 0,
  errorMessage = null,
  onToggleItem,
  onRemoveItem,
  onSubmit,
  disabled = false,
  columns = 3,
  rows = 2,
  hideCalculator = false,
  layout = "default",
}) {
  const shoppingItems = useMemo(() => {
    return items.map(normalizeShoppingItem);
  }, [items]);

  const desktopLayoutClass =
    layout === "balanced"
      ? "lg:grid-cols-[minmax(0,1.18fr)_minmax(23rem,1fr)]"
      : "lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.9fr)]";

  return (
    <div
      className={
        hideCalculator
          ? "grid min-h-full w-full min-w-0 gap-3 overflow-visible lg:h-full lg:min-h-0 lg:grid-cols-1 lg:items-stretch"
          : `grid min-h-full w-full min-w-0 gap-3 overflow-visible lg:h-full lg:min-h-0 lg:items-stretch ${desktopLayoutClass}`
      }
    >
      <section className="min-h-[18rem] min-w-0 overflow-visible rounded-2xl border border-white/10 bg-white/5 p-3 lg:h-full lg:min-h-0">
        <CollageCard
          items={shoppingItems}
          selectedIds={selectedIds}
          onSelect={onToggleItem}
          columns={columns}
          rows={rows}
        />
      </section>

      {!hideCalculator ? (
        <Calculator
          data={calculatorData}
          items={selectedItems}
          initialBalance={initialBalance}
          total={total}
          balance={balance}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onRemoveItem={onRemoveItem}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}
