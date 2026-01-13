import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Zap } from "lucide-react";
import { Star } from "lucide-react";
import { getInitials, resolveAvatar } from "./helpers";
import InsigniasGrid from "./InsigniasGrid";
import XpQuipuIcon from "../../components/icons/XpQuipuIcon";

export default function UserProfileCard({ me, myRank, insigniasState }) {
  const progressPct = useMemo(() => {
    const xp = me?.xp_total ?? 0;
    const max = 5000;
    return Math.min(100, Math.max(0, (xp / max) * 100));
  }, [me]);

  return (
    <div className="relative p-6">
      <div className="mb-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Perfil</span>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 blur-xl" />
          <div className="relative h-28 w-28 rounded-full border-4 border-primary/50 bg-gradient-to-br from-primary/20 to-accent/20 p-1">
            <Avatar className="h-full w-full">
              <AvatarImage src={resolveAvatar(me?.img ?? "default")} alt={me?.full_name ?? "Perfil"} />
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {getInitials(me?.full_name ?? "Usuario")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">{me?.full_name ?? "—"}</h3>
          <p className="text-sm text-muted-foreground">{me?.grade ?? "—"}</p>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1">
            <span className="text-xs text-muted-foreground">Posición</span>
            <span className="text-sm font-bold text-accent">{typeof myRank === "number" ? `#${myRank}` : "—"}</span>
          </div>
        </div>

        <div className="w-full">
          <div className="rounded-xl border border-border bg-gradient-to-br from-secondary to-secondary/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total XP</p>
                <p className="mt-1 text-4xl font-bold text-foreground">{(me?.xp_total ?? 0).toLocaleString()}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/80">
                <XpQuipuIcon className="h-12 w-12 text-accent" />
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-to-r from-accent to-primary" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="mt-3 text-xs font-semibold text-muted-foreground">Progreso visual (meta 5,000 XP)</div>
          </div>
        </div>

        <div className="w-full">
          <h4 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Insignias
          </h4>

          <InsigniasGrid
            loading={insigniasState.loading}
            insignias={insigniasState.items}
            count={insigniasState.count}
          />
        </div>
      </div>
    </div>
  );
}
