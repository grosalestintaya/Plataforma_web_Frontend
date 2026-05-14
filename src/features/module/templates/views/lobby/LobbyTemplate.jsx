import { useAvatarStore } from "@/features/dashboard/hooks/useAvatarStore";
import coinIcon from "@/assets/dashboard/coin.png";
import Confetti from "react-confetti";

import MetricPanel from "@/features/dashboard/components/metricalpanel";
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
    attempt: {
      score: rewards?.score ?? null,
      passed: rewards?.passed ?? null,
      message: rewards?.message ?? null,
      xpEarned: rewards?.xpEarned ?? null,
      isImprovement: rewards?.isImprovement ?? null,
      prevBestScore: rewards?.prevBestScore ?? null,
      minScore: rewards?.minScore ?? null,
    },
  };
}
import { useState, useEffect } from "react";

function MascotBubble({ message }) {
  const text = message ?? "¡Hola! Soy Quipu.\nTe guío en esta misión 🙌";
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div style={{ position: "relative", marginBottom: 8, padding: "0 8px" }}>
      {/* burbuja */}
      <div
        style={{
          background: "#fff",
          border: "2.5px solid #111",
          borderRadius: 14,
          padding: "10px 14px",
          whiteSpace: "pre-line",
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.5,
          color: "#111",
          textAlign: "center",
          boxShadow: "3px 3px 0px #111",
        }}>
        {displayed}
        {!done && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: "1em",
              background: "#111",
              marginLeft: 2,
              verticalAlign: "text-bottom",
              animation: "blink 0.7s step-end infinite",
            }}
          />
        )}
      </div>

      {/* cola de la burbuja apuntando hacia abajo */}
      <div
        style={{
          position: "absolute",
          bottom: -12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "12px solid #111",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -9,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "10px solid #fff",
        }}
      />

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
// ─── PreGame ──────────────────────────────────────────────────────────────────
// titulo arriba, fila inferior: texto izquierda | imagen derecha
const STEP_ACCENTS = [
  { border: "#f9c74f", bg: "rgba(249,199,79,0.12)" },
  { border: "#6ee7b7", bg: "rgba(110,231,183,0.12)" },
  { border: "#93c5fd", bg: "rgba(147,197,253,0.12)" },
  { border: "#fca5a5", bg: "rgba(252,165,165,0.12)" },
];

