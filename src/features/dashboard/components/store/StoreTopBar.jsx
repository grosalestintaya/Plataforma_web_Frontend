import React from "react";
import { ShieldCheck, Sparkles, Sword } from "lucide-react";
import coin from "@/assets/dashboard/coin.png";
function StatChip({
  label,
  value,
  icon,
  imgSrc,
  imgAlt = label,
  tone = "default",
}) {
  const styles =
    tone === "coin"
      ? {
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--coin-panel-bg) 90%, white) 0%, var(--coin-panel-bg) 100%)",
          color: "var(--coin-panel-text)",
          borderColor: "color-mix(in srgb, var(--coin-panel-bg) 72%, black)",
          iconBg: "rgba(255,255,255,0.16)",
          shadow:
            "0 10px 22px color-mix(in srgb, var(--coin-panel-bg) 24%, transparent)",
        }
      : {
          background:
            "linear-gradient(180deg, var(--usercard-bg) 0%, color-mix(in srgb, var(--chip-bg) 90%, black) 100%)",
          color: "var(--sidebar)",
          borderColor: "var(--usercard-border)",
          iconBg: "rgba(255,255,255,0.12)",
          shadow: "0 10px 22px rgba(0,0,0,0.08)",
        };

  return (
    <div
      className="relative overflow-hidden rounded-[20px] border px-3 py-2.5"
      style={{
        background: styles.background,
        color: styles.color,
        borderColor: styles.borderColor,
        boxShadow: styles.shadow,
      }}>
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-8 rounded-full blur-2xl"
        style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
      />

      <div className="relative flex items-center gap-2.5">
        {imgSrc ? (
          <img src={imgSrc} alt={imgAlt} className="h-16 w-16" />
        ) : (
          icon
        )}

        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] opacity-80">
            {label}
          </p>
          <p className="truncate text-md font-extrabold md:text-[28px]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StoreTopBar({ wallet, equippedAvatarName }) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] border px-4 py-4 md:px-5 md:py-4"
      style={{
        background:
          "linear-gradient(180deg, var(--usercard-bg) 0%, color-mix(in srgb, var(--chip-bg) 93%, black) 100%)",
        borderColor: "var(--usercard-border)",
        boxShadow:
          "0 14px 30px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
      <div
        className="pointer-events-none absolute -left-8 top-0 h-20 w-20 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--primary)", opacity: 0.14 }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-full blur-3xl"
        style={{ backgroundColor: "var(--accent)", opacity: 0.14 }}
      />

      <div className="relative flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="mt-2 flex items-center gap-2">
            <h1
              className="truncate text-xl font-extrabold tracking-tight md:text-3xl"
              style={{ color: "var(--sidebar)" }}>
              Tienda de avatares
            </h1>
          </div>

          <p
            className="mt-1 max-w-2xl text-sm leading-relaxed"
            style={{ color: "var(--card-muted)" }}>
            Desbloquea apariencias y equipa tu mejor estilo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[500px]">
          <StatChip
            label="MONEDAS"
            value={(wallet?.coins_total ?? 0).toLocaleString()}
            tone="coin"
            imgSrc={coin}
          />

          <StatChip
            label="Equipado"
            value={equippedAvatarName || "Sin equipar"}
            tone="default"
            icon={<ShieldCheck className="h-4.5 w-4.5" />}
          />
        </div>
      </div>
    </div>
  );
}
