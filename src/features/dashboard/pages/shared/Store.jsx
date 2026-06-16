import React from "react";
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

  return (
    <div className="w-full h-full min-h-0 overflow-hidden">
      <div
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border p-0 shadow-sm md:p-5 xl:p-1"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <div className="shrink-0 -pb-5">
          <StoreTopBar
            wallet={wallet}
            equippedAvatarName={equippedAvatarName}
          />
        </div>

        <div className="-mt-2 shrink-0">
          <StoreFilters filter={filter} onChange={setFilter} />
        </div>

        {(error || feedback) && (
          <div className="mt-4 shrink-0">
            <StoreFeedback error={error} feedback={feedback} />
          </div>
        )}

        <div className="mt-4 flex-1 min-h-0 overflow-hidden" id="store-items">
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
    </div>
  );
}

export default Store;
