import React from "react";
import MascotTutorDemo from "@/features/guidepet/MascotTutorDemo";
import xpicon from "@/assets/dashboard/xp.png";
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

function StatBadge({
  iconSrc,
  label,
  value,
  themeHex,
  iconBg = "rgba(255,255,255,0.12)",
}) {
  return (
    <div
      className="flex min-w-[138px] items-center gap-3 rounded-2xl px-3 py-2.5"
      style={{
        background: `linear-gradient(180deg, ${withAlpha(
          "#ffffff",
          0.08,
        )}, ${withAlpha("#000000", 0.18)})`,
        boxShadow: `
          0 12px 28px ${withAlpha("#000000", 0.24)},
          0 0 0 1px ${withAlpha("#ffffff", 0.12)},
          0 0 0 4px ${withAlpha(themeHex, 0.08)}
        `,
        backdropFilter: "blur(8px)",
      }}>
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{
          background: iconBg,
          boxShadow: `inset 0 1px 0 ${withAlpha("#ffffff", 0.1)}`,
        }}>
        <img
          src={iconSrc}
          alt={label}
          draggable={false}
          className="h-6 w-6 object-contain"
        />
      </div>

      <div className="leading-tight">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
          {label}
        </div>
        <div className="text-base font-extrabold text-white/95">
          {value ?? 0}
        </div>
      </div>
    </div>
  );
}

export default function ModuleMenuMascotPanel({
  mascot,
  themeHex,
  text,
  wallet = { xp: 0, coins: 0 },
}) {
  return (className =
    "mt-2 flex justify-center xl:absolute xl:right-0 xl:top-[39%] xl:mt-0 xl:w-[290px] xl:-translate-y-1/2" >
    (
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
    ));
}
