// src/pages/HeatmapPage.jsx (solo lo relevante)
import { useMemo } from "react";
import { useHeatmapActivityModule } from "../../hooks/useHeatmapActivityModule";
import { transformHeatmapToModuleByType } from "../../utils/heatmapCompactTransform";
import HeatmapModuleByType from "../../charts/HeatmapModuleByType";
import ShowDashboardTitle from "@/features/dashboard/components/ShowDashboardTitle";
export default function Heatmap() {
  const metric = "completion_pct";
  const rangeDays = 30;

  const query = useHeatmapActivityModule({ metric, rangeDays });

  const normalized = useMemo(() => {
    if (!query.data) return null;
    return transformHeatmapToModuleByType(query.data);
  }, [query.data]);

  if (query.isLoading) return <div className="p-6">Cargando…</div>;
  if (query.isError)
    return <div className="p-6">Error: {String(query.error?.message)}</div>;

  return (
    <div className="py-6 px-1">
      <ShowDashboardTitle>Progreso General</ShowDashboardTitle>
      <br />
      {normalized ? <HeatmapModuleByType data={normalized} /> : null}
    </div>
  );
}
