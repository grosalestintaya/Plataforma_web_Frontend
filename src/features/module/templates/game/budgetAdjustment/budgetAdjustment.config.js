const DEFAULT_FEEDBACK = {
  idle: {
    title: "Construye el presupuesto",
    text: "Selecciona las tarjetas necesarias y revisa la balanza.",
  },
  overBudget: {
    title: "Te pasaste del presupuesto",
    text: "Quita o cambia una tarjeta para recuperar saldo.",
  },
  missingEssential: {
    title: "Aun faltan gastos clave",
    text: "Falta una tarjeta necesaria o una alternativa obligatoria.",
  },
  good: {
    title: "Buen trabajo, tu presupuesto va bien",
    text: "Cubriste lo necesario y queda saldo.",
  },
  balanced: {
    title: "Vas equilibrando el presupuesto",
    text: "El presupuesto funciona, pero queda poco saldo.",
  },
};

export const BUDGET_STATE_COPY = Object.freeze({
  idle: { label: "Explorando", tone: "idle", score: 0 },
  process: { label: "En proceso", tone: "process", score: 20 },
  balanced: { label: "Equilibrado", tone: "balanced", score: 60 },
  good: { label: "Bueno", tone: "good", score: 100 },
  risk: { label: "Riesgo", tone: "risk", score: 40 },
});

const PASSING_SCORE = 60;

