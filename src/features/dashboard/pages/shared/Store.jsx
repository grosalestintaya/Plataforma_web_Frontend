import React from "react";
import ShowDashboardTitle from "@/features/dashboard/components/ShowDashboardTitle";
import StoreTopBar from "@/features/dashboard/components/store/StoreTopBar";
import StoreFilters from "@/features/dashboard/components/store/StoreFilters";
import StoreFeedback from "@/features/dashboard/components/store/StoreFeedback";
import StoreGrid from "@/features/dashboard/components/store/StoreGrid";
import { useAvatarStore } from "@/features/dashboard/hooks/useAvatarStore";

function Store() {
  const {
    avatars,
    wallet,
    loading,
    error,
    feedback,
    filter,
    setFilter,
    busyAvatarId,
    purchaseAvatar,
    equipAvatar,
    equippedAvatarName,
  } = useAvatarStore();
  // <ShowDashboardTitle>Tienda de Avatares</ShowDashboardTitle>

  return (
    <div className="w-full min-h-screen pt-0">
      <div
        className="mt-6 rounded-2xl border  pt-0 shadow-sm md:p-6"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <StoreTopBar wallet={wallet} equippedAvatarName={equippedAvatarName} />

        <StoreFilters filter={filter} onChange={setFilter} />

        <StoreFeedback error={error} feedback={feedback} />

        <StoreGrid
          avatars={avatars}
          loading={loading}
          currentCoins={wallet?.coins_total ?? 0}
          busyAvatarId={busyAvatarId}
          onPurchase={purchaseAvatar}
          onEquip={equipAvatar}
        />
      </div>
    </div>
  );
}

export default Store;
