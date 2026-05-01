// LobbyTemplate.jsx

import coinIcon from "@/assets/dashboard/coin.png";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { renderSlot } from "../../_core/SlotRenderer";
import * as Blocks from "@/features/module/blocks";
import { useEquippedAvatar } from "@/features/dashboard/services/useEquippedAvatar.service";

// ─── Constantes ───────────────────────────────────────────────────────────────

const XP_ICON_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg width="76" height="82" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="9" r="6" stroke="#facc15" stroke-width="1.8" />
    <path d="M8.2 4.8c1 .6 2 .6 3 0 1-.6 2-.6 3 0 1 .6 2 .6 3 0" stroke="#facc15" stroke-width="1" opacity="0.35" stroke-linecap="round" />
    <path d="M9 15v4" stroke="#facc15" stroke-width="1.6" stroke-linecap="round" />
    <circle cx="9" cy="17" r="0.9" fill="#facc15" />
    <circle cx="9" cy="19" r="0.7" fill="#facc15" opacity="0.75" />
    <path d="M12 15v5" stroke="#facc15" stroke-width="1.8" stroke-linecap="round" />
    <circle cx="12" cy="17.2" r="1.1" fill="#facc15" />
    <circle cx="12" cy="19.6" r="0.85" fill="#facc15" opacity="0.8" />
    <path d="M15 15v4" stroke="#facc15" stroke-width="1.6" stroke-linecap="round" />
    <circle cx="15" cy="17" r="0.9" fill="#facc15" />
    <circle cx="15" cy="19" r="0.7" fill="#facc15" opacity="0.75" />
  </svg>
`)}`;

const VARIANT_BY_TEMPLATE = {
  preGameLobby: "preGame",
  postGameLobby: "postGame",
  waitLobby: "wait",
};

// ─── Design tokens compartidos ────────────────────────────────────────────────
// Una sola paleta para las 3 variantes — borde amarillo, fondo negro/35, blur.

const UI = {
  card: [
    "relative",
    "rounded-[28px]",
    "border-3 border-yellow-400/60",
    "bg-yellow-500/15 backdrop-blur-md",
    "transition-all duration-300",
    "hover:border-yellow-300",
    "hover:shadow-[0_0_0_2px_rgba(255,255,255,0.08),0_0_28px_rgba(250,204,21,0.28)]",
  ].join(" "),

  // Línea decorativa superior (shine)
  shine: [
    "before:absolute before:inset-x-6 before:top-0",
    "before:h-px before:bg-gradient-to-r",
    "before:from-transparent before:via-red-300/60 before:to-transparent",
  ].join(" "),

  // Avatar: borde doble cartoon
  avatar: [
    "relative overflow-hidden",
    "rounded-[28px]",
    "border-3 border-yellow-400/90",
  ].join(" "),

  title: [
    "px-1 py-5 text-center",
    "text-yellow-300 font-black tracking-wide uppercase",
  ].join(" "),

  body: [
    "px-8 py-6",
    "text-white/85 text-2xl leading-relaxed font-normal tracking-[0.01em]",
  ].join(" "),

  feedback: [
    "px-8 py-5 text-center",
    "text-yellow-200/80 text-xl font-medium",
  ].join(" "),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function typographySlot(area, contentKey, fallbackVariant, extra = {}) {
  return {
    area,
    block: "Typography",
    props: (p) => {
      const content = p?.[contentKey];
      return {
        content,
        variant: content?.variant ?? fallbackVariant,
        color: content?.color,
        align: content?.align,
        component: content?.component,
        className: content?.className,
        containerClassName: content?.containerClassName,
      };
    },
    ...extra,
  };
}

function avatarSlot(overrides = {}) {
  return {
    area: "media",
    block: "Image",
    when: (p) => Boolean(p?.equippedAvatarName) || Boolean(p?.media?.src),
    props: (p) => {
      const hasAvatar = Boolean(p?.equippedAvatarName);
      return {
        src: hasAvatar ? `/avatars/${p.equippedAvatarName}.png` : p?.media?.src,
        alt: hasAvatar
          ? `Avatar de ${p.equippedAvatarName}`
          : (p?.media?.alt ?? "Imagen"),
        variant: p?.media?.variant ?? p?.media?.ratio,
        className: "h-full w-full object-cover",
      };
    },
    ...overrides,
  };
}

function resolveVariant(variant, view) {
  if (variant && LOBBY[variant]) return variant;
  const mapped = VARIANT_BY_TEMPLATE[view?.template];
  return mapped && LOBBY[mapped] ? mapped : "preGame";
}

function getMissionRewards(heroApi) {
  return heroApi?.getMissionCompletion?.() ?? null;
}

function getBaseRowItems(view) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];
  const showCard = compounds.find(
    (c) => (c?.component ?? c?.type) === "showCard",
  );
  return showCard?.items ?? [];
}

