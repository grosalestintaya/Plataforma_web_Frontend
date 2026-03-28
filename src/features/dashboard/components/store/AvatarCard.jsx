import React, { useMemo, useState } from "react";

function getAvatarImageSrc(imgKey) {
  if (!imgKey) return null;
  return `/avatars/${imgKey}.png`;
}

function StatusBadge({ avatar }) {
  const status = useMemo(() => {
    if (avatar.equipped) {
      return {
        label: "Equipado",
        bg: "var(--accent)",
        color: "var(--accent-foreground)",
        borderColor: "var(--accent)",
      };
    }

    if (avatar.owned) {
      return {
        label: "Comprado",
        bg: "var(--dash-title-bg)",
        color: "var(--dash-title-text)",
        borderColor: "var(--usercard-border)",
      };
    }

    return {
      label: "Disponible",
      bg: "var(--usercard-bg)",
      color: "var(--sidebar)",
      borderColor: "var(--usercard-border)",
    };
  }, [avatar]);

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] sm:text-[11px]"
      style={{
        backgroundColor: status.bg,
        color: status.color,
        borderColor: status.borderColor,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
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
      className="relative flex h-40 items-center justify-center overflow-hidden rounded-[22px] border p-3 sm:h-44 md:h-48 xl:h-44 2xl:h-48"
      style={{
        background:
          "radial-gradient(circle at top, var(--usercard-bg) 0%, var(--app-bg) 58%, var(--chip-bg) 100%)",
        borderColor: "var(--card-border)",
      }}>
      <div
        className="pointer-events-none absolute inset-x-[18%] top-4 h-20 rounded-full blur-2xl"
        style={{
          backgroundColor: "var(--sidebar)",
          opacity: 0.16,
        }}
      />

      {!imageError && src ? (
        <img
          src={src}
          alt={avatar.name}
          className="relative z-10 h-full max-h-full w-auto object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.22)] transition duration-200 hover:scale-[1.03]"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="relative z-10 flex h-full w-full items-center justify-center rounded-xl border px-4 text-center text-sm font-semibold"
          style={{
            backgroundColor: "var(--chip-bg)",
            color: "var(--card-muted)",
            borderColor: "var(--card-border)",
          }}>
          Vista previa no disponible
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-x-4 bottom-3 h-5 rounded-full blur-xl"
        style={{
          backgroundColor: "rgba(0,0,0,0.18)",
        }}
      />
    </div>
  );
}

function PriceChip({ price }) {
  const label = Number(price) === 0 ? "Gratis" : `${price} monedas`;

  return (
    <div
      className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-extrabold sm:text-sm"
      style={{
        backgroundColor: "var(--usercard-bg)",
        color: "var(--sidebar)",
        borderColor: "var(--usercard-border)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
      }}>
      {label}
    </div>
  );
}

function ActionButton({ avatar, currentCoins, busy, onPurchase, onEquip }) {
  const price = Number(avatar.price_coins || 0);
  const canAfford = currentCoins >= price;
  const isFree = price === 0;

  if (avatar.equipped) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] opacity-90"
        style={{
          background:
            "linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 82%, black) 100%)",
          color: "var(--accent-foreground)",
          borderColor: "var(--accent)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
        }}>
        Equipado
      </button>
    );
  }

  if (avatar.owned) {
    return (
      <button
        type="button"
        onClick={() => onEquip(avatar)}
        disabled={busy}
        className="w-full rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] transition duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          background:
            "linear-gradient(180deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 82%, black) 100%)",
          color: "var(--accent-foreground)",
          borderColor: "var(--accent)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
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
        className="w-full cursor-not-allowed rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] opacity-80"
        style={{
          backgroundColor: "var(--progress-track)",
          color: "var(--card-muted)",
          borderColor: "var(--card-border)",
        }}>
        Monedas insuficientes
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPurchase(avatar)}
      disabled={busy}
      className="w-full rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] transition duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background:
          "linear-gradient(180deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 82%, black) 100%)",
        color: "var(--primary-foreground)",
        borderColor: "var(--primary)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
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
      className="group flex h-full min-h-[360px] flex-col overflow-hidden rounded-[26px] border p-3 shadow-sm transition duration-200 hover:-translate-y-1 sm:min-h-[390px] sm:p-4"
      style={{
        background:
          "linear-gradient(180deg, var(--chip-bg) 0%, color-mix(in srgb, var(--chip-bg) 90%, black) 100%)",
        borderColor: avatar.equipped
          ? "var(--accent)"
          : avatar.owned
            ? "var(--primary)"
            : "var(--card-border)",
        boxShadow: isHighlighted
          ? "0 16px 34px rgba(0,0,0,0.12)"
          : "0 10px 24px rgba(0,0,0,0.08)",
      }}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <StatusBadge avatar={avatar} />
        <PriceChip price={avatar.price_coins} />
      </div>

      <div className="mt-3 sm:mt-4">
        <AvatarPreview avatar={avatar} />
      </div>

      <div className="mt-3 flex flex-1 flex-col sm:mt-4">
        <h3
          className="line-clamp-2 text-base font-extrabold leading-tight sm:text-lg"
          style={{ color: "var(--card-text)" }}>
          {avatar.name}
        </h3>

        <p
          className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed"
          style={{ color: "var(--card-muted)" }}>
          {avatar.description}
        </p>

        <div className="mt-4">
          <ActionButton
            avatar={avatar}
            currentCoins={currentCoins}
            busy={busy}
            onPurchase={onPurchase}
            onEquip={onEquip}
          />
        </div>
      </div>
    </article>
  );
}
