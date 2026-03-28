import React, { useEffect, useState } from "react";
import { Card } from "../../../../shared/atoms/card";
import UserProfileCard from "../../components/UserProfileCard";
import BoardCard from "../../components/ListCard";
import { RankingService } from "../../services/ranking.service";

export default function Ranking() {
  const [rankingState, setRankingState] = useState({
    loading: false,
    top10: [],
    myRank: null,
    me: null,
  });

  const [insigniasState, setInsigniasState] = useState({
    loading: false,
    count: 0,
    items: [],
  });

  const [error, setError] = useState("");

  const fetchRanking = async () => {
    setRankingState((s) => ({ ...s, loading: true }));
    setError("");

    try {
      const json = await RankingService.getRanking();

      setRankingState({
        loading: false,
        top10: Array.isArray(json?.top10) ? json.top10 : [],
        myRank: typeof json?.myRank === "number" ? json.myRank : null,
        me: json?.me ?? null,
      });
    } catch (e) {
      if (e?.status !== 401) {
        setError(e?.message || "Error al cargar ranking");
      }
      setRankingState({ loading: false, top10: [], myRank: null, me: null });
    }
  };

  const fetchInsignias = async () => {
    setInsigniasState((s) => ({ ...s, loading: true }));

    try {
      const json = await RankingService.getMyInsignias();

      setInsigniasState({
        loading: false,
        count: typeof json?.count === "number" ? json.count : 0,
        items: Array.isArray(json?.insignias) ? json.insignias : [],
      });
    } catch (e) {
      setInsigniasState({ loading: false, count: 0, items: [] });
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchRanking(), fetchInsignias()]);
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myRank = rankingState.myRank ?? rankingState.me?.rank ?? null;

  return (
    <div className="w-full h-[calc(100dvh-60px)] overflow-hidden px-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {error && (
          <div className="mb-4 shrink-0 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-bold">No se pudo cargar</div>
            <div className="mt-1 opacity-90">{error}</div>
          </div>
        )}

        <div className="grid flex-1 min-h-0 w-full gap-6 overflow-hidden lg:grid-cols-[minmax(0,1fr)_450px]">
          {/* Panel izquierdo */}
          <div className="min-h-0 w-full overflow-hidden">
            <BoardCard
              rankingState={{ ...rankingState, myRank }}
              onRefresh={refreshAll}
            />
          </div>

          {/* Panel derecho */}
          <div className="min-h-0 w-full overflow-hidden">
            <Card className="relative flex h-full min-h-0 w-full flex-col overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/[0.02]" />
              <div className="relative flex-1 min-h-0 overflow-y-auto">
                <UserProfileCard
                  me={rankingState.me}
                  myRank={myRank}
                  insigniasState={insigniasState}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
