import { useMemo, useState } from "react";
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
  selectedIds,
  selectedItems,
  initialSelectedIds = [],
  resetKey,
  calculatorData,
  initialBalance = 0,
  total,
  balance,
  errorMessage,
  onToggleItem,
  onRemoveItem,
  onSubmit,
  onSelectionChange,
  disabled,
  enforceBalance = false,
  insufficientBalanceMessage =
    "No te alcanza ese saldo. Quita un producto o elige una opción más económica.",
  columns = 3,
  rows = 2,
  hideCalculator = false,
  layout = "default",
}) {
  const isControlled = Array.isArray(selectedIds);
  const [uncontrolledState, setUncontrolledState] = useState(() => ({
    resetKey,
    selectedIds: Array.isArray(initialSelectedIds)
      ? initialSelectedIds
      : [],
    error: null,
  }));
  const resolvedUncontrolledState =
    uncontrolledState.resetKey === resetKey
      ? uncontrolledState
      : {
          resetKey,
          selectedIds: Array.isArray(initialSelectedIds)
            ? initialSelectedIds
            : [],
          error: null,
        };

  const shoppingItems = useMemo(() => {
    return items.map(normalizeShoppingItem);
  }, [items]);
  const resolvedSelectedIds = isControlled
    ? selectedIds
    : resolvedUncontrolledState.selectedIds;
  const derivedSelectedItems = useMemo(
    () =>
      shoppingItems.filter((item) =>
        resolvedSelectedIds.includes(item.id),
      ),
    [resolvedSelectedIds, shoppingItems],
  );
  const resolvedSelectedItems = Array.isArray(selectedItems)
    ? selectedItems
    : derivedSelectedItems;
  const derivedTotal = resolvedSelectedItems.reduce(
    (sum, item) => sum + Number(item?.price ?? 0),
    0,
  );
  const resolvedTotal = Number.isFinite(Number(total))
    ? Number(total)
    : derivedTotal;
  const resolvedBalance = Number.isFinite(Number(balance))
    ? Number(balance)
    : Number(initialBalance) - resolvedTotal;
  const resolvedError = errorMessage ?? resolvedUncontrolledState.error;
  const resolvedDisabled =
    disabled ?? resolvedSelectedItems.length === 0;

  const desktopLayoutClass =
    layout === "balanced"
      ? "lg:grid-cols-[minmax(0,1.18fr)_minmax(23rem,1fr)]"
      : "lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.9fr)]";

  function getSelectionPayload(nextIds) {
    const nextItems = shoppingItems.filter((item) =>
      nextIds.includes(item.id),
    );
    const nextTotal = nextItems.reduce(
      (sum, item) => sum + Number(item?.price ?? 0),
      0,
    );

    return {
      selectedIds: nextIds,
      selectedItems: nextItems,
      total: nextTotal,
      balance: Number(initialBalance) - nextTotal,
    };
  }

  function handleToggle(item) {
    if (isControlled) {
      onToggleItem?.(item);
      return;
    }

    const nextIds = resolvedSelectedIds.includes(item.id)
      ? resolvedSelectedIds.filter((id) => id !== item.id)
      : [...resolvedSelectedIds, item.id];
    const payload = getSelectionPayload(nextIds);

    if (enforceBalance && payload.balance < 0) {
      setUncontrolledState({
        resetKey,
        selectedIds: resolvedSelectedIds,
        error: insufficientBalanceMessage,
      });
      return;
    }

    setUncontrolledState({
      resetKey,
      selectedIds: nextIds,
      error: null,
    });
    onSelectionChange?.(payload);
  }

  function handleRemove(item) {
    if (isControlled) {
      onRemoveItem?.(item);
      return;
    }

    const nextIds = resolvedSelectedIds.filter((id) => id !== item.id);
    const payload = getSelectionPayload(nextIds);

    setUncontrolledState({
      resetKey,
      selectedIds: nextIds,
      error: null,
    });
    onSelectionChange?.(payload);
  }

  function handleSubmit() {
    onSubmit?.({
      selectedIds: resolvedSelectedIds,
      selectedItems: resolvedSelectedItems,
      total: resolvedTotal,
      balance: resolvedBalance,
    });
  }

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
          selectedIds={resolvedSelectedIds}
          onSelect={handleToggle}
          columns={columns}
          rows={rows}
        />
      </section>

      {!hideCalculator ? (
        <Calculator
          data={calculatorData}
          items={resolvedSelectedItems}
          initialBalance={initialBalance}
          total={resolvedTotal}
          balance={resolvedBalance}
          errorMessage={resolvedError}
          onSubmit={handleSubmit}
          onRemoveItem={handleRemove}
          disabled={resolvedDisabled}
        />
      ) : null}
    </div>
  );
}
