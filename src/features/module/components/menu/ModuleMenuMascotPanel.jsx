import React from "react";
import MascotTutorDemo from "@/features/guidepet/MascotTutorDemo";
import CoinsPanel from "./coins";
import XpPanel from "./xp";
function hexToRgb(hex) {
  const h = String(hex || "#000")
    .replace("#", "")
    .trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");

  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function ModuleMenuMascotPanel({
  mascot,
  themeHex,
  text,
  wallet = { xp: 0, coins: 0 },
  className = "",
}) {
  return (
    <aside className={`flex h-full w-full justify-center ${className}`}>
      <div className="flex h-full w-full max-w-[360px] min-h-0 flex-col gap-1.5 px-1 sm:gap-2 sm:px-0">
        {/* El panel inferior se compacta en sm/md/lg para que entre completo
            cuando la mascota todavia comparte una altura limitada. */}
        <div className="flex origin-top flex-wrap items-center justify-center gap-1.5 scale-[0.74] sm:scale-[0.8] md:scale-[0.86] lg:scale-[0.92] xl:scale-100">
          <XpPanel monedas={wallet?.xp ?? 0} themeHex={themeHex} />
          <CoinsPanel monedas={wallet?.coins ?? 0} themeHex={themeHex} />
        </div>

        <div className="min-h-0 flex-1">
          <MascotTutorDemo
            gifSrc={mascot?.gif}
            name={mascot?.name}
            themeHex={themeHex}
            text={text}
          />
        </div>
      </div>
    </aside>
  );
}
