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
  total = 0,
  balance = 0,
  onToggleItem,
  onRemoveItem,
  onSubmit,
  disabled = false,
  columns = 3,
  rows = 2,
}) {
  const shoppingItems = useMemo(() => {
    return items.map(normalizeShoppingItem);
  }, [items]);

  return (
    <div className="grid min-h-full w-full min-w-0 gap-3 overflow-visible lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.9fr)] lg:overflow-hidden">
      <section className="min-h-[18rem] min-w-0 overflow-visible rounded-2xl border border-white/10 bg-white/5 p-3 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <CollageCard
          items={shoppingItems}
          selectedIds={selectedIds}
          onSelect={onToggleItem}
          columns={columns}
          rows={rows}
        />
      </section>

      <section className="min-h-[18rem] min-w-0 overflow-visible rounded-2xl lg:h-full lg:min-h-0 lg:overflow-hidden">
        <Calculator
          data={calculatorData}
          items={selectedItems}
          total={total}
          balance={balance}
          onSubmit={onSubmit}
          onRemoveItem={onRemoveItem}
          disabled={disabled}
        />
      </section>
    </div>
  );
}
