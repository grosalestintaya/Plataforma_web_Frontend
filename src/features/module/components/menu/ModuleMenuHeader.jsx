import React from "react";
import menuIcon from "@/shared/icons/icon-menu-pen.svg";
import HeaderSettingsButton from "../ui/HeaderSettingsButton";
import HeaderBackButton from "../ui/HeaderBackButton";
import HeaderRopeSvg from "../HeaderRopeSvg";
function hexToRgba(hex, a = 1) {
  const h = String(hex || "#000").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");

  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Header del menu del modulo.
 * Solo expone acciones; el modal se monta en la pagina.
 */
export default function ModuleMenuHeader({
  title,
  themeHex = "#7130F7",
  onBack,
  onOpenSettings,
  gearIconSrc = menuIcon,
  audioState,
}) {
  const playSfx = audioState?.playSfx;

  function handleBack() {
    playSfx?.("click");
    onBack?.();
  }

  function handleOpenSettings() {
    playSfx?.("openModal");
    onOpenSettings?.();
  }

  return (
    <header className="relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            ${hexToRgba(themeHex, 0.24)} 0%,
            ${hexToRgba("#000000", 0.14)} 55%,
            ${hexToRgba("#000000", 0)} 100%
          )`,
        }}
      />

      <div className="relative px-3 py-0 pb-1 pt-2.5 sm:px-4 md:px-8 lg:px-1">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <div className="flex items-center">
            <HeaderBackButton
              onClick={handleBack}
              themeHex={themeHex}
              label="Volver"
            />
          </div>

          <div className="flex min-w-0 justify-center px-1 sm:px-2">
            <h1 className="truncate text-center text-sm font-semibold tracking-tight text-white sm:text-lg md:text-2xl lg:text-3xl">
              {title}
            </h1>
          </div>

          <div className="flex items-center justify-end">
            <HeaderSettingsButton
              onClick={handleOpenSettings}
              themeHex={themeHex}
              iconSrc={gearIconSrc}
            />
          </div>
        </div>
        <div className="-mt-5 -m-3 overflow-hidden sm:-mx-4 md:-mx-8 lg:-mx-10 -pt-2">
          <HeaderRopeSvg
            themeHex={themeHex}
            className="block h-[40px] w-full select-none sm:h-[54px] md:h-[78px] lg:h-[142px] "
          />
        </div>
      </div>
    </header>
  );
}
