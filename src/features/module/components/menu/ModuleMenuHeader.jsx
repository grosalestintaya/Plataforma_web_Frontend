import React from "react";
import menuIcon from "@/shared/icons/icon-menu-pen.svg";
import HeaderSettingsButton from "../ui/HeaderSettingsButton";
import HeaderBackButton from "../ui/HeaderBackButton";
import HeaderRopeSvg from "../HeaderRopeSvg";
import CoinsPanel from "./coins";
import XpPanel from "./xp";
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
  wallet = { xp: 0, coins: 0 },
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
    <header className="relative w-full overflow-hidden gap-4">
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

      <div className="relative px-0 py-0 pb-1 pt-2.5 sm:px-4 md:px-8 lg:px-1">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-9 ">
          <div className="flex items-center pl-2 sm:pl-3">
            <HeaderBackButton
              onClick={handleBack}
              themeHex={themeHex}
              label="Volver"
            />
          </div>

          <div className="flex min-w-0 justify-center px-1 sm:px-2">
            <h1
              className="truncate text-center"
              style={{
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#f5e9c8",
                textShadow: [
                  "0 2px 0 rgba(122,85,16,0.8)",
                  "0 1px 0 rgba(201,162,39,0.6)",
                  "0 0 18px rgba(232,200,64,0.35)",
                  "0 4px 14px rgba(0,0,0,0.5)",
                ].join(", "),
                fontSize: "clamp(0.85rem, 2.5vw, 1.75rem)",
              }}>
              {title}
            </h1>
          </div>

          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <XpPanel monedas={wallet?.xp ?? 0} themeHex={themeHex} />
            <CoinsPanel monedas={wallet?.coins ?? 0} themeHex={themeHex} />
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
