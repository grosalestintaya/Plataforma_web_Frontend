import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";

import coinIcon from "@/assets/dashboard/coin.webp";
import MetricPanel from "@/features/dashboard/components/metricalpanel";
import { useEquippedAvatar } from "@/features/dashboard/services/useEquippedAvatar.service";
import * as Blocks from "@/features/module/blocks";

const XP_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="76" height="82" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="9" r="6" stroke="#facc15" stroke-width="1.8"/>
  <path d="M8.2 4.8c1 .6 2 .6 3 0 1-.6 2-.6 3 0 1 .6 2 .6 3 0M9 15v4M12 15v5M15 15v4" stroke="#facc15" stroke-width="1.7" stroke-linecap="round"/>
  <g fill="#facc15"><circle cx="9" cy="17" r=".9"/><circle cx="9" cy="19" r=".7"/><circle cx="12" cy="17.2" r="1.1"/><circle cx="12" cy="19.6" r=".85"/><circle cx="15" cy="17" r=".9"/><circle cx="15" cy="19" r=".7"/></g>
</svg>`
)}`;

const TEMPLATE_VARIANTS = {
  preGameLobby: "preGame",
  postGameLobby: "postGame",
  waitLobby: "wait",
};

const MESSAGES = [
  "Todo está listo.\nComencemos esta misión 🎯",
  "Hoy aprenderemos algo útil.\nVamos juntos 🚀",
  "Prepárate.\nCada decisión cuenta 💰",
  "Una nueva misión te espera.\n¿Listo? ✨",
  "No necesitas saberlo todo.\nSolo comenzar 🌱",
];

const STEP_COLORS = ["#f9c74f", "#6ee7b7", "#93c5fd", "#fca5a5"];
const LAYOUT_DEF = Object.freeze({
  base: { cols: "minmax(0, 1fr)", rows: "minmax(0, 1fr)", areas: ["primary"] },
  lg: { cols: "minmax(0, 1fr)", rows: "minmax(0, 1fr)", areas: ["primary"] },
});

function useMobile(max = 480) {
  const query = `(max-width:${max}px)`;
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return mobile;
}

const resolveVariant = (variant, view) =>
  ["preGame", "postGame", "wait"].includes(variant)
    ? variant
    : TEMPLATE_VARIANTS[view?.template] ?? "preGame";

function rewardItem(items, tokens, value, defaults) {
  const base = items.find((item) =>
    tokens.some((token) => String(item?.id ?? "").toLowerCase().includes(token)),
  );

  return {
    ...base,
    title: base?.title ?? { text: defaults.title, variant: "label", align: "center" },
    text: { ...base?.text, text: `+ ${Number(value ?? 0)}`, variant: base?.text?.variant ?? "bodySm", align: "center" },
    media: { ...base?.media, src: defaults.icon, alt: base?.media?.alt ?? defaults.alt },
  };
}

function buildPayload(data, view, heroApi, avatar, variant) {
  const completion = heroApi?.getMissionCompletion?.() ?? null;
  const result = completion ?? {};
  const items = (view?.elements?.compound ?? []).find(
    (item) => (item?.component ?? item?.type) === "showCard",
  )?.items ?? [];
  const xp = result.xpEarned ?? result.xp ?? 0;
  const coins = result.coinsAwarded ?? result.coins ?? 0;

  return {
    equippedAvatarName: avatar,
    title: view?.slots?.title ?? data.title,
    body: view?.slots?.body ?? data.body ?? data.text,
    media: view?.slots?.media ?? data.media ?? data.image,
    footer: view?.slots?.footer ?? data.footer,
    feedback:
      variant === "postGame" && completion
        ? { text: `Ganaste +${xp} XP y +${coins} INTIS.`, variant: "label", align: "center" }
        : view?.slots?.feedback ?? data.feedback,
    rewards: {
      xp: rewardItem(items, ["xp"], xp, { title: "XP", icon: XP_ICON, alt: "Recompensa de XP" }),
      coins: rewardItem(items, ["intis", "coins", "coin"], coins, { title: "INTIS", icon: coinIcon, alt: "Recompensa de INTIS" }),
    },
    attempt: { ...result, xpEarned: xp, coinsAwarded: coins },
  };
}

