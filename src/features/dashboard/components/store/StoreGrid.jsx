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
        className="h-6 w-28 rounded animate-pulse"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-4 h-52 rounded-2xl animate-pulse"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-4 h-5 w-44 rounded animate-pulse"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-3 h-4 w-full rounded animate-pulse"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-2 h-4 w-4/5 rounded animate-pulse"
        style={{ backgroundColor: "var(--progress-track)" }}
      />

      <div
        className="mt-4 h-12 rounded-2xl animate-pulse"
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
  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <StoreSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!avatars.length) {
    return (
      <div
        className="mt-6 rounded-2xl border px-6 py-10 text-center shadow-sm"
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
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
  );
}
