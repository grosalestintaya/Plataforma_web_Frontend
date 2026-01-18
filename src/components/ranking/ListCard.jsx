import React, { useMemo } from "react";
import { Card } from "../ui/card";
import PodiumCard from "./PodiumCard";
import RankingRow from "./RankingRow";
import RankBadge from "./RankBadge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials, resolveAvatar } from "./helpers";
import { Star } from "lucide-react";
import XpQuipuIcon from "../../components/icons/XpQuipuIcon";

export default function BoardCard({ rankingState, onRefresh }) {
  const { loading, top10, me, myRank } = rankingState;

  const topThree = useMemo(() => (top10 || []).slice(0, 3), [top10]);
  const rest = useMemo(() => (top10 || []).slice(3), [top10]);

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-2xl">


      <div className="p-6">
        <div className="relative mb-8 flex items-end justify-center gap-8 rounded-2xl bg-gradient-to-br from-secondary/50 to-muted/30 p-8">
          {loading ? (
            <div className="text-sm font-semibold text-muted-foreground">Cargando…</div>
          ) : topThree.length === 3 ? (
            <>
              <div className="relative pt-8">
                <PodiumCard participant={topThree[1]} rank={2} />
              </div>
              <div className="relative">
                <PodiumCard participant={topThree[0]} rank={1} />
              </div>
              <div className="relative pt-8">
                <PodiumCard participant={topThree[2]} rank={3} />
              </div>
            </>
          ) : (
            <div className="text-sm font-semibold text-muted-foreground">No hay suficientes datos para el podio.</div>
          )}
        </div>

 

        <div className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-full border border-border bg-secondary/50" />
              ))
            : rest.map((p) => <RankingRow key={p.id_user ?? p.user_id ?? p.rank} participant={p} />)}
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-3 text-center text-xs uppercase tracking-wider text-muted-foreground">Tu posición</p>

          {me ? (
            <div className="grid grid-cols-[60px_1fr_120px] gap-4 rounded-lg border-2 border-accent bg-gradient-to-r from-accent/20 to-primary/20 p-4">
              <div className="flex items-center">
                <RankBadge position={me.rank} />
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-accent">
                  <AvatarImage src={resolveAvatar(me.img)} alt={me.full_name} />
                  <AvatarFallback className="bg-accent/20 text-accent">{getInitials(me.full_name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="truncate font-semibold text-foreground">{me.full_name}</div>
                  <div className="text-xs font-semibold text-muted-foreground">{me.grade}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <span className="text-xl font-bold text-accent">{me.xp_total.toLocaleString()}</span>
                  <XpQuipuIcon className="h-5 w-5 text-accent" />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
              No se encontró tu posición en el ranking.
              {typeof myRank === "number" ? <span className="ml-1">Tu rank actual es #{myRank}.</span> : null}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
