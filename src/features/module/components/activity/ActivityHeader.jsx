import { useMemo } from "react";

import rope from "@/assets/activity/cord.png";
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

/**
 * Header principal de la actividad.
 * Solo renderiza la barra superior; el modal vive en la pagina.
 */
export default function ActivityHeader({
  moduleData,
  missionKey,
  themeHex = "",
  onBack,
  onOpenSettings,
  gearIconSrc = gearicon,
  showBackButton = true,
  audioState,
}) {
  const mission = moduleData?.missions?.[missionKey];
  const playSfx = audioState?.playSfx;

  const missionTitle = useMemo(() => {
    return (
      mission?.missionTitle ??
      moduleData?.meta?.missions?.[missionKey]?.title ??
      ""
    );
  }, [mission, moduleData, missionKey]);

  function handleBack() {
    playSfx?.("click");
    onBack?.();
  }

  function handleOpenSettings() {
    playSfx?.("openModal");
    onOpenSettings?.();
  }

  return (
    <header
      className="relative w-full overflow-hidden leading-none"
      style={{
        minHeight: "var(--activity-header-height, 112px)",
      }}
    >
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
        <div
          className={
            showBackButton
              ? "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 md:gap-3"
              : "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:gap-3"
          }
        >
          {showBackButton ? (
            <div className="flex items-center">
              <HeaderBackButton
                onClick={handleBack}
                themeHex={themeHex}
                label="Volver"
              />
            </div>
          ) : null}

          <div
            className={
              showBackButton
                ? "flex min-w-0 items-center justify-center px-1"
                : "flex min-w-0 items-center justify-start px-1"
            }
          >
          <button className={showBackButton ? "invisible":"pr-4"}>
            fdfd
          </button>
            <h1
              className={
                showBackButton
                  ? "truncate text-center text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl lg:text-2xl"
                  : "truncate text-left text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl lg:text-2xl"
              }
            >
              {missionTitle || "Mision"}
            </h1>
          </div>

          <div className="flex items-center justify-end">
            <HeaderSettingsButton
              onClick={handleOpenSettings}
              themeHex={themeHex}
              iconSrc={gearIconSrc}
              title="Configuracion"
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
  );
}
