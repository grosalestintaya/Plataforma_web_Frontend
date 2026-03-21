// src/hooks/analytics/useAnalyticsStats.js
import { useQuery } from "@tanstack/react-query";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function fetchStats({ token }) {
  const res = await fetch(BASE_URL + "/api/analytics/stats", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Stats error ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

export function useAnalyticsStats() {
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["analytics-stats"],
    queryFn: () => fetchStats({ token }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