function getRewardRowItems(view, rewards) {
  const base = getBaseRowItems(view);
  const baseXp =
    base.find((i) => String(i?.id).toLowerCase().includes("xp")) ?? {};
  const baseCoins =
    base.find((i) =>
      ["intis", "coins", "coin"].some((t) =>
        String(i?.id).toLowerCase().includes(t),
      ),
    ) ?? {};

  return [
    {
      ...baseXp,
      id: baseXp?.id ?? "reward-xp",
      title: baseXp?.title ?? { text: "XP", variant: "label", align: "center" },
      text: {
        ...(baseXp?.text ?? {}),
        text: rewards
          ? `+ ${Number(rewards?.xp ?? 0)}`
          : (baseXp?.text?.text ?? "+ 0"),
        variant: baseXp?.text?.variant ?? "bodySm",
        align: baseXp?.text?.align ?? "center",
      },
      media: {
        ...(baseXp?.media ?? {}),
        src: XP_ICON_DATA_URI,
        alt: baseXp?.media?.alt ?? "Recompensa de XP",
      },
    },
    {
      ...baseCoins,
      id: baseCoins?.id ?? "reward-intis",
      title: baseCoins?.title ?? {
        text: "INTIS",
        variant: "label",
        align: "center",
      },
      text: {
        ...(baseCoins?.text ?? {}),
        text: rewards
          ? `+ ${Number(rewards?.coins ?? 0)}`
          : (baseCoins?.text?.text ?? "+ 0"),
        variant: baseCoins?.text?.variant ?? "bodySm",
        align: baseCoins?.text?.align ?? "center",
      },
      media: {
        ...(baseCoins?.media ?? {}),
        src: coinIcon,
        alt: baseCoins?.media?.alt ?? "Recompensa de INTIS",
      },
    },
  ];
}

