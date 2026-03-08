import { api } from "@/services/apiClient";

export const RankingService = {
  getRanking: () => api.get("/api/data/ranking"),
  getMyInsignias: () => api.get("/api/me/insignias"),
};
