import React from "react";
import ActivityDots from "./ActivityDots";

export default function ModuleMenuSelectorPanel({
  activities,
  selectedId,
  onSelect,
  themeHex,
  className = "",
}) {
  return (
    <aside
      className={`
        flex w-full items-start justify-center
        ${className}
      `}
    >
      <div
        className="
          origin-top
          scale-[0.68]
          sm:scale-[0.78]
          md:scale-[0.88]
          xl:scale-[1.02]
          2xl:scale-[1.16]
        "
      >
        <ActivityDots
          activities={activities}
          selectedId={selectedId}
          onSelect={onSelect}
          themeHex={themeHex}
        />
      </div>
    </aside>
  );
}