export function clampBudgetValue(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function formatBudgetCurrency(value) {
  return `S/${Math.round(Number(value ?? 0))}`;
}

export function resolveBudgetItemImage(item) {
  const media = item?.image ?? item?.media;
  const rawSrc = typeof media === "string" ? media : media?.src;
  const src = String(rawSrc ?? "").trim();

  if (!src) return null;
  if (/^(https?:|data:|blob:|\/)/.test(src)) {
    return { src, alt: media?.alt ?? item.label };
  }

  const normalizedSrc = src
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^(src\/)?assets\/activity\//, "")
    .replace(/^activity\//, "")
    .replace(/^assets\//, "");

  return { src: `/activity/${normalizedSrc}`, alt: media?.alt ?? item.label };
}

export function isBudgetPassingScore(score) {
  return Number(score ?? 0) >= PASSING_SCORE;
}

export function getAverageBudgetScore(results = []) {
  if (!results.length) return 0;

  const total = results.reduce(
    (sum, result) =>
      sum +
      Number(result.score ?? BUDGET_STATE_COPY[result.status]?.score ?? 0),
    0,
  );

  return clampBudgetValue(Math.round(total / results.length), 0, 100);
}

export function getBudgetViewId(view) {
  return view?.id ?? view?.viewId ?? null;
}

export function getBudgetAdjustmentModel(data = {}) {
  const budget = data.budget ?? {};

  return {
    ...data,
    eyebrow: data.eyebrow ?? { text: "Proyecto emprendedor" },
    subtitle: data.subtitle ?? {
      text: "Elabora el presupuesto de tu proyecto escolar",
    },
    coach: {
      ...data.coach,
      feedback: { ...DEFAULT_FEEDBACK, ...data.coach?.feedback },
    },
    budget: {
      ...budget,
      income: Number(budget.income ?? 0),
      targetBalanceMin: Number(budget.targetBalanceMin ?? 0),
      essentialIds: budget.essentialIds ?? [],
      requiredGroups: budget.requiredGroups ?? [],
      exclusiveGroups: budget.exclusiveGroups ?? [],
      items: budget.items ?? [],
      situations: Array.isArray(budget.situations) ? budget.situations : [],
    },
  };
}

export function getBudgetSituations(model) {
  return model.budget.situations.length
    ? model.budget.situations
    : [model.budget];
}

function normalizeCopy(copy, fallback) {
  const source = copy ?? fallback;
  const title =
    typeof source?.title === "string" ? source.title : source?.title?.text;
  const text =
    typeof source?.text === "string"
      ? source.text
      : (source?.text?.paragraphs?.join(" ") ?? source?.text?.text);

  return {
    title: title ?? fallback.title,
    text: text ?? fallback.text,
  };
}

function getGroupIssues(groups, selectedIdSet, type) {
  return groups.flatMap((group) => {
    const count = (group.ids ?? []).filter((id) =>
      selectedIdSet.has(id),
    ).length;
    const min = Number(group.min ?? (type === "required" ? 1 : 0));
    const max = Number(group.max ?? 1);
    const issues = [];

    if (count < min) issues.push({ type: "missingGroup", groupId: group.id });
    if (count > max)
      issues.push({ type: "incompatibleGroup", groupId: group.id });
    return issues;
  });
}

export function evaluateBudget(situation = {}, selectedIds = [], fallbackCopy) {
  const selectedIdSet = new Set(selectedIds);
  const selectedItems = [];
  const availableItems = [];
  let total = 0;

  for (const item of situation.items ?? []) {
    if (selectedIdSet.has(item.id)) {
      selectedItems.push(item);
      total += Number(item.amount ?? 0);
    } else {
      availableItems.push(item);
    }
  }

  const income = Number(situation.income ?? 0);
  const balance = income - total;
  const missingEssentialIds = (situation.essentialIds ?? []).filter(
    (id) => !selectedIdSet.has(id),
  );
  const groupIssues = [
    ...getGroupIssues(
      situation.requiredGroups ?? [],
      selectedIdSet,
      "required",
    ),
    ...getGroupIssues(
      situation.exclusiveGroups ?? [],
      selectedIdSet,
      "exclusive",
    ),
  ];
  const hasMissingRequirements =
    missingEssentialIds.length > 0 ||
    groupIssues.some((issue) => issue.type === "missingGroup");
  const hasIncompatibilities = groupIssues.some(
    (issue) => issue.type === "incompatibleGroup",
  );

  let statusKey = "balanced";
  if (!selectedIds.length) statusKey = "idle";
  else if (total > income || hasIncompatibilities) statusKey = "risk";
  else if (hasMissingRequirements) statusKey = "process";
  else if (balance >= Number(situation.targetBalanceMin ?? 0))
    statusKey = "good";

  const status = { key: statusKey, ...BUDGET_STATE_COPY[statusKey] };
  const feedbackKey =
    statusKey === "idle"
      ? "idle"
      : statusKey === "risk" && balance < 0
        ? "overBudget"
        : statusKey === "process" || hasMissingRequirements
          ? "missingEssential"
          : statusKey === "good"
            ? "good"
            : "balanced";
  const feedbackSource = {
    ...DEFAULT_FEEDBACK,
    ...fallbackCopy,
    ...situation.coach?.feedback,
  };

  return {
    income,
    total,
    balance,
    selectedItems,
    availableItems,
    missingEssentialIds,
    groupIssues,
    issueCount: missingEssentialIds.length + groupIssues.length,
    status,
    feedback: normalizeCopy(
      feedbackSource[feedbackKey],
      DEFAULT_FEEDBACK[feedbackKey],
    ),
  };
}

export function getBudgetAction({
  state,
  evaluation,
  signature,
  isLastSituation,
}) {
  const reviewMatches = state.reviewed?.signature === signature;

  if (
    state.isFinalized &&
    reviewMatches &&
    isBudgetPassingScore(evaluation.status.score)
  ) {
    return {
      label: "Mision finalizada",
      tone: "done",
      action: "done",
      disabled: true,
    };
  }

  if (
    reviewMatches &&
    isBudgetPassingScore(BUDGET_STATE_COPY[state.reviewed.outcome]?.score)
  ) {
    return {
      label: isLastSituation ? "Finalizar mision" : "Siguiente situacion",
      tone: isLastSituation ? "success" : "review",
      action: isLastSituation ? "finalize" : "nextSituation",
      disabled: false,
    };
  }

  if (reviewMatches && ["risk", "process"].includes(state.reviewed.outcome)) {
    return {
      label: "Realizar ajustes",
      tone: "warning",
      action: "adjust",
      disabled: false,
    };
  }

  return {
    label: "Revisar presupuesto",
    tone: "review",
    action: "review",
    disabled: false,
  };
}

function upsertResult(results, result) {
  return [
    ...results.filter((item) => item.situationId !== result.situationId),
    result,
  ];
}

export function createBudgetInitialState({ heroApi, viewId, situations }) {
  const stored = heroApi?.getInteractiveState?.(viewId);
  const workflow = stored?.payload?.workflow ?? {};
  const situationIndex = clampBudgetValue(
    Number(workflow.situationIndex ?? 0),
    0,
    Math.max(situations.length - 1, 0),
  );
  const validIds = new Set(
    (situations[situationIndex]?.items ?? []).map((item) => item.id),
  );

  return {
    situationIndex,
    selectedIds: Array.isArray(stored?.selectedProductIds)
      ? stored.selectedProductIds.filter((id) => validIds.has(id))
      : [],
    reviewed:
      workflow.reviewedSignature != null
        ? {
            signature: workflow.reviewedSignature,
            outcome: workflow.reviewedOutcome,
          }
        : null,
    isFinalized: Boolean(workflow.isFinalized),
    results: Array.isArray(workflow.situationResults)
      ? workflow.situationResults
      : [],
  };
}

export function createBudgetSnapshot({
  state,
  evaluation,
  situation,
  signature,
  missionScore,
}) {
  return {
    type: "budgetAdjustment",
    completed:
      state.isFinalized &&
      isBudgetPassingScore(missionScore) &&
      state.reviewed?.signature === signature,
    score: missionScore,
    balance: evaluation.balance,
    total: evaluation.total,
    selectedProductIds: state.selectedIds,
    payload: {
      status: evaluation.status.key,
      situationId: situation.id,
      selectedItems: evaluation.selectedItems,
      income: evaluation.income,
      targetBalanceMin: Number(situation.targetBalanceMin ?? 0),
      workflow: {
        situationIndex: state.situationIndex,
        situationResults: state.results,
        reviewedSignature: state.reviewed?.signature ?? null,
        reviewedOutcome: state.reviewed?.outcome ?? null,
        isFinalized: state.isFinalized,
      },
    },
  };
}

export function budgetAdjustmentReducer(state, event) {
  switch (event.type) {
    case "toggleItem": {
      const selectedIds = state.selectedIds.includes(event.itemId)
        ? state.selectedIds.filter((id) => id !== event.itemId)
        : [...state.selectedIds, event.itemId];
      return { ...state, selectedIds, reviewed: null, isFinalized: false };
    }
    case "review":
      return {
        ...state,
        reviewed: { signature: event.signature, outcome: event.outcome },
        isFinalized: false,
      };
    case "adjust":
      return { ...state, reviewed: null, isFinalized: false };
    case "nextSituation":
      return {
        ...state,
        situationIndex: Math.min(state.situationIndex + 1, event.maxIndex),
        selectedIds: [],
        reviewed: null,
        isFinalized: false,
        results: upsertResult(state.results, event.result),
      };
    case "finalize":
      return {
        ...state,
        reviewed: { signature: event.signature, outcome: event.outcome },
        isFinalized: true,
        results: upsertResult(state.results, event.result),
      };
    default:
      return state;
  }
}
