import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import rope from "@/assets/activity/cord.png";
import gearicon from "@/assets/dashboard/gear.png";

import HeaderSettingsButton from "../ui/HeaderSettingsButton";
import HeaderBackButton from "../ui/HeaderBackButton";
import ConfiguracionModal from "../sections/ConfiguracionModal";

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

export default function ActivityHeader({
  moduleData,
  missionKey,
  themeHex = "",
  onBack,
  onAbandonActivity,
  gearIconSrc = gearicon,
  showBackButton = true,
  audioState,
}) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const mission = moduleData?.missions?.[missionKey];

  const missionTitle = useMemo(() => {
    return (
      mission?.missionTitle ??
      moduleData?.meta?.missions?.[missionKey]?.title ??
      ""
    );
  }, [mission, moduleData, missionKey]);

  const music = audioState?.music ?? 50;
  const sfx = audioState?.sfx ?? 80;
  const setMusic = audioState?.setMusic;
  const setSfx = audioState?.setSfx;
  const stopMusic = audioState?.stopMusic;
  const playSfx = audioState?.playSfx;

  const handleBack = () => {
    playSfx?.("click");

    if (onBack) return onBack();
    navigate(-1);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    playSfx?.("openModal");
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    playSfx?.("closeModal");
  };

  const handleAbandonActivity = () => {
    playSfx?.("click");
    stopMusic?.();
    setIsSettingsOpen(false);

    if (onAbandonActivity) return onAbandonActivity();
    navigate("/");
  };

  return (
    <>
      <header className="relative w-full overflow-hidden leading-none">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              ${hexToRgba(themeHex, 0.22)} 0%,
              ${hexToRgba("#000000", 0.12)} 58%,
              ${hexToRgba("#000000", 0)} 100%
            )`,
          }}
        />

        <div className="relative px-2 pt-2 pb-0 md:px-6 md:pt-2 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 md:gap-2">
            <div className="min-w-0 flex items-center justify-center px-1">
              <h1 className="truncate text-center text-lg font-semibold tracking-tight text-white md:text-2xl">
                {missionTitle || "Misión"}
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

          <div className="mt-0 -mx-2 md:-mx-6 lg:-mx-8">
            <img
              src={rope}
              alt="Cuerda del Quipu"
              className="block h-[44px] w-full"
              draggable={false}
            />
          </div>
        </div>
      </header>

      <ConfiguracionModal
        open={isSettingsOpen}
        onRequestClose={handleCloseSettings}
        onRequestAbandon={handleAbandonActivity}
        sfx={sfx}
        music={music}
        onChangeSfx={setSfx}
        onChangeMusic={setMusic}
        title="Opciones"
        abandonLabel="Abandonar actividad"
      />
    </>
  );
}
