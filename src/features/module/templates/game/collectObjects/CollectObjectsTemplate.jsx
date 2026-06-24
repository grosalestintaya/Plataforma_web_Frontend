import { useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CircleDollarSign,
  Landmark,
  Pause,
  PiggyBank,
  Play,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import Typography from "@/features/module/blocks/base/Typography";
import { cn } from "@/shared/libs/utils";
import SurplusDecisionStage from "./SurplusDecisionStage";

const DEFAULT_WAVE_PATTERNS = [
  ["income"],
  ["income", "expense"],
  ["income", "expense", "expense"],
  ["expense", "income", "income"],
  ["income", "income", "expense"],
  ["income", "expense", "income"],
];

const DEFAULT_GAME_DATA = {
  sidebarTitle: {
    text: "Atrapa los ingresos",
    variant: "h2",
    align: "left",
  },
  goalLabel: {
    text: "Meta",
    variant: "h3",
    align: "center",
  },
  target: {
    title: {
      text: "Bicicleta",
      variant: "h3",
      align: "center",
    },
    amount: 100,
    media: {
      src: "1/ganar-dinero.webp",
      alt: "Meta de ahorro",
      variant: "square",
    },
  },
  collectedLabel: {
    text: "Recolectado:",
    variant: "h3",
    align: "left",
  },
  basket: {
    label: "INGRESO",
    width: 188,
    height: 120,
  },
  game: {
    maxActiveItems: 3,
    spawnEveryMs: 540,
    basketSpeedPx: 28,
    itemFallMin: 2.5,
    itemFallMax: 3.7,
    pointsToComplete: 100,
    minimumCompletionAmount: 100,
    introTitle: "¿Cómo se juega?",
    introText:
      "Mueve la canasta con el cursor o con las teclas para atrapar los ingresos que caen. Evita los egresos para completar tu meta.",
    startButtonText: "Comenzar",
    roundLabelText: "Semana",
    weeklyRounds: [],
    wavePatterns: DEFAULT_WAVE_PATTERNS,
    incomeItems: [],
    expenseItems: [],
  },
};

const ITEM_STYLES = {
  income: {
    shell: "border-[#44c37c] shadow-[0_16px_28px_rgba(26,116,58,0.2)]",
    badge: "bg-[radial-gradient(circle_at_30%_30%,#95ef6c_0%,#4ead39_100%)]",
    icon: CircleDollarSign,
  },
  expense: {
    shell: "border-[#ff7e69] shadow-[0_16px_28px_rgba(164,57,34,0.2)]",
    badge: "bg-[radial-gradient(circle_at_30%_30%,#ffb17f_0%,#ff6d45_100%)]",
    icon: TrendingDown,
  },
};

const BACKDROP_ICONS = [
  { Icon: Landmark, className: "left-[4%] top-[11%] h-12 w-12 sm:h-16 sm:w-16 opacity-14" },
  { Icon: TrendingUp, className: "right-[4%] top-[16%] h-14 w-14 sm:h-20 sm:w-20 opacity-14" },
  { Icon: PiggyBank, className: "left-[10%] bottom-[20%] h-16 w-16 sm:h-24 sm:w-24 opacity-10" },
  { Icon: Wallet, className: "right-[7%] bottom-[17%] h-16 w-16 sm:h-24 sm:w-24 opacity-10" },
  { Icon: Target, className: "right-[11%] top-[42%] h-10 w-10 sm:h-14 sm:w-14 opacity-10" },
];

const PLAYFIELD_PADDING = 18;
const CARD_WIDTH = 168;
const CARD_HEIGHT = 112;
const FLOOR_HEIGHT = 92;
const BASKET_WIDTH_FALLBACK = 228;
const BASKET_HEIGHT_FALLBACK = 120;
const BASKET_MIN_WIDTH = 228;
const DEFAULT_COLLECTED_STATUS_TEXT = "Superaste la meta por {amount}";
const CAPTURE_SCORE_BY_WEEK = {
  1: 60,
  2: 60,
  3: 60,
  4: 60,
  5: 45,
  6: 30,
};
const RESTART_PENALTY = 10;

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function toNumber(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function formatCurrency(value) {
  return `S/. ${Number(value ?? 0).toFixed(2)}`;
}

function replaceAmountToken(text, amount) {
  return String(text ?? DEFAULT_COLLECTED_STATUS_TEXT).replace(
    "{amount}",
    formatCurrency(amount),
  );
}

function getCaptureScore(completionWeek, restartCount) {
  const baseScore = CAPTURE_SCORE_BY_WEEK[completionWeek] ?? 0;
  return Math.max(0, baseScore - Math.max(0, restartCount) * RESTART_PENALTY);
}

function resolveAssetSrc(src) {
  const raw = String(src ?? "").trim();
  if (!raw) return "";

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:") ||
    raw.startsWith("/")
  ) {
    return raw;
  }

  const normalized = raw
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^src\/assets\/activity\//, "")
    .replace(/^assets\/activity\//, "")
    .replace(/^activity\//, "")
    .replace(/^assets\//, "");

  return `/activity/${normalized}`;
}

function normalizeItems(items, kind) {
  return Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        kind: item?.kind ?? kind,
      }))
    : [];
}

function normalizeGameData(data) {
  const incomingGame = data?.game ?? {};
  const incomingTarget = data?.target ?? {};
  const legacyItems = Array.isArray(incomingGame.items)
    ? incomingGame.items
    : [];
  const legacyIncomeItems = legacyItems.filter((item) => item?.kind !== "expense");
  const legacyExpenseItems = legacyItems.filter((item) => item?.kind === "expense");

  const incomeItems = normalizeItems(
    incomingGame.incomeItems?.length
      ? incomingGame.incomeItems
      : legacyIncomeItems.length
        ? legacyIncomeItems
        : DEFAULT_GAME_DATA.game.incomeItems,
    "income",
  );

  const expenseItems = normalizeItems(
    incomingGame.expenseItems?.length
      ? incomingGame.expenseItems
      : legacyExpenseItems.length
        ? legacyExpenseItems
        : DEFAULT_GAME_DATA.game.expenseItems,
    "expense",
  );

  return {
    ...DEFAULT_GAME_DATA,
    ...data,
    sidebarTitle: data?.sidebarTitle ?? DEFAULT_GAME_DATA.sidebarTitle,
    goalLabel: data?.goalLabel ?? DEFAULT_GAME_DATA.goalLabel,
    collectedLabel: data?.collectedLabel ?? DEFAULT_GAME_DATA.collectedLabel,
    target: {
      ...DEFAULT_GAME_DATA.target,
      ...incomingTarget,
      title: incomingTarget.title ?? DEFAULT_GAME_DATA.target.title,
      media: {
        ...DEFAULT_GAME_DATA.target.media,
        ...(incomingTarget.media ?? {}),
      },
      amount: toNumber(
        incomingTarget.amount,
        DEFAULT_GAME_DATA.target.amount,
      ),
    },
    basket: {
      ...DEFAULT_GAME_DATA.basket,
      ...(data?.basket ?? {}),
      width: toNumber(data?.basket?.width, DEFAULT_GAME_DATA.basket.width),
      height: toNumber(data?.basket?.height, DEFAULT_GAME_DATA.basket.height),
    },
    game: {
      ...DEFAULT_GAME_DATA.game,
      ...incomingGame,
      maxActiveItems: toNumber(
        incomingGame.maxActiveItems,
        DEFAULT_GAME_DATA.game.maxActiveItems,
      ),
      spawnEveryMs: toNumber(
        incomingGame.spawnEveryMs,
        DEFAULT_GAME_DATA.game.spawnEveryMs,
      ),
      basketSpeedPx: toNumber(
        incomingGame.basketSpeedPx,
        DEFAULT_GAME_DATA.game.basketSpeedPx,
      ),
      itemFallMin: toNumber(
        incomingGame.itemFallMin,
        DEFAULT_GAME_DATA.game.itemFallMin,
      ),
      itemFallMax: toNumber(
        incomingGame.itemFallMax,
        DEFAULT_GAME_DATA.game.itemFallMax,
      ),
      pointsToComplete: toNumber(
        incomingGame.pointsToComplete,
        incomingTarget.amount ?? DEFAULT_GAME_DATA.game.pointsToComplete,
      ),
      minimumCompletionAmount: toNumber(
        incomingGame.minimumCompletionAmount,
        incomingTarget.amount ?? DEFAULT_GAME_DATA.game.minimumCompletionAmount,
      ),
      roundLabelText:
        incomingGame.roundLabelText ?? DEFAULT_GAME_DATA.game.roundLabelText,
      weeklyRounds:
        Array.isArray(incomingGame.weeklyRounds) && incomingGame.weeklyRounds.length
          ? incomingGame.weeklyRounds
          : DEFAULT_GAME_DATA.game.weeklyRounds,
      wavePatterns:
        Array.isArray(incomingGame.wavePatterns) && incomingGame.wavePatterns.length
          ? incomingGame.wavePatterns
          : DEFAULT_WAVE_PATTERNS,
      incomeItems,
      expenseItems,
    },
  };
}

function pickRandom(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function getSourcePayload({ heroApi, resolvedData, targetAmount }) {
  const sourceViewId = resolvedData?.sourceViewId ?? resolvedData?.game?.sourceViewId;
  const previousState = sourceViewId ? heroApi?.getInteractiveState?.(sourceViewId) : null;
  const payload = previousState?.payload ?? resolvedData?.previewPayload ?? {};
  const protectedGoalAmount = toNumber(
    payload?.protectedGoalAmount,
    targetAmount,
  );
  const collectedAmount = toNumber(payload?.collectedAmount, protectedGoalAmount);
  const surplusAmount = Math.max(
    0,
    toNumber(payload?.surplusAmount, collectedAmount - protectedGoalAmount),
  );

  return {
    sourceViewId,
    targetAmount: toNumber(payload?.targetAmount, targetAmount),
    collectedAmount,
    protectedGoalAmount,
    surplusAmount,
    target: payload?.target ?? resolvedData?.target,
  };
}

function shuffleArray(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

function isPremiumIncomeItem(item) {
  const amount = Number(item?.amount ?? 0);
  return item?.kind === "income" && amount >= 30 && amount <= 50;
}

function getItemLookup(incomeItems, expenseItems) {
  return [...incomeItems, ...expenseItems].reduce((acc, item) => {
    if (item?.id) acc[item.id] = item;
    return acc;
  }, {});
}

function getRoundCards({
  waveIndex,
  weeklyRounds,
  itemLookup,
  incomeItems,
  expenseItems,
  patterns,
}) {
  if (Array.isArray(weeklyRounds) && weeklyRounds.length > 0) {
    const roundConfig = weeklyRounds[waveIndex];
    const roundCards = Array.isArray(roundConfig)
      ? roundConfig
      : Array.isArray(roundConfig?.cards)
        ? roundConfig.cards
        : [];

    return shuffleArray(
      roundCards
        .map((entry) => {
          const itemId =
            typeof entry === "string"
              ? entry
              : entry?.itemId ?? entry?.id ?? null;

          return itemId ? itemLookup[itemId] ?? null : null;
        })
        .filter(Boolean),
    );
  }

  const pattern = patterns[waveIndex % patterns.length] ?? DEFAULT_WAVE_PATTERNS[0];
  const lowestIncome = [...incomeItems].sort(
    (left, right) => Number(left.amount ?? 0) - Number(right.amount ?? 0),
  )[0];

  return pattern
    .map((kind) => {
      const sourceItem =
        waveIndex === 0 && kind === "income"
          ? lowestIncome
          : kind === "expense"
            ? pickRandom(expenseItems)
            : pickRandom(incomeItems);

      return sourceItem ?? null;
    })
    .filter(Boolean);
}

function buildSprite(item, playfieldWidth, fallMin, fallMax, overrides = {}) {
  const maxLeft = Math.max(
    PLAYFIELD_PADDING,
    playfieldWidth - CARD_WIDTH - PLAYFIELD_PADDING,
  );

  return {
    runtimeId:
      overrides.runtimeId ??
      `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    item,
    left: clamp(
      overrides.left ??
        PLAYFIELD_PADDING + Math.random() * (maxLeft - PLAYFIELD_PADDING),
      PLAYFIELD_PADDING,
      maxLeft,
    ),
    top: overrides.top ?? (-CARD_HEIGHT - Math.random() * 36),
    speed:
      overrides.speed ??
      (fallMin + Math.random() * Math.max(0.2, fallMax - fallMin)),
    rotation: overrides.rotation ?? (Math.random() * 8 - 4),
    releaseAtMs: overrides.releaseAtMs ?? 0,
    isPremium: overrides.isPremium ?? isPremiumIncomeItem(item),
  };
}

function buildWaveState({
  waveIndex,
  width,
  weeklyRounds,
  itemLookup,
  patterns,
  incomeItems,
  expenseItems,
  fallMin,
  fallMax,
  spawnEveryMs,
}) {
  const roundCards = getRoundCards({
    waveIndex,
    weeklyRounds,
    itemLookup,
    incomeItems,
    expenseItems,
    patterns,
  });

  if (!roundCards.length) {
    return null;
  }

  const queue = roundCards
    .map((item, index) =>
      buildSprite(item, width, fallMin, fallMax, {
        top: -CARD_HEIGHT - Math.random() * 20,
        left:
          PLAYFIELD_PADDING +
          ((width - CARD_WIDTH - PLAYFIELD_PADDING * 2) * (index + 1)) /
            (roundCards.length + 1),
        rotation: index % 2 === 0 ? -3 + index : 2 + index,
        releaseAtMs: index * spawnEveryMs,
        speed:
          (fallMin + Math.random() * Math.max(0.2, fallMax - fallMin)) *
          (isPremiumIncomeItem(item) ? 1.2 : 1),
        isPremium: isPremiumIncomeItem(item),
      }),
    )
    .filter(Boolean);

  return {
    capacity: Math.max(1, queue.length),
    displayRound: waveIndex + 1,
    queue,
  };
}

function fillOpenSlots({ visibleSprites, queue, capacity, elapsedMs }) {
  const nextQueue = [...queue];
  const nextVisibleSprites = [...visibleSprites];

  while (nextQueue.length && nextVisibleSprites.length < capacity) {
    const nextCandidate = nextQueue[0];
    if ((nextCandidate?.releaseAtMs ?? 0) > elapsedMs) {
      break;
    }

    const nextSprite = nextQueue.shift();
    if (nextSprite) {
      nextVisibleSprites.push(nextSprite);
    }
  }

  return {
    visibleSprites: nextVisibleSprites,
    queue: nextQueue,
  };
}

function FallingCard({ sprite }) {
  const theme = ITEM_STYLES[sprite.item.kind] ?? ITEM_STYLES.income;
  const BadgeIcon = theme.icon;
  const imageSrc = resolveAssetSrc(sprite.item?.media?.src);
  const isPremium = Boolean(sprite.isPremium);
  const amountLabel =
    sprite.item.kind === "expense"
      ? `- ${formatCurrency(sprite.item.amount)}`
      : `+ ${formatCurrency(sprite.item.amount)}`;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: `${sprite.left}px`,
        top: `${sprite.top}px`,
        width: `${CARD_WIDTH}px`,
        transform: `rotate(${sprite.rotation}deg)`,
      }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.25rem] border-[3px] bg-transparent p-[0.18rem]",
          theme.shell,
          isPremium &&
            "border-[#ffe483] shadow-[0_0_0_2px_rgba(255,233,142,0.45),0_0_26px_rgba(255,208,72,0.55),0_20px_32px_rgba(170,112,0,0.24)]",
        )}
      >
        {isPremium ? (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,245,175,0.38),transparent_58%)]" />
        ) : null}
        <div
          className={cn(
            "absolute -left-3 -top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white/90 text-white shadow-[0_10px_18px_rgba(0,0,0,0.18)]",
            theme.badge,
            isPremium &&
              "bg-[radial-gradient(circle_at_30%_30%,#fff4ab_0%,#ffbd2c_100%)] shadow-[0_0_18px_rgba(255,211,83,0.6)]",
          )}
        >
          <BadgeIcon className="h-5 w-5" strokeWidth={2.5} />
        </div>

        <div className="relative overflow-hidden rounded-[1rem] border border-white/20 bg-white/5 shadow-[0_10px_22px_rgba(0,0,0,0.16)] backdrop-blur-[1px]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={sprite.item?.media?.alt ?? sprite.item.label}
              className="h-[74px] w-full object-cover"
            />
          ) : null}

          <div className="bg-[linear-gradient(180deg,rgba(8,26,74,0.24),rgba(8,26,74,0.82))] px-2 py-1.5 text-center">
            <div className="text-[0.76rem] font-black leading-tight text-white">
              {sprite.item.label}
            </div>
            <div className="mt-0.5 text-[0.68rem] font-black leading-none text-white/90">
              {amountLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ target }) {
  const targetImageSrc = resolveAssetSrc(target?.media?.src);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.15rem] p-1">
      <div className="absolute right-2 top-2 rounded-[0.8rem] bg-[linear-gradient(180deg,#42d98f_0%,#19bf6c_100%)] px-3 py-1 text-[0.82rem] font-black text-white shadow-[0_10px_16px_rgba(0,105,64,0.26)]">
        {formatCurrency(target.amount)}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.1rem] border-[3px] border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] shadow-[0_14px_28px_rgba(7,31,94,0.24)]">
        <div className="min-h-0 flex-1 overflow-hidden rounded-[0.9rem]">
          {targetImageSrc ? (
            <img
              src={targetImageSrc}
              alt={target?.media?.alt ?? target?.title?.text ?? "Meta"}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="shrink-0 px-2 pb-2 pt-2 text-center text-[0.95rem] font-black leading-tight text-white sm:text-[1.05rem]">
          {target?.title?.text ?? "Meta"}
        </div>
      </div>
    </div>
  );
}

function Basket({ basketX, basketWidth, basketHeight }) {
  return (
    <div
      className="pointer-events-none absolute bottom-[0.65rem] z-30"
      style={{
        left: `${basketX}px`,
        width: `${basketWidth}px`,
        height: `${basketHeight + 20}px`,
      }}
    >
      <img
        src={resolveAssetSrc("4/canasta-juego.png")}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-full w-full object-contain drop-shadow-[0_18px_18px_rgba(69,40,12,0.22)]"
      />
    </div>
  );
}

export default function CollectObjectsTemplate({ view, heroApi, data }) {
  const viewId = view?.id ?? view?.viewId;
  const resolvedData = useMemo(() => normalizeGameData(data), [data]);
  const isSurplusMode = resolvedData.game?.mode === "surplusDecision";
  const targetAmount = resolvedData.game.pointsToComplete;
  const minimumCompletionAmount = Math.max(
    targetAmount,
    toNumber(resolvedData.game.minimumCompletionAmount, targetAmount),
  );
  const sourcePayload = useMemo(
    () => getSourcePayload({ heroApi, resolvedData, targetAmount }),
    [heroApi, resolvedData, targetAmount],
  );
  const basketWidth = Math.max(
    resolvedData.basket.width ?? BASKET_WIDTH_FALLBACK,
    BASKET_MIN_WIDTH,
  );
  const basketHeight = resolvedData.basket.height ?? BASKET_HEIGHT_FALLBACK;
  const playfieldRef = useRef(null);
  const rafRef = useRef(null);
  const lastFrameRef = useRef(0);
  const spritesRef = useRef([]);
  const waveElapsedRef = useRef(0);
  const queueRef = useRef([]);
  const waveIndexRef = useRef(0);
  const waveCapacityRef = useRef(1);
  const keyboardRef = useRef({ left: false, right: false });
  const basketXRef = useRef(0);
  const collectedRef = useRef(0);
  const completedRef = useRef(false);
  const consumedSpriteIdsRef = useRef(new Set());
  const currentRoundRef = useRef(0);
  const sessionInitializedRef = useRef(false);
  const autoPausedByDetailsRef = useRef(false);
  const [playfieldSize, setPlayfieldSize] = useState({ width: 900, height: 520 });
  const [basketX, setBasketX] = useState(0);
  const [sprites, setSprites] = useState([]);
  const [collected, setCollected] = useState(0);
  const [caughtItems, setCaughtItems] = useState([]);
  const [movementHistory, setMovementHistory] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [restartCount, setRestartCount] = useState(0);
  const [completionWeek, setCompletionWeek] = useState(null);
  const [surplusStageState, setSurplusStageState] = useState({
    completed: false,
    score: 0,
    displayAmount: 0,
    progressValue: 0,
    progressMax: 1,
    details: [],
    payload: null,
  });
  const itemLookup = useMemo(
    () => getItemLookup(resolvedData.game.incomeItems, resolvedData.game.expenseItems),
    [resolvedData.game.expenseItems, resolvedData.game.incomeItems],
  );
  const captureScore = useMemo(
    () =>
      isCompleted && !isSurplusMode
        ? getCaptureScore(completionWeek, restartCount)
        : 0,
    [completionWeek, isCompleted, isSurplusMode, restartCount],
  );

  useEffect(() => {
    setCollected(0);
    setCaughtItems([]);
    setMovementHistory([]);
    setIsCompleted(false);
    setIsFailed(false);
    setIsStarted(false);
    setIsPaused(false);
    setIsDetailsOpen(false);
    setCurrentRound(0);
    setRestartCount(0);
    setCompletionWeek(null);
    setSprites([]);
    spritesRef.current = [];
    collectedRef.current = 0;
    completedRef.current = false;
    consumedSpriteIdsRef.current = new Set();
    currentRoundRef.current = 0;
    waveElapsedRef.current = 0;
    autoPausedByDetailsRef.current = false;
    sessionInitializedRef.current = false;
    queueRef.current = [];
    waveIndexRef.current = 0;
    waveCapacityRef.current = 1;
    keyboardRef.current = { left: false, right: false };
    lastFrameRef.current = 0;
    setSurplusStageState({
      completed: false,
      score: 0,
      displayAmount: 0,
      progressValue: 0,
      progressMax: 1,
      details: [],
      payload: null,
    });
  }, [viewId]);

  useEffect(() => {
    if (!isSurplusMode) return;

    setCollected(sourcePayload.surplusAmount);
    setIsStarted(true);
    setIsPaused(false);
    setIsFailed(false);
    setSprites([]);
    spritesRef.current = [];
    queueRef.current = [];
    sessionInitializedRef.current = false;
    waveIndexRef.current = 0;
    waveCapacityRef.current = 1;
    currentRoundRef.current = 0;
    setCurrentRound(0);
    lastFrameRef.current = 0;
  }, [isSurplusMode, sourcePayload.surplusAmount]);

  useEffect(() => {
    function updateSize() {
      const node = playfieldRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const width = Math.max(360, Math.round(rect.width));
      const height = Math.max(360, Math.round(rect.height));
      setPlayfieldSize({ width, height });
      setBasketX((current) => {
        const maxLeft = Math.max(
          PLAYFIELD_PADDING,
          width - basketWidth - PLAYFIELD_PADDING,
        );
        const next = clamp(
          current || (width - basketWidth) / 2,
          PLAYFIELD_PADDING,
          maxLeft,
        );
        basketXRef.current = next;
        return next;
      });
    }

    updateSize();

    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(() => updateSize());
    if (playfieldRef.current) observer.observe(playfieldRef.current);

    return () => observer.disconnect();
  }, [basketWidth]);

  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  useEffect(() => {
    collectedRef.current = collected;
    completedRef.current = isCompleted;

    if (isSurplusMode) {
      heroApi?.setInteractiveState?.(viewId, {
        type: "collectObjects",
        completed: surplusStageState.completed,
        score: surplusStageState.score,
        collected: surplusStageState.displayAmount,
        payload: {
          ...surplusStageState.payload,
          targetAmount: sourcePayload.targetAmount,
          collectedAmount: sourcePayload.collectedAmount,
          protectedGoalAmount: sourcePayload.protectedGoalAmount,
          surplusAmount: sourcePayload.surplusAmount,
          target: sourcePayload.target,
        },
      });
      return;
    }

    heroApi?.setInteractiveState?.(viewId, {
      type: "collectObjects",
      completed: isCompleted,
      score: isCompleted
        ? captureScore
        : Math.round((collected / Math.max(minimumCompletionAmount, 1)) * 100),
      collected,
      payload: {
        targetAmount,
        collectedAmount: collected,
        protectedGoalAmount: targetAmount,
        surplusAmount: Math.max(0, collected - targetAmount),
        requiredAmount: minimumCompletionAmount,
        canContinueToInvestment: collected >= minimumCompletionAmount,
        completionWeek,
        restartCount,
        captureScore,
        target: resolvedData.target,
        caughtItems,
        currentRound,
      },
    });
  }, [
    caughtItems,
    collected,
    currentRound,
    heroApi,
    isCompleted,
    isSurplusMode,
    captureScore,
    completionWeek,
    resolvedData.target,
    restartCount,
    sourcePayload.collectedAmount,
    sourcePayload.protectedGoalAmount,
    sourcePayload.surplusAmount,
    sourcePayload.target,
    sourcePayload.targetAmount,
    surplusStageState.completed,
    surplusStageState.displayAmount,
    surplusStageState.payload,
    surplusStageState.score,
    targetAmount,
    viewId,
  ]);

  useEffect(() => {
    if (isSurplusMode) return undefined;

    function handleKeyDown(event) {
      const key = event.key.toLowerCase();

      if (event.key === "ArrowLeft" || key === "a") {
        keyboardRef.current.left = true;
      }
      if (event.key === "ArrowRight" || key === "d") {
        keyboardRef.current.right = true;
      }
    }

    function handleKeyUp(event) {
      const key = event.key.toLowerCase();

      if (event.key === "ArrowLeft" || key === "a") {
        keyboardRef.current.left = false;
      }
      if (event.key === "ArrowRight" || key === "d") {
        keyboardRef.current.right = false;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSurplusMode]);

  useEffect(() => {
    if (isSurplusMode) {
      setSprites([]);
      spritesRef.current = [];
      queueRef.current = [];
      lastFrameRef.current = 0;
      return undefined;
    }

    if (!isStarted || isCompleted || isFailed) {
      setSprites([]);
      spritesRef.current = [];
      queueRef.current = [];
      lastFrameRef.current = 0;
      return undefined;
    }

    if (isPaused) {
      lastFrameRef.current = 0;
      return undefined;
    }

    function tick(timestamp) {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const delta = Math.min(32, timestamp - lastFrameRef.current);
      lastFrameRef.current = timestamp;
      waveElapsedRef.current += delta;

      const maxLeft = Math.max(
        PLAYFIELD_PADDING,
        playfieldSize.width - basketWidth - PLAYFIELD_PADDING,
      );
      const movingLeft = keyboardRef.current.left;
      const movingRight = keyboardRef.current.right;

      if (movingLeft || movingRight) {
        const direction =
          movingLeft && !movingRight ? -1 : !movingLeft && movingRight ? 1 : 0;

        if (direction) {
          const nextBasketX = clamp(
            basketXRef.current + direction * resolvedData.game.basketSpeedPx,
            PLAYFIELD_PADDING,
            maxLeft,
          );
          basketXRef.current = nextBasketX;
          setBasketX(nextBasketX);
        }
      }

      let nextSprites = spritesRef.current.map((sprite) => ({
        ...sprite,
        top: sprite.top + sprite.speed * (delta / 16),
      }));

      const floorTop = playfieldSize.height - FLOOR_HEIGHT;
      const basketVisualHeight = basketHeight + 20;
      const basketCollisionLeft = basketXRef.current + basketWidth * 0.16;
      const basketCollisionRight = basketXRef.current + basketWidth * 0.84;
      const basketCollisionTop =
        floorTop - Math.max(24, basketVisualHeight * 0.34);
      const basketCollisionBottom =
        floorTop + Math.max(6, basketVisualHeight * 0.04);

      let deltaAmount = 0;
      const caughtNow = [];

      nextSprites = nextSprites.filter((sprite) => {
        const spriteLeft = sprite.left + 6;
        const spriteRight = sprite.left + CARD_WIDTH - 6;
        const spriteTop = sprite.top + 8;
        const spriteBottom = sprite.top + CARD_HEIGHT;
        const spriteCenterX = (spriteLeft + spriteRight) / 2;

        const intersectsBasket =
          spriteCenterX >= basketCollisionLeft &&
          spriteCenterX <= basketCollisionRight &&
          spriteBottom >= basketCollisionTop &&
          spriteBottom <= basketCollisionBottom &&
          spriteTop < basketCollisionBottom;

        if (intersectsBasket) {
          if (consumedSpriteIdsRef.current.has(sprite.runtimeId)) {
            return false;
          }

          consumedSpriteIdsRef.current.add(sprite.runtimeId);
          const signedAmount =
            sprite.item.kind === "expense"
              ? -Number(sprite.item.amount ?? 0)
              : Number(sprite.item.amount ?? 0);

          deltaAmount += signedAmount;
          caughtNow.push(sprite.item);
          return false;
        }

        if (sprite.top > playfieldSize.height + CARD_HEIGHT) {
          return false;
        }

        return true;
      });

      if (!queueRef.current.length && !nextSprites.length) {
        const nextWave = buildWaveState({
          waveIndex: waveIndexRef.current,
          width: playfieldSize.width,
          weeklyRounds: resolvedData.game.weeklyRounds,
          itemLookup,
          patterns: resolvedData.game.wavePatterns,
          incomeItems: resolvedData.game.incomeItems,
          expenseItems: resolvedData.game.expenseItems,
          fallMin: resolvedData.game.itemFallMin,
          fallMax: resolvedData.game.itemFallMax,
          spawnEveryMs: resolvedData.game.spawnEveryMs,
        });

        if (!nextWave) {
          spritesRef.current = [];
          setSprites([]);
          setIsPaused(false);
          setIsFailed(true);
          lastFrameRef.current = 0;
          sessionInitializedRef.current = false;
          queueRef.current = [];
          return;
        }

        queueRef.current = nextWave.queue;
        waveCapacityRef.current = nextWave.capacity;
        currentRoundRef.current = nextWave.displayRound;
        waveElapsedRef.current = 0;
        setCurrentRound(nextWave.displayRound);
        waveIndexRef.current += 1;
      }

      if (queueRef.current.length) {
        const fillResult = fillOpenSlots({
            visibleSprites: nextSprites,
            queue: queueRef.current,
            capacity: Math.min(
              waveCapacityRef.current,
              resolvedData.game.maxActiveItems,
            ),
            elapsedMs: waveElapsedRef.current,
          });
        nextSprites = fillResult.visibleSprites;
        queueRef.current = fillResult.queue;
      }

      if (deltaAmount !== 0) {
        const nextCollected = Math.max(0, collectedRef.current + deltaAmount);
        collectedRef.current = nextCollected;
        setCollected(nextCollected);
        setCaughtItems((currentCaught) =>
          [...caughtNow, ...currentCaught].slice(0, 6),
        );
        setMovementHistory((currentHistory) => [
          ...currentHistory,
          ...caughtNow.map((item) => ({
            id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            week: currentRoundRef.current,
            label: item.label,
            kind: item.kind,
            amount:
              item.kind === "expense"
                ? -Math.abs(Number(item.amount ?? 0))
                : Math.abs(Number(item.amount ?? 0)),
          })),
        ]);

        if (
          nextCollected >= minimumCompletionAmount &&
          !completedRef.current
        ) {
          completedRef.current = true;
          setCompletionWeek(currentRoundRef.current);
          setIsCompleted(true);
        }
      }

      spritesRef.current = nextSprites;
      setSprites(nextSprites);
      rafRef.current = window.requestAnimationFrame(tick);
    }

    if (!sessionInitializedRef.current) {
      const firstWave = buildWaveState({
        waveIndex: 0,
        width: playfieldSize.width,
        weeklyRounds: resolvedData.game.weeklyRounds,
        itemLookup,
        patterns: resolvedData.game.wavePatterns,
        incomeItems: resolvedData.game.incomeItems,
        expenseItems: resolvedData.game.expenseItems,
        fallMin: resolvedData.game.itemFallMin,
        fallMax: resolvedData.game.itemFallMax,
        spawnEveryMs: resolvedData.game.spawnEveryMs,
      });
      if (!firstWave) {
        return undefined;
      }
      queueRef.current = firstWave.queue;
      waveCapacityRef.current = firstWave.capacity;
      currentRoundRef.current = firstWave.displayRound;
      waveElapsedRef.current = 0;
      setCurrentRound(firstWave.displayRound);
      waveIndexRef.current = 1;
      const initialFill = fillOpenSlots({
        visibleSprites: [],
        queue: queueRef.current,
        capacity: Math.min(firstWave.capacity, resolvedData.game.maxActiveItems),
        elapsedMs: waveElapsedRef.current,
      });
      queueRef.current = initialFill.queue;
      spritesRef.current = initialFill.visibleSprites;
      setSprites(initialFill.visibleSprites);
      sessionInitializedRef.current = true;
    }

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = 0;
    };
  }, [
    basketHeight,
    basketWidth,
    isStarted,
    isCompleted,
    isFailed,
    isPaused,
    itemLookup,
    playfieldSize.height,
    playfieldSize.width,
    resolvedData.game.basketSpeedPx,
    resolvedData.game.expenseItems,
    resolvedData.game.incomeItems,
    resolvedData.game.itemFallMax,
    resolvedData.game.itemFallMin,
    resolvedData.game.maxActiveItems,
    resolvedData.game.minimumCompletionAmount,
    resolvedData.game.spawnEveryMs,
    resolvedData.game.weeklyRounds,
    resolvedData.game.wavePatterns,
    minimumCompletionAmount,
    isSurplusMode,
    targetAmount,
  ]);

  function handlePointerMove(event) {
    if (isSurplusMode) return;
    const node = playfieldRef.current;
    if (!node || isCompleted || !isStarted || isPaused) return;

    const rect = node.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const nextX = clamp(
      relativeX - basketWidth / 2,
      PLAYFIELD_PADDING,
      Math.max(
        PLAYFIELD_PADDING,
        playfieldSize.width - basketWidth - PLAYFIELD_PADDING,
      ),
    );
    basketXRef.current = nextX;
    setBasketX(nextX);
  }

  function handleStartGame() {
    if (isSurplusMode) return;
    keyboardRef.current = { left: false, right: false };
    lastFrameRef.current = 0;
    setCollected(0);
    setCaughtItems([]);
    setMovementHistory([]);
    setSprites([]);
    spritesRef.current = [];
    setIsCompleted(false);
    setIsFailed(false);
    setIsPaused(false);
    setIsDetailsOpen(false);
    setCurrentRound(0);
    setCompletionWeek(null);
    collectedRef.current = 0;
    completedRef.current = false;
    consumedSpriteIdsRef.current = new Set();
    currentRoundRef.current = 0;
    waveElapsedRef.current = 0;
    autoPausedByDetailsRef.current = false;
    sessionInitializedRef.current = false;
    queueRef.current = [];
    waveIndexRef.current = 0;
    waveCapacityRef.current = 1;
    setIsStarted(true);
    playfieldRef.current?.focus?.();
  }

  function handleTogglePause() {
    if (isSurplusMode) return;
    if (!isStarted || isCompleted || isFailed) return;
    keyboardRef.current = { left: false, right: false };
    lastFrameRef.current = 0;
    setIsPaused((current) => !current);
    playfieldRef.current?.focus?.();
  }

  function handleRetryFromFailure() {
    if (isSurplusMode) return;
    keyboardRef.current = { left: false, right: false };
    lastFrameRef.current = 0;
    setCollected(0);
    setCaughtItems([]);
    setMovementHistory([]);
    setSprites([]);
    spritesRef.current = [];
    setIsCompleted(false);
    setIsFailed(false);
    setIsStarted(false);
    setIsPaused(false);
    setIsDetailsOpen(false);
    setCurrentRound(0);
    setCompletionWeek(null);
    setRestartCount((current) => current + 1);
    collectedRef.current = 0;
    completedRef.current = false;
    consumedSpriteIdsRef.current = new Set();
    currentRoundRef.current = 0;
    waveElapsedRef.current = 0;
    autoPausedByDetailsRef.current = false;
    sessionInitializedRef.current = false;
    queueRef.current = [];
    waveIndexRef.current = 0;
    waveCapacityRef.current = 1;
  }

  function handleOpenDetails() {
    if (isSurplusMode) {
      setIsDetailsOpen(true);
      return;
    }

    if (isStarted && !isCompleted && !isFailed && !isPaused) {
      autoPausedByDetailsRef.current = true;
      setIsPaused(true);
    }

    setIsDetailsOpen(true);
  }

  function handleCloseDetails() {
    setIsDetailsOpen(false);

    if (isSurplusMode) {
      playfieldRef.current?.focus?.();
      return;
    }

    if (autoPausedByDetailsRef.current) {
      autoPausedByDetailsRef.current = false;
      setIsPaused(false);
      lastFrameRef.current = 0;
    }

    playfieldRef.current?.focus?.();
  }

  const displayAmount = isSurplusMode
    ? surplusStageState.displayAmount
    : collected;
  const progressBaseAmount = isSurplusMode
    ? Math.max(surplusStageState.progressMax, 1)
    : Math.max(targetAmount, 1);
  const progressPercent = clamp(
    (displayAmount / progressBaseAmount) * 100,
    0,
    100,
  );
  const hasExceededGoal = displayAmount > progressBaseAmount;
  const exceededAmount = Math.max(0, displayAmount - progressBaseAmount);
  const historyByWeek = useMemo(
    () =>
      movementHistory.reduce((accumulator, entry) => {
        const currentEntries = accumulator[entry.week] ?? [];
        currentEntries.push(entry);
        accumulator[entry.week] = currentEntries;
        return accumulator;
      }, {}),
    [movementHistory],
  );
  const collectedStatusText = replaceAmountToken(
    resolvedData.collectedStatusText,
    exceededAmount,
  );

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-[98rem] flex-col overflow-hidden rounded-[2rem] border border-white/30 bg-[linear-gradient(180deg,#3e8cff_0%,#235fda_100%)] p-2 text-white shadow-[0_24px_60px_rgba(8,30,88,0.3)] sm:p-3 lg:min-h-0">
      <div
        className={cn(
          "grid min-h-0 flex-1 gap-2 sm:gap-3",
          isSurplusMode
            ? "lg:grid-cols-[clamp(15.5rem,18vw,17rem)_minmax(0,1fr)] xl:grid-cols-[clamp(16rem,18vw,17.5rem)_minmax(0,1fr)]"
            : "lg:grid-cols-[clamp(18rem,22vw,20rem)_minmax(0,1fr)] xl:grid-cols-[clamp(19rem,23vw,21rem)_minmax(0,1fr)]",
        )}
      >
        <aside className="relative flex min-h-0 flex-col overflow-hidden rounded-[1.7rem] border border-white/30 bg-[linear-gradient(180deg,#1b66de_0%,#0f4fb9_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] sm:p-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_46%)]" />
          <div className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-[#66beff]/40" />

          <div className="relative z-10 grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1.1fr)_minmax(0,0.72fr)] gap-2 sm:gap-3">
            <div className="rounded-[1.15rem] border border-[#66beff]/34 bg-[linear-gradient(180deg,#2a76ef_0%,#1958c0_100%)] px-3 py-3 sm:px-4 sm:py-4">
              <Typography
                content={{
                  ...resolvedData.sidebarTitle,
                  align: "center",
                }}
                className={cn(
                  "mx-auto font-black leading-[0.94]",
                  isSurplusMode
                    ? "max-w-[12.5rem] text-[clamp(1.3rem,0.95rem+1vw,2rem)]"
                    : "max-w-[11rem] text-[clamp(1.55rem,1.05rem+1.2vw,2.4rem)]",
                )}
              />
            </div>

            <div className="min-h-0 rounded-[1.15rem] border border-[#66beff]/34 bg-[linear-gradient(180deg,#236fef_0%,#154fae_100%)] p-2.5 sm:p-3">
              <div className="mb-2.5 flex items-center gap-2 rounded-[0.95rem] bg-[linear-gradient(180deg,#3186ff_0%,#2567d3_100%)] px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fff3d9_0%,#ffdca4_100%)] text-[#f04c48] shadow-[0_8px_14px_rgba(0,0,0,0.14)]">
                  <Target className="h-4.5 w-4.5" strokeWidth={2.8} />
                </div>
                <Typography content={resolvedData.goalLabel} className="font-black" />
              </div>

              <div className="min-h-0 h-[calc(100%-3.75rem)]">
                <GoalCard target={resolvedData.target} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenDetails}
              className="min-h-0 rounded-[1.15rem] border border-[#66beff]/34 bg-[linear-gradient(180deg,#236fef_0%,#154fae_100%)] px-3 py-3 text-left transition-transform duration-150 hover:scale-[1.01] sm:px-4 sm:py-4"
            >
              <Typography content={resolvedData.collectedLabel} className="font-black" />

              <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-[3.1rem] w-[3.1rem] shrink-0 items-center justify-center rounded-[0.9rem] bg-[linear-gradient(180deg,#24c675_0%,#187d59_100%)] shadow-[0_10px_18px_rgba(0,0,0,0.16)] sm:h-[3.5rem] sm:w-[3.5rem]">
                  <Wallet className="h-6 w-6 text-[#fff1b7] sm:h-7 sm:w-7" strokeWidth={2.4} />
                </div>
                <div className="min-w-0 text-[1.35rem] font-black leading-none text-white sm:text-[1.55rem] xl:text-[1.8rem]">
                  {formatCurrency(displayAmount)}
                </div>
              </div>

              {hasExceededGoal ? (
                <div className="mt-2 text-[0.72rem] font-black uppercase tracking-[0.04em] text-[#ffd46b] sm:text-[0.78rem]">
                  {collectedStatusText}
                </div>
              ) : null}

              <div className="mt-2.5 h-3 overflow-hidden rounded-full border border-white/20 bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-200",
                    hasExceededGoal
                      ? "bg-[linear-gradient(90deg,#ffd15a_0%,#ff8f2c_100%)]"
                      : "bg-[linear-gradient(90deg,#4bed92_0%,#1fb75f_100%)]",
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </button>
          </div>
        </aside>

        <div
          ref={playfieldRef}
          role="application"
          tabIndex={0}
          onMouseMove={handlePointerMove}
          onPointerMove={handlePointerMove}
          className="relative min-h-[26rem] overflow-hidden rounded-[1.7rem] border border-white/34 bg-[linear-gradient(180deg,#bdd7ff_0%,#9cc0fb_38%,#77a7ef_100%)] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.36)] sm:min-h-[30rem] lg:min-h-[34rem]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_52%)]" />

          {BACKDROP_ICONS.map(({ Icon, className }, index) => (
            <Icon
              key={`${Icon.displayName ?? Icon.name}-${index}`}
              className={cn("pointer-events-none absolute text-white", className)}
              strokeWidth={1.8}
            />
          ))}

          {!isSurplusMode && isStarted && !isFailed ? (
            <div className="pointer-events-none absolute left-4 top-4 z-30 flex items-center gap-2 rounded-[1rem] bg-[linear-gradient(180deg,#2f61c8_0%,#234aa9_100%)] px-4 py-2 text-white shadow-[0_12px_22px_rgba(19,47,118,0.24)]">
              <BriefcaseBusiness
                className="h-4.5 w-4.5 text-[#ffd96d]"
                strokeWidth={2.4}
              />
              <span className="text-[0.82rem] font-black uppercase tracking-[0.04em] text-white/92">
                {resolvedData.game.roundLabelText ??
                  DEFAULT_GAME_DATA.game.roundLabelText}
              </span>
              <span className="text-[1rem] font-black leading-none text-white">
                {currentRound}
              </span>
            </div>
          ) : null}

          {!isSurplusMode && isStarted && !isCompleted && !isFailed ? (
            <button
              type="button"
              onClick={handleTogglePause}
              className="absolute right-4 top-4 z-40 inline-flex items-center gap-2 rounded-[1rem] border border-white/20 bg-[linear-gradient(180deg,#2f61c8_0%,#234aa9_100%)] px-4 py-2 text-[0.96rem] font-black text-white shadow-[0_12px_22px_rgba(19,47,118,0.24)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
            >
              {isPaused ? (
                <Play className="h-4.5 w-4.5 text-[#ffd96d]" strokeWidth={2.6} />
              ) : (
                <Pause
                  className="h-4.5 w-4.5 text-[#ffd96d]"
                  strokeWidth={2.6}
                />
              )}
              <span>{isPaused ? "Continuar" : "Pausar"}</span>
            </button>
          ) : null}

          {!isSurplusMode ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[92px] bg-[linear-gradient(180deg,#d98138_0%,#c66d23_100%)]">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.07)_0_28px,transparent_28px_56px)] opacity-75" />
              </div>

              {sprites.map((sprite) => (
                <FallingCard key={sprite.runtimeId} sprite={sprite} />
              ))}

              <Basket
                basketX={basketX}
                basketWidth={basketWidth}
                basketHeight={basketHeight}
              />
            </>
          ) : (
            <SurplusDecisionStage
              data={resolvedData}
              sourcePayload={sourcePayload}
              onStateChange={setSurplusStageState}
            />
          )}

          {!isSurplusMode && !isStarted ? (
            <div className="absolute inset-0 z-40 flex items-center justify-center px-5 py-6 sm:px-8">
              <div className="w-full max-w-[35rem] rounded-[1.6rem] border border-white/35 bg-[linear-gradient(180deg,rgba(20,76,180,0.78),rgba(14,55,143,0.86))] px-5 py-6 text-center shadow-[0_20px_40px_rgba(10,28,88,0.3)] backdrop-blur-[3px] sm:px-8 sm:py-8">
                <Typography
                  content={{
                    text:
                      resolvedData.game.introTitle ??
                      DEFAULT_GAME_DATA.game.introTitle,
                    variant: "h2",
                    align: "center",
                  }}
                  className="font-black text-white"
                />
                <Typography
                  content={{
                    text:
                      resolvedData.game.introText ??
                      DEFAULT_GAME_DATA.game.introText,
                    variant: "body",
                    align: "center",
                  }}
                  className="mx-auto mt-4 max-w-[29rem] text-[1rem] font-semibold leading-relaxed text-white/92 sm:text-[1.05rem]"
                />
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="mt-6 inline-flex min-w-[11rem] items-center justify-center rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
                >
                  {resolvedData.game.startButtonText ??
                    DEFAULT_GAME_DATA.game.startButtonText}
                </button>
              </div>
            </div>
          ) : null}

          {!isSurplusMode && isPaused && !isCompleted && !isFailed && !isDetailsOpen ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center px-5 py-6 sm:px-8">
              <div className="absolute inset-0 bg-[rgba(8,26,74,0.22)] backdrop-blur-[2px]" />
              <div className="relative w-full max-w-[31rem] rounded-[1.5rem] border border-white/28 bg-[linear-gradient(180deg,rgba(25,87,201,0.9),rgba(17,62,149,0.92))] px-6 py-7 text-center shadow-[0_24px_48px_rgba(7,22,69,0.28)]">
                <Typography
                  content={{
                    text: "Juego en pausa",
                    variant: "h2",
                    align: "center",
                  }}
                  className="font-black text-white"
                />
                <Typography
                  content={{
                    text: "Reanuda cuando quieras para seguir atrapando ingresos desde el mismo punto.",
                    variant: "body",
                    align: "center",
                  }}
                  className="mx-auto mt-3 max-w-[24rem] text-[0.98rem] font-semibold leading-relaxed text-white/92"
                />
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="mt-6 inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
                >
                  <Play className="h-4.5 w-4.5" strokeWidth={2.8} />
                  <span>Continuar</span>
                </button>
              </div>
            </div>
          ) : null}

          {!isSurplusMode && isFailed && !isCompleted ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center px-5 py-6 sm:px-8">
              <div className="absolute inset-0 bg-[rgba(8,26,74,0.3)] backdrop-blur-[2px]" />
              <div className="relative w-full max-w-[33rem] rounded-[1.5rem] border border-white/28 bg-[linear-gradient(180deg,rgba(25,87,201,0.94),rgba(17,62,149,0.96))] px-6 py-7 text-center shadow-[0_24px_48px_rgba(7,22,69,0.28)]">
                <Typography
                  content={{
                    text: "No cumpliste la meta en el tiempo estimado",
                    variant: "h2",
                    align: "center",
                  }}
                  className="font-black text-white"
                />
                <Typography
                  content={{
                    text: "Se acabaron las 6 semanas disponibles. Vuelve a intentarlo para reorganizar tus decisiones y completar la meta.",
                    variant: "body",
                    align: "center",
                  }}
                  className="mx-auto mt-3 max-w-[25rem] text-[0.98rem] font-semibold leading-relaxed text-white/92"
                />
                <button
                  type="button"
                  onClick={handleRetryFromFailure}
                  className="mt-6 inline-flex min-w-[13rem] items-center justify-center rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
                >
                  Volver a intentarlo
                </button>
              </div>
            </div>
          ) : null}

          {!isSurplusMode && isCompleted ? (
            <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.36),rgba(255,255,255,0.08)_54%,transparent_100%)]" />
              <Typography
                content={{
                  text: "¡Ganaste!",
                  variant: "h1",
                  align: "center",
                }}
                className="relative z-10 text-[clamp(2.7rem,8vw,6rem)] font-black leading-none text-[#ff7a00] [text-shadow:0_4px_0_rgba(255,255,255,0.9),0_12px_22px_rgba(154,67,0,0.22)]"
              />
              <div className="relative z-10 mt-5 w-full max-w-[34rem] rounded-[1.25rem] border border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.12))] px-6 py-4 text-center shadow-[0_16px_28px_rgba(18,45,118,0.18)] backdrop-blur-[2px]">
                <Typography
                  content={{
                    text: `Completaste la meta con ${formatCurrency(collected)}.`,
                    variant: "h2",
                    align: "center",
                  }}
                  className="mx-auto max-w-[28rem] font-black text-white [text-shadow:0_3px_10px_rgba(0,0,0,0.16)]"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {isDetailsOpen ? (
        <div className="absolute inset-0 z-[80] flex items-center justify-center px-4 py-6 sm:px-8">
          <div
            className="absolute inset-0 bg-[rgba(6,18,56,0.42)] backdrop-blur-[3px]"
            onClick={handleCloseDetails}
          />
          <div className="relative w-full max-w-[42rem] overflow-hidden rounded-[1.6rem] border border-white/28 bg-[linear-gradient(180deg,rgba(23,91,207,0.96),rgba(13,55,145,0.98))] shadow-[0_28px_56px_rgba(8,23,68,0.34)]">
            <div className="flex items-center justify-between border-b border-white/12 px-5 py-4 sm:px-6">
              <div>
                <Typography
                  content={{
                    text: isSurplusMode
                      ? "Detalle del excedente"
                      : "Detalle de lo recolectado",
                    variant: "h2",
                    align: "left",
                  }}
                  className="font-black text-white"
                />
                <p className="mt-1 text-sm font-semibold text-white/75">
                  {isSurplusMode
                    ? "Resumen de la decision tomada con el dinero extra."
                    : "Movimientos atrapados por semana y valor."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDetails}
                className="rounded-[0.9rem] border border-white/18 bg-white/10 px-3 py-2 text-sm font-black text-white transition-colors hover:bg-white/16"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">
              {isSurplusMode ? (
                surplusStageState.details?.length ? (
                  <div className="space-y-3">
                    {surplusStageState.details.map((entry) => (
                      <div
                        key={entry.label}
                        className="flex items-center justify-between gap-3 rounded-[1rem] bg-[rgba(255,255,255,0.08)] px-4 py-3"
                      >
                        <div className="text-sm font-black text-white">
                          {entry.label}
                        </div>
                        <div className="text-sm font-semibold text-white/82">
                          {entry.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-white/18 bg-white/6 px-5 py-8 text-center">
                    <p className="text-sm font-semibold text-white/82">
                      Aun no hay una decision registrada.
                    </p>
                  </div>
                )
              ) : Object.keys(historyByWeek).length ? (
                <div className="space-y-4">
                  {Object.entries(historyByWeek)
                    .sort((left, right) => Number(left[0]) - Number(right[0]))
                    .map(([week, entries]) => {
                      const sortedEntries = [...entries].sort(
                        (left, right) => Math.abs(right.amount) - Math.abs(left.amount),
                      );

                      return (
                        <div
                          key={week}
                          className="rounded-[1.2rem] border border-white/14 bg-white/8 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="rounded-full bg-white/12 px-3 py-1 text-sm font-black uppercase tracking-[0.04em] text-white">
                              {resolvedData.game.roundLabelText ?? "Semana"} {week}
                            </span>
                            <span className="text-sm font-semibold text-white/75">
                              {sortedEntries.length} movimientos
                            </span>
                          </div>

                          <div className="space-y-2">
                            {sortedEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between gap-3 rounded-[0.95rem] bg-[rgba(255,255,255,0.08)] px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-black text-white">
                                    {entry.label}
                                  </div>
                                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-white/62">
                                    {entry.kind === "income" ? "Ingreso" : "Gasto"}
                                  </div>
                                </div>
                                <div
                                  className={cn(
                                    "shrink-0 text-sm font-black",
                                    entry.amount >= 0 ? "text-[#9af7b7]" : "text-[#ffb0a2]",
                                  )}
                                >
                                  {entry.amount >= 0 ? "+" : "-"}
                                  {formatCurrency(Math.abs(entry.amount))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-white/18 bg-white/6 px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-white/82">
                    Aun no hay movimientos registrados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
