import React from "react";
import AvatarCard from "./AvatarCard";

function StoreSkeletonCard() {
  return (
    <div
      className="rounded-[16px] border"
      style={{
        aspectRatio: "1 / 1",
        backgroundColor: "var(--chip-bg)",
        borderColor: "var(--card-border)",
        overflow: "hidden",
      }}>
      <div className="flex h-full w-full">
        <div
          className="h-full animate-pulse shrink-0"
          style={{ width: "50%", backgroundColor: "var(--progress-track)" }}
        />
        <div
          className="flex flex-col justify-between p-2"
          style={{ width: "50%" }}>
          <div className="flex flex-col gap-1.5">
            <div
              className="h-3 w-14 animate-pulse rounded-full"
              style={{ backgroundColor: "var(--progress-track)" }}
            />
            <div
              className="h-3 w-10 animate-pulse rounded-full"
              style={{ backgroundColor: "var(--progress-track)" }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div
              className="h-2.5 w-full animate-pulse rounded"
              style={{ backgroundColor: "var(--progress-track)" }}
            />
            <div
              className="h-2.5 w-4/5 animate-pulse rounded"
              style={{ backgroundColor: "var(--progress-track)" }}
            />
          </div>
          <div
            className="h-6 w-full animate-pulse rounded-xl"
            style={{ backgroundColor: "var(--progress-track)" }}
          />
        </div>
      </div>
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
  const gridClass =
    "grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className="h-full min-h-0 overflow-y-auto pr-1 pt-1">
      {loading ? (
        <div className={gridClass}>
          {Array.from({ length: 10 }).map((_, i) => (
            <StoreSkeletonCard key={i} />
          ))}
        </div>
      ) : !avatars.length ? (
        <div
          className="rounded-2xl border px-6 py-10 text-center"
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
        <div className={gridClass}>
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