function PreGame({ payload }) {
  const equippedAvatarName = payload?.equippedAvatarName;
  const imageSrc = `avatars/${equippedAvatarName}.gif`;
  const imageAlt = equippedAvatarName
    ? `Avatar de ${equippedAvatarName}`
    : (payload?.media?.alt ?? "Imagen");

  return (
    <div
      className="flex flex-col h-[99%] w-full overflow-hidden rounded-2xl pb-0.5"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
      {/* grid principal */}
      <div
        className="flex-1 grid min-h-0"
        style={{ gridTemplateColumns: "1fr 500px" }}>
        {/* columna izquierda */}
        <div
          className="flex flex-col gap-4 px-7 py-6"
          style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
          {/* título */}
          <div
            className="text-yellow-300 font-black tracking-widest uppercase"
            style={{ fontSize: 6, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            <Blocks.Typography
              content={payload?.title}
              variant={payload?.title?.variant ?? "h1"}
              color={payload?.title?.color}
              align={payload?.title?.align}
            />
          </div>

          <div className="flex flex-col gap-2 flex-1 overflow-auto pb-1 px-9">
            {(payload?.body?.paragraphs ?? []).map((text, i) => {
              if (!text.trim()) return null;
              const accent = STEP_ACCENTS[i % STEP_ACCENTS.length];
              return (
                <div
                  key={i}
                  className="flex items-center gap-6 rounded-xl px-6 py-4"
                  style={{
                    background: "rgba(0,0,0,0.22)",
                    border: "5px solid rgba(255,255,255,0.08)",
                    borderLeft: `3px solid ${accent.border}`,
                  }}>
                  <span className="text-white text-2xl font-medium leading-snug">
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* columna derecha — mascota */}
        <div
          className="flex flex-col items-center justify-end px-4 pb-1.5 pt-0"
          style={{ background: "rgba(0,0,0,0.1)" }}>
          <MascotBubble message={getRandomMessage()} />

          <Blocks.Image
            src={imageSrc}
            alt={imageAlt}
            className="w-full object-contain h-[89%]"
            style={{ maxWidth: 550 }}
          />
        </div>
      </div>
    </div>
  );
}
const MASCOT_MESSAGES = [
  "¡Hola! Soy Quipu.\nTe guío en esta misión 🙌",
  "¿Listo para aprender?\n¡Vamos juntos! 💪",
  "Cada misión te hace más sabio.\n¡Tú puedes! ⭐",
  "Recuerda: el saber\nes tu mejor tesoro 🏆",
  "¡Ánimo! Esta misión\nserá muy interesante 🎯",
  "Juntos aprenderemos\ncosas increíbles hoy 🌟",
];

function getRandomMessage() {
  return MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)];
}
// ─── PostGame ─────────────────────────────────────────────────────────────────
// titulo arriba, fila inferior: xp izquierda | imagen centro (TODO) | coins derecha

function PostGame({ payload }) {
  const equippedAvatarName = payload?.equippedAvatarName;
  const { xp, coins } = payload?.rewards ?? {};
  const attempt = payload?.attempt ?? {}; // 👈 nuevo
  const imageSrc = `activity/avatars/${equippedAvatarName}.gif`;
  const imageAlt = equippedAvatarName
    ? `Avatar de ${equippedAvatarName}`
    : (payload?.media?.alt ?? "Imagen");

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex flex-col h-[100%] w-full overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.15)",
        position: "relative",
      }}>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={300}
          gravity={0.18}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}

      {/* título */}
      <div className="px-7 pt-6 pb-2 text-center">
        <Blocks.Typography
          content={payload?.title}
          variant={payload?.title?.variant ?? "h1"}
          color={payload?.title?.color}
          align={payload?.title?.align}
        />
      </div>

      {/* grid: xp | mascota | coins */}
      <div
        className="flex-1 grid min-h-0 px-6 py-1.5 gap-5.4"
        style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="pt-10">
          <MetricPanel
            title={xp?.title?.text || xp?.title}
            value={attempt?.xpEarned || xp?.text?.text}
            color="#2962ff"
            textColor="#fff8e6"
            accent="#f9c74f"
            className="min-h-[200px] max-w-[440px] mx-auto rounded-2xl px-4 py-3"
            icon={
              <img
                src={xp?.media?.src}
                alt={xp?.media?.alt}
                className="h-300 w-300"
              />
            }
          />
          <br />
          <MetricPanel
            title={coins?.title?.text || coins?.title}
            value={attempt?.coinsAwarded ?? coins?.text?.text}
            color="#ffc400"
            textColor="#ecfdf5"
            accent=""
            className="min-h-[200px] max-w-[440px] mx-auto rounded-2xl px-4 py-3"
            icon={
              <img
                src={coins?.media?.src}
                alt={coins?.media?.alt}
                className="h-300 w-300 object-contain"
              />
            }
          />
        </div>

        <div className="flex items-center justify-center">
          <Blocks.Image
            src={imageSrc}
            alt={imageAlt}
            variant="square"
            className="w-full h-full object-contain border-0"
          />
        </div>

        <div className="pt-10 px-4">
          {" "}
          {/* mensaje del intento */}
          {attempt?.message && (
            <div
              className="mx-6 mb-2 px-4 py-4 rounded-xl text-center text-4xl font-semibold"
              style={{
                background: attempt?.passed
                  ? "rgba(110,231,183,0.15)"
                  : "rgba(252,165,165,0.15)",
                border: `1px solid ${
                  attempt?.passed
                    ? "rgba(110,231,183,0.4)"
                    : "rgba(252,165,165,0.4)"
                }`,
                color: attempt?.passed ? "#ffff" : "#fca5a5",
              }}>
              {attempt.message}
            </div>
          )}
          {/* score del intento */}
          {attempt?.score != null && (
            <div className="text-justify text-white/70 text-3xl mb-1 pl-8   font-semibold py-5">
              🟡 Puntaje de este intento:{" "}
              <span className="font-bold text-white/100">{attempt.score}</span>{" "}
              <br />
              {attempt?.prevBestScore != null && (
                <span>
                  {" "}
                  🔴 Mejor marca:{" "}
                  <span className="font-bold text-white/100">
                    {attempt.prevBestScore}
                  </span>{" "}
                  <br />
                </span>
              )}
              {attempt?.minScore != null && (
                <span>
                  {" "}
                  🔵 Mínimo para aprobar:{" "}
                  <span className="font-bold text-white/80">
                    {attempt.minScore}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* footer */}
      <div
        className="px-7 py-0 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Blocks.Typography
          content={payload?.footer}
          variant={payload?.footer?.variant ?? "bodySm"}
          color={payload?.footer?.color}
          align={payload?.footer?.align}
        />
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
        gap: "10px",
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
