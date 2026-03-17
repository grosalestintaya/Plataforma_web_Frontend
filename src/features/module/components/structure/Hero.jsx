import HeroStage from "@/features/module/engine/HeroStage";
import { templates } from "@/features/module/templates";

export default function Hero({ moduleData, missionKey, viewIndex }) {
  const views = moduleData.missions?.[missionKey]?.views ?? [];
  const view = views[viewIndex];

  if (!view) return <HeroStage><div className="text-white/80">No hay vista</div></HeroStage>;

  const Template = templates[view.template];
  if (!Template) return <HeroStage><div className="text-white/80">Template no registrado</div></HeroStage>;

  return (
    <HeroStage className="bg-transparent">
      <Template variant={view.variant} data={view.data}/>
    </HeroStage>
  );
}



// import HeroStage from "@/features/module/engine/HeroStage";
// import { templates } from "@/features/module/templates";

// /*
//   Hero decide: qué vista tocar (por índice) y qué template llamar.
//   TeoriaTemplate decide: qué layout usar (por variant).
//   HeroGrid decide: cómo se ordenan los espacios (grid).
//   HeroArea decide: dónde cae cada bloque (en qué área).
//   Blocks deciden: cómo se ve un título, un texto, una imagen.
// */


// function clamp(n, min, max) {
//   return Math.max(min, Math.min(n, max));
// }

// function toneToClass(tone) {
//   switch (tone) {
//     case "purple":
//       return "bg-[#6c2cf1]";
//     case "blue":
//       return "bg-[#1e4cff]";
//     case "green":
//       return "bg-emerald-700";
//     default:
//       return "bg-transparent";
//   }
// }

// export default function Hero({ moduleData }) {
//   const missionKey = moduleData?.state?.missionKey;
//   const viewIndex = moduleData?.state?.viewIndex ?? 0;

//   const views = moduleData?.missions?.[missionKey]?.views ?? [];
//   const view = views[clamp(viewIndex, 0, Math.max(0, views.length - 1))];


//   if (!view) {
//     return (
//       <HeroStage className="bg-transparent">
//         <div className="text-white/80">No hay vista para mostrar.</div>
//       </HeroStage>
//     );
//   }

//   const Template = templates[view.template];
//   if (!Template) {
//     return (
//       <HeroStage className="bg-transparent">
//         <div className="text-white/80">
//           Template no registrado: <span className="font-semibold">{view.template}</span>
//         </div>
//       </HeroStage>
//     );
//   }

//   // prioridad: tone por vista -> tone por misión -> heroTone global
//   const tone =
//     view.tone ??
//     moduleData?.meta?.heroToneByMission?.[missionKey] ??
//     moduleData?.meta?.heroTone ??
//     "none";

//   return (
//     <HeroStage className={toneToClass(tone)}>
//       <Template variant={view.variant} data={view.data} />
//     </HeroStage>
//   );
// }