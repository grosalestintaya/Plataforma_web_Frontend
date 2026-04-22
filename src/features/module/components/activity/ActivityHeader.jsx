import { useCallback, useMemo } from "react";

import menuIcon from "@/shared/icons/icon-menu-pen.svg";
import HeaderSettingsButton from "../ui/HeaderSettingsButton";
import HeaderExitButton from "../ui/HeaderExitButton";
import HeaderRopeSvg from "../HeaderRopeSvg";

const HEADER_CLASS = "relative w-full overflow-hidden leading-none";
const HEADER_STYLE = {
  minHeight: "var(--activity-header-height, 112px)",
};
const HEADER_OVERLAY_CLASS = "pointer-events-none absolute inset-0";
const HEADER_INNER_CLASS =
  "relative px-[var(--activity-shell-gutter)] py-0";
const HEADER_BAR_CLASS =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:gap-3";
const HEADER_TITLE_GROUP_CLASS = "flex min-w-0 items-center gap-2 px-1";
const HEADER_TITLE_CLASS =
  "truncate text-left text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl lg:text-2xl";
const HEADER_ACTION_CLASS = "flex items-center justify-end";
const HEADER_ROPE_WRAP_CLASS =
  "-mx-[var(--activity-shell-gutter)] -mt-5 overflow-hidden";
const HEADER_ROPE_CLASS =
  "block h-[40px] w-full select-none sm:h-[54px] md:h-[64px] lg:h-[64px]";

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

  const overlayStyle = useMemo(
    () => ({
      background: `linear-gradient(
        180deg,
        ${hexToRgba(themeHex, 0.22)} 0%,
        ${hexToRgba("#000000", 0.12)} 58%,
        ${hexToRgba("#000000", 0)} 100%
      )`,
    }),
    [themeHex],
  );

  const handleExitActivity = useCallback(() => {
    playSfx?.("click");
    onExitActivity?.();
  }, [onExitActivity, playSfx]);

  const handleOpenSettings = useCallback(() => {
    playSfx?.("openModal");
    onOpenSettings?.();
  }, [onOpenSettings, playSfx]);

  return (
    <header className={HEADER_CLASS} style={HEADER_STYLE}>
      <div className={HEADER_OVERLAY_CLASS} style={overlayStyle} />

      <div className={HEADER_INNER_CLASS}>
        <div className={HEADER_BAR_CLASS}>
          <div className={HEADER_TITLE_GROUP_CLASS}>
            <HeaderExitButton
              onClick={handleExitActivity}
              themeHex={themeHex}
              title="Salir de la actividad"
            />
            <h1 className={HEADER_TITLE_CLASS}>
              {missionTitle || "Mision"}
            </h1>
          </div>

          <div className={HEADER_ACTION_CLASS}>
            <HeaderSettingsButton
              onClick={handleOpenSettings}
              themeHex={themeHex}
              iconSrc={gearIconSrc}
              title="Configuracion"
            />
          </div>
        </div>
        <div className={HEADER_ROPE_WRAP_CLASS}>
          <HeaderRopeSvg
            themeHex={themeHex}
            className={HEADER_ROPE_CLASS}
          />
        </div>
      </div>
    </header>
  );
}