const Text = ({ content, fallback = "bodySm" }) => (
  <Blocks.Typography
    content={content}
    variant={content?.variant ?? fallback}
    color={content?.color}
    align={content?.align}
  />
);

function MascotBubble({ message }) {
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;
    setText("");
    const timer = setInterval(() => {
      setText(message.slice(0, ++i));
      if (i >= message.length) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [message]);

  return (
    <div className="relative mb-2 px-2">
      <div className="whitespace-pre-line rounded-[14px] border-[2.5px] border-black bg-white px-6 py-2.5 text-center text-sm font-semibold leading-relaxed text-neutral-900 shadow-[3px_3px_0_#111]">
        {text}
        {text.length < message.length && <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-neutral-900 align-text-bottom" />}
      </div>
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-x-8 border-t-[12px] border-x-transparent border-t-black" />
      <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 border-x-[6px] border-t-[10px] border-x-transparent border-t-white" />
    </div>
  );
}

function PreGame({ payload, mobile }) {
  const avatar = payload.equippedAvatarName;
  const message = useMemo(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)], []);

  return (
    <section className="flex h-[99%] w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[.08] pb-0.5 backdrop-blur-2xl">
      <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns: mobile ? "1fr" : "1fr 500px" }}>
        <div className="flex flex-col gap-2 overflow-hidden border-white/10 p-3 md:gap-4 md:border-r md:px-7 md:py-6">
          <div className="font-black uppercase tracking-widest text-yellow-300 [text-shadow:0_2px_8px_rgba(0,0,0,.4)]">
            <Text content={payload.title} fallback="h1" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5 overflow-y-auto px-1 pb-1 md:gap-2 md:px-9">
            {(payload.body?.paragraphs ?? []).map((text, index) =>
              text?.trim() ? (
                <div
                  key={index}
                  className="flex min-w-0 items-center rounded-xl border-[5px] border-white/[.08] bg-black/20 px-2.5 py-2 md:px-6 md:py-4"
                  style={{ borderLeft: `3px solid ${STEP_COLORS[index % 4]}` }}
                >
                  <span className="min-w-0 break-words text-sm font-medium leading-snug text-white md:text-[clamp(16px,1.85vw,24px)]">{text}</span>
                </div>
              ) : null,
            )}
          </div>
        </div>

        {!mobile && (
          <aside className="flex min-h-0 flex-col items-center justify-end bg-[#fabe01] px-4 pb-1.5 pt-1">
            <MascotBubble message={message} />
            <Blocks.Image src={`avatars/${avatar}.webp`} alt={`Avatar de ${avatar}`} className="w-full flex-1 object-contain object-bottom" style={{ minHeight: 0, maxWidth: 550 }} />
          </aside>
        )}
      </div>
    </section>
  );
}

function Reward({ reward, value, mobile, ...colors }) {
  return (
    <MetricPanel
      {...colors}
      title={reward?.title?.text ?? reward?.title}
      value={value ?? reward?.text?.text}
      className="rounded-2xl"
      style={{ minHeight: mobile ? "unset" : 200, width: mobile ? 0 : "100%", maxWidth: mobile ? "none" : 440, flex: 1, padding: mobile ? "8px 10px" : "12px 16px", margin: mobile ? 0 : "0 auto", overflow: "hidden" }}
      icon={<img src={reward?.media?.src} alt={reward?.media?.alt} className="shrink-0 object-contain" style={{ width: mobile ? 28 : 48, height: mobile ? 28 : 48 }} />}
    />
  );
}