function getLobbyFeedback(baseFeedback, rewards, resolvedVariant) {
  if (resolvedVariant !== "postGame" || !rewards) return baseFeedback;
  return {
    ...(baseFeedback ?? {}),
    text: `Ganaste +${Number(rewards?.xp ?? 0)} XP y +${Number(rewards?.coins ?? 0)} INTIS.`,
    variant: baseFeedback?.variant ?? "label",
    align: baseFeedback?.align ?? "center",
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const LOBBY = {
  preGame: {
    layout: {
      base: {
        cols: "1fr",
        rows: "auto auto minmax(0,1fr)",
        areas: ["title", "body", "media"],
        gap: "16px",
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto minmax(0,1fr)",
        areas: ["title title", "body media"],
      },
    },
    slots: [
      avatarSlot({
        className: UI.avatar,
        props: (p) => {
          const hasAvatar = Boolean(p?.equippedAvatarName);
          return {
            src: hasAvatar
              ? `/avatars/${p.equippedAvatarName}.png`
              : p?.media?.src,
            alt: hasAvatar
              ? `Avatar de ${p.equippedAvatarName}`
              : (p?.media?.alt ?? "Imagen"),
            variant: p?.media?.variant ?? p?.media?.ratio,
            className: "h-full w-full object-cover",
          };
        },
      }),
      typographySlot("title", "title", "h1", {
        className: `${UI.card} ${UI.shine} ${UI.title}`,
        containerClassName: "mx-auto max-w-[760px]",
      }),
      //cambiar
      typographySlot("body", "body", "body", {
        when: (p) => Boolean(p?.body),
        className: `${UI.card} ${UI.shine} ${UI.body}`,
      }),
    ],
  },

  postGame: {
    layout: {
      base: {
        cols: "1fr",
        rows: "auto auto auto auto",
        areas: ["title", "media", "rewards", "feedback"],
        gap: "16px",
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto 1fr auto",
        areas: ["title title", "media rewards", "feedback feedback"],
        gap: "16px",
      },
    },
    slots: [
      typographySlot("title", "title", "h1", {
        className: `${UI.card} ${UI.shine} ${UI.title}`,
        containerClassName: "mx-auto max-w-[760px]",
      }),
      avatarSlot({
        className: UI.avatar,
      }),
      {
        area: "rewards",
        when: (p) => Array.isArray(p?.rowItems) && p.rowItems.length > 0,
        block: "ShowCard",
        className: `${UI.card} p-5`,
        props: (p) => ({ items: p?.rowItems ?? [], zoomable: false }),
      },
      typographySlot("feedback", "feedback", "label", {
        when: (p) => Boolean(p?.feedback),
        className: `${UI.card} ${UI.shine} ${UI.feedback}`,
        containerClassName: "mx-auto max-w-[760px]",
      }),
    ],
  },

  wait: {
    layout: {
      base: {
        cols: "1fr",
        rows: "auto minmax(0,1fr)",
        areas: ["title", "media"],
        gap: "16px",
      },
    },
    slots: [
      typographySlot("title", "title", "h1", {
        className: `${UI.card} ${UI.shine} ${UI.title}`,
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "media",
        when: (p) => Boolean(p?.media?.src),
        block: "Image",
        className: UI.avatar,
        props: (p) => ({
          src: p?.media?.src,
          alt: p?.media?.alt ?? "Imagen",
          variant: p?.media?.variant ?? p?.media?.ratio,
          className: "min-h-[220px] w-full object-cover",
        }),
      },
    ],
  },
};

// ─── Hook de confeti ──────────────────────────────────────────────────────────

function useConfetti(active) {
  const { width, height } = useWindowSize();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!active) return;
    setRunning(true);
    const timer = setTimeout(() => setRunning(false), 5000);
    return () => clearTimeout(timer);
  }, [active]);

  return { running, width, height };
}

// ─── Hook interno ─────────────────────────────────────────────────────────────

function useLobbyRuntime({ variant, data, heroApi, view }) {
  const { imgAvatar } = useEquippedAvatar();
  const resolvedVariant = resolveVariant(variant, view);
  const config = LOBBY[resolvedVariant];
  const rewards = getMissionRewards(heroApi);

  const payload = {
    equippedAvatarName: imgAvatar,
    title: view?.slots?.title ?? data?.title,
    body: view?.slots?.body ?? data?.body ?? data?.text,
    media: view?.slots?.media ?? data?.media ?? data?.image,
    feedback: getLobbyFeedback(
      view?.slots?.feedback ?? data?.feedback,
      rewards,
      resolvedVariant,
    ),
    rowItems: getRewardRowItems(view, rewards),
  };

  return {
    layout: config.layout,
    slots: config.slots,
    payload,
    isPostGame: resolvedVariant === "postGame",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LobbyTemplate({ variant, data, heroApi, view }) {
  const { layout, slots, payload, isPostGame } = useLobbyRuntime({
    variant,
    data,
    heroApi,
    view,
  });
  const normalizedLayout = normalizeLayout(layout);
  const { running, width, height } = useConfetti(isPostGame);

  if (!normalizedLayout || !slots.length) {
    return (
      <div className="text-white/80">Config invalida para LobbyTemplate</div>
    );
  }

  return (
    <>
      {running && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.4}
        />
      )}
      <HeroGrid layout={normalizedLayout} className="h-full min-h-0 w-full">
        {slots.map((slot, index) => {
          const renderedSlot = renderSlot(slot, payload, Blocks, { view });
          if (!renderedSlot) return null;
          return (
            <HeroArea
              key={`${slot.area}-${index}`}
              area={slot.area}
              className={slot.className}>
              {renderedSlot}
            </HeroArea>
          );
        })}
      </HeroGrid>
    </>
  );
}
