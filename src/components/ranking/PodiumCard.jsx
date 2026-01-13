import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Zap, Trophy, Crown,  } from "lucide-react";
import { getInitials, resolveAvatar } from "./helpers";
import XpQuipuIcon from "../../components/icons/XpQuipuIcon";

export default function PodiumCard({ participant, rank }) {
  const isFirst = rank === 1;
  const size = isFirst ? "h-32 w-32" : "h-24 w-24";
  const badgeSize = isFirst ? "h-16 w-16" : "h-12 w-12";

  const rankColors = {
    1: "from-yellow-400 via-yellow-500 to-amber-600",
    2: "from-slate-300 via-slate-400 to-slate-500",
    3: "from-amber-600 via-orange-600 to-orange-700",
  };

  if (!participant) return null;

  return (
    <div className={`flex flex-col items-center gap-4 ${isFirst ? "scale-110" : ""}`}>
      <div
        className={`flex ${badgeSize} items-center justify-center rounded-full bg-gradient-to-br ${rankColors[rank]} shadow-lg`}
      >
        {isFirst ? <Crown className="h-8 w-8 fill-white text-white" /> : <Trophy className="h-6 w-6 fill-white text-white" />}
      </div>

      <div className="relative">
        <div className={`absolute inset-0 animate-spin-slow rounded-full bg-gradient-to-br ${rankColors[rank]} opacity-30 blur-md`} />
        <div className={`relative ${size} rounded-full border-4 bg-gradient-to-br ${rankColors[rank]} p-1 shadow-xl`}>
          <Avatar className="h-full w-full border-2 border-background">
            <AvatarImage src={resolveAvatar(participant.img)} alt={participant.full_name} />
            <AvatarFallback className="text-2xl">{getInitials(participant.full_name)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-2xl opacity-50">🌿</div>
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 scale-x-[-1] text-2xl opacity-50">🌿</div>
      </div>

      <div className="text-center">
        <p className={`font-bold ${isFirst ? "text-xl" : "text-base"} text-foreground`}>{participant.full_name}</p>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className={`font-bold ${isFirst ? "text-2xl" : "text-xl"} text-accent`}>{(participant.xp_total ?? 0).toLocaleString()}</span>
<XpQuipuIcon className="h-10 w-10 text-accent" />
        </div>
        <div className="mt-2 text-xs font-semibold text-muted-foreground">{participant.grade}</div>
      </div>
    </div>
  );
}
