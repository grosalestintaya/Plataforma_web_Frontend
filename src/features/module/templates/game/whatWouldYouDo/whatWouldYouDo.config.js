export const WHAT_WOULD_YOU_DO_MISSION = Object.freeze({
  templates: Object.freeze(["whatWouldYouDo", "WhatWouldYouDo"]),
  runtime: Object.freeze({
    variant: "whatWouldYouDo",
    layoutVariant: "secondaryEmphasis",
    stageClassName:
      "mx-auto h-full min-h-0 w-full max-w-[96rem] px-4 py-4 text-white",
    gridClassName: "h-full gap-4 p-0 md:gap-4",
    asideClassName:
      "h-full border-white/18 bg-[radial-gradient(circle_at_top_left,rgba(120,92,255,0.22),transparent_30%),linear-gradient(180deg,rgba(19,14,49,0.96),rgba(34,21,82,0.90))]",
  }),
});

const EMPTY_COPY = Object.freeze({ step1: {}, step2: {}, step3: {}, step4: {} });

export function formatLoanCurrency(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value ?? 0), 0);
}

export function getWhatWouldYouDoModel({ view, data }) {
  const source = data?.game ?? view?.data?.game ?? data ?? {};
  return {
    viewId: view?.id ?? view?.viewId,
    title: data?.title ?? view?.data?.title,
    ownMoney: Number(source.ownMoney ?? 0),
    ventureMedia: source.ventureMedia,
    stepTitles: source.stepTitles ?? [],
    products: source.products ?? [],
    materials: source.materials ?? [],
    loanOffers: source.loanOffers ?? [],
    paymentStrategies: source.paymentStrategies ?? [],
    weeks: source.weeks ?? [],
    copy: { ...EMPTY_COPY, ...(source.copy ?? {}) },
  };
}

export function createLoanInitialState(model, persisted) {
  const saved = persisted?.payload?.gameState;
  if (saved && Number(saved.step) >= 1 && Number(saved.step) <= 4) {
    const initial = createLoanInitialState(model);
    return {
      ...initial,
      ...saved,
      debtRemaining: Number(saved.debtRemaining ?? saved.pendingAmount ?? 0),
      scores: { ...initial.scores, ...(saved.scores ?? {}) },
      completed: Boolean(persisted.completed),
    };
  }

  return {
    step: 1,
    selectedMaterials: [],
    materialsValidated: false,
    selectedOfferId: null,
    activeOfferId: null,
    selectedStrategyId: "regulated",
    paymentPlanConfirmed: false,
    currentWeek: 1,
    weeklyPayments: Array(model.weeks.length).fill(0),
    weeklyStates: Array(model.weeks.length).fill(null),
    debtRemaining: 0,
    reserve: 0,
    totalPaid: 0,
    draftPayment: "",
    message: null,
    scores: { materials: 0, loan: 0, payments: 0 },
    completed: false,
  };
}

