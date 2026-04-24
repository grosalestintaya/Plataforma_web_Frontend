import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../shared/atoms/avatar";
import { getInitials, resolveAvatar } from "../helpers/helpers";
import XpQuipuIcon from "../../../shared/icons/XpQuipuIcon";

function ChakanaBadge({ rank, isFirst }) {
  const palette = {
    1: {
      shell: "from-yellow-300 via-yellow-500 to-amber-700",
      fill: "rgba(255,255,255,0.92)",
      glow: "rgba(245, 191, 36, 0.34)",
    },
    2: {
      shell: "from-slate-200 via-slate-400 to-slate-600",
      fill: "rgba(255,255,255,0.92)",
      glow: "rgba(148, 163, 184, 0.30)",
    },
    3: {
      shell: "from-amber-500 via-orange-600 to-orange-800",
      fill: "rgba(255,255,255,0.92)",
      glow: "rgba(194, 101, 31, 0.30)",
    },
  };

  const style = palette[rank] || palette[3];
  const size = isFirst ? "h-16 w-16" : "h-13 w-13";

  return (
    <div className="relative">
      <div
        className={`absolute inset-0 rounded-full blur-xl ${
          isFirst ? "animate-pulse" : ""
        }`}
        style={{ backgroundColor: style.glow }}
      />

      <div
        className={`relative ${size} rounded-2xl bg-gradient-to-br ${style.shell} p-[3px] shadow-lg`}
        style={{
          boxShadow: `0 10px 26px ${style.glow}, inset 0 1px 0 rgba(255,255,255,0.22)`,
        }}>
        <div className="relative flex h-full w-full items-center justify-center rounded-[14px] bg-black/15 backdrop-blur-[1px]">
          <div className="relative h-8 w-8">
            <span
              className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-[2px]"
              style={{ backgroundColor: style.fill }}
            />
            <span
              className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px]"
              style={{ backgroundColor: style.fill }}
            />
            <span
              className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-[2px]"
              style={{ backgroundColor: style.fill }}
            />
            <span
              className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-[2px]"
              style={{ backgroundColor: style.fill }}
            />
            <span
              className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-[2px]"
              style={{ backgroundColor: style.fill }}
            />

            <span
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                backgroundColor: "transparent",
                borderColor: style.fill,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PodiumCard({ participant, rank }) {
  if (!participant) return null;

  const isFirst = rank === 1;
  const size = isFirst ? "h-32 w-32" : "h-24 w-24";

  const rankStyles = {
    1: {
      ring: "from-yellow-300 via-yellow-500 to-amber-600",
      badgeBg: "from-yellow-400 via-yellow-500 to-amber-600",
    },
    2: {
      ring: "from-slate-200 via-slate-400 to-slate-600",
      badgeBg: "from-slate-300 via-slate-400 to-slate-600",
    },
    3: {
      ring: "from-amber-500 via-orange-600 to-orange-800",
      badgeBg: "from-amber-500 via-orange-600 to-orange-800",
    },
  };

  const style = rankStyles[rank] || rankStyles[3];

  return (
    <div
      className={`flex flex-col items-center gap-4 ${isFirst ? "scale-110" : ""}`}>
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${style.ring} opacity-30 blur-md ${
            isFirst ? "animate-spin-slow" : ""
          }`}
        />

        <div
          className={`relative ${size} rounded-full border-4 bg-gradient-to-br ${style.ring} p-1 shadow-xl`}>
          <Avatar className="h-full w-full border-2 border-background">
            <AvatarImage
              src={resolveAvatar(participant.img)}
              alt={participant.full_name}
            />
            <AvatarFallback className="text-2xl">
              {getInitials(participant.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div
          className={`absolute -bottom-2 left-1/2 flex h-9 min-w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br px-3 shadow-md ${style.badgeBg}`}>
          <span className="text-sm font-black text-white">#{rank}</span>
        </div>

        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-2xl opacity-50">
          𓆰
        </div>
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 scale-x-[-1] text-2xl opacity-50">
          𓆰
        </div>
      </div>

      <div className="text-center">
        <p
          className={`font-bold text-foreground ${isFirst ? "text-xl" : "text-base"}`}>
          {participant.full_name}
        </p>

        <div className="mt-1 flex items-center justify-center gap-1">
          <span
            className={`font-bold text-accent ${isFirst ? "text-2xl" : "text-xl"}`}>
            {(participant.xp_total ?? 0).toLocaleString()}
          </span>
          <XpQuipuIcon className="h-10 w-10 text-accent" />
        </div>

        <div className="mt-2 text-xs font-semibold text-muted-foreground">
          {participant.grade}
        </div>
      </div>
    </div>
  );
}
