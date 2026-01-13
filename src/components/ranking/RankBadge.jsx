import React from "react";

export default function RankBadge({ position }) {
  const isTopThree = position <= 3;

  const gradientColors = {
    1: "from-yellow-400 via-yellow-500 to-amber-600",
    2: "from-slate-300 via-slate-400 to-slate-500",
    3: "from-amber-600 via-orange-600 to-orange-700",
  };

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold transition-all ${
          isTopThree
            ? `bg-gradient-to-br ${gradientColors[position]} text-white shadow-lg`
            : "bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-300"
        }`}
      >
        <span className="text-lg">{position}</span>
      </div>
    </div>
  );
}
