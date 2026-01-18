// src/api/analytics.js
import { http } from "./http";

export async function getHeatmapActivityModule({ metric = "completion_pct", rangeDays = 30 } = {}) {
  const { data } = await http.get("/api/analytics/heatmap/activity-module", {
    params: { metric, rangeDays },
  });
  return data;
}
