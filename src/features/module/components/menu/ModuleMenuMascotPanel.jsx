import React from "react";
import MascotTutorDemo from "@/features/guidepet/MascotTutorDemo";

export default function ModuleMenuMascotPanel({
  mascot,
  themeHex,
  text,
  className = "",
  onHoverWallet,
  onHoverMascot,
  onClickMascot,
}) {
  const mascotInteractive = typeof onClickMascot === "function";

  return (
    <aside className={`flex h-full w-full justify-center ${className}`}>
      <div className="flex h-full w-full max-w-[360px] min-h-0 flex-col gap-1.5 px-1 sm:gap-2 sm:px-0">
        <div
          className="flex origin-top flex-wrap items-center justify-center gap-1.5 scale-[0.74] sm:scale-[0.8] md:scale-[0.86] lg:scale-[0.92] xl:scale-100"
          onMouseEnter={onHoverWallet}></div>

        <div className="min-h-0 flex-1">
          <div
            className={`h-full rounded-3xl transition ${mascotInteractive ? "cursor-pointer hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 active:translate-y-0" : ""}`}
            onMouseEnter={onHoverMascot}
            onClick={onClickMascot}
            role={mascotInteractive ? "button" : undefined}
            aria-label={
              mascotInteractive
                ? `Interactuar con ${mascot?.name ?? "la mascota"}`
                : undefined
            }
            tabIndex={mascotInteractive ? 0 : undefined}
            onKeyDown={
              mascotInteractive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onClickMascot?.();
                    }
                  }
                : undefined
            }>
            <MascotTutorDemo
              gifSrc={mascot?.gif}
              name={mascot?.name}
              themeHex={themeHex}
              text={text}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
