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
}) {
  return (
    <aside className="mt-2 flex justify-center xl:absolute xl:right-0 xl:top-[44%] xl:mt-0 xl:w-[267px] xl:-translate-y-1/2">
      <div className="flex w-full max-w-[360px] flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-center gap-3 xl:justify-start">
          <XpPanel monedas={wallet?.xp ?? 0} themeHex={themeHex} />
          <CoinsPanel monedas={wallet?.coins ?? 0} themeHex={themeHex} />
        </div>

        <MascotTutorDemo
          gifSrc={mascot?.gif}
          name={mascot?.name}
          themeHex={themeHex}
          text={text}
        />
      </div>
    </aside>
  );
}
