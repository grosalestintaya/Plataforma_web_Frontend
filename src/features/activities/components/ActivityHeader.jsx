import React from "react";
import rope from "@/assets/activity/cord.png"; // tu cuerda

export default function QuipuHeader({ title, subtitle, onSettings }) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* PADRE: 0 padding horizontal */}
      <div className="relative px-0 pt-1 pb-0  absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md">
        {/* Row: logo + title | settings */}
        <div className="flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0 pl-2">
            <img
              src="/iconcolor.png"
              alt="logo"
              className="w-5 h-5 md:w-8 md:h-8 object-contain shrink-0 "
              draggable={false}
            />
          </div>
          {title && (
            <h1 className="truncate text-white text-lg md:text-2xl font-bold tracking-tight drop-shadow-sm">
              {title}
            </h1>
          )}

          {/* Right (gear) */}
          <div className="pr-2">
            <button
              type="button"
              onClick={onSettings}
              className="w-full h-full  grid place-items-center "
              aria-label="Ajustes">
              <img
                src="/gear.png"
                alt=""
                className="w-full h-full md:w-8 md:h-8 object-contain"
                draggable={false}
              />
            </button>
          </div>
        </div>

        {/* Rope */}
        <div className="flex justify-center">
          <img
            src={rope}
            alt="Cuerda del Quipu"
            className="w-full h-[78px]"
            draggable={false}
          />
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-center leading-none">
            <p className="text-white text-base md:text-xl font-extrabold tracking-tight">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



// /**
//  * Renderiza el encabezado principal de la actividad.
//  */
// export default function ActivityHeader({ activityDef, scene, status }) {
//   const title =
//     activityDef?.meta?.headerTitle ||
//     activityDef?.title ||
//     activityDef?.missionTitle ||
//     "Actividad";

//   const moduleName =
//     activityDef?.meta?.moduleName ||
//     activityDef?.moduleName ||
//     activityDef?.moduleCode ||
//     "";

//   const sceneTitle = scene?.title || scene?.label || "";

//   return (
//     <header className="px-6 py-4 border-b border-white/10 bg-neutral-950 text-white">
//       <div className="text-sm opacity-70">{moduleName}</div>
//       <div className="text-2xl font-semibold">{title}</div>

//       {sceneTitle ? (
//         <div className="text-sm opacity-70 mt-1">{sceneTitle}</div>
//       ) : null}

//       {status === "submitting" ? (
//         <div className="text-xs opacity-60 mt-2">Enviando resultados...</div>
//       ) : null}
//     </header>
//   );
// }