function Stats({ attempt, mobile }) {
  if (!attempt.message && attempt.score == null) return null;
  const passed = attempt.passed;

  return (
    <div className={mobile ? "" : "px-4 pt-10"}>
      {attempt.message && (
        <div
          className="mb-1.5 rounded-xl border px-2.5 py-2 text-center text-base font-semibold md:mx-6 md:mb-2 md:p-4 md:text-[29px]"
          style={{
            background: passed ? "rgba(110,231,183,.15)" : "rgba(252,165,165,.15)",
            borderColor: passed ? "rgba(110,231,183,.4)" : "rgba(252,165,165,.4)",
            color: passed ? "#fff" : "#fca5a5",
          }}
        >
          {attempt.message}
        </div>
      )}

      {attempt.score != null && (
        <div className="px-1.5 py-1 text-center text-[13px] font-semibold text-white/70 md:py-5 md:pl-8 md:text-left md:text-xl">
          🟡 Puntaje: <b className="text-white">{attempt.score}</b>
          {attempt.prevBestScore != null && <><br />🟡 Mejor marca: <b className="text-white">{attempt.prevBestScore}</b></>}
          {attempt.minScore != null && <><br />🟡 Mínimo: <b className="text-white/80">{attempt.minScore}</b></>}
        </div>
      )}
    </div>
  );
}

function PostGame({ payload, mobile }) {
  const { xp, coins } = payload.rewards;
  const attempt = payload.attempt;
  const avatar = payload.equippedAvatarName;
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[.08] backdrop-blur-2xl" style={{ height: mobile ? "auto" : "100%" }}>
      {confetti && <Confetti recycle={false} numberOfPieces={mobile ? 150 : 300} gravity={0.18} className="pointer-events-none absolute inset-0 z-10" />}

      <header className="px-3 pb-1.5 pt-3 text-center md:px-7 md:pb-2 md:pt-6"><Text content={payload.title} fallback="h1" /></header>

      <div className={mobile ? "flex flex-1 flex-col gap-2.5 p-2.5" : "grid min-h-0 flex-1 grid-cols-3 gap-1.5 px-6 py-1.5"}>
        <div className={mobile ? "flex w-full items-stretch justify-center gap-2 px-2" : "flex w-full flex-col items-center justify-center pt-10"}>
          <Reward reward={xp} value={attempt.xpEarned} color="#2962ff" textColor="#fff8e6" accent="#f9c74f" mobile={mobile} />
          {!mobile && <div className="h-4" />}
          <Reward reward={coins} value={attempt.coinsAwarded} color="#ffc400" textColor="#ecfdf5" accent="" mobile={mobile} />
        </div>

        <div className="flex min-h-0 items-center justify-center overflow-hidden" style={{ maxHeight: mobile ? 160 : "none" }}>
          <Blocks.Image src={`activity/avatars/${avatar}.webp`} alt={`Avatar de ${avatar}`} variant="square" className="w-full border-0 object-contain" style={{ height: mobile ? 140 : "90%", minHeight: 0, objectPosition: "center bottom" }} />
        </div>

        <Stats attempt={attempt} mobile={mobile} />
      </div>

      <footer className="border-t border-white/10 px-2.5 py-1.5 text-center md:px-7 md:py-0"><Text content={payload.footer} /></footer>
    </section>
  );
}

function Wait({ payload, mobile }) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-1.5 md:gap-2.5">
      <header className="rounded-2xl p-3 text-center md:p-5"><div className="mx-auto max-w-[760px]"><Text content={payload.title} fallback="h1" /></div></header>
      {payload.media?.src && (
        <div className="min-h-0 flex-1 rounded-2xl p-2 md:p-5">
          <Blocks.Image src={payload.media.src} alt={payload.media.alt ?? "Imagen"} variant={payload.media.variant ?? payload.media.ratio} className="h-full w-full object-cover" style={{ minHeight: mobile ? 140 : 220 }} />
        </div>
      )}
    </section>
  );
}

const VIEWS = { preGame: PreGame, postGame: PostGame, wait: Wait };

export function LobbyRuntimeController({ variant, data = {}, heroApi, view, renderRuntime }) {
  const mobile = useMobile();
  const { imgAvatar } = useEquippedAvatar();
  const resolvedVariant = resolveVariant(variant, view);
  const payload = buildPayload(data, view, heroApi, imgAvatar, resolvedVariant);
  const View = VIEWS[resolvedVariant];

  return renderRuntime({
    variant: resolvedVariant,
    layoutDef: LAYOUT_DEF,
    payload,
    gridClassName: "h-full min-h-0 w-full",
    slots: [{
      slotId: "lobby",
      area: "primary",
      areaAlign: "stretch",
      areaClassName: "h-full justify-stretch",
      render: () => <View payload={payload} mobile={mobile} />,
    }],
  });
}