export function loanReducer(state, action) {
  switch (action.type) {
    case "toggleMaterial":
      if (state.materialsValidated) return state;
      return {
        ...state,
        selectedMaterials: state.selectedMaterials.includes(action.id)
          ? state.selectedMaterials.filter((id) => id !== action.id)
          : [...state.selectedMaterials, action.id],
        message: null,
      };
    case "validateMaterials":
      return {
        ...state,
        materialsValidated: action.valid,
        message: action.message,
        scores: { ...state.scores, materials: action.valid ? 20 : 0 },
      };
    case "goToStep":
      return { ...state, step: action.step, message: null };
    case "openOffer":
      return { ...state, activeOfferId: action.id, message: null };
    case "chooseOffer":
      return {
        ...state,
        step: 3,
        activeOfferId: action.offer.id,
        selectedOfferId: action.offer.id,
        selectedStrategyId: "regulated",
        paymentPlanConfirmed: false,
        currentWeek: 1,
        weeklyPayments: state.weeklyPayments.map(() => 0),
        weeklyStates: state.weeklyStates.map(() => null),
        debtRemaining: Number(action.offer.totalToRepay),
        reserve: Math.max(0, Number(action.offer.amount) - action.fundingNeeded),
        totalPaid: 0,
        draftPayment: "",
        message: null,
        scores: {
          ...state.scores,
          loan: Number(action.offer.loanScore ?? (action.offer.recommended ? 30 : 20)),
        },
      };
    case "selectStrategy":
      return { ...state, selectedStrategyId: action.id, message: null };
    case "confirmStrategy":
      return { ...state, paymentPlanConfirmed: true, message: null };
    case "setDraft":
      return { ...state, draftPayment: action.value, message: null };
    case "paymentError":
      return { ...state, message: action.message };
    case "payWeek": {
      const weeklyPayments = [...state.weeklyPayments];
      const weeklyStates = [...state.weeklyStates];
      weeklyPayments[action.index] = action.amount;
      weeklyStates[action.index] = {
        payment: action.amount,
        remaining: action.remaining,
      };
      return {
        ...state,
        weeklyPayments,
        weeklyStates,
        debtRemaining: action.remaining,
        totalPaid: state.totalPaid + action.amount,
        draftPayment: "",
        message: action.message,
        scores: {
          ...state.scores,
          payments: state.scores.payments + action.score,
        },
      };
    }
    case "advanceWeek":
      return action.finished
        ? { ...state, step: 4, completed: true, message: null }
        : {
            ...state,
            currentWeek: state.currentWeek + 1,
            draftPayment: "",
            message: null,
          };
    default:
      return state;
  }
}

export function selectLoanGame(model, state) {
  const selectedMaterials = model.materials.filter((item) =>
    state.selectedMaterials.includes(item.id),
  );
  const materialsTotal = sum(selectedMaterials.map((item) => item.price));
  const fundingNeeded = Math.max(0, materialsTotal - model.ownMoney);
  const materialsCorrect =
    model.materials
      .filter((item) => item.required)
      .every((item) => state.selectedMaterials.includes(item.id)) &&
    selectedMaterials.every((item) => item.required);
  const activeOffer = model.loanOffers.find(
    (item) => item.id === (state.activeOfferId ?? state.selectedOfferId),
  );
  const selectedOffer = model.loanOffers.find(
    (item) => item.id === state.selectedOfferId,
  );
  const selectedStrategy =
    model.paymentStrategies.find((item) => item.id === state.selectedStrategyId) ??
    model.paymentStrategies[0];
  const currentWeekIndex = Math.max(
    0,
    Math.min(state.currentWeek - 1, model.weeks.length - 1),
  );
  const currentWeek = model.weeks[currentWeekIndex] ?? { sales: [], income: 0 };
  const earned = sum(
    model.weeks.slice(0, currentWeekIndex + 1).map((week) => week.income),
  );
  const availableThisWeek = Math.max(0, state.reserve + earned - state.totalPaid);
  const remainingWeeks = Math.max(1, model.weeks.length - currentWeekIndex);
  const regulatedPayment = Math.min(
    state.debtRemaining,
    Math.ceil((state.debtRemaining / remainingWeeks) * 100) / 100,
  );
  const suggestedPayment =
    state.selectedStrategyId === "early"
      ? Math.min(state.debtRemaining, availableThisWeek)
      : state.selectedStrategyId === "deferred"
        ? currentWeekIndex === model.weeks.length - 1
          ? Math.min(state.debtRemaining, availableThisWeek)
          : 0
        : regulatedPayment;
  const totalScore = Math.min(
    100,
    state.scores.materials + state.scores.loan + state.scores.payments,
  );
  const totalIncome = sum(model.weeks.map((week) => week.income));

  return {
    selectedMaterials,
    materialsTotal,
    fundingNeeded,
    materialsCorrect,
    activeOffer,
    selectedOffer,
    selectedStrategy,
    currentWeekIndex,
    currentWeek,
    availableThisWeek,
    suggestedPayment,
    totalScore,
    finalAvailableMoney: Math.max(
      0,
      state.reserve + totalIncome - state.totalPaid,
    ),
    netProfit: totalIncome - materialsTotal - Math.max(0, state.totalPaid - Number(selectedOffer?.amount ?? 0)),
  };
}
