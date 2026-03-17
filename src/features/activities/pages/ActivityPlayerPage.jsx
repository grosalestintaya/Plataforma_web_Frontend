import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getActivityDef } from "../engine/activityCatalog";
import FlowRunner from "../engine/FlowRunner";

export default function ActivityPlayerPage() {
  const nav = useNavigate();
  const { moduleCode, activityCode } = useParams();

  const activityDef = useMemo(
    () => getActivityDef(moduleCode, activityCode),
    [moduleCode, activityCode],
  );

  if (!activityDef) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-white/10 bg-white/5">
        Actividad no encontrada: {moduleCode}/{activityCode}
        <button
          onClick={() => nav(-1)}
          className="mt-4 rounded-xl px-4 py-2 bg-white/10 border border-white/10">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-0">
      <FlowRunner activityDef={activityDef} onExit={() => nav(-1)} />
    </div>
  );
}
