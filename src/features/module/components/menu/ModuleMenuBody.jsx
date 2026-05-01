import React from "react";
import ModuleMenuActivityPanel from "./ModuleMenuActivityPanel";
import ModuleMenuMascotPanel from "./ModuleMenuMascotPanel";
import ModuleMenuSelectorPanel from "./ModuleMenuSelectorPanel";

/**
 * ModuleMenuBody:
 * - Recibe la data ya resuelta desde la pagina del menu.
 * - Construye internamente los tres paneles del body:
 *   selector, tarjeta central y panel de mascota.
 * - Usa un solo grid responsive.
 * - El layout cambia por clases responsivas, no por duplicar la vista.
 */
export default function ModuleMenuBody({
  activities,
  selectedActivity,
  selectedActivityId,
  activityContent,
  mascot,
  mascotText,
  wallet,
  themeHex,
  canPlay,
  ctaLabel,
  onSelectActivity,
  onPlay,
  onHoverActivity,
  audioState,
}) {
  const handleClickDot = () => {
    audioState?.playSfx?.("clickDot");
  };

  const left = (
    <ModuleMenuSelectorPanel
      activities={activities}
      onClickDot={() => audioState?.playSfx?.("clickDot")}
      selectedId={selectedActivityId}
      onSelect={onSelectActivity}
      onHoverActivity={onHoverActivity}
      audioState={audioState}
      themeHex={themeHex}
      className="xl:justify-center pt-6"
    />
  );

  const center = (
    <ModuleMenuActivityPanel
      activity={selectedActivity}
      activityContent={activityContent}
      themeHex={themeHex}
      canPlay={canPlay}
      ctaLabel={ctaLabel}
      onPlay={onPlay}
      onHoverActivity={onHoverActivity}
      audioState={audioState}
    />
  );

  const right = (
    <ModuleMenuMascotPanel
      mascot={mascot}
      themeHex={themeHex}
      text={mascotText}
      wallet={wallet}
      className="xl:justify-center"
      onHoverMascot={() => {
        if (mascot.name === "Llamita") {
          audioState?.playSfx?.("hover_llamita", { rate: 1.02 });
        } else if (mascot.name === "Cóndor") {
          audioState?.playSfx?.("hover_condor", { rate: 0.95 });
        } else if (mascot.name === "Colibrí") {
          audioState?.playSfx?.("hover_colibri", { rate: 0.88 });
        } else if (mascot.name === "Puma") {
          audioState?.playSfx?.("hover_puma", { rate: 1.0 });
        } else if (mascot.name === "Serpiente") {
          audioState?.playSfx?.("hover_snake", { rate: 1.0 });
        } else {
          audioState?.playSfx?.("hover", { rate: 1.0 }); // fallback
        }
      }}
      onClickMascot={() => audioState?.playSfx?.("hovermascot")}
    />
  );

  return (
    <main className="h-full min-h-0 px-2 pb-2 pt-0 sm:px-3 md:px-4 lg:px-6 xl:px-10">
      <div
        className="
          mx-auto grid h-full min-h-0 w-full max-w-[1380px] gap-2 sm:gap-3 md:gap-4
          grid-cols-[88px_minmax(0,1fr)] grid-rows-[50%_50%]
          sm:grid-cols-[108px_minmax(0,1fr)] sm:grid-rows-[50%_50%]
          md:grid-cols-[108px_minmax(0,1fr)] md:grid-rows-[50%_50%]
          lg:grid-cols-[132px_minmax(0,1fr)_240px]
          xl:grid-cols-[168px_minmax(0,1fr)_280px]
        ">
        <div className="min-h-0 min-w-0 -mt-32">{left}</div>

        <section className="flex h-full min-h-0 min-w-0 items-start justify-center lg:items-stretch lg:justify-center">
          {center}
        </section>

        <div className="col-span-1 min-h-0 lg:col-span-1">{right}</div>
      </div>
    </main>
  );
}
