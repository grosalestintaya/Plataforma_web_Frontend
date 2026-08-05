const DEFAULT_STATE_COPY = Object.freeze({
  safe: {
    label: "Protegido",
    description: "Conservaste tu excedente disponible.",
    tone: "safe",
  },
  balanced: {
    label: "En crecimiento",
    description: "Tu dinero puede crecer, pero requiere tiempo.",
    tone: "balanced",
  },
  good: {
    label: "Decisión equilibrada",
    description: "Protegiste una parte e invertiste otra con criterio.",
    tone: "good",
  },
  risk: {
    label: "En riesgo",
    description: "La oportunidad no era clara.",
    tone: "risk",
  },
});

export const COLLECT_OBJECTS_MISSION = Object.freeze({
  templates: Object.freeze(["collectObjects", "CollectObjects"]),
  runtime: Object.freeze({
    variant: "collectObjects",
    layoutVariant: "secondaryEmphasis",
    stageClassName:
      "mx-auto h-full min-h-0 w-full max-w-[98rem] overflow-hidden rounded-[2rem] border border-white/30 bg-[linear-gradient(180deg,#3e8cff_0%,#235fda_100%)] p-2 text-white shadow-[0_24px_60px_rgba(8,30,88,0.3)] sm:p-3",
    gridClassName: "h-full gap-2 p-0 sm:gap-3",
  }),
});

export function toAmount(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatCollectCurrency(value) {
  return `S/ ${toAmount(value).toFixed(2)}`;
}

export function resolveCollectAsset(src) {
  const value = String(src ?? "").trim();
  if (!value || /^(https?:|data:|blob:|\/)/.test(value)) return value;
  return `/activity/${value.replace(/\\/g, "/").replace(/^(src\/assets\/activity\/|assets\/activity\/|activity\/|assets\/|\.\/)/, "")}`;
}

function normalizeItems(items, kind) {
  return Array.isArray(items)
    ? items.map((item, index) => ({
        ...item,
        id: item.id ?? `${kind}-${index + 1}`,
        kind: item.kind ?? kind,
        amount: Math.max(0, toAmount(item.amount)),
      }))
    : [];
}

export function getCollectObjectsModel({ view, data, heroApi }) {
  const source = data ?? view?.data ?? {};
  const game = source.game ?? {};
  const targetAmount = Math.max(
    1,
    toAmount(game.pointsToComplete, source.target?.amount ?? 1),
  );
  const mode = game.mode === "surplusDecision" ? "surplus" : "falling";
  const sourceViewId = source.sourceViewId;
  const sourceState = sourceViewId
    ? heroApi?.getInteractiveState?.(sourceViewId)
    : null;
  const sourcePayload = sourceState?.payload ?? source.previewPayload ?? {};

  return {
    mode,
    viewId: view?.id ?? view?.viewId,
    title: source.title,
    sidebarTitle: source.sidebarTitle,
    goalLabel: source.goalLabel,
    collectedLabel: source.collectedLabel,
    collectedStatusText: source.collectedStatusText,
    instruction: source.instruction,
    target: {
      ...source.target,
      amount: toAmount(source.target?.amount, targetAmount),
      media: source.target?.media
        ? {
            ...source.target.media,
            src: resolveCollectAsset(source.target.media.src),
          }
        : null,
    },
    targetAmount,
    minimumCompletionAmount: Math.max(
      targetAmount,
      toAmount(game.minimumCompletionAmount, targetAmount),
    ),
    items: [
      ...normalizeItems(game.incomeItems, "income"),
      ...normalizeItems(game.expenseItems, "expense"),
    ],
    rounds: Array.isArray(game.weeklyRounds) ? game.weeklyRounds : [],
    engine: {
      spawnEveryMs: toAmount(game.spawnEveryMs, 650),
      maxActiveItems: toAmount(game.maxActiveItems, 4),
      fallMin: toAmount(game.itemFallMin, 0.8),
      fallMax: toAmount(game.itemFallMax, 1.15),
      introTitle: game.introTitle ?? "Cómo se juega",
      introText: game.introText ?? source.instruction?.text,
      startLabel: game.startButtonText ?? "Comenzar",
      roundLabel: game.roundLabelText ?? "Semana",
    },
    sourcePayload: {
      targetAmount: toAmount(sourcePayload.targetAmount, source.target?.amount),
      collectedAmount: toAmount(sourcePayload.collectedAmount),
      protectedGoalAmount: toAmount(
        sourcePayload.protectedGoalAmount,
        source.target?.amount,
      ),
      surplusAmount: Math.max(0, toAmount(sourcePayload.surplusAmount)),
      captureScore: Math.max(0, toAmount(sourcePayload.captureScore)),
      completionWeek: toAmount(sourcePayload.completionWeek),
      restartCount: toAmount(sourcePayload.restartCount),
    },
    surplus: {
      intro: source.intro ?? {},
      noSurplus: source.noSurplus ?? {},
      opportunitiesSection: source.opportunitiesSection ?? {},
      distributionSection: source.distributionSection ?? {},
      resultSection: source.resultSection ?? {},
      summary: source.summary ?? {},
      states: { ...DEFAULT_STATE_COPY, ...(source.states ?? {}) },
      opportunities: Array.isArray(source.opportunities)
        ? source.opportunities
        : [],
    },
  };
}

export function getCaptureScore(completionWeek, restartCount) {
  const baseByWeek = { 1: 60, 2: 55, 3: 50, 4: 45, 5: 35, 6: 25 };
  return Math.max(0, (baseByWeek[completionWeek] ?? 0) - restartCount * 10);
}

export function getRequiredAmount(opportunity) {
  return Math.max(
    0,
    toAmount(opportunity?.requiredAmount, opportunity?.minAmount),
  );
}

export function evaluateOpportunity(opportunity, surplusAmount) {
  const available = Math.max(0, toAmount(surplusAmount));
  const usedAmount = Math.min(getRequiredAmount(opportunity), available);
  const returnedAmount = Math.round(
    usedAmount * toAmount(opportunity?.returnMultiplier, 1),
  );
  const profitAmount = returnedAmount - usedAmount;
  const finalSurplusAmount = Math.max(
    0,
    available - usedAmount + returnedAmount,
  );
  const outcome =
    opportunity?.type === "save"
      ? "safe"
      : opportunity?.risk === "high"
        ? "risk"
        : opportunity?.id === "juice-stand"
          ? "good"
          : "balanced";
  const copy = opportunity?.outcome?.[outcome] ?? {};

  return {
    outcome,
    usedAmount,
    returnedAmount,
    profitAmount,
    finalSurplusAmount,
    title: copy.title ?? opportunity?.title,
    message: copy.text ?? opportunity?.possibleResult,
    score: Math.max(0, toAmount(opportunity?.score)),
  };
}
