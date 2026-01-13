import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import UserProfileCard from "../../components/ranking/UserProfileCard";
import { API_BASE } from "../../components/ranking/helpers";
import BoardCard from "../../components/ranking/ListCard";
export default function Ranking() {
  const token = localStorage.getItem("token");

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
      const res = await fetch(`${API_BASE}/api/data/ranking`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();

      setRankingState({
        loading: false,
        top10: Array.isArray(json?.top10) ? json.top10 : [],
        myRank: typeof json?.myRank === "number" ? json.myRank : null,
        me: json?.me ?? null,
      });
    } catch (e) {
      setError(e?.message || "Error al cargar ranking");
      setRankingState({ loading: false, top10: [], myRank: null, me: null });
    }
  };

  const fetchInsignias = async () => {
    setInsigniasState((s) => ({ ...s, loading: true }));

    try {
      const res = await fetch(`${API_BASE}/api/me/insignias`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();

      setInsigniasState({
        loading: false,
        count: typeof json?.count === "number" ? json.count : 0,
        items: Array.isArray(json?.insignias) ? json.insignias : [],
      });
    } catch (e) {
      // No bloquea la vista si falla insignias
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
    <div className="mx-auto max-w-7xl">
   

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-bold">No se pudo cargar</div>
          <div className="mt-1 opacity-90">{error}</div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <BoardCard rankingState={{ ...rankingState, myRank }} onRefresh={refreshAll} />

        <Card className="relative overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="relative">
            <UserProfileCard me={rankingState.me} myRank={myRank} insigniasState={insigniasState} />
          </div>
        </Card>
      </div>
    </div>
  );
}
