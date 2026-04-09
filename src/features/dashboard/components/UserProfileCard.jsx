import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/atoms/avatar";
import { getInitials, resolveAvatar } from "../helpers/helpers";
import InsigniasGrid from "./InsigniasGrid";
import XpQuipuIcon from "@/shared/icons/XpQuipuIcon";

export default function UserProfileCard({ me, myRank, insigniasState }) {
  const progressPct = useMemo(() => {
    const xp = me?.xp_total ?? 0;
    const max = 1000;
    return Math.min(100, Math.max(0, (xp / max) * 100));
  }, [me]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-4 xl:p-5">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Bloque principal */}
        <div className="shrink-0 rounded-2xl border border-border bg-gradient-to-br from-secondary/60 to-muted/30 p-4 xl:p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 blur-xl" />
              <div className="relative h-20 w-20 rounded-full border-4 border-primary/40 bg-gradient-to-br from-primary/20 to-accent/20 p-1 xl:h-24 xl:w-24">
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={resolveAvatar(me?.img ?? "default")}
                    alt={me?.full_name ?? "Perfil"}
                  />
                  <AvatarFallback className="bg-primary text-xl text-primary-foreground xl:text-2xl">
                    {getInitials(me?.full_name ?? "Usuario")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold text-foreground xl:text-xl">
                {me?.full_name ?? "—"}
              </h3>

              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {me?.grade ?? "—"}
              </p>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Posición
                </span>
                <span className="text-sm font-bold text-accent">
                  {typeof myRank === "number" ? `#${myRank}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* XP */}
        <div className="mt-4 shrink-0 rounded-2xl border border-border bg-gradient-to-br from-secondary to-secondary/50 p-4 xl:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Total XP
              </p>
              <p className="mt-1 truncate text-2xl font-bold text-foreground xl:text-3xl">
                {(me?.xp_total ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/80 xl:h-14 xl:w-14">
              <XpQuipuIcon className="h-8 w-8 text-accent xl:h-10 xl:w-10" />
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-accent to-primary"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="mt-2 text-[11px] font-medium text-muted-foreground">
            Progreso visual hacia 1080 XP
          </div>
        </div>

        {/* Insignias */}
        <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-background/30 p-3 xl:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Insignias
            </h4>

            <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-semibold text-foreground">
              {insigniasState.count ?? 0}
            </span>
          </div>

          <div className="h-full min-h-0 overflow-hidden">
            <InsigniasGrid
              loading={insigniasState.loading}
              insignias={insigniasState.items}
              count={insigniasState.count}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
