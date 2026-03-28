import React, { useMemo } from "react";
import { Card } from "../../../shared/atoms/card";
import PodiumCard from "./PodiumCard";
import RankingRow from "./RankingRow";

export default function BoardCard({ rankingState }) {
  const { loading, top10 } = rankingState;

  const topThree = useMemo(() => (top10 || []).slice(0, 3), [top10]);
  const rest = useMemo(() => (top10 || []).slice(3), [top10]);

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden border border-border bg-card shadow-2xl">
      <div className="flex h-full min-h-0 flex-col p-4 xl:p-5">
        {/* Bloque superior fijo */}
        <div className="mb-4 shrink-0">
          <div className="relative flex min-h-[240px] items-end justify-center gap-4 rounded-2xl bg-gradient-to-br from-secondary/50 to-muted/30 p-4 xl:min-h-[280px] xl:gap-6 xl:p-6">
            {loading ? (
              <div className="text-sm font-semibold text-muted-foreground">
                Cargando…
              </div>
            ) : topThree.length === 3 ? (
              <>
                <div className="relative pt-6 xl:pt-8">
                  <PodiumCard participant={topThree[1]} rank={2} />
                </div>

                <div className="relative">
                  <PodiumCard participant={topThree[0]} rank={1} />
                </div>

                <div className="relative pt-6 xl:pt-8">
                  <PodiumCard participant={topThree[2]} rank={3} />
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-muted-foreground">
                No hay suficientes datos para el podio.
              </div>
            )}
          </div>
        </div>

        {/* Lista con scroll interno */}
        <div className="flex-1 min-h-0">
          <div className="h-full min-h-0 overflow-y-auto pr-1">
            <div className="space-y-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl border border-border bg-secondary/50"
                    />
                  ))
                : rest.map((p) => (
                    <RankingRow
                      key={p.id_user ?? p.user_id ?? p.rank}
                      participant={p}
                    />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
