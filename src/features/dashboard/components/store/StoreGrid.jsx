import React from "react";
import AvatarCard from "./AvatarCard";

function StoreSkeletonCard() {
  return (
    <div
      className="rounded-[24px] border p-4 shadow-sm"
      style={{
        backgroundColor: "var(--chip-bg)",
        borderColor: "var(--card-border)",
      }}>
      <div
        className="h-6 w-28 animate-pulse rounded"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-4 h-52 animate-pulse rounded-2xl"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-4 h-5 w-44 animate-pulse rounded"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-3 h-4 w-full animate-pulse rounded"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-2 h-4 w-4/5 animate-pulse rounded"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-4 h-12 animate-pulse rounded-2xl"
        style={{ backgroundColor: "var(--progress-track)" }}
      />
    </div>
  );
}

export default function StoreGrid({
  avatars,
  loading,
  currentCoins,
  busyAvatarId,
  onPurchase,
  onEquip,
}) {
  return (
    <div className="h-full min-h-0 overflow-y-auto pr-1 pt-1">
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <StoreSkeletonCard key={index} />
          ))}
        </div>
      ) : !avatars.length ? (
        <div
          className="rounded-2xl border px-6 py-10 text-center shadow-sm"
          style={{
            backgroundColor: "var(--chip-bg)",
            borderColor: "var(--card-border)",
          }}>
          <p
            className="text-base font-bold"
            style={{ color: "var(--card-text)" }}>
            No hay avatares para mostrar.
          </p>

          <p className="mt-2 text-sm" style={{ color: "var(--card-muted)" }}>
            Cambia el filtro para ver más opciones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {avatars.map((avatar) => (
            <AvatarCard
              key={avatar.id_avatar}
              avatar={avatar}
              currentCoins={currentCoins}
              busy={busyAvatarId === avatar.id_avatar}
              onPurchase={onPurchase}
              onEquip={onEquip}
            />
          ))}
        </div>
      )}
    </div>
  );
}
