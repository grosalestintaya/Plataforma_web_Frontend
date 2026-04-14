import { useMemo } from "react";

import rope from "@/assets/activity/cord.png";
import menuIcon from "@/shared/icons/icon-menu-pen.svg";
import HeaderSettingsButton from "../ui/HeaderSettingsButton";
import HeaderExitButton from "../ui/HeaderExitButton";
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
 * Header principal de la actividad.
 * Solo renderiza la barra superior; el modal vive en la pagina.
 */
export default function ActivityHeader({
  moduleData,
  missionKey,
  themeHex = "",
  onExitActivity,
  onOpenSettings,
  gearIconSrc = menuIcon,
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

  function handleExitActivity() {
    playSfx?.("click");
    onExitActivity?.();
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

      <div className="relative px-[var(--activity-shell-gutter)] pt-0 pb-0 md:pt-">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:gap-3">
          <div className="flex min-w-0 items-center gap-2 px-1">
            <HeaderExitButton
              onClick={handleExitActivity}
              themeHex={themeHex}
              title="Salir de la actividad"
            />
            <h1 className="truncate text-left text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl lg:text-2xl">
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
        <div className="-mt-5 -pt-5 -mx-3 overflow-hidden sm:-mx-4 md:-mx-8 lg:-mx-10">
          <HeaderRopeSvg
            themeHex={themeHex}
            className="block h-[40px] w-full select-none sm:h-[54px] md:h-[78px] lg:h-[78px]"
          />
        </div>
      </div>
    </header>
  );
}
