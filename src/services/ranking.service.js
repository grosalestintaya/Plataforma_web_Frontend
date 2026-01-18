import { api } from "./apiClient";

export const RankingService = {
  getRanking: () => api.get("/api/data/ranking"),
  getMyInsignias: () => api.get("/api/me/insignias"),
};
