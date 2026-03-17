// src/features/module-menu/components/ModuleMenuSelectorPanel.jsx
import React from "react";
import ActivityDots from "../components/ActivityDots";

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
        mb-8 flex justify-center
        lg:absolute
        lg:left-[4%]
        xl:left-[6%]
        2xl:left-[9%]
        lg:top-2/5
        lg:mb-0
        lg:-translate-y-1/2
        lg:justify-start
        ${className}
      `}>
      <div
        className="
          origin-center
          scale-[1.02]
          md:scale-[1.05]
          lg:origin-left
          lg:scale-[1.08]
          xl:scale-[1.12]
          2xl:scale-[1.16]
        ">
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
