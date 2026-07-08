import { useEffect, useMemo, useState } from "react";

const DEFAULT_CONTENT = {
  title: {
    text: "",
    variant: "h1",
    align: "left",
  },
  stepTitles: ["Paso 1", "Paso 2", "Paso 3", "Paso 4"],
  ownMoney: 0,
  products: [],
  materials: [],
  loanOffers: [],
  weeks: [],
  paymentStrategies: [],
  copy: {
    step1: {
      asideTitle: "",
      ownMoneyLabel: "",
      mainTitle: "",
      mainSubtitle: "",
      shoppingTitle: "",
      emptySelectionLabel: "",
      summaryLabels: {
        initial: "Inicial",
        total: "Total",
        balance: "Balance",
      },
      reviewButton: "Continuar",
      nextButton: "Continuar",
    },
    step2: {
      mainTitle: "",
      mainSubtitle: "",
      neededMoneyLabel: "Dinero que necesito",
      chooseButton: "Elegir",
    },
    step3: {
      sidebarHeroTitle: "",
      asidePlanTitle: "",
      asideExecutionTitle: "",
      planTitle: "",
      planSubtitle: "",
      strategyDetailsTitle: "",
      strategyContinueButton: "Continuar",
      reserveLabel: "Reserva",
      reserveHint: "",
      executionTitle: "",
      executionSubtitle: "",
      weekSalesTitle: "",
      weekSalesHint: "",
      paymentActionTitle: "",
      waitWeekButton: "Continuar",
      payAllButton: "Pagar",
      paymentInputTitle: "",
      paymentInputHint: "",
      confirmPaymentButton: "Confirmar",
      continueButton: "Continuar",
      reviewResultButton: "Revisar",
    },
    step4: {
      mainTitle: "",
      mainSubtitle: "",
      generalInfoTitle: "",
      ventureCardTitle: "",
      productionTitle: "",
      ventureSalesTitle: "",
      journeyTitle: "",
      closingTitle: "",
      finishButton: "Finalizar",
    },
    messages: {
      materialsSuccess: { tone: "success", title: "", text: "" },
      materialsMissing: { tone: "warning", title: "", text: "" },
      materialsDistractor: { tone: "warning", title: "", text: "" },
      materialsGeneric: { tone: "warning", title: "", text: "" },
      offerViable: { tone: "success", title: "", text: "" },
      offerInvalidTitle: "",
      offerInvalidFallback: "",
      planAdjustTitle: "",
      planReady: { tone: "success", title: "", text: "" },
      paymentInvalid: { tone: "warning", title: "", text: "" },
      finalRiskTitle: "",
      finalRiskText: "",
      finalDebtTitle: "",
      finalDebtText: "",
      finalTopTitle: "",
      finalTopText: "",
      finalMidTitle: "",
      finalMidText: "",
      finalLowTitle: "",
      finalLowText: "",
    },
  },
};

function mergeContent(defaults, incoming = {}) {
  return {
    ...defaults,
    ...incoming,
    title: incoming.title ?? defaults.title,
    stepTitles: incoming.stepTitles ?? defaults.stepTitles,
    ownMoney: incoming.ownMoney ?? defaults.ownMoney,
    products: incoming.products ?? defaults.products,
    materials: incoming.materials ?? defaults.materials,
    loanOffers: incoming.loanOffers ?? defaults.loanOffers,
    paymentStrategies: incoming.paymentStrategies ?? defaults.paymentStrategies,
    weeks: incoming.weeks ?? defaults.weeks,
    copy: {
      ...defaults.copy,
      ...(incoming.copy ?? {}),
      step1: {
        ...defaults.copy.step1,
        ...(incoming.copy?.step1 ?? {}),
        summaryLabels: {
          ...defaults.copy.step1.summaryLabels,
          ...(incoming.copy?.step1?.summaryLabels ?? {}),
        },
      },
      step2: {
        ...defaults.copy.step2,
        ...(incoming.copy?.step2 ?? {}),
      },
      step3: {
        ...defaults.copy.step3,
        ...(incoming.copy?.step3 ?? {}),
      },
      step4: {
        ...defaults.copy.step4,
        ...(incoming.copy?.step4 ?? {}),
      },
      messages: {
        ...defaults.copy.messages,
        ...(incoming.copy?.messages ?? {}),
      },
    },
  };
}

function getViewId(view) {
  return view?.id ?? view?.viewId ?? null;
}

