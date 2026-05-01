import CollageCard from "../grouper/CollageCard";
import Calculator from "./Calculator";

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
  return (
    <div className="grid h-full min-h-0 w-full gap-3 lg:grid-cols-[1.55fr_0.9fr]">
      <div className="min-h-0 overflow-hidden rounded-2xl p-2.5 md:p-3">
        <CollageCard
          items={items}
          selectable
          selectedIds={selectedIds}
          onSelect={onToggleItem}
          columns={columns}
          rows={rows}
          className="h-full content-start gap-3"
          style={{
            "--card-slot-height":
              "min(300px, calc(var(--hero-height, 100vh) * 0.33))",
            "--card-media-max-height":
              "min(190px, calc(var(--hero-height, 100vh) * 0.21))",
            "--card-content-reserve": "108px",
          }}
        />
      </div>

      <div className="min-h-0 overflow-hidden rounded-2xl p-2.5 md:p-3">
        <Calculator
          data={calculatorData}
          items={selectedItems}
          total={total}
          balance={balance}
          onSubmit={onSubmit}
          onRemoveItem={onRemoveItem}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
