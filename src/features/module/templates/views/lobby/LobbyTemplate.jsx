import { useAvatarStore } from "@/features/dashboard/hooks/useAvatarStore";
import coinIcon from "@/assets/dashboard/coin.webp";
import Confetti from "react-confetti";
import React, { useMemo, useRef } from "react";

import MetricPanel from "@/features/dashboard/components/metricalpanel";
import * as Blocks from "@/features/module/blocks";
import { useEquippedAvatar } from "@/features/dashboard/services/useEquippedAvatar.service";
import { useState, useEffect } from "react";

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

// ─── Hook responsivo ──────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 481) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    setIsMobile(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, [breakpoint]);
  return isMobile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── MascotBubble ─────────────────────────────────────────────────────────────
function MascotBubble({ message, isMobile }) {
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
      <div
        style={{
          background: "#fff",
          border: "2.5px solid #000000FF",
          borderRadius: 14,
          padding: isMobile ? "7px 10px" : "10px 24px",
          whiteSpace: "pre-line",
          fontSize: isMobile ? 10 : 14,
          fontWeight: 600,
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

// ─── Step accent colors ───────────────────────────────────────────────────────
const STEP_ACCENTS = [
  { border: "#f9c74f", bg: "rgba(249,199,79,0.12)" },
  { border: "#6ee7b7", bg: "rgba(110,231,183,0.12)" },
  { border: "#93c5fd", bg: "rgba(147,197,253,0.12)" },
  { border: "#fca5a5", bg: "rgba(252,165,165,0.12)" },
];

const MASCOT_MESSAGES = [
  "Todo está listo.\nComencemos esta misión 🎯",
  "Hoy aprenderemos algo útil.\nVamos juntos 🚀",
  "Prepárate.\nCada decisión cuenta 💰",
  "Una nueva misión te espera.\n¿Listo? ✨",
  "Es momento de comenzar.\nTú puedes 💪",
  "Tu aventura financiera\nempieza aquí 🧭",
  "Hoy pondremos a prueba\nnuevas ideas 🧠",
  "Antes de empezar:\npiensa, decide y aprende 🎮",
  "Esta misión trata sobre\nhacer elecciones inteligentes 💎",
  "No necesitas saberlo todo.\nSolo comenzar 🌱",
  "Toma asiento, aventurero.\nLa misión está por iniciar ⚔️",
  "Un buen plan puede cambiarlo todo.\nDescubrámoslo 📜",
  "Cada reto trae\nuna nueva enseñanza ⭐",
  "Hoy aprenderemos algo\nque sí usarás en la vida 💡",
  "Respira hondo.\nLa misión comienza ahora 🎒",
  "Tus decisiones tendrán impacto.\nEmpecemos 📈",
  "La mejor herramienta\nes lo que aprendes hoy 🛡️",
  "Todo listo para iniciar.\nVamos allá ⚡",
  "Esta misión puede parecer pequeña...\npero será importante 🌟",
  "Comienza una nueva experiencia.\nEstoy contigo 🤝",
];

function getRandomMessage() {
  return MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)];
}

// ─── PreGame ──────────────────────────────────────────────────────────────────
// Desktop: grid 2 cols (texto | avatar)
// Mobile:  solo columna de texto, avatar oculto
function PreGame({ payload, isMobile }) {
  const equippedAvatarName = payload?.equippedAvatarName;
  const imageSrc = `avatars/${equippedAvatarName}.webp`;
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
      {/* grid principal — mobile: 1 col, desktop: 2 cols */}
      <div
        className="flex-1 min-h-0"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 500px",
        }}>
        {/* columna izquierda — texto */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            gap: isMobile ? 8 : 16,
            padding: isMobile ? "12px 10px" : "24px 28px",
            borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.1)",
          }}>
          {/* título */}
          <div
            className="text-yellow-300 font-black tracking-widest uppercase"
            style={{
              fontSize: isMobile ? 5 : 6,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}>
            <Blocks.Typography
              content={payload?.title}
              variant={payload?.title?.variant ?? "h1"}
              color={payload?.title?.color}
              align={payload?.title?.align}
            />
          </div>

          {/* párrafos */}
          <div
            className="flex flex-col flex-1 overflow-auto pb-1"
            style={{
              gap: isMobile ? 6 : 8,
              paddingInline: isMobile ? 4 : 36,
            }}>
            {(payload?.body?.paragraphs ?? []).map((text, i) => {
              if (!text.trim()) return null;
              const accent = STEP_ACCENTS[i % STEP_ACCENTS.length];
              return (
                <div
                  key={i}
                  className="flex items-center rounded-xl"
                  style={{
                    gap: isMobile ? 8 : 24,
                    padding: isMobile ? "8px 10px" : "16px 24px",
                    background: "rgba(0,0,0,0.22)",
                    border: "5px solid rgba(255,255,255,0.08)",
                    borderLeft: `3px solid ${accent.border}`,
                  }}>
                  <span
                    className="text-white font-medium leading-snug"
                    style={{ fontSize: isMobile ? 14 : 24 }}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* columna derecha — mascota: OCULTA en móvil */}
        {!isMobile && (
          <div
            className="flex flex-col items-center px-4 pb-1.5 pt-0 min-h-0"
            style={{
              background: "rgba(0,0,0,0.1)",
              justifyContent: "flex-end",
            }}>
            <MascotBubble message={getRandomMessage()} isMobile={false} />
            <Blocks.Image
              src={imageSrc}
              alt={imageAlt}
              className="w-full object-contain object-bottom"
              style={{
                flex: "1 1 0",
                minHeight: 0,
                maxWidth: 550,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PostGame ─────────────────────────────────────────────────────────────────
// Desktop: grid 3 cols (métricas | mascota | stats)
// Mobile:  columna vertical — métricas arriba, imagen centro (más pequeña), stats abajo
function PostGame({ payload, isMobile }) {
  const equippedAvatarName = payload?.equippedAvatarName;
  const { xp, coins } = payload?.rewards ?? {};
  const attempt = payload?.attempt ?? {};
  const imageSrc = `activity/avatars/${equippedAvatarName}.webp`;
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
      className="flex flex-col w-full overflow-hidden rounded-2xl"
      style={{
        height: isMobile ? "auto" : "100%",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.15)",
        position: "relative",
      }}>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={isMobile ? 150 : 300}
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
      <div
        className="text-center"
        style={{ padding: isMobile ? "12px 12px 6px" : "24px 28px 8px" }}>
        <Blocks.Typography
          content={payload?.title}
          variant={payload?.title?.variant ?? "h1"}
          color={payload?.title?.color}
          align={payload?.title?.align}
        />
      </div>

      {/* contenido principal */}
      <div
        className="flex-1 min-h-0"
        style={
          isMobile
            ? {
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: "8px 10px",
              }
            : {
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "5.4px",
                padding: "6px 24px",
              }
        }>
        {/* métricas XP + Coins */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            gap: isMobile ? 8 : 0,
            paddingTop: isMobile ? 0 : 40,
            justifyContent: "center",
            alignItems: isMobile ? "stretch" : "center",
            width: "100%",
            boxSizing: "border-box",
            padding: isMobile ? "0 8px" : "40px 0 0 0",
          }}>
          <MetricPanel
            title={xp?.title?.text || xp?.title}
            value={attempt?.xpEarned || xp?.text?.text}
            color="#2962ff"
            textColor="#fff8e6"
            accent="#f9c74f"
            className="rounded-2xl"
            style={{
              minHeight: isMobile ? "unset" : 200,
              width: isMobile ? 0 : "100%", // ← clave: fuerza igual tamaño en móvil
              maxWidth: isMobile ? "none" : 440,
              flex: 1, // ← siempre flex: 1 para que sean iguales
              padding: isMobile ? "8px 10px" : "12px 16px",
              margin: isMobile ? 0 : "0 auto",
              boxSizing: "border-box",
              overflow: "hidden", // ← evita desbordamiento
            }}
            icon={
              <img
                src={xp?.media?.src}
                alt={xp?.media?.alt}
                style={{
                  width: isMobile ? 28 : 48,
                  height: isMobile ? 28 : 48,
                  objectFit: "contain",
                  flexShrink: 0, // ← evita que el icono se comprima
                }}
              />
            }
          />
          {!isMobile && <br />}
          <MetricPanel
            title={coins?.title?.text || coins?.title}
            value={attempt?.coinsAwarded ?? coins?.text?.text}
            color="#ffc400"
            textColor="#ecfdf5"
            accent=""
            className="rounded-2xl"
            style={{
              minHeight: isMobile ? "unset" : 200,
              width: isMobile ? 0 : "100%", // ← mismo fix
              maxWidth: isMobile ? "none" : 440,
              flex: 1,
              padding: isMobile ? "8px 10px" : "12px 16px",
              margin: isMobile ? 0 : "0 auto",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
            icon={
              <img
                src={coins?.media?.src}
                alt={coins?.media?.alt}
                style={{
                  width: isMobile ? 28 : 48,
                  height: isMobile ? 28 : 48,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
            }
          />
        </div>

        {/* imagen / mascota — visible en móvil pero más pequeña */}
        <div
          className="flex items-center justify-center min-h-0"
          style={{ maxHeight: isMobile ? 160 : "none", overflow: "hidden" }}>
          <Blocks.Image
            src={imageSrc}
            alt={imageAlt}
            variant="square"
            className="object-contain border-0"
            style={{
              width: "100%",
              height: isMobile ? 140 : "90%",
              minHeight: 0,
              flex: "1 1 0",
              objectFit: "contain",
              objectPosition: "center bottom",
            }}
          />
        </div>

        {/* stats / mensaje del intento */}
        <div
          style={{
            paddingTop: isMobile ? 0 : 40,
            paddingInline: isMobile ? 0 : 16,
          }}>
          {attempt?.message && (
            <div
              className="rounded-xl text-center font-semibold"
              style={{
                margin: isMobile ? "0 0 6px" : "0 24px 8px",
                padding: isMobile ? "8px 10px" : "16px",
                fontSize: isMobile ? 16 : 29,
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
          {attempt?.score != null && (
            <div
              className="text-white/70 font-semibold"
              style={{
                fontSize: isMobile ? 13 : 20,
                padding: isMobile ? "4px 6px" : "20px 0 20px 32px",
                textAlign: isMobile ? "center" : "justify",
                marginBottom: 4,
              }}>
              🟡 Puntaje:{" "}
              <span className="font-bold text-white">{attempt.score}</span>
              <br />
              {attempt?.prevBestScore != null && (
                <span>
                  🟡 Mejor marca:{" "}
                  <span className="font-bold text-white">
                    {attempt.prevBestScore}
                  </span>
                  <br />
                </span>
              )}
              {attempt?.minScore != null && (
                <span>
                  🟡 Mínimo:{" "}
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
        className="text-center"
        style={{
          padding: isMobile ? "6px 10px" : "0 28px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
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
function Wait({ payload, isMobile }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        width: "100%",
        gap: isMobile ? 6 : 10,
      }}>
      <div
        className="rounded-2xl text-center"
        style={{ padding: isMobile ? "12px 10px" : "20px" }}>
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
        <div
          className="rounded-2xl flex-1 min-h-0"
          style={{ padding: isMobile ? "8px" : "20px" }}>
          <Blocks.Image
            src={payload?.media?.src}
            alt={payload?.media?.alt ?? "Imagen"}
            variant={payload?.media?.variant ?? payload?.media?.ratio}
            className="w-full h-full object-cover"
            style={{ minHeight: isMobile ? 140 : 220 }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export default function LobbyTemplate({ variant, data, heroApi, view }) {
  const isMobile = useIsMobile(481);
  const { equipped, owned } = useAvatarStore();
  const avatar = equipped || owned;
  const resolvedVariant = resolveVariant(variant, view);
  const payload = getPayload(data, view, heroApi, avatar);

  if (resolvedVariant === "preGame")
    return <PreGame payload={payload} isMobile={isMobile} />;
  if (resolvedVariant === "postGame")
    return <PostGame payload={payload} isMobile={isMobile} />;
  if (resolvedVariant === "wait")
    return <Wait payload={payload} isMobile={isMobile} />;

  return (
    <div style={{ color: "rgba(255,255,255,0.8)" }}>
      Config invalida para LobbyTemplate
    </div>
  );
}
