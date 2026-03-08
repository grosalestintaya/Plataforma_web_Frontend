import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/apiClient";

async function fetchCharts() {
  // apiClient ya agrega Authorization y maneja 401
  return api.get("/api/analytics/charts");
}
export function useAnalyticsCharts(rangeDays = 100) {
  return useQuery({
    queryKey: ["analytics-charts", rangeDays],
    queryFn: () => api.get(`/api/analytics/charts?rangeDays=${rangeDays}`),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

