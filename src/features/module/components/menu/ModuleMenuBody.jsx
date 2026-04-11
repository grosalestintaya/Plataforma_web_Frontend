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
}) {
  const left = (
    <ModuleMenuSelectorPanel
      activities={activities}
      selectedId={selectedActivityId}
      onSelect={onSelectActivity}
      themeHex={themeHex}
      className="xl:justify-center pt-{6}"
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
    />
  );

  const right = (
    <ModuleMenuMascotPanel
      mascot={mascot}
      themeHex={themeHex}
      text={mascotText}
      wallet={wallet}
      className="xl:justify-center"
    />
  );

  return (
    <main className="h-full min-h-0 px-2 pb-2 pt-0 sm:px-3 md:px-4 lg:px-6 xl:px-10">
      {/* Un solo grid responsive:
          en pantallas pequeñas deja selector + tarjeta arriba y mascota abajo;
          en desktop reparte selector, contenido y mascota en tres columnas. */}
      <div
        className="
          mx-auto grid h-full min-h-0 w-full max-w-[1380px] gap-2 sm:gap-3 md:gap-4
          grid-cols-[88px_minmax(0,1fr)] grid-rows-[50%_50%]

          sm:grid-cols-[108px_minmax(0,1fr)] sm:grid-rows-[50%_50%]

          md:grid-cols-[108px_minmax(0,1fr)] md:grid-rows-[50%_50%]

          lg:grid-cols-[132px_minmax(0,1fr)_240px] 
          xl:grid-cols-[168px_minmax(0,1fr)_280px]
        ">
        <div className="min-h-0 min-w-0 -mt-26">{left}</div>
        <section className="flex h-full min-h-0 min-w-0 items-start justify-center lg:items-stretch">
          {center}
        </section>
        <div className="col-span-2 min-h-0 lg:col-span-1">{right}</div>
      </div>
    </main>
  );
}
