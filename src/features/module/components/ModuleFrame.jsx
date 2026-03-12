import { useParams } from "react-router";
import { MODULE_CONTENT_MAP } from "../content/content.registry";

import Header from "./structure/Header";
import Hero from "./structure/Hero";
import Footer from "./structure/Footer";
import { useModulePlayer } from "../hooks/useModulePlayer";
import SceneBackground from "@/features/activities/components/SceneBackground";

export default function ModuleFrame({ footerState }) {
  const { moduleCode } = useParams();

  const moduleData = MODULE_CONTENT_MAP[moduleCode];

  if (!moduleData) {
    return <div>No existe contenido para el módulo {moduleCode}</div>;
  }

  const player = useModulePlayer(moduleData, {
    onFinishMission: ({ missionKey }) => {
      console.log("Finalizar misión:", missionKey);
      // aquí luego: navegar al mapa / guardar progreso / etc.
    },
  });

  return (
    <div className="min-h-screen w-full grid grid-rows-[auto_minmax(0,1fr)_auto] bg-neutral-800">
      <SceneBackground>
        <Header moduleData={moduleData} missionKey={player.missionKey} />
        <Hero
          moduleData={moduleData}
          missionKey={player.missionKey}
          viewIndex={player.viewIndex}
          heroApi={player.heroApi}
        />{" "}
        <Footer model={player.footerModel} />
      </SceneBackground>
    </div>
  );
}
