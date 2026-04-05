// hooks/useProgressOverview.js
import { useEffect, useState } from "react";
import { api } from "@/services/apiClient";

export function useProgressOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/progress/overview")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
