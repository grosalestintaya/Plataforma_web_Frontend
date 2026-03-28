import React from "react";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "owned", label: "Comprados" },
  { key: "shop", label: "Tienda" },
];

export default function StoreFilters({ filter, onChange }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {FILTERS.map((item) => {
        const isActive = filter === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className="rounded-xl border px-4 py-2 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5"
            style={{
              backgroundColor: isActive
                ? "var(--primary)"
                : "var(--usercard-bg)",
              color: isActive
                ? "var(--primary-foreground)"
                : "var(--card-text)",
              borderColor: isActive
                ? "var(--primary)"
                : "var(--usercard-border)",
            }}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
