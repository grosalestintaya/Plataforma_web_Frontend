import React, { useMemo, useState } from "react";

function getAvatarImageSrc(imgKey) {
  if (!imgKey) return null;

  // Ajusta esta ruta si tus imágenes están en otra carpeta pública
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
      className="inline-flex rounded-xl border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]"
      style={{
        backgroundColor: status.bg,
        color: status.color,
        borderColor: status.borderColor,
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
      className="flex h-52 items-center justify-center rounded-2xl border p-4"
      style={{
        backgroundColor: "var(--app-bg)",
        borderColor: "var(--card-border)",
      }}>
      {!imageError && src ? (
        <img
          src={src}
          alt={avatar.name}
          className="h-full w-auto object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-xl border px-4 text-center text-sm font-semibold"
          style={{
            backgroundColor: "var(--chip-bg)",
            color: "var(--card-muted)",
            borderColor: "var(--card-border)",
          }}>
          Vista previa no disponible
        </div>
      )}
    </div>
  );
}

function PriceChip({ price }) {
  const label = Number(price) === 0 ? "Gratis" : `${price} monedas`;

  return (
    <div
      className="inline-flex rounded-xl border px-3 py-2 text-sm font-bold"
      style={{
        backgroundColor: "var(--usercard-bg)",
        color: "var(--sidebar)",
        borderColor: "var(--usercard-border)",
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
        className="w-full rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] opacity-80"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--accent-foreground)",
          borderColor: "var(--accent)",
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
        className="w-full rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--accent-foreground)",
          borderColor: "var(--accent)",
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
        className="w-full rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] cursor-not-allowed opacity-75"
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
      className="w-full rounded-2xl border px-4 py-3 text-sm font-extrabold uppercase tracking-[0.16em] transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
        borderColor: "var(--primary)",
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
  return (
    <article
      className="rounded-[24px] border p-4 shadow-sm transition-transform duration-150 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--chip-bg)",
        borderColor: avatar.equipped
          ? "var(--accent)"
          : avatar.owned
            ? "var(--primary)"
            : "var(--card-border)",
      }}>
      <div className="flex items-start justify-between gap-3">
        <StatusBadge avatar={avatar} />
        <PriceChip price={avatar.price_coins} />
      </div>

      <div className="mt-4">
        <AvatarPreview avatar={avatar} />
      </div>

      <div className="mt-4">
        <h3
          className="text-lg font-extrabold leading-tight"
          style={{ color: "var(--card-text)" }}>
          {avatar.name}
        </h3>

        <p
          className="mt-2 min-h-[60px] text-sm leading-relaxed"
          style={{ color: "var(--card-muted)" }}>
          {avatar.description}
        </p>
      </div>

      <div className="mt-4">
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
