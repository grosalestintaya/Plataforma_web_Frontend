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

    if (onBack) {
      onBack();
      return;
    }

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

    if (onAbandonActivity) {
      onAbandonActivity();
      return;
    }

    navigate("/");
  };

  return (
    <>
      <header
        className="relative w-full overflow-hidden leading-none"
        style={{
          minHeight: "var(--activity-header-height, 112px)",
        }}>
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

        <div className="relative px-[var(--activity-shell-gutter)] pt-3 pb-0 md:pt-3.5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 md:gap-3">
            <div className="flex items-center">
              {showBackButton ? (
                <HeaderBackButton
                  onClick={handleBack}
                  themeHex={themeHex}
                  label="Volver"
                />
              ) : (
                <div className="h-[48px] w-[48px] sm:h-[54px] sm:w-[54px] md:h-[60px] md:w-[60px]" />
              )}
            </div>

            <div className="flex min-w-0 justify-center px-1">
              <h1 className="truncate text-center text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl lg:text-2xl">
                {missionTitle || "Misión"}
              </h1>
            </div>

            <div className="flex items-center justify-end">
              <HeaderSettingsButton
                onClick={handleOpenSettings}
                themeHex={themeHex}
                iconSrc={gearIconSrc}
                title="Configuración"
              />
            </div>
          </div>

          <div className="mt-1 -mx-[var(--activity-shell-gutter)]">
            <img
              src={rope}
              alt="Cuerda del Quipu"
              className="block h-[34px] w-full select-none object-fill sm:h-[38px] lg:h-[44px]"
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
