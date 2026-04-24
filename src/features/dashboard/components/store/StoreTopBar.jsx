import React from "react";
import { ShieldCheck } from "lucide-react";
import coin from "@/assets/dashboard/coin.png";

function StatChip({
  label,
  value,
  icon,
  imgSrc,
  imgAlt = label,
  tone = "default",
}) {
  const isCoin = tone === "coin";

  return (
    <div
      className="relative overflow-hidden rounded-[14px] border flex items-center gap-2 px-3 py-1.5"
      style={{
        background: isCoin
          ? "linear-gradient(135deg, color-mix(in srgb, var(--coin-panel-bg) 85%, white) 0%, var(--coin-panel-bg) 100%)"
          : "linear-gradient(135deg, var(--usercard-bg) 0%, color-mix(in srgb, var(--chip-bg) 90%, black) 100%)",
        color: isCoin ? "var(--coin-panel-text)" : "var(--sidebar)",
        borderColor: isCoin
          ? "color-mix(in srgb, var(--coin-panel-bg) 60%, black)"
          : "var(--usercard-border)",
        boxShadow: isCoin
          ? "0 4px 12px color-mix(in srgb, var(--coin-panel-bg) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.18)"
          : "0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
      {/* shine strip */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{ background: "rgba(255,255,255,0.22)" }}
      />

      {imgSrc ? (
        <img
          src={imgSrc}
          alt={imgAlt}
          className="h-8 w-8 shrink-0 drop-shadow-sm"
        />
      ) : (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}>
          {icon}
        </div>
      )}

      <div className="min-w-0 flex flex-col">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.20em] opacity-60 leading-none mb-0.5">
          {label}
        </p>
        <p
          className="truncate text-sm font-extrabold leading-none"
          style={{ fontSize: "clamp(13px, 2.2vw, 17px)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function StoreTopBar({ wallet, equippedAvatarName }) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] border px-4 py-2.5"
      style={{
        background:
          "linear-gradient(180deg, var(--usercard-bg) 0%, color-mix(in srgb, var(--chip-bg) 93%, black) 100%)",
        borderColor: "var(--usercard-border)",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
      {/* glows */}
      <div
        className="pointer-events-none absolute -left-6 -top-4 h-16 w-16 rounded-full blur-2xl"
        style={{ backgroundColor: "var(--primary)", opacity: 0.18 }}
      />
      <div
        className="pointer-events-none absolute right-0 -top-4 h-14 w-14 rounded-full blur-2xl"
        style={{ backgroundColor: "var(--accent)", opacity: 0.16 }}
      />
      {/* top shine */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{ background: "rgba(255,255,255,0.14)" }}
      />

      <div className="relative flex items-center justify-between gap-4">
        {/* Title block */}
        <div className="min-w-0">
          <h1
            className="truncate font-extrabold tracking-tight leading-none"
            style={{
              color: "var(--sidebar)",
              fontSize: "clamp(15px, 2.5vw, 22px)",
            }}>
            Tienda de avatares
          </h1>
          <p
            className="mt-0.5 text-xs leading-tight hidden sm:block"
            style={{ color: "var(--card-muted)" }}>
            Desbloquea apariencias y equipa tu mejor estilo.
          </p>
        </div>

        {/* Chips */}
        <div className="flex items-center gap-2 shrink-0">
          <StatChip
            label="Monedas"
            value={(wallet?.coins_total ?? 0).toLocaleString()}
            tone="coin"
            imgSrc={coin}
          />
          <StatChip
            label="Equipado"
            value={equippedAvatarName || "Sin equipar"}
            tone="default"
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
          />
        </div>
      </div>
    </div>
  );
}
