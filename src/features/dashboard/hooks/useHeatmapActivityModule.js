// src/hooks/useHeatmapActivityModule.js
import { useQuery } from "@tanstack/react-query";
import { getHeatmapActivityModule } from "../services/analytics";

export function useHeatmapActivityModule({ metric, rangeDays }) {
  return useQuery({
    queryKey: ["heatmap-activity-module", metric, rangeDays],
    queryFn: () => getHeatmapActivityModule({ metric, rangeDays }),
    staleTime: 60_000,
  });
}
