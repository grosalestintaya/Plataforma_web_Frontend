import React, { useMemo, useState } from "react";

function getAvatarImageSrc(imgKey) {
  if (!imgKey) return null;
  return `/avatars/${imgKey}.png`;
}

function StatusBadge({ avatar }) {
  const status = useMemo(() => {
    if (avatar.equipped)
      return {
        label: "Equipado",
        bg: "var(--accent)",
        color: "var(--accent-foreground)",
        borderColor: "var(--accent)",
      };
    if (avatar.owned)
      return {
        label: "Comprado",
        bg: "var(--dash-title-bg)",
        color: "var(--dash-title-text)",
        borderColor: "var(--usercard-border)",
      };
    return {
      label: "Disponible",
      bg: "var(--usercard-bg)",
      color: "var(--sidebar)",
      borderColor: "var(--usercard-border)",
    };
  }, [avatar]);

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.16em]"
      style={{
        backgroundColor: status.bg,
        color: status.color,
        borderColor: status.borderColor,
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}>
      {status.label}
    </span>
  );
}

function AvatarPreview({ avatar }) {
  const [imageError, setImageError] = useState(false);
  const src = getAvatarImageSrc(avatar.img_avatar);

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden border p-2"
      style={{
        height: "200px",
        width: "200px",
        borderRadius: "50%", // 👈 círculo perfecto (antes rounded-[86px])
        alignSelf: "center", // 👈 centrado horizontal en el flex column del card
        background:
          "radial-gradient(circle at top, var(--usercard-bg) 0%, var(--app-bg) 58%, var(--chip-bg) 100%)",
        borderColor: "var(--card-border)",
      }}>
      <div
        className="pointer-events-none absolute inset-x-[18%] top-3 h-10 rounded-full blur-2xl"
        style={{ backgroundColor: "var(--sidebar)", opacity: 0.15 }}
      />

      {!imageError && src ? (
        <img
          src={src}
          alt={avatar.name}
          className="relative z-10 h-full max-h-full w-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.22)] transition duration-200 hover:scale-[1.06]"
          style={{ borderRadius: "50%" }} // 👈 imagen también circular
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="relative z-10 flex h-full w-full items-center justify-center px-3 text-center text-xs font-semibold"
          style={{
            borderRadius: "50%", // 👈 fallback también circular
            backgroundColor: "var(--chip-bg)",
            color: "var(--card-muted)",
            borderColor: "var(--card-border)",
          }}>
          Vista previa no disponible
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-x-4 bottom-2 h-4 rounded-full blur-xl"
        style={{ backgroundColor: "rgba(0,0,0,0.16)" }}
      />
    </div>
  );
}

function PriceChip({ price }) {
  const isFree = Number(price) === 0;
  return (
    <div
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold"
      style={{
        backgroundColor: "var(--usercard-bg)",
        color: "var(--sidebar)",
        borderColor: "var(--usercard-border)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
      }}>
      {isFree ? "Gratis" : `🪙 ${price}`}
    </div>
  );
}

function ActionButton({ avatar, currentCoins, busy, onPurchase, onEquip }) {
  const price = Number(avatar.price_coins || 0);
  const canAfford = currentCoins >= price;
  const isFree = price === 0;

  const base =
    "w-full rounded-xl border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.15em] transition duration-150";

  if (avatar.equipped) {
    return (
      <button
        type="button"
        disabled
        className={`${base} opacity-90`}
        style={{
          background:
            "linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 82%, black) 100%)",
          color: "var(--accent-foreground)",
          borderColor: "var(--accent)",
        }}>
        ✓ Equipado
      </button>
    );
  }
  if (avatar.owned) {
    return (
      <button
        type="button"
        onClick={() => onEquip(avatar)}
        disabled={busy}
        className={`${base} hover:-translate-y-0.5 disabled:opacity-70`}
        style={{
          background:
            "linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 82%, black) 100%)",
          color: "var(--accent-foreground)",
          borderColor: "var(--accent)",
          boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
        }}>
        {busy ? "Equipando..." : "Equipar"}
      </button>
    );
  }
  if (!isFree && !canAfford) {
    return (
      <button
        type="button"
        disabled
        className={`${base} cursor-not-allowed opacity-70`}
        style={{
          backgroundColor: "var(--progress-track)",
          color: "var(--card-muted)",
          borderColor: "var(--card-border)",
        }}>
        Sin monedas
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onPurchase(avatar)}
      disabled={busy}
      className={`${base} hover:-translate-y-0.5 disabled:opacity-70`}
      style={{
        background:
          "linear-gradient(180deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 82%, black) 100%)",
        color: "var(--primary-foreground)",
        borderColor: "var(--primary)",
        boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
      }}>
      {busy ? "Comprando..." : "Comprar"}
    </button>
  );
}

export default function AvatarCard({
  avatar,
  currentCoins,
  busy,
  onPurchase,
  onEquip,
}) {
  const isHighlighted = avatar.equipped || avatar.owned;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[20px] border p-3 transition duration-200 hover:-translate-y-0.5"
      style={{
        background:
          "linear-gradient(180deg, var(--chip-bg) 0%, color-mix(in srgb, var(--chip-bg) 90%, black) 100%)",
        borderColor: avatar.equipped
          ? "var(--accent)"
          : avatar.owned
            ? "var(--primary)"
            : "var(--card-border)",
        boxShadow: isHighlighted
          ? "0 14px 28px rgba(0,0,0,0.12)"
          : "0 8px 20px rgba(0,0,0,0.08)",
      }}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <StatusBadge avatar={avatar} />
        <PriceChip price={avatar.price_coins} />
      </div>

      <AvatarPreview avatar={avatar} />

      <div className="mt-2.5 flex flex-1 flex-col gap-2">
        <h3
          className="line-clamp-1 text-sm font-extrabold leading-tight"
          style={{ color: "var(--card-text)" }}>
          {avatar.name}
        </h3>

        <p
          className="line-clamp-2 flex-1 text-[11px] leading-relaxed"
          style={{ color: "var(--card-muted)" }}>
          {avatar.description}
        </p>

        <ActionButton
          avatar={avatar}
          currentCoins={currentCoins}
          busy={busy}
          onPurchase={onPurchase}
          onEquip={onEquip}
        />
      </div>
    </article>
  );
}
