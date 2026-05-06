// lobby.config.js — corregido: avatar fluye correctamente hasta el payload

import coinIcon from "@/assets/dashboard/coin.png";

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

export const LOBBY_VARIANT_BY_TEMPLATE = {
  preGameLobby: "preGame",
  postGameLobby: "postGame",
  waitLobby: "wait",
};

function createTypographySlot(area, contentKey, fallbackVariant, extra = {}) {
  return {
    area,
    block: "Typography",
    props: (payload) => {
      const content = payload?.[contentKey];
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

function getBaseRowItems(view) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];
  const showCard = compounds.find(
    (item) => (item?.component ?? item?.type) === "showCard",
  );
  return showCard?.items ?? [];
}

function getMissionRewards(heroApi) {
  return heroApi?.getMissionCompletion?.() ?? null;
}

function getRewardRowItems(view, rewards) {
  const baseItems = getBaseRowItems(view);
  const baseXp =
    baseItems.find((item) => String(item?.id).toLowerCase().includes("xp")) ??
    {};
  const baseCoins =
    baseItems.find((item) =>
      ["intis", "coins", "coin"].some((token) =>
        String(item?.id).toLowerCase().includes(token),
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

function resolveVariant(variant, view) {
  if (variant && LOBBY_CONFIG.variants[variant]) return variant;
  const mappedVariant = LOBBY_VARIANT_BY_TEMPLATE[view?.template];
  if (mappedVariant && LOBBY_CONFIG.variants[mappedVariant])
    return mappedVariant;
  return LOBBY_CONFIG.fallbackVariant;
}

function getLobbyFeedback(baseFeedback, rewards, view) {
  const isPostGame = resolveVariant(view?.variant, view) === "postGame";
  if (!isPostGame || !rewards) return baseFeedback;

  return {
    ...(baseFeedback ?? {}),
    text: `Ganaste +${Number(rewards?.xp ?? 0)} XP y +${Number(rewards?.coins ?? 0)} INTIS.`,
    variant: baseFeedback?.variant ?? "label",
    align: baseFeedback?.align ?? "center",
  };
}

export const LOBBY_CONFIG = {
  layouts: {
    preGame: {
      base: {
        cols: "1fr",
        rows: "auto auto minmax(0,1fr)",
        areas: ["title", "body", "media"],
        gap: "20px",
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto minmax(0,1fr)",
        areas: ["title title", "body media"],
      },
    },
    postGame: {
      base: {
        cols: "1fr",
        rows: "auto auto minmax(0,1fr)",
        areas: ["title", "rewards", "feedback"],
        gap: "20px",
      },
    },
    wait: {
      base: {
        cols: "1fr",
        rows: "auto minmax(0,1fr)",
        areas: ["title", "media"],
        gap: "20px",
      },
    },
  },
  variants: {
    preGame: [
      {
        area: "media",
        when: (payload) =>
          Boolean(payload?.equippedAvatarName || payload?.media?.src),
        block: "Image",
        className: [
          "relative overflow-hidden",
          "rounded-t-2xl rounded-b-none",
          "border-2 border-yellow-600/70",
          "shadow-[0_0_32px_rgba(202,138,4,0.35)]",
          "p-0",
        ].join(" "),
        props: (payload) => {
          const equippedAvatarName = payload?.equippedAvatarName;
          const resolvedSrc = equippedAvatarName
            ? `/${equippedAvatarName}.png`
            : payload?.media?.src;
          const resolvedAlt = equippedAvatarName
            ? `Avatar de ${equippedAvatarName}`
            : (payload?.media?.alt ?? "Imagen");

          return {
            src: resolvedSrc,
            alt: resolvedAlt,
            variant: payload?.media?.variant ?? payload?.media?.ratio,
            className: "min-h-[300px] w-full object-cover",
          };
        },
      },
      createTypographySlot("title", "title", "h1", {
        className: [
          "rounded-b-2xl rounded-t-none",
          "px-6 py-0 text-center",
          "text-yellow-300 font-black tracking-widest uppercase",
          "text-shadow-[0_2px_12px_rgba(202,138,4,0.6)]",
        ].join(" "),
        containerClassName: "mx-auto max-w-[760px]",
      }),
      createTypographySlot("body", "body", "body", {
        when: (payload) => Boolean(payload?.body),
        className: [
          "mx-auto max-w-[760px]",
          "mt-3 rounded-2xl",
          "border border-yellow-700/40",
          "bg-stone-900/60 backdrop-blur-sm",
          "px-6 py-1",
          "text-2xl",
        ].join(" "),
      }),
    ],
    postGame: [
      createTypographySlot("title", "title", "h1", {
        className: "rounded-2xl p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "rewards",
        when: (payload) =>
          Array.isArray(payload?.rowItems) && payload.rowItems.length > 0,
        block: "ShowCard",
        className: "rounded-2xl p-5",
        props: (payload) => ({
          items: payload?.rowItems ?? [],
          zoomable: false,
        }),
      },
      createTypographySlot("feedback", "feedback", "label", {
        when: (payload) => Boolean(payload?.feedback),
        className: "rounded-2xl p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
    ],
    wait: [
      createTypographySlot("title", "title", "h1", {
        className: "rounded-2xl p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "media",
        when: (payload) => Boolean(payload?.media?.src),
        block: "Image",
        className: "rounded-2xl p-5",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen",
          variant: payload?.media?.variant ?? payload?.media?.ratio,
          className: "min-h-[220px] w-full",
        }),
      },
    ],
  },
  fallbackVariant: "preGame",
};

// ✅ Bug fix: avatar ahora se recibe y se pasa correctamente a getPayload
function getPayload(data = {}, view, heroApi, avatar) {
  const rewards = getMissionRewards(heroApi);
  const equippedAvatarName = avatar?.name ?? avatar?.id ?? null;

  return {
    equippedAvatarName, // ← antes nunca llegaba aqui
    title: view?.slots?.title ?? data?.title,
    body: view?.slots?.body ?? data?.body ?? data?.text,
    media: view?.slots?.media ?? data?.media ?? data?.image,
    feedback: getLobbyFeedback(
      view?.slots?.feedback ?? data?.feedback,
      rewards,
      view,
    ),
    rowItems: getRewardRowItems(view, rewards),
  };
}

// ✅ Bug fix: avatar se recibe desde getLobbyRuntime y se pasa a getPayload
export function getLobbyRuntime({ variant, data, heroApi, view, avatar }) {
  const resolvedVariant = resolveVariant(variant, view);

  return {
    layoutDef: LOBBY_CONFIG.layouts[resolvedVariant],
    slots: LOBBY_CONFIG.variants[resolvedVariant],
    payload: getPayload(data, view, heroApi, avatar), // ← antes faltaba avatar
  };
}
