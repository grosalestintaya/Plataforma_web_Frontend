import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../shared/atoms/avatar";
import { getInitials, resolveAvatar } from "../helpers/helpers";
import XpQuipuIcon from "../../../shared/icons/XpQuipuIcon";

export default function RankingRow({ participant }) {
  return (
    <div className="group flex items-center gap-4 rounded-full border border-border bg-secondary/50 py-3 pl-4 pr-0 transition-all hover:border-primary/50 hover:bg-secondary hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
        #{participant.rank}
      </div>

      <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/30">
        <AvatarImage
          src={resolveAvatar(participant.img)}
          alt={participant.full_name}
        />
        <AvatarFallback className="bg-primary/20 text-primary">
          {getInitials(participant.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-foreground">
          {participant.full_name}
        </div>
        <div className="mt-1 text-xs font-semibold text-muted-foreground">
          {participant.grade}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-accent">
          {participant.xp_total.toLocaleString()}
        </span>

        {/* Badge XP */}
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/25">
          <XpQuipuIcon className="h-10 w-10 text-accent" />
        </span>
      </div>
    </div>
  );
}
