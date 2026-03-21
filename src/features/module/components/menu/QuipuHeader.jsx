import React from "react";
import rope from "@/assets/activity/cord.png";
import { useNavigate } from "react-router-dom";
import gearicon from "@/assets/dashboard/gear.png";
import HeaderSettingsButton from "../ui/HeaderSettingsButton";
import HeaderBackButton from "../ui/HeaderBackButton";

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

export default function QuipuHeader({
  title,
  themeHex = "#7130F7",
  onBack,
  onOpenSettings,
  gearIconSrc = gearicon,
}) {
  
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

      <div className="relative px-3 pb-3 pt-4 md:px-8 lg:px-10">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="flex items-center">
            <HeaderBackButton
              onClick={onBack}
              themeHex={themeHex}
              label="Volver"
            />
          </div>

          <div className="flex justify-center px-2">
            <h1 className="truncate text-center text-xl font-semibold tracking-tight text-white md:text-3xl">
              {title}
            </h1>
          </div>

          <div className="flex items-center justify-end">
            <HeaderSettingsButton
              onClick={onOpenSettings}
              themeHex={themeHex}
              iconSrc={gearIconSrc}
            />
          </div>
        </div>

        <div className="mt-2 -mx-3 md:-mx-8 lg:-mx-10">
          <img
            src={rope}
            alt="Cuerda del Quipu"
            className="block h-[100px] w-full"
            draggable={false}
          />
        </div>
      </div>
    </header>
  );
}
