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
  // FIX 1: handleClickDot eliminada — se usa () => audioState?.playSfx?.("clickDot")
  // directamente como referencia donde se necesita, sin duplicar lógica.

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
        const sfxMap = {
          Llamita: { key: "hover_llamita", rate: 1.02 },
          Cóndor: { key: "hover_condor", rate: 0.95 },
          Colibrí: { key: "hover_colibri", rate: 0.88 },
          Puma: { key: "hover_puma", rate: 1.0 },
          Serpiente: { key: "hover_snake", rate: 1.0 },
        };
        const sfx = sfxMap[mascot.name] ?? { key: "hover", rate: 1.0 };
        audioState?.playSfx?.(sfx.key, { rate: sfx.rate });
      }}
      onClickMascot={() => audioState?.playSfx?.("hovermascot")}
    />
  );

  return (
    <main className="h-full min-h-0 px-2 pt-0 sm:px-3 md:px-4 lg:px-6 xl:px-10">
      <div
        className="
          mx-auto grid h-full min-h-0 w-full max-w-[1380px] gap-2 sm:gap-3 md:gap-4
          grid-cols-[88px_minmax(0,1fr)]   grid-rows-[1fr_auto]
          sm:grid-cols-[108px_minmax(0,1fr)] sm:grid-rows-1
          md:grid-cols-[108px_minmax(0,1fr)] md:grid-rows-[1fr_auto]
          lg:grid-cols-[132px_minmax(0,1fr)_240px]
          xl:grid-cols-[168px_minmax(0,1fr)_280px]
        ">
        {/* FIX 2: -mt-32 eliminado → self-start + pt-4 para control limpio */}
        <div className="min-h-0 min-w-0 self-start -mt-34 pt-4">{left}</div>
        <section className="flex h-full min-h-0 min-w-0 items-start justify-center lg:items-stretch lg:justify-center px-1 sm:px-3 lg:px-5">
          {center}
        </section>
        {/* FIX 4: pt-11 → self-end para anclar el panel al fondo de la celda */}
        {/* Wrapper flex column: en móvil fluye normal, en lg+ distribuye el espacio verticalmente */}
        <div className="col-span-1 min-h-0 lg:col-span-1 hidden lg:flex lg:flex-col">
          {/* Spacer superior: ocupa ~60% del espacio libre → empuja la mascota al 60% del alto */}
          <div className="flex-[3]">{right}</div>
          {/* Contenido: ocupa el resto y queda naturalmente en el tercio inferior */}
          <div className="flex-[2]"></div>
        </div>
      </div>
    </main>
  );
}
