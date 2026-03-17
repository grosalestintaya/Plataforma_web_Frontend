import ActivityHeader from "../components/ActivityHeader";
import Footer from "../components/Footer";
import SceneBackground from "../components/SceneBackground";

import FlowRunner from "../engine/FlowRunner";
import { getActivityDef } from "../engine/activityCatalog";
import { useActivityPlayer } from "../hooks/useActivityPlayer";

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ActivityPlayerPage() {
  const navigate = useNavigate();
  const { moduleCode, activityCode } = useParams();

  /**
   * Carga la actividad indicada en la ruta.
   */
  const activityDef = useMemo(
    () => getActivityDef(moduleCode, activityCode),
    [moduleCode, activityCode],
  );

  if (!activityDef) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-white/10 bg-white/5">
        No existe la actividad {moduleCode}/{activityCode}

        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl px-4 py-2 bg-white/10 border border-white/10"
        >
          Volver
        </button>
      </div>
    );
  }

  /**
   * Expone escena actual, estado del flujo y modelo del footer.
   */
  const player = useActivityPlayer(activityDef, {
    onExit: () => navigate(-1),
  });

  return (
    <div className="p-0">
      <FlowRunner activityDef={activityDef} onExit={() => nav(-1)} />
    </div>
  );
}