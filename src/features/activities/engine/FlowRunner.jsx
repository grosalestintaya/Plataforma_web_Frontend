import { useMemo } from "react";
import { resolveScene } from "./sceneRegistry";

/**
 * Resuelve y renderiza la escena actual según su template.
 */
export default function FlowRunner({
  activityDef,
  scene,
  game,
  locked,
  onExit,
}) {
  const SceneComp = useMemo(() => {
    if (!scene) return null;
    return resolveScene(scene.template);
  }, [scene]);

  if (!scene || !SceneComp) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-white/10 bg-white/5">
        Escena inválida (template no registrado o flow vacío).

        <button
          onClick={onExit}
          className="mt-4 rounded-xl px-4 py-2 bg-white/10 border border-white/10"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <SceneComp
      activityDef={activityDef}
      scene={scene}
      game={game}
      locked={locked}
    />
  );
}