export function formatCurrency(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function sum(values) {
  return values.reduce((acc, value) => acc + Number(value ?? 0), 0);
}

function buildExpectedPaymentPlan(totalToRepay, termWeeks) {
  const safeWeeks = Math.max(1, Number(termWeeks) || 1);
  const safeTotal = Math.max(0, Number(totalToRepay) || 0);
  const basePayment = Math.floor(safeTotal / safeWeeks);
  let remainder = safeTotal % safeWeeks;

  return Array.from({ length: safeWeeks }, () => {
    if (remainder > 0) {
      remainder -= 1;
      return basePayment + 1;
    }
    return basePayment;
  });
}

function buildExpectedAccumulated(payments) {
  const accumulated = [];
  let runningTotal = 0;

  payments.forEach((payment) => {
    runningTotal += Number(payment ?? 0);
    accumulated.push(runningTotal);
  });

  return accumulated;
}

function isBalancedPaymentPlan(payments, totalToRepay) {
  const normalized = payments.map((value) => Number(value ?? 0));
  const matchesTotal = sum(normalized) === Number(totalToRepay ?? 0);
  const positiveWeeks = normalized.every((value) => value > 0);
  const spread = Math.max(...normalized) - Math.min(...normalized);

  return matchesTotal && positiveWeeks && spread <= 1;
}

function getAttemptMultiplier(attempts) {
  if (attempts <= 0) return 1;
  if (attempts === 1) return 0.8;
  return 0.6;
}

function getInitialGameState(content) {
  const fallbackTotal =
    content.loanOffers.find((offer) => isOfferPassable(offer))?.totalToRepay ??
    0;

  return {
    step: 1,
    score: 0,
    selectedMaterials: [],
    materialAttempts: 0,
    materialsValidated: false,
    materialsTotal: 0,
    ownMoney: content.ownMoney,
    fundingNeeded: 0,
    openedOfferIds: [],
    selectedOfferId: null,
    selectedOfferJustification: null,
    selectedPaymentStrategyId: null,
    loanAttempts: 0,
    loanValidated: false,
    recognizedInformalRisk: false,
    paymentPlan: [0, 0, 0, 0],
    paymentPlanConfirmed: false,
    paymentPlanAttempts: 0,
    currentWeek: 1,
    weeklyPayments: [0, 0, 0, 0],
    weeklyStates: [],
    pendingAmount: fallbackTotal,
    reserveRemaining: 0,
    totalPaid: 0,
    paymentAttempts: [0, 0, 0, 0],
    paymentsCompleted: false,
    scoreBreakdown: {
      materials: 0,
      loan: 0,
      payments: 0,
    },
  };
}

function mergePersistedState(payload, content) {
  return {
    ...getInitialGameState(content),
    ...(payload ?? {}),
    scoreBreakdown: {
      ...getInitialGameState(content).scoreBreakdown,
      ...(payload?.scoreBreakdown ?? {}),
    },
  };
}

function getMaterialsTotal(materials, selectedIds) {
  return materials
    .filter((item) => selectedIds.includes(item.id))
    .reduce((acc, item) => acc + Number(item.price ?? 0), 0);
}

function getFundingNeeded(materialsTotal, ownMoney) {
  return Math.max(0, materialsTotal - ownMoney);
}

function getSelectedOffer(loanOffers, offerId) {
  return loanOffers.find((offer) => offer.id === offerId) ?? null;
}

function isOfferPassable(offer) {
  return Boolean(offer?.passable ?? offer?.viable);
}

function isOfferRecommended(offer) {
  return Boolean(offer?.recommended);
}

function getEarlyPayoffWeek(weeks, initialReserve, totalToRepay) {
  let accumulated = Number(initialReserve ?? 0);
  const target = Number(totalToRepay ?? 0);

  for (let index = 0; index < weeks.length; index += 1) {
    accumulated += Number(weeks[index]?.income ?? 0);
    if (accumulated >= target) {
      return index + 1;
    }
  }

  return weeks.length;
}

function buildStrategyPlan({
  strategyId,
  totalToRepay,
  weeks,
  initialReserve,
}) {
  if (strategyId === "deferred") {
    return weeks.map((_, index) =>
      index === weeks.length - 1 ? Number(totalToRepay) : 0,
    );
  }

  if (strategyId === "early") {
    const payoffWeek = getEarlyPayoffWeek(weeks, initialReserve, totalToRepay);
    return weeks.map((_, index) =>
      index === payoffWeek - 1 ? Number(totalToRepay) : 0,
    );
  }

  return buildExpectedPaymentPlan(totalToRepay, weeks.length);
}

function getWeekStatus({ weekIndex, payment, arrears, remaining, weeks }) {
  if (remaining <= 0) return "Prestamo completado";
  if (weekIndex === 0 && payment > 0) return "Puntual";
  if (weekIndex === 1) return arrears > 0 ? "Pago incompleto" : "Puntual";
  if (weekIndex === 2) return arrears === 0 ? "Al dia" : "Con atraso";
  return arrears === 0 ? "Puntual" : "Con atraso";
}

function buildMaterialsFeedback({
  missingRequiredCount,
  selectedDistractors,
  isCorrect,
  messages,
}) {
  if (isCorrect) return messages.materialsSuccess;
  if (missingRequiredCount > 0) return messages.materialsMissing;
  if (selectedDistractors.length > 0) return messages.materialsDistractor;
  return messages.materialsGeneric;
}

function getMaterialsRawScore({
  selectedIds,
  materials,
  requiredIds,
  materialsTotal,
  fundingNeeded,
  expectedMaterialsTotal,
  expectedFundingNeeded,
}) {
  const selectedRequiredCount = requiredIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const selectedDistractors = materials.filter(
    (item) => !item.required && selectedIds.includes(item.id),
  );

  let rawScore = 0;

  if (selectedRequiredCount === requiredIds.length) rawScore += 14;
  if (selectedDistractors.length === 0) rawScore += 6;
  if (
    materialsTotal === Number(expectedMaterialsTotal ?? 0) &&
    fundingNeeded === Number(expectedFundingNeeded ?? 0)
  ) {
    rawScore += 5;
  }

  return rawScore;
}

function getLoanRawScore(state, loanOffers) {
  const selectedOffer = getSelectedOffer(loanOffers, state.selectedOfferId);
  const offerScore = Number(selectedOffer?.loanScore ?? 0);

  if (!isOfferPassable(selectedOffer)) return 0;
  return offerScore;
}

function getWeekScore(week, paidAmount, expectedAmount) {
  const fullScore = Number(week.fullScore ?? 10);

  if (Number(paidAmount) === Number(expectedAmount)) return fullScore;
  if (Number(paidAmount) > 0) return Math.round(fullScore * 0.45);
  return 0;
}

function getFinalStateLabel({
  totalScore,
  debtPending,
  loanValidated,
  selectedOfferId,
  passableOfferIds,
  recommendedOfferId,
}) {
  if (!passableOfferIds.includes(selectedOfferId) || !loanValidated) {
    return "No aprobado: decisión riesgosa";
  }

  if (debtPending > 0) {
    return "No aprobado: debe reforzar pagos";
  }

  if (selectedOfferId === recommendedOfferId && totalScore >= 90) {
    return "Dominio logrado";
  }
  if (totalScore >= 60) return "Aprobado";
  return "En proceso";
}

function getFinalMessage({
  totalScore,
  debtPending,
  loanValidated,
  selectedOfferId,
  passableOfferIds,
  recommendedOfferId,
  messages,
}) {
  if (!passableOfferIds.includes(selectedOfferId) || !loanValidated) {
    return {
      tone: "warning",
      title: messages.finalRiskTitle,
      text: messages.finalRiskText,
    };
  }

  if (debtPending > 0) {
    return {
      tone: "warning",
      title: messages.finalDebtTitle,
      text: messages.finalDebtText,
    };
  }

  if (selectedOfferId === recommendedOfferId && totalScore >= 90) {
    return {
      tone: "success",
      title: messages.finalTopTitle,
      text: messages.finalTopText,
    };
  }

  if (totalScore >= 60) {
    return {
      tone: "success",
      title: messages.finalMidTitle,
      text: messages.finalMidText,
    };
  }

  return {
    tone: "warning",
    title: messages.finalLowTitle,
    text: messages.finalLowText,
  };
}

function getOfferGuidance(offer) {
  if (!offer) {
    return {
      title: "Aquí verás el análisis",
      description:
        "Selecciona una oferta y revisa su monto, interés, plazo y claridad.",
    };
  }

  if (!isOfferPassable(offer)) {
    return {
      title: "No permite avanzar",
      description: offer.detailMessage ?? "Esta oferta no te deja continuar.",
    };
  }

  return {
    title: "Revisa la oferta seleccionada",
    description:
      "Comprueba si el monto te alcanza y si el pago final se puede organizar.",
  };
}

function getWeekPaymentSummary({
  week,
  paidAmount,
  paymentTarget,
  remaining,
  isLastWeek,
  hadDebtBeforePayment,
}) {
  const title = `Semana ${week} registrada`;

  if (!hadDebtBeforePayment && remaining <= 0) {
    return {
      tone: "success",
      title,
      text: "Ya no tienes deuda.",
    };
  }

  if (isLastWeek) {
    return {
      tone: remaining <= 0 ? "success" : "warning",
      title,
      text:
        remaining <= 0
          ? "Pagaste la deuda."
          : "No llegaste a pagar la deuda en el plazo.",
    };
  }

  if (remaining <= 0) {
    return {
      tone: "success",
      title,
      text: "Pagaste toda la deuda antes del plazo.",
    };
  }

  if (paidAmount <= 0) {
    return {
      tone: "warning",
      title,
      text: "No pagaste nada esta semana.",
    };
  }

  if (paidAmount > paymentTarget) {
    return {
      tone: "success",
      title,
      text: "Pagaste más de la cuota por semana.",
    };
  }

  if (paidAmount === paymentTarget) {
    return {
      tone: "success",
      title,
      text: "Pagaste la cuota aproximada.",
    };
  }

  return {
    tone: "warning",
    title,
    text: "Pagaste menos de la cuota aproximada.",
  };
}

function getPaymentQualityLabel({
  strategyId,
  debtPending,
  weeklyPayments,
  loanTotalToRepay,
  weeksLength,
}) {
  const normalizedPayments = weeklyPayments.map((value) => Number(value ?? 0));
  const balancedWeeklyPlan = isBalancedPaymentPlan(
    normalizedPayments,
    loanTotalToRepay,
  );
  let accumulated = 0;
  const payoffWeekIndex = normalizedPayments.findIndex((value) => {
    accumulated += Number(value ?? 0);
    return accumulated >= Number(loanTotalToRepay ?? 0);
  });
  const finishedBeforeLastWeek =
    payoffWeekIndex >= 0 &&
    payoffWeekIndex < Math.max(0, Number(weeksLength ?? 0) - 1);

  if (debtPending > 0) return "Malo";
  if (finishedBeforeLastWeek) {
    return "Bueno";
  }
  if (strategyId === "regulated" && balancedWeeklyPlan) {
    return "Equilibrado";
  }
  return "Malo";
}

export function useWhatWouldYouDoLogic({ view, heroApi, data }) {
  const content = useMemo(
    () => mergeContent(DEFAULT_CONTENT, data?.game ?? {}),
    [data],
  );
  const viewId = getViewId(view);
  const persistedState =
    heroApi?.getInteractiveState?.(viewId)?.payload?.gameState;
  const [gameState, setGameState] = useState(() =>
    persistedState
      ? mergePersistedState(persistedState, content)
      : getInitialGameState(content),
  );
  const [materialsMessage, setMaterialsMessage] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [offerFeedback, setOfferFeedback] = useState(null);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [pendingMissionAdvance, setPendingMissionAdvance] = useState(false);
  const [completionPersisted, setCompletionPersisted] = useState(false);
  const [draftPayment, setDraftPayment] = useState("");
  const [activeOfferId, setActiveOfferId] = useState(
    () => persistedState?.selectedOfferId ?? null,
  );

  const requiredMaterialIds = useMemo(
    () =>
      content.materials.filter((item) => item.required).map((item) => item.id),
    [content.materials],
  );

  const materialsTotal = useMemo(
    () => getMaterialsTotal(content.materials, gameState.selectedMaterials),
    [content.materials, gameState.selectedMaterials],
  );
  const fundingNeeded = useMemo(
    () => getFundingNeeded(materialsTotal, content.ownMoney),
    [content.ownMoney, materialsTotal],
  );
  const expectedMaterialsTotal = useMemo(
    () =>
      content.materials
        .filter((item) => item.required)
        .reduce((acc, item) => acc + Number(item.price ?? 0), 0),
    [content.materials],
  );
  const expectedFundingNeeded = useMemo(
    () => getFundingNeeded(expectedMaterialsTotal, content.ownMoney),
    [content.ownMoney, expectedMaterialsTotal],
  );
  const passableOffers = useMemo(
    () => content.loanOffers.filter((offer) => isOfferPassable(offer)),
    [content.loanOffers],
  );
  const passableOfferIds = useMemo(
    () => passableOffers.map((offer) => offer.id),
    [passableOffers],
  );
  const recommendedOfferId = useMemo(
    () =>
      content.loanOffers.find((offer) => isOfferRecommended(offer))?.id ??
      passableOffers[0]?.id ??
      null,
    [content.loanOffers, passableOffers],
  );
  const selectedRequiredCount = requiredMaterialIds.filter((id) =>
    gameState.selectedMaterials.includes(id),
  ).length;
  const selectedDistractors = content.materials.filter(
    (item) => !item.required && gameState.selectedMaterials.includes(item.id),
  );
  const isMaterialsCorrect =
    selectedRequiredCount === requiredMaterialIds.length &&
    selectedDistractors.length === 0 &&
    materialsTotal === expectedMaterialsTotal &&
    fundingNeeded === expectedFundingNeeded;

  const materialShopItems = useMemo(
    () =>
      content.materials.map((material) => ({
        id: material.id,
        label: material.label,
        title: null,
        text: {
          text: formatCurrency(material.price),
          variant: "label",
          align: "center",
        },
        media: material.media,
        interaction: { type: "selectable" },
        hoverLabel: material.label,
        price: material.price,
      })),
    [content.materials],
  );
  const selectedMaterialItems = useMemo(
    () =>
      materialShopItems.filter((item) =>
        gameState.selectedMaterials.includes(item.id),
      ),
    [gameState.selectedMaterials, materialShopItems],
  );
  const materialsCalculatorData = useMemo(
    () => ({
      title: {
        text: content.copy.step1.shoppingTitle,
        variant: "h3",
        align: "center",
      },
      emptyLabel: content.copy.step1.emptySelectionLabel,
      summaryLabels: {
        initial: content.copy.step1.summaryLabels.initial,
        total: content.copy.step1.summaryLabels.total,
        balance: content.copy.step1.summaryLabels.balance,
      },
      submitLabel: gameState.materialsValidated
        ? content.copy.step1.nextButton
        : content.copy.step1.reviewButton,
    }),
    [content.copy.step1, gameState.materialsValidated],
  );

  const activeOffer = useMemo(
    () =>
      getSelectedOffer(
        content.loanOffers,
        activeOfferId ?? gameState.selectedOfferId,
      ),
    [activeOfferId, content.loanOffers, gameState.selectedOfferId],
  );
  const selectedOffer = useMemo(
    () => getSelectedOffer(content.loanOffers, gameState.selectedOfferId),
    [content.loanOffers, gameState.selectedOfferId],
  );
  const selectedPaymentStrategy = useMemo(
    () =>
      content.paymentStrategies.find(
        (strategy) =>
          strategy.id === (gameState.selectedPaymentStrategyId ?? "regulated"),
      ) ??
      content.paymentStrategies[0] ??
      null,
    [content.paymentStrategies, gameState.selectedPaymentStrategyId],
  );
  const loanTotalToRepay =
    selectedOffer?.totalToRepay ??
    content.loanOffers.find((offer) => isOfferPassable(offer))?.totalToRepay ??
    0;
  const loanTermWeeks = selectedOffer?.termWeeks ?? content.weeks.length;
  const initialReserve = Math.max(
    0,
    Number(selectedOffer?.amount ?? 0) -
      Number(gameState.fundingNeeded || fundingNeeded),
  );
  const earlyPayoffWeek = useMemo(
    () => getEarlyPayoffWeek(content.weeks, initialReserve, loanTotalToRepay),
    [content.weeks, initialReserve, loanTotalToRepay],
  );
  const expectedPaymentPlan = useMemo(
    () => buildExpectedPaymentPlan(loanTotalToRepay, loanTermWeeks),
    [loanTermWeeks, loanTotalToRepay],
  );
  const previewPaymentPlan = useMemo(
    () =>
      buildStrategyPlan({
        strategyId: selectedPaymentStrategy?.id ?? "regulated",
        totalToRepay: loanTotalToRepay,
        weeks: content.weeks,
        initialReserve,
      }),
    [
      content.weeks,
      initialReserve,
      loanTotalToRepay,
      selectedPaymentStrategy?.id,
    ],
  );
  const effectivePaymentPlan = gameState.paymentPlanConfirmed
    ? gameState.paymentPlan
    : expectedPaymentPlan;
  const expectedAccumulated = useMemo(
    () => buildExpectedAccumulated(effectivePaymentPlan),
    [effectivePaymentPlan],
  );
  const currentWeekIndex = Math.max(
    0,
    Math.min(gameState.currentWeek - 1, content.weeks.length - 1),
  );
  const currentWeek = content.weeks[currentWeekIndex];
  const currentWeekSalesSummary = currentWeek.sales
    .map((sale) => `${sale.quantity} ${sale.product.toLowerCase()}`)
    .join(", ");
  const previousArrears =
    gameState.weeklyStates[currentWeekIndex - 1]?.arrears ?? 0;
  const plannedWeekPayment = Number(
    effectivePaymentPlan[currentWeekIndex] ?? 0,
  );
  const availableThisWeek =
    Number(gameState.reserveRemaining ?? 0) + Number(currentWeek?.income ?? 0);
  const paymentTarget = Math.min(
    plannedWeekPayment + previousArrears,
    gameState.pendingAmount,
  );
  const maxAllowedPayment = Math.min(
    availableThisWeek,
    gameState.pendingAmount,
  );
  const planSpread =
    gameState.paymentPlan.length > 0
      ? Math.max(...gameState.paymentPlan) - Math.min(...gameState.paymentPlan)
      : 0;
  const planTotal = sum(gameState.paymentPlan);
  const totalScore =
    gameState.scoreBreakdown.materials +
    gameState.scoreBreakdown.loan +
    gameState.scoreBreakdown.payments;
  const debtPending = Math.max(0, loanTotalToRepay - gameState.totalPaid);
  const isApproved =
    totalScore >= 60 &&
    debtPending === 0 &&
    passableOfferIds.includes(gameState.selectedOfferId) &&
    gameState.loanValidated;
  const totalSalesIncome = content.weeks.reduce(
    (total, week) => total + Number(week?.income ?? 0),
    0,
  );
  const finalAvailableMoney = Math.max(
    0,
    Number(initialReserve ?? 0) + totalSalesIncome - Number(gameState.totalPaid ?? 0),
  );
  const netProfit = finalAvailableMoney;
  const finalStateLabel = getFinalStateLabel({
    totalScore,
    debtPending,
    loanValidated: gameState.loanValidated,
    selectedOfferId: gameState.selectedOfferId,
    passableOfferIds,
    recommendedOfferId,
  });
  const finalMessage = getFinalMessage({
    totalScore,
    debtPending,
    loanValidated: gameState.loanValidated,
    selectedOfferId: gameState.selectedOfferId,
    passableOfferIds,
    recommendedOfferId,
    messages: content.copy.messages,
  });
  const selectedStrategyDetails = useMemo(() => {
    if (!selectedPaymentStrategy) return null;

    if (selectedPaymentStrategy.id === "early") {
      return {
        title: selectedPaymentStrategy.title,
        description: `Con tu reserva y tus ventas, recien en la semana ${earlyPayoffWeek} reunirias ${formatCurrency(
          loanTotalToRepay,
        )} para pagar todo junto.`,
        conditions: selectedPaymentStrategy.conditions,
      };
    }

    if (selectedPaymentStrategy.id === "regulated") {
      return {
        title: selectedPaymentStrategy.title,
        description: `Debes repartir ${formatCurrency(
          loanTotalToRepay,
        )} entre ${loanTermWeeks} semanas. La division base es ${formatCurrency(
          loanTotalToRepay / loanTermWeeks,
        )} y el plan queda ${previewPaymentPlan.map(formatCurrency).join(", ")}.`,
        conditions: selectedPaymentStrategy.conditions,
      };
    }

    return {
      title: selectedPaymentStrategy.title,
      description: `Guardarias el dinero hasta la semana ${content.weeks.length} y ese dia tendrias que pagar ${formatCurrency(
        loanTotalToRepay,
      )} de una sola vez.`,
      conditions: selectedPaymentStrategy.conditions,
    };
  }, [
    content.weeks.length,
    earlyPayoffWeek,
    loanTermWeeks,
    loanTotalToRepay,
    previewPaymentPlan,
    selectedPaymentStrategy,
  ]);
  const strategyExecutionConfig = useMemo(() => {
    if (!selectedPaymentStrategy || !gameState.paymentPlanConfirmed)
      return null;

    if (gameState.pendingAmount <= 0) {
      return {
        mode: "wait",
        title: "Prestamo completado",
        description:
          "Ya cancelaste toda la deuda. Esta semana solo registra el cierre sin pago.",
        helper: "Tu siguiente decisión ya no requiere abonar nada.",
        suggestedPayment: 0,
        buttonLabel: content.copy.step3.waitWeekButton,
      };
    }

    if (selectedPaymentStrategy.id === "early") {
      if (currentWeek.week < earlyPayoffWeek) {
        return {
          mode: "wait",
          title: "Aún no toca pagar",
          description: `Con esta estrategia pagaras todo recien en la semana ${earlyPayoffWeek}. Por ahora guarda lo que vendes.`,
          helper: `Esta semana registraras S/ 0.00 para seguir acumulando hasta llegar a ${formatCurrency(
            loanTotalToRepay,
          )}.`,
          suggestedPayment: 0,
          buttonLabel: content.copy.step3.waitWeekButton,
        };
      }

      return {
        mode: "autoPay",
        title: "Ya puedes pagar toda la deuda",
        description: `Entre tu reserva y lo reunido ya alcanzas ${formatCurrency(
          loanTotalToRepay,
        )}. Ahora debes pagar todo de una sola vez.`,
        helper: `Pago esperado esta semana: ${formatCurrency(gameState.pendingAmount)}.`,
        suggestedPayment: gameState.pendingAmount,
        buttonLabel: content.copy.step3.payAllButton,
      };
    }

    if (selectedPaymentStrategy.id === "deferred") {
      if (currentWeekIndex < content.weeks.length - 1) {
        return {
          mode: "wait",
          title: "Todavia no pagaras",
          description:
            "Con esta opción guardas el dinero durante las primeras semanas.",
          helper: `Recien en la semana ${content.weeks.length} intentaras pagar ${formatCurrency(
            loanTotalToRepay,
          )} de una sola vez.`,
          suggestedPayment: 0,
          buttonLabel: content.copy.step3.waitWeekButton,
        };
      }

      return {
        mode: "autoPay",
        title: "Llego el pago final",
        description:
          "Ahora si debes intentar cancelar toda la deuda en una sola semana.",
        helper: `Pago esperado esta semana: ${formatCurrency(gameState.pendingAmount)}.`,
        suggestedPayment: gameState.pendingAmount,
        buttonLabel: content.copy.step3.payAllButton,
      };
    }

    return {
      mode: "regulated",
      title: "Cumple la cuota de esta semana",
      description: `Primero divide ${formatCurrency(
        loanTotalToRepay,
      )} entre ${loanTermWeeks} semanas. La cuota objetivo para esta semana es ${formatCurrency(
        plannedWeekPayment,
      )}.`,
      helper: `Operacion base: ${formatCurrency(loanTotalToRepay)} / ${loanTermWeeks} = ${formatCurrency(
        loanTotalToRepay / loanTermWeeks,
      )} aprox.`,
      suggestedPayment: plannedWeekPayment,
      buttonLabel: content.copy.step3.confirmPaymentButton,
    };
  }, [
    content.copy.step3.confirmPaymentButton,
    content.copy.step3.payAllButton,
    content.copy.step3.waitWeekButton,
    content.weeks.length,
    currentWeek.week,
    currentWeekIndex,
    earlyPayoffWeek,
    gameState.paymentPlanConfirmed,
    gameState.pendingAmount,
    loanTermWeeks,
    loanTotalToRepay,
    plannedWeekPayment,
    selectedPaymentStrategy,
  ]);

  useEffect(() => {
    if (!gameState.paymentPlanConfirmed) return;
    const paymentValue = Number(
      gameState.weeklyPayments[currentWeekIndex] ?? 0,
    );
    setDraftPayment(paymentValue > 0 ? String(paymentValue) : "");
  }, [
    currentWeekIndex,
    gameState.paymentPlanConfirmed,
    gameState.weeklyPayments,
  ]);

  useEffect(() => {
    if (gameState.selectedOfferId) {
      setActiveOfferId(gameState.selectedOfferId);
    }
  }, [gameState.selectedOfferId]);

  useEffect(() => {
    if (gameState.step === 4 && !missionCompleted) {
      setMissionCompleted(true);
    }
  }, [gameState.step, missionCompleted]);

  useEffect(() => {
    if (!viewId) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: missionCompleted,
      type: "whatWouldYouDo",
      score: totalScore,
      missionScoreOverride: totalScore,
      countsTowardScore: missionCompleted,
      payload: {
        gameState: {
          ...gameState,
          materialsTotal,
          fundingNeeded,
          pendingAmount: debtPending,
          score: totalScore,
        },
        scoreBreakdown: gameState.scoreBreakdown,
        products: content.products,
        offersReviewed: gameState.openedOfferIds,
        selectedOfferId: gameState.selectedOfferId,
        selectedOfferJustification: gameState.selectedOfferJustification,
        weeklyStates: gameState.weeklyStates,
        totalPaid: gameState.totalPaid,
        finalAvailableMoney,
        netProfit,
        finalStateLabel,
        approved: isApproved,
      },
    });

    if (missionCompleted && pendingMissionAdvance && !completionPersisted) {
      setCompletionPersisted(true);
    }
  }, [
    completionPersisted,
    content.products,
    debtPending,
    finalAvailableMoney,
    finalStateLabel,
    fundingNeeded,
    gameState,
    heroApi,
    isApproved,
    materialsTotal,
    missionCompleted,
    netProfit,
    pendingMissionAdvance,
    totalScore,
    viewId,
  ]);

  useEffect(() => {
    if (!pendingMissionAdvance || !completionPersisted) return;

    setPendingMissionAdvance(false);
    setCompletionPersisted(false);

    const timerId = window.setTimeout(() => {
      heroApi?.advanceCurrentView?.();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [completionPersisted, heroApi, pendingMissionAdvance]);

  function updateGameState(patch) {
    setGameState((current) => ({
      ...current,
      ...patch,
      scoreBreakdown: {
        ...current.scoreBreakdown,
        ...(patch.scoreBreakdown ?? {}),
      },
    }));
  }

  function toggleMaterial(materialId) {
    if (gameState.materialsValidated) return;

    setMaterialsMessage(null);
    setGameState((current) => {
      const selected = current.selectedMaterials.includes(materialId)
        ? current.selectedMaterials.filter((id) => id !== materialId)
        : [...current.selectedMaterials, materialId];

      return {
        ...current,
        selectedMaterials: selected,
      };
    });
  }

  function removeMaterial(material) {
    if (!material?.id || gameState.materialsValidated) return;
    toggleMaterial(material.id);
  }

  function handleReviewMaterials() {
    const rawScore = getMaterialsRawScore({
      selectedIds: gameState.selectedMaterials,
      materials: content.materials,
      requiredIds: requiredMaterialIds,
      materialsTotal,
      fundingNeeded,
      expectedMaterialsTotal,
      expectedFundingNeeded,
    });
    const multiplier = getAttemptMultiplier(gameState.materialAttempts);
    const stepScore = Math.round(rawScore * multiplier);

    if (isMaterialsCorrect) {
      updateGameState({
        step: 1,
        materialsValidated: true,
        materialsTotal,
        fundingNeeded,
        scoreBreakdown: {
          materials: stepScore,
        },
      });
    } else {
      updateGameState({
        materialsTotal,
        fundingNeeded,
        materialAttempts: gameState.materialAttempts + 1,
      });
    }

    setMaterialsMessage(
      buildMaterialsFeedback({
        missingRequiredCount:
          requiredMaterialIds.length - selectedRequiredCount,
        selectedDistractors,
        isCorrect: isMaterialsCorrect,
        messages: content.copy.messages,
      }),
    );
  }

  function goToStep(step) {
    updateGameState({ step });
  }

  function markOfferOpened(offerId) {
    if (gameState.openedOfferIds.includes(offerId)) return;
    updateGameState({
      openedOfferIds: [...gameState.openedOfferIds, offerId],
      recognizedInformalRisk:
        gameState.recognizedInformalRisk || offerId === "offer-d",
    });
  }

  function handleOpenOffer(offerId) {
    setActiveOfferId(offerId);
    markOfferOpened(offerId);
    setOfferFeedback(null);
  }

  function handleChooseOffer(offerId) {
    const offer = getSelectedOffer(content.loanOffers, offerId);
    if (!offer || !isOfferPassable(offer)) return;

    setActiveOfferId(offerId);
    markOfferOpened(offerId);
    const recognizedInformalRisk =
      gameState.recognizedInformalRisk || offerId === "offer-d";

    if (isOfferPassable(offer)) {
      const nextState = {
        ...gameState,
        selectedOfferId: offerId,
        recognizedInformalRisk,
      };
      const rawScore = getLoanRawScore(nextState, content.loanOffers);
      const multiplier = getAttemptMultiplier(gameState.loanAttempts);
      const stepScore = Math.round(rawScore * multiplier);

      updateGameState({
        selectedOfferId: offerId,
        loanValidated: true,
        step: 3,
        recognizedInformalRisk,
        selectedPaymentStrategyId: null,
        paymentPlan: Array.from(
          { length: offer.termWeeks ?? content.weeks.length },
          () => 0,
        ),
        paymentPlanConfirmed: false,
        paymentPlanAttempts: 0,
        currentWeek: 1,
        weeklyPayments: Array.from({ length: content.weeks.length }, () => 0),
        weeklyStates: [],
        pendingAmount:
          offer.totalToRepay ?? passableOffers[0]?.totalToRepay ?? 0,
        reserveRemaining: Math.max(
          0,
          Number(offer.amount ?? 0) -
            Number(gameState.fundingNeeded || fundingNeeded),
        ),
        totalPaid: 0,
        paymentAttempts: Array.from({ length: content.weeks.length }, () => 0),
        paymentsCompleted: false,
        scoreBreakdown: {
          loan: stepScore,
        },
      });
      setPaymentMessage(null);
      setOfferFeedback(null);
      return;
    }

    updateGameState({
      recognizedInformalRisk,
      loanAttempts: gameState.loanAttempts + 1,
    });
    setOfferFeedback(null);
  }

  function handleOpenPaymentStrategy(strategyId) {
    updateGameState({
      selectedPaymentStrategyId: strategyId,
    });
    setPaymentMessage(null);
  }

  function handleConfirmPaymentStrategy(strategyIdOverride = null) {
    const resolvedStrategyId =
      strategyIdOverride ?? gameState.selectedPaymentStrategyId ?? "regulated";
    const strategy = content.paymentStrategies.find(
      (item) => item.id === resolvedStrategyId,
    );
    if (!strategy) return;

    const plan = buildStrategyPlan({
      strategyId: strategy.id,
      totalToRepay: loanTotalToRepay,
      weeks: content.weeks,
      initialReserve,
    });

    const initialWeek =
      strategy.id === "early"
        ? earlyPayoffWeek
        : strategy.id === "deferred"
          ? content.weeks.length
          : 1;
    const carriedReserve =
      initialReserve +
      sum(
        content.weeks
          .slice(0, Math.max(0, initialWeek - 1))
          .map((week) => Number(week.income ?? 0)),
      );

    updateGameState({
      selectedPaymentStrategyId: strategy.id,
      paymentPlan: plan,
      paymentPlanConfirmed: true,
      currentWeek: initialWeek,
      pendingAmount: loanTotalToRepay,
      reserveRemaining: carriedReserve,
      weeklyPayments: Array.from({ length: content.weeks.length }, () => 0),
      weeklyStates: [],
      totalPaid: 0,
      paymentAttempts: Array.from({ length: content.weeks.length }, () => 0),
      paymentsCompleted: false,
    });
    setPaymentMessage(null);
  }

  function updateDraftPayment(nextValue) {
    const sanitized = String(nextValue ?? "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    if (!sanitized) {
      setDraftPayment("");
      return;
    }

    const [integerPart = "", ...decimalParts] = sanitized.split(".");
    const decimalPart = decimalParts.join("").slice(0, 2);
    const normalized = decimalParts.length
      ? `${integerPart}.${decimalPart}`
      : integerPart;
    const numericValue = Number(normalized);

    if (Number.isNaN(numericValue)) {
      setDraftPayment("");
      return;
    }

    if (numericValue > maxAllowedPayment) {
      setDraftPayment(String(maxAllowedPayment));
      return;
    }

    setDraftPayment(normalized);
  }

  function adjustDraftPayment(delta) {
    updateDraftPayment(Number(draftPayment || 0) + delta);
  }

  function commitWeekPayment(rawAmount) {
    const paidAmount = Number(rawAmount ?? 0);
    const hadDebtBeforePayment = Number(gameState.pendingAmount ?? 0) > 0;

    if (paidAmount < 0 || paidAmount > maxAllowedPayment) {
      setPaymentMessage(content.copy.messages.paymentInvalid);
      updateGameState({
        paymentAttempts: gameState.paymentAttempts.map((value, index) =>
          index === currentWeekIndex ? value + 1 : value,
        ),
      });
      return;
    }

    const previousTotalPaid = sum(
      gameState.weeklyPayments.slice(0, currentWeekIndex),
    );
    const newTotalPaid = previousTotalPaid + paidAmount;
    const remaining = Math.max(0, loanTotalToRepay - newTotalPaid);
    const arrears = Math.max(
      0,
      expectedAccumulated[currentWeekIndex] - newTotalPaid,
    );
    const nextReserve = Math.max(
      0,
      Number(gameState.reserveRemaining ?? 0) +
        Number(currentWeek.income ?? 0) -
        paidAmount,
    );
    const updatedPayments = [...gameState.weeklyPayments];
    updatedPayments[currentWeekIndex] = paidAmount;
    const updatedStates = [...gameState.weeklyStates];
    const weekPaymentSummary = getWeekPaymentSummary({
      week: currentWeek.week,
      paidAmount,
      paymentTarget,
      remaining,
      isLastWeek: currentWeekIndex === content.weeks.length - 1,
      hadDebtBeforePayment,
    });
    updatedStates[currentWeekIndex] = {
      week: currentWeek.week,
      income: currentWeek.income,
      payment: paidAmount,
      plannedPayment: plannedWeekPayment,
      arrears,
      remaining,
      status: getWeekStatus({
        weekIndex: currentWeekIndex,
        payment: paidAmount,
        arrears,
        remaining,
        weeks: content.weeks,
      }),
      balance: nextReserve,
      reserveAfterWeek: nextReserve,
      message: weekPaymentSummary,
    };

    const nextPaymentsScore = updatedPayments.reduce(
      (acc, payment, index) =>
        acc +
        getWeekScore(
          content.weeks[index],
          payment,
          Math.min(
            Number(effectivePaymentPlan[index] ?? 0) +
              Number(updatedStates[index - 1]?.arrears ?? 0),
            Number(loanTotalToRepay) - sum(updatedPayments.slice(0, index)),
          ),
        ),
      0,
    );

    updateGameState({
      weeklyPayments: updatedPayments,
      weeklyStates: updatedStates,
      totalPaid: newTotalPaid,
      pendingAmount: remaining,
      reserveRemaining: nextReserve,
      paymentAttempts: gameState.paymentAttempts.map((value, index) =>
        index === currentWeekIndex ? value + 1 : value,
      ),
      scoreBreakdown: {
        payments: nextPaymentsScore,
      },
      paymentsCompleted: currentWeekIndex === content.weeks.length - 1,
    });

    setPaymentMessage(weekPaymentSummary);
  }

  function handleConfirmWeekPayment() {
    commitWeekPayment(draftPayment || 0);
  }

  function handleApplySuggestedPayment(amount) {
    setDraftPayment(String(amount));
    commitWeekPayment(amount);
  }

  function handleContinueAfterWeek() {
    if (currentWeekIndex < content.weeks.length - 1) {
      updateGameState({
        currentWeek: gameState.currentWeek + 1,
      });
      setPaymentMessage(null);
      return;
    }

    updateGameState({
      step: 4,
      paymentsCompleted: true,
    });
    setPaymentMessage(null);
  }

  const currentStepTitle = content.stepTitles[gameState.step - 1];
  const interactiveAsideModel = useMemo(() => {
    const step1Model = {
      title: currentStepTitle,
      sections: [
        {
          id: "own-money",
          kind: "stat",
          label: content.copy.step1.ownMoneyLabel,
          value: formatCurrency(content.ownMoney),
        },
        {
          id: "products-intro",
          title: content.copy.step1.asideTitle,
          description: content.copy.step1.asideText,
        },
        {
          id: "products-list",
          kind: "cards",
          items: content.products.map((product) => ({
            id: product.id,
            title: product.sidebarLabel ?? product.label,
            text: `${product.quantity} unidades`,
            media: product.media,
            variant: "solid",
            size: "normal",
          })),
          columns: 2,
          fill: true,
          scrollable: true,
        },
      ],
    };

    const step2Sections = [
      {
        id: "needed-money",
        kind: "stat",
        label: content.copy.step2.neededMoneyLabel,
        value: formatCurrency(gameState.fundingNeeded || fundingNeeded),
      },
      {
        id: "active-offer",
        kind: "grid",
        title: activeOffer?.name ?? "Selecciona una oferta",
        items: [
          {
            label: "Monto prestado",
            value: activeOffer ? formatCurrency(activeOffer.amount) : "—",
          },
          {
            label: "Total a devolver",
            value: activeOffer
              ? activeOffer.totalToRepay != null
                ? formatCurrency(activeOffer.totalToRepay)
                : "No indicado"
              : "—",
          },
          {
            label: "Interes",
            value: activeOffer
              ? activeOffer.extraCost != null
                ? formatCurrency(activeOffer.extraCost)
                : "No indicado"
              : "—",
          },
          {
            label: "Plazo",
            value: activeOffer
              ? activeOffer.termWeeks != null
                ? `${activeOffer.termWeeks} semanas`
                : "Poco claro"
              : "—",
          },
        ],
      },
      {
        id: "offer-guidance",
        title: getOfferGuidance(activeOffer).title,
        description: getOfferGuidance(activeOffer).description,
      },
      {
        id: "offer-action",
        kind: "action",
        buttonLabel: content.copy.step2.chooseButton,
        disabled: !activeOffer || !isOfferPassable(activeOffer),
        onClick: () => handleChooseOffer(activeOffer?.id),
      },
    ];

    const step2Model = {
      title: currentStepTitle,
      sections: step2Sections,
    };

    const step3Sections = [];

    if (selectedOffer) {
      step3Sections.push({
        id: "loan-overview",
        kind: "grid",
        title: "Información previa",
        items: [
          {
            label: "Prestamo (P)",
            value: formatCurrency(selectedOffer.amount),
          },
          {
            label: "Plazo",
            value:
              selectedOffer.termWeeks != null
                ? `${selectedOffer.termWeeks} semanas`
                : "Poco claro",
          },
          {
            label: "Interes (I)",
            value:
              selectedOffer.extraCost != null
                ? formatCurrency(selectedOffer.extraCost)
                : "No indicado",
          },
          {
            label: "Gastado (G)",
            value: formatCurrency(gameState.fundingNeeded || fundingNeeded),
          },
          {
            label: "Total (P + I)",
            value:
              selectedOffer.totalToRepay != null
                ? formatCurrency(selectedOffer.totalToRepay)
                : "No indicado",
          },
          {
            label: "Sobrante (P - G)",
            value: formatCurrency(initialReserve),
          },
        ],
      });
    }

    step3Sections.push({
      id: "weekly-reference",
      title: "Cuota aproximada por semana",
      description: `Se divide el total a pagar (${formatCurrency(
        loanTotalToRepay,
      )}) entre el plazo (${loanTermWeeks} semanas) ${formatCurrency(
        loanTermWeeks > 0 ? loanTotalToRepay / loanTermWeeks : 0,
      )} aprox.`,
    });

    const step3Model = {
      title: gameState.paymentPlanConfirmed
        ? currentStepTitle
        : content.copy.step3.sidebarHeroTitle,
      sections: step3Sections,
    };

    const paymentQuality = getPaymentQualityLabel({
      strategyId: gameState.selectedPaymentStrategyId,
      debtPending,
      weeklyPayments: gameState.weeklyPayments,
      loanTotalToRepay,
      weeksLength: content.weeks.length,
    });
    const totalPaidWeeks = gameState.weeklyPayments.filter(
      (value) => Number(value ?? 0) > 0,
    ).length;

    const paymentQualityDescription =
      paymentQuality === "Bueno"
        ? "Juntaste el dinero necesario y cancelaste la deuda antes de la última semana."
        : paymentQuality === "Equilibrado"
          ? "Repartiste el pago por semanas y cumpliste el plazo sin atrasarte."
          : debtPending > 0
            ? "El plan no alcanzo para cubrir toda la deuda dentro del plazo."
            : totalPaidWeeks <= 1
              ? "Cancelaste la deuda al cierre, pero asumiste más riesgo durante el proceso."
              : "Tuviste pagos desordenados y el plan se volvio menos seguro.";

    const step4Sections = [
      {
        id: "general-result",
        kind: "grid",
        title: content.copy.step4.generalInfoTitle,
        items: [
          {
            label: "Prestamo",
            value: formatCurrency(selectedOffer?.amount ?? 0),
          },
          {
            label: "Interes",
            value: formatCurrency(
              selectedOffer?.additionalCost ??
                Math.max(
                  0,
                  (selectedOffer?.totalToRepay ?? 0) -
                    (selectedOffer?.amount ?? 0),
                ),
            ),
          },
          {
            label: "Total",
            value: formatCurrency(
              selectedOffer?.totalToRepay ?? loanTotalToRepay,
            ),
          },
          { label: "Plazo", value: `${loanTermWeeks} semanas` },
        ],
      },
      {
        id: "financial-close-result",
        kind: "grid",
        title: `Ganancia neta:  ${formatCurrency(finalAvailableMoney)}`,
      },
      {
        id: "payment-quality-result",
        kind: "message",
        title: `Pago: ${paymentQuality}`,
        description: paymentQualityDescription,
        tone: paymentQuality === "Malo" ? "warning" : "success",
      },
    ];

    const step4Model = {
      title: currentStepTitle,
      sections: step4Sections,
    };

    switch (gameState.step) {
      case 1:
        return step1Model;
      case 2:
        return step2Model;
      case 3:
        return step3Model;
      case 4:
        return step4Model;
      default:
        return null;
    }
  }, [
    activeOffer,
    content.copy.step1.asideText,
    content.copy.step1.asideTitle,
    content.copy.step1.ownMoneyLabel,
    content.copy.step2.chooseButton,
    content.copy.step2.neededMoneyLabel,
    content.copy.step3.sidebarHeroTitle,
    content.copy.step4.generalInfoTitle,
    content.products,
    currentStepTitle,
    debtPending,
    finalMessage,
    finalStateLabel,
    fundingNeeded,
    gameState.fundingNeeded,
    gameState.materialsTotal,
    gameState.paymentPlanConfirmed,
    gameState.selectedPaymentStrategyId,
    gameState.step,
    gameState.weeklyPayments,
    gameState.weeklyStates,
    handleChooseOffer,
    finalAvailableMoney,
    initialReserve,
    loanTermWeeks,
    loanTotalToRepay,
    materialsTotal,
    netProfit,
    selectedOffer,
    totalScore,
  ]);

  return {
    content,
    gameState,
    materialsMessage,
    paymentMessage,
    offerFeedback,
    draftPayment,
    materialsTotal,
    fundingNeeded,
    selectedRequiredCount,
    selectedDistractors,
    isMaterialsCorrect,
    materialShopItems,
    selectedMaterialItems,
    materialsCalculatorData,
    activeOffer,
    selectedOffer,
    selectedPaymentStrategy,
    selectedStrategyDetails,
    strategyExecutionConfig,
    loanTotalToRepay,
    loanTermWeeks,
    initialReserve,
    earlyPayoffWeek,
    currentWeekIndex,
    currentWeek,
    currentWeekSalesSummary,
    previousArrears,
    plannedWeekPayment,
    availableThisWeek,
    paymentTarget,
    maxAllowedPayment,
    planSpread,
    planTotal,
    totalScore,
    debtPending,
    isApproved,
    finalAvailableMoney,
    netProfit,
    finalStateLabel,
    finalMessage,
    currentStepTitle,
    interactiveAsideModel,
    isBalancedPaymentPlan,
    toggleMaterial,
    removeMaterial,
    handleReviewMaterials,
    goToStep,
    handleOpenOffer,
    handleChooseOffer,
    handleOpenPaymentStrategy,
    handleConfirmPaymentStrategy,
    updateDraftPayment,
    adjustDraftPayment,
    handleConfirmWeekPayment,
    handleApplySuggestedPayment,
    handleContinueAfterWeek,
  };
}
