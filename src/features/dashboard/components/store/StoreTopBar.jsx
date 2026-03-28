import React from "react";

function StatChip({ label, value, bg, color, borderColor }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3 shadow-sm"
      style={{
        backgroundColor: bg,
        color,
        borderColor,
      }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
        {label}
      </p>
      <p className="mt-1 text-base font-extrabold md:text-lg">{value}</p>
    </div>
  );
}

export default function StoreTopBar({ wallet, equippedAvatarName }) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h2
          className="text-xl font-extrabold tracking-tight md:text-2xl"
          style={{ color: "var(--card-text)" }}>
          Tienda de avatares
        </h2>

        <p
          className="mt-1 max-w-2xl text-sm md:text-base"
          style={{ color: "var(--card-muted)" }}>
          Compra apariencias nuevas y equipa la que mejor represente tu perfil.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatChip
          label="Monedas"
          value={wallet?.coins_total ?? 0}
          bg="var(--coin-panel-bg)"
          color="var(--coin-panel-text)"
          borderColor="var(--usercard-border)"
        />

        <StatChip
          label="Avatar actual"
          value={equippedAvatarName}
          bg="var(--usercard-bg)"
          color="var(--sidebar)"
          borderColor="var(--usercard-border)"
        />
      </div>
    </div>
  );
}
