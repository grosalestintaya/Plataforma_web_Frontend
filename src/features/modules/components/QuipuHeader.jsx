import React from "react";
import rope from "@/assets/activity/cord.png";
import { useNavigate } from "react-router-dom";
import gearicon from "@/assets/dashboard/gear.png";
import HeaderSettingsButton from "../components/HeaderSettingsButton";
import HeaderBackButton from "../components/HeaderBackButton";
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
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate("/");
  };

  return (
    <header className="relative w-full overflow-hidden">
      {/* fondo integrado */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            180deg,
            ${hexToRgba(themeHex, 0.24)} 0%,
            ${hexToRgba("#000000", 0.14)} 55%,
            ${hexToRgba("#000000", 0)} 100%
          )`,
        }}
      />

      <div className="relative px-3 md:px-8 lg:px-10 pt-4 pb-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          {/* izquierda: botón */}
          <div className="flex items-center">
            <HeaderBackButton
              onClick={handleBack}
              themeHex={themeHex}
              label="Volver"
            />
          </div>

          {/* centro: título */}
          <div className="flex justify-center px-2">
            <h1 className="text-white text-center text-xl md:text-3xl font-semibold tracking-tight truncate">
              {title}
            </h1>
          </div>

          {/* derecha: tuerca */}
          <div className="flex items-center justify-end">
            <HeaderSettingsButton
              onClick={onOpenSettings}
              themeHex={themeHex}
              iconSrc={gearicon}
            />
          </div>
        </div>

        {/* cuerda full width */}
        <div className="mt-2 -mx-3 md:-mx-8 lg:-mx-10">
          <img
            src={rope}
            alt="Cuerda del Quipu"
            className="block w-full h-[100px]"
            draggable={false}
          />
        </div>
      </div>
    </header>
  );
}
