import { useAvatarStore } from "@/features/dashboard/hooks/useAvatarStore";
import coinIcon from "@/assets/dashboard/coin.png";
import * as Blocks from "@/features/module/blocks";
import { useEquippedAvatar } from "@/features/dashboard/services/useEquippedAvatar.service";
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

const LOBBY_VARIANT_BY_TEMPLATE = {
  preGameLobby: "preGame",
  postGameLobby: "postGame",
  waitLobby: "wait",
};

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

  return {
    xp: {
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
    coins: {
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
  };
}

function resolveVariant(variant, view) {
  if (variant && ["preGame", "postGame", "wait"].includes(variant))
    return variant;
  const mapped = LOBBY_VARIANT_BY_TEMPLATE[view?.template];
  if (mapped) return mapped;
  return "preGame";
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

function getPayload(data = {}, view, heroApi, avatar) {
  const rewards = getMissionRewards(heroApi);
  const equippedAvatarName = avatar?.name ?? avatar?.id ?? null;
  const { imgAvatar } = useEquippedAvatar();
  return {
    equippedAvatarName: imgAvatar,
    title: view?.slots?.title ?? data?.title,
    body: view?.slots?.body ?? data?.body ?? data?.text,
    media: view?.slots?.media ?? data?.media ?? data?.image,
    feedback: getLobbyFeedback(
      view?.slots?.feedback ?? data?.feedback,
      rewards,
      view,
    ),
    rewards: getRewardRowItems(view, rewards),
  };
}

// ─── PreGame ──────────────────────────────────────────────────────────────────
// titulo arriba, fila inferior: texto izquierda | imagen derecha

function PreGame({ payload }) {
  const equippedAvatarName = payload?.equippedAvatarName;
  const imageSrc = `avatars/${equippedAvatarName}.gif`;
  const imageAlt = equippedAvatarName
    ? `Avatar de ${equippedAvatarName}`
    : (payload?.media?.alt ?? "Imagen");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: "100%",
        gap: "20px",
      }}>
      {/* titulo */}
      <div className="px-6 py-0 text-center text-yellow-300 font-black tracking-widest uppercase">
        <div className="mx-auto max-w-[760px]">
          <Blocks.Typography
            content={payload?.title}
            variant={payload?.title?.variant ?? "h1"}
            color={payload?.title?.color}
            align={payload?.title?.align}
          />
        </div>
      </div>

      {/* texto izquierda | imagen derecha */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          flex: 1,
          minHeight: 0,
          gap: "20px",
        }}>
        <div className="rounded-2xl border border-yellow-700/40 bg-stone-900/60 backdrop-blur-sm px-6 py-4 text-2xl overflow-auto">
          <Blocks.Typography
            content={payload?.body}
            variant={payload?.body?.variant ?? "body"}
            color={payload?.body?.color}
            align={payload?.body?.align}
          />
        </div>

        <div className="relative overflow-hidden rounded-2xl border-none">
          <Blocks.Image
            src={imageSrc}
            alt={imageAlt}
            variant={payload?.media?.variant ?? payload?.media?.ratio}
            className="w-full h-full object-cover border-color border-0 "
          />
        </div>
      </div>
    </div>
  );
}

// ─── PostGame ─────────────────────────────────────────────────────────────────
// titulo arriba, fila inferior: xp izquierda | imagen centro (TODO) | coins derecha

function PostGame({ payload }) {
  const equippedAvatarName = payload?.equippedAvatarName;

  const { xp, coins } = payload?.rewards ?? {};
  const imageSrc = `activity/avatars/${equippedAvatarName}.gif`;
  const imageAlt = equippedAvatarName
    ? `Avatar de ${equippedAvatarName}`
    : (payload?.media?.alt ?? "Imagen");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: "100%",
        gap: "20px",
      }}>
      {/* titulo */}
      <div className="rounded-2xl p-5 text-center">
        <div className="mx-auto max-w-[760px]">
          <Blocks.Typography
            content={payload?.title}
            variant={payload?.title?.variant ?? "h1"}
            color={payload?.title?.color}
            align={payload?.title?.align}
          />
        </div>
      </div>

      {/* xp | imagen (TODO) | coins */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          flex: 1,
          minHeight: 0,
          gap: "20px",
        }}>
        {/* XP — izquierda */}
        <div className="rounded-2xl border border-yellow-700/450 bg-stone-900/60 flex flex-col items-center justify-center gap-3 p-5">
          <img
            src={xp?.media?.src}
            alt={xp?.media?.alt}
            style={{ width: 56, height: 56, objectFit: "contain" }}
          />
          <Blocks.Typography
            content={xp?.title}
            variant="label"
            align="center"
          />
          <Blocks.Typography
            content={xp?.text}
            variant="bodySm"
            align="center"
          />
        </div>

        {/* imagen central — próxima implementación */}
        <div className="rounded-2xl flex items-center justify-center">
          <Blocks.Image
            src={imageSrc}
            alt={imageAlt}
            variant={payload?.media?.variant ?? payload?.media?.ratio}
            className=" w-full h-full object-cover border-color border-0 "
          />
        </div>

        {/* Coins — derecha */}
        <div className="rounded-2xl border border-yellow-700/40 bg-stone-900/60 flex flex-col items-center justify-center gap-3 p-5">
          <img
            src={coins?.media?.src}
            alt={coins?.media?.alt}
            style={{ width: 56, height: 56, objectFit: "contain" }}
          />
          <Blocks.Typography
            content={coins?.title}
            variant="label"
            align="center"
          />
          <Blocks.Typography
            content={coins?.text}
            variant="bodySm"
            align="center"
          />
        </div>
        <div>aun falta poner un footer con texto dinamico</div>
      </div>
    </div>
  );
}

// ─── Wait ─────────────────────────────────────────────────────────────────────

function Wait({ payload }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: "100%",
        gap: "20px",
      }}>
      <div className="rounded-2xl p-5 text-center">
        <div className="mx-auto max-w-[760px]">
          <Blocks.Typography
            content={payload?.title}
            variant={payload?.title?.variant ?? "h1"}
            color={payload?.title?.color}
            align={payload?.title?.align}
          />
        </div>
      </div>

      {payload?.media?.src && (
        <div className="rounded-2xl p-5 flex-1 min-h-0">
          <Blocks.Image
            src={payload?.media?.src}
            alt={payload?.media?.alt ?? "Imagen"}
            variant={payload?.media?.variant ?? payload?.media?.ratio}
            className="min-h-[220px] w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function LobbyTemplate({ variant, data, heroApi, view }) {
  const { equipped, owned } = useAvatarStore();
  const avatar = equipped || owned;
  const resolvedVariant = resolveVariant(variant, view);
  const payload = getPayload(data, view, heroApi, avatar);

  if (resolvedVariant === "preGame") return <PreGame payload={payload} />;
  if (resolvedVariant === "postGame") return <PostGame payload={payload} />;
  if (resolvedVariant === "wait") return <Wait payload={payload} />;

  return (
    <div style={{ color: "rgba(255,255,255,0.8)" }}>
      Config invalida para LobbyTemplate
    </div>
  );
}
