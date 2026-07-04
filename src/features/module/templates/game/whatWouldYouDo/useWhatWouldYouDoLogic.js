import { useEffect, useMemo, useState } from "react";

const DEFAULT_CONTENT = {
  title: {
    text: "Financio mi emprendimiento sin atrasarme",
    variant: "h1",
    align: "left",
  },
  stepTitles: [
    "Preparo mis materiales",
    "Comparo prestamos",
    "Cumplo mi plan de pagos",
    "Reviso mi resultado",
  ],
  ownMoney: 12,
  products: [
    {
      id: "basic",
      label: "Pulsera basica",
      sidebarLabel: "Basica",
      quantity: 5,
      unitPrice: 3,
      income: 15,
      media: {
        src: "1/ganar-dinero.webp",
        alt: "Modelo de pulsera basica",
        variant: "square",
      },
    },
    {
      id: "charm",
      label: "Pulsera con dije",
      sidebarLabel: "Con dije",
      quantity: 4,
      unitPrice: 6,
      income: 24,
      media: {
        src: "1/ganar-dinero.webp",
        alt: "Modelo de pulsera con dije",
        variant: "square",
      },
    },
    {
      id: "custom",
      label: "Pulsera personalizada",
      sidebarLabel: "Personalizada",
      quantity: 3,
      unitPrice: 8,
      income: 24,
      media: {
        src: "1/ganar-dinero.webp",
        alt: "Modelo de pulsera personalizada",
        variant: "square",
      },
    },
  ],
  materials: [
    {
      id: "hilo",
      label: "Hilos",
      price: 8,
      required: true,
      media: {
        src: "2/cinta.webp",
        alt: "Hilo de colores para pulseras",
        variant: "square",
      },
    },
    {
      id: "cuentas",
      label: "Cuentas",
      price: 15,
      required: true,
      media: {
        src: "2/escarcha.webp",
        alt: "Cuentas para pulseras",
        variant: "square",
      },
    },
    {
      id: "dijes",
      label: "Dijes",
      price: 8,
      required: true,
      media: {
        src: "2/stikers.webp",
        alt: "Dijes para pulseras",
        variant: "square",
      },
    },
    {
      id: "letras",
      label: "Letras",
      price: 9,
      required: true,
      media: {
        src: "2/plumones.webp",
        alt: "Letras para personalizar pulseras",
        variant: "square",
      },
    },
    {
      id: "broches",
      label: "Broches",
      price: 6,
      required: true,
      media: {
        src: "2/stick.webp",
        alt: "Broches y cierres para pulseras",
        variant: "square",
      },
    },
    {
      id: "bolsitas",
      label: "Bolsitas para entregar",
      price: 4,
      required: true,
      media: {
        src: "2/cartulina.webp",
        alt: "Bolsitas para entregar pulseras",
        variant: "square",
      },
    },
    {
      id: "snack",
      label: "Snack",
      price: 5,
      required: false,
      media: {
        src: "3/snacks.jpeg",
        alt: "Snack para el recreo",
        variant: "square",
      },
    },
    {
      id: "audifonos",
      label: "Audifonos",
      price: 7,
      required: false,
      media: {
        src: "2/audifonos.webp",
        alt: "Audifonos personales",
        variant: "square",
      },
    },
    {
      id: "cuaderno",
      label: "Cuaderno",
      price: 6,
      required: false,
      media: {
        src: "2/materiales-de-estudio.webp",
        alt: "Cuaderno y utiles escolares",
        variant: "square",
      },
    },
  ],
  loanOffers: [
    {
      id: "offer-a",
      name: "Oferta A",
      amount: 30,
      totalToRepay: 33,
      extraCost: 3,
      termWeeks: 4,
      weeklyPayment: "S/ 8.25",
      differenceLabel: "Faltan S/ 8.00",
      risk: "Bajo",
      conditions: "Claras",
      coverage: "Insuficiente",
      summary: "No alcanza para completar la compra.",
      detailMessage: "Faltan S/ 8.00 para cubrir todos los materiales.",
      viable: false,
      media: {
        src: "/activity/1/recibir-dinero.webp",
        alt: "Oferta A de prestamo",
      },
    },
    {
      id: "offer-b",
      name: "Oferta B",
      amount: 45,
      totalToRepay: 51,
      extraCost: 6,
      termWeeks: 4,
      weeklyPayment: "S/ 13, S/ 13, S/ 13 y S/ 12",
      differenceLabel: "Sobran S/ 7.00",
      risk: "Bajo",
      conditions: "Claras",
      coverage: "Suficiente",
      summary: "Cubre la compra y deja un pequeno respaldo.",
      detailMessage: "Cubre lo necesario y sus condiciones son claras.",
      viable: true,
      media: {
        src: "/activity/1/ganar-dinero.webp",
        alt: "Oferta B de prestamo",
      },
    },
    {
      id: "offer-c",
      name: "Oferta C",
      amount: 65,
      totalToRepay: 84,
      extraCost: 19,
      termWeeks: 4,
      weeklyPayment: "S/ 21.00",
      differenceLabel: "Sobran S/ 27.00",
      risk: "Medio",
      conditions: "Claras, pero costosas",
      coverage: "Mucho mas de lo necesario",
      summary: "Presta de mas y vuelve la deuda pesada.",
      detailMessage: "Devolverias S/ 84.00, mas de lo que el negocio puede sostener.",
      viable: false,
      media: {
        src: "/activity/1/ahorro.webp",
        alt: "Oferta C de prestamo",
      },
    },
    {
      id: "offer-d",
      name: "Oferta D",
      amount: 45,
      totalToRepay: null,
      extraCost: null,
      termWeeks: null,
      weeklyPayment: "No se puede calcular",
      differenceLabel: "Cobertura suficiente",
      risk: "Alto",
      conditions: "Poco claras",
      coverage: "Suficiente",
      summary: "Oculta datos clave del pago.",
      detailMessage: "Sin total ni plazo claros no puedes planificar el pago.",
      viable: false,
      media: {
        src: "/activity/1/compra-online-ahorro.webp",
        alt: "Oferta D de prestamo",
      },
    },
  ],
  weeks: [
    {
      week: 1,
      title: "La feria comienza bien",
      description:
        "Vendiste 2 pulseras basicas, 1 pulsera con dije y 1 pulsera personalizada.",
      sales: [
        { product: "Basica", quantity: 2, unitPrice: 3, income: 6 },
        { product: "Con dije", quantity: 1, unitPrice: 6, income: 6 },
        { product: "Personalizada", quantity: 1, unitPrice: 8, income: 8 },
      ],
      income: 20,
      fullScore: 10,
    },
    {
      week: 2,
      title: "Esta semana hubo menos compradores",
      description: "Vendiste 1 pulsera basica y 1 pulsera con dije.",
      sales: [
        { product: "Basica", quantity: 1, unitPrice: 3, income: 3 },
        { product: "Con dije", quantity: 1, unitPrice: 6, income: 6 },
      ],
      income: 9,
      fullScore: 10,
    },
    {
      week: 3,
      title: "Las ventas mejoraron",
      description:
        "Vendiste 1 pulsera basica, 1 pulsera con dije y 1 pulsera personalizada.",
      sales: [
        { product: "Basica", quantity: 1, unitPrice: 3, income: 3 },
        { product: "Con dije", quantity: 1, unitPrice: 6, income: 6 },
        { product: "Personalizada", quantity: 1, unitPrice: 8, income: 8 },
      ],
      income: 17,
      fullScore: 15,
    },
    {
      week: 4,
      title: "La feria cierra con buenas ventas",
      description:
        "Vendiste 1 pulsera basica, 1 pulsera con dije y 1 pulsera personalizada.",
      sales: [
        { product: "Basica", quantity: 1, unitPrice: 3, income: 3 },
        { product: "Con dije", quantity: 1, unitPrice: 6, income: 6 },
        { product: "Personalizada", quantity: 1, unitPrice: 8, income: 8 },
      ],
      income: 17,
      fullScore: 10,
    },
  ],
  paymentStrategies: [
    {
      id: "early",
      title: "Opcion 1: pago anticipado",
      description:
        "Cada semana juntas dinero y, ni bien alcanzas lo que debes, lo pagas de inmediato.",
      tone: "warning",
      summary: "Avanzas rapido, pero puedes gastar tu reserva antes de tiempo.",
      conditions: [
        "Guardas ventas y reserva hasta completar toda la deuda.",
        "Pagas en una sola semana, apenas ya te alcance.",
        "Si te adelantas, terminas antes del plazo.",
      ],
      media: {
        src: "/activity/1/recibir-dinero.webp",
        alt: "Pago anticipado del prestamo",
        variant: "horizontal",
      },
    },
    {
      id: "regulated",
      title: "Opcion 2: pago regulado",
      description:
        "Cada semana separas un monto para completar el pago dentro del plazo acordado.",
      tone: "success",
      summary: "Te ayuda a mantener orden entre pagar y seguir vendiendo.",
      conditions: [
        "Divides la deuda en 4 semanas.",
        "Cada semana cumples una cuota planificada.",
        "Es la opcion mas ordenada para no desbalancearte.",
      ],
      media: {
        src: "/activity/1/ganar-dinero.webp",
        alt: "Pago regulado del prestamo",
        variant: "horizontal",
      },
    },
    {
      id: "deferred",
      title: "Opcion 3: pago ni bien tenga todo",
      description:
        "Dejas la deuda para el final y pagas cuando crees tener todo, con mas incertidumbre al cierre.",
      tone: "warning",
      summary: "Postergar el pago hace mas riesgoso llegar completo al final.",
      conditions: [
        "No pagas durante las primeras semanas.",
        "Guardas todo para cancelar al final.",
        "Si algo falla, el cierre se vuelve mas riesgoso.",
      ],
      media: {
        src: "/activity/1/compra-online-ahorro.webp",
        alt: "Pago postergado del prestamo",
        variant: "horizontal",
      },
    },
  ],
  copy: {
    step1: {
      asideTitle: "Productos a vender",
      asideText: "Observa las pulseras y elige solo los materiales necesarios.",
      mainTitle: "Que necesito comprar para fabricar las pulseras?",
      mainSubtitle:
        "Agrega al carrito solo los materiales que ayudan a producir o entregar los pedidos.",
      shoppingTitle: "Mi seleccion",
      emptySelectionLabel: "Elige uno o mas materiales.",
      summaryLabels: {
        initial: "Dinero propio",
        total: "Costo actual",
        balance: "Dinero disponible",
      },
      reviewButton: "Revisar materiales",
      nextButton: "Comparar prestamos",
    },
    step2: {
      mainTitle: "Ofertas de prestamo disponibles",
      mainSubtitle: "Compara monto, interes, plazo y claridad antes de decidir.",
      neededMoneyLabel: "Dinero que necesito",
      chooseButton: "Elegir esta oferta",
    },
    step3: {
      sidebarHeroTitle: "Armando mi plan de pago",
      asidePlanTitle: "Plan de pago",
      asideExecutionTitle: "Seguimiento del pago",
      planTitle: "Como pagare mi prestamo?",
      planSubtitle:
        "Elige una forma de organizar tus pagos semanales antes de empezar con las ventas.",
      strategyDetailsTitle: "Condiciones de esta opcion",
      strategyContinueButton: "Continuar con esta opcion",
      reserveLabel: "Reserva disponible",
      reserveHint: "Es la diferencia entre lo que necesitabas y lo que te presto la oferta elegida.",
      executionTitle: "Cumplo mi plan de pagos",
      executionSubtitle:
        "Sigue tu estrategia, revisa lo que vendiste y decide el pago de la semana solo cuando corresponda.",
      weekSalesTitle: "Ventas de la semana",
      weekSalesHint: "Esto ingreso tu emprendimiento en esta semana.",
      paymentActionTitle: "Decision de esta semana",
      waitWeekButton: "Registrar semana sin pago",
      payAllButton: "Pagar todo ahora",
      paymentInputTitle: "Decide cuanto pagar esta semana",
      paymentInputHint:
        "Recuerda: puedes usar las ventas de la semana y, si hace falta, parte de tu reserva.",
      confirmPaymentButton: "Confirmar pago",
      continueButton: "Continuar a la siguiente semana",
      reviewResultButton: "Revisar mi resultado",
    },
    step4: {
      mainTitle: "Resultado de mi emprendimiento",
      mainSubtitle:
        "Asi fue tu proceso desde la lista de materiales hasta el pago final del prestamo.",
      materialsTitle: "Mis materiales",
      loanTitle: "Prestamo elegido",
      paymentsTitle: "Recorrido de pagos",
      financialTitle: "Resultado financiero",
    },
    messages: {
      materialsSuccess: {
        tone: "success",
        title: "Tu lista esta completa",
        text: "Ya sabes cuanto dinero necesitas para iniciar la produccion de las pulseras.",
      },
      materialsMissing: {
        tone: "warning",
        title: "Tu lista aun no permite fabricar todos los pedidos",
        text: "Revisa que material falta para completar las pulseras solicitadas antes de pasar al prestamo.",
      },
      materialsDistractor: {
        tone: "warning",
        title: "Hay productos que no ayudan a tu produccion",
        text: "Ese gasto no fabrica ni entrega pulseras. Si lo agregas, aumenta el dinero que necesitas pedir prestado.",
      },
      materialsGeneric: {
        tone: "warning",
        title: "Revisa tu seleccion",
        text: "Ajusta la lista para quedarte solo con lo necesario para producir y entregar.",
      },
      offerViable: {
        tone: "success",
        title: "Puede funcionar",
        text: "Cubre lo necesario. Si quieres seguir, presiona otra vez el boton.",
      },
      offerInvalidTitle: "No permite avanzar",
      offerInvalidFallback: "Esta oferta no conviene para continuar.",
      planAdjustTitle: "Ajusta tu plan semanal",
      planReady: {
        tone: "success",
        title: "Plan de pagos listo",
        text: "Ahora revisa semana por semana si tus ventas y tu reserva alcanzan para sostener el plan que propusiste.",
      },
      paymentInvalid: {
        tone: "warning",
        title: "El pago no es valido",
        text: "No puedes pagar un monto negativo, superior al dinero disponible de la semana o mayor que la deuda pendiente.",
      },
      finalRiskTitle: "Tu plan necesita mejoras",
      finalRiskText:
        "Antes de aceptar un prestamo, debes verificar que el monto alcance, que las condiciones sean claras y que tus ventas permitan cumplir con el pago.",
      finalDebtTitle: "Tu plan necesita reforzar los pagos",
      finalDebtText:
        "Aun queda deuda pendiente. Revisa como una semana con menos ventas puede afectar el cumplimiento del prestamo.",
      finalTopTitle: "Decision financiera responsable",
      finalTopText:
        "Identificaste los materiales necesarios, elegiste una oferta clara y organizaste tus pagos hasta completar el prestamo dentro del plazo.",
      finalMidTitle: "Cumpliste con el prestamo, pero tu plan tuvo momentos ajustados",
      finalMidText:
        "Revisa como una semana con menos ventas puede generar atrasos. Una reserva mas amplia puede ayudarte a reducir el riesgo.",
      finalLowTitle: "Tu plan necesita mejoras",
      finalLowText:
        "Lograste avanzar, pero todavia debes fortalecer como comparas el prestamo y como compensas los atrasos de pago.",
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
  const fallbackTotal = content.loanOffers.find((offer) => offer.viable)?.totalToRepay ?? 51;

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

function buildStrategyPlan({ strategyId, totalToRepay, weeks, initialReserve }) {
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

function buildMaterialsFeedback({ missingRequiredCount, selectedDistractors, isCorrect, messages }) {
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
  if (materialsTotal === 50 && fundingNeeded === 38) rawScore += 5;

  return rawScore;
}

function getLoanRawScore(state) {
  let rawScore = 0;

  if (state.openedOfferIds.length >= 3) rawScore += 5;
  if (state.recognizedInformalRisk) rawScore += 5;
  if (state.selectedOfferId === "offer-b") rawScore += 15;

  return rawScore;
}

function getWeekScore(week, paidAmount, expectedAmount) {
  const fullScore = Number(week.fullScore ?? 10);

  if (Number(paidAmount) === Number(expectedAmount)) return fullScore;
  if (Number(paidAmount) > 0) return Math.round(fullScore * 0.45);
  return 0;
}

function getFinalStateLabel({ totalScore, debtPending, loanValidated, selectedOfferId }) {
  if (selectedOfferId !== "offer-b" || !loanValidated) {
    return "No aprobado: decision riesgosa";
  }

  if (debtPending > 0) {
    return "No aprobado: debe reforzar pagos";
  }

  if (totalScore >= 90) return "Dominio logrado";
  if (totalScore >= 60) return "Aprobado";
  return "En proceso";
}

function getFinalMessage({ totalScore, debtPending, loanValidated, selectedOfferId, messages }) {
  if (selectedOfferId !== "offer-b" || !loanValidated) {
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

  if (totalScore >= 90) {
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

export function useWhatWouldYouDoLogic({ view, heroApi, data }) {
  const content = useMemo(
    () => mergeContent(DEFAULT_CONTENT, data?.game ?? {}),
    [data],
  );
  const viewId = getViewId(view);
  const persistedState = heroApi?.getInteractiveState?.(viewId)?.payload?.gameState;
  const [gameState, setGameState] = useState(() =>
    persistedState ? mergePersistedState(persistedState, content) : getInitialGameState(content),
  );
  const [materialsMessage, setMaterialsMessage] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [offerFeedback, setOfferFeedback] = useState(null);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [draftPayment, setDraftPayment] = useState(0);
  const [activeOfferId, setActiveOfferId] = useState(
    () => persistedState?.selectedOfferId ?? content.loanOffers[0]?.id ?? null,
  );

  const requiredMaterialIds = useMemo(
    () => content.materials.filter((item) => item.required).map((item) => item.id),
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
  const selectedRequiredCount = requiredMaterialIds.filter((id) =>
    gameState.selectedMaterials.includes(id),
  ).length;
  const selectedDistractors = content.materials.filter(
    (item) => !item.required && gameState.selectedMaterials.includes(item.id),
  );
  const isMaterialsCorrect =
    selectedRequiredCount === requiredMaterialIds.length &&
    selectedDistractors.length === 0 &&
    materialsTotal === 50 &&
    fundingNeeded === 38;

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
        activeOfferId ?? gameState.selectedOfferId ?? content.loanOffers[0]?.id,
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
        (strategy) => strategy.id === gameState.selectedPaymentStrategyId,
      ) ?? null,
    [content.paymentStrategies, gameState.selectedPaymentStrategyId],
  );
  const loanTotalToRepay = selectedOffer?.totalToRepay ?? 51;
  const loanTermWeeks = selectedOffer?.termWeeks ?? content.weeks.length;
  const initialReserve = Math.max(
    0,
    Number(selectedOffer?.amount ?? 0) - Number(gameState.fundingNeeded || fundingNeeded),
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
    [content.weeks, initialReserve, loanTotalToRepay, selectedPaymentStrategy?.id],
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
  const previousArrears = gameState.weeklyStates[currentWeekIndex - 1]?.arrears ?? 0;
  const plannedWeekPayment = Number(effectivePaymentPlan[currentWeekIndex] ?? 0);
  const availableThisWeek =
    Number(gameState.reserveRemaining ?? 0) + Number(currentWeek?.income ?? 0);
  const paymentTarget = Math.min(
    plannedWeekPayment + previousArrears,
    gameState.pendingAmount,
  );
  const maxAllowedPayment = Math.min(availableThisWeek, gameState.pendingAmount);
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
    gameState.selectedOfferId === "offer-b" &&
    gameState.loanValidated;
  const finalAvailableMoney = gameState.reserveRemaining;
  const netProfit = finalAvailableMoney - content.ownMoney;
  const finalStateLabel = getFinalStateLabel({
    totalScore,
    debtPending,
    loanValidated: gameState.loanValidated,
    selectedOfferId: gameState.selectedOfferId,
  });
  const finalMessage = getFinalMessage({
    totalScore,
    debtPending,
    loanValidated: gameState.loanValidated,
    selectedOfferId: gameState.selectedOfferId,
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
    if (!selectedPaymentStrategy || !gameState.paymentPlanConfirmed) return null;

    if (gameState.pendingAmount <= 0) {
      return {
        mode: "wait",
        title: "Prestamo completado",
        description: "Ya cancelaste toda la deuda. Esta semana solo registra el cierre sin pago.",
        helper: "Tu siguiente decision ya no requiere abonar nada.",
        suggestedPayment: 0,
        buttonLabel: content.copy.step3.waitWeekButton,
      };
    }

    if (selectedPaymentStrategy.id === "early") {
      if (currentWeek.week < earlyPayoffWeek) {
        return {
          mode: "wait",
          title: "Aun no toca pagar",
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
          description: "Con esta opcion guardas el dinero durante las primeras semanas.",
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
        description: "Ahora si debes intentar cancelar toda la deuda en una sola semana.",
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
    setDraftPayment(gameState.weeklyPayments[currentWeekIndex] ?? 0);
  }, [currentWeekIndex, gameState.paymentPlanConfirmed, gameState.weeklyPayments]);

  useEffect(() => {
    if (gameState.selectedOfferId) {
      setActiveOfferId(gameState.selectedOfferId);
    }
  }, [gameState.selectedOfferId]);

  useEffect(() => {
    if (!viewId) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: missionCompleted,
      type: "whatWouldYouDo",
      score: totalScore,
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
  }, [
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
    totalScore,
    viewId,
  ]);

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
        missingRequiredCount: requiredMaterialIds.length - selectedRequiredCount,
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
    setActiveOfferId(offerId);
    markOfferOpened(offerId);
    const recognizedInformalRisk =
      gameState.recognizedInformalRisk || offerId === "offer-d";
    const isSameFeedback =
      offerFeedback?.offerId === offerId && offerFeedback?.tone === "success";

    if (offer?.viable && isSameFeedback) {
      const nextState = {
        ...gameState,
        selectedOfferId: offerId,
        recognizedInformalRisk,
      };
      const rawScore = getLoanRawScore(nextState);
      const multiplier = getAttemptMultiplier(gameState.loanAttempts);
      const stepScore = Math.round(rawScore * multiplier);

      updateGameState({
        selectedOfferId: offerId,
        loanValidated: true,
        step: 3,
        recognizedInformalRisk,
        selectedPaymentStrategyId: null,
        paymentPlan: Array.from({ length: offer.termWeeks ?? content.weeks.length }, () => 0),
        paymentPlanConfirmed: false,
        paymentPlanAttempts: 0,
        currentWeek: 1,
        weeklyPayments: Array.from({ length: content.weeks.length }, () => 0),
        weeklyStates: [],
        pendingAmount: offer.totalToRepay ?? 51,
        reserveRemaining: Math.max(
          0,
          Number(offer.amount ?? 0) - Number(gameState.fundingNeeded || fundingNeeded),
        ),
        totalPaid: 0,
        paymentAttempts: Array.from({ length: content.weeks.length }, () => 0),
        paymentsCompleted: false,
        scoreBreakdown: {
          loan: stepScore,
        },
      });
      setPaymentMessage(null);
      return;
    }

    updateGameState({
      selectedOfferId: offerId,
      recognizedInformalRisk,
      loanAttempts:
        offer?.viable ? gameState.loanAttempts : gameState.loanAttempts + 1,
    });

    setOfferFeedback(
      offer?.viable
        ? {
            ...content.copy.messages.offerViable,
            offerId,
          }
        : {
            offerId,
            tone: "warning",
            title: content.copy.messages.offerInvalidTitle,
            text: offer?.detailMessage ?? content.copy.messages.offerInvalidFallback,
          },
    );
  }

  function handleOpenPaymentStrategy(strategyId) {
    updateGameState({
      selectedPaymentStrategyId: strategyId,
    });
    setPaymentMessage(null);
  }

  function handleConfirmPaymentStrategy() {
    const strategy = content.paymentStrategies.find(
      (item) => item.id === gameState.selectedPaymentStrategyId,
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
    const normalized = Number(String(nextValue).replace(/[^\d.]/g, ""));
    if (Number.isNaN(normalized)) {
      setDraftPayment(0);
      return;
    }
    setDraftPayment(Math.max(0, Math.min(normalized, maxAllowedPayment)));
  }

  function adjustDraftPayment(delta) {
    updateDraftPayment(Number(draftPayment ?? 0) + delta);
  }

  function commitWeekPayment(rawAmount) {
    const paidAmount = Number(rawAmount ?? 0);

    if (paidAmount < 0 || paidAmount > maxAllowedPayment) {
      setPaymentMessage(content.copy.messages.paymentInvalid);
      updateGameState({
        paymentAttempts: gameState.paymentAttempts.map((value, index) =>
          index === currentWeekIndex ? value + 1 : value,
        ),
      });
      return;
    }

    const previousTotalPaid = sum(gameState.weeklyPayments.slice(0, currentWeekIndex));
    const newTotalPaid = previousTotalPaid + paidAmount;
    const remaining = Math.max(0, loanTotalToRepay - newTotalPaid);
    const arrears = Math.max(0, expectedAccumulated[currentWeekIndex] - newTotalPaid);
    const nextReserve = Math.max(
      0,
      Number(gameState.reserveRemaining ?? 0) + Number(currentWeek.income ?? 0) - paidAmount,
    );
    const updatedPayments = [...gameState.weeklyPayments];
    updatedPayments[currentWeekIndex] = paidAmount;
    const updatedStates = [...gameState.weeklyStates];
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

    setPaymentMessage({
      tone: paidAmount >= paymentTarget ? "success" : "warning",
      title: `Semana ${currentWeek.week} registrada`,
      text:
        paidAmount >= paymentTarget
          ? `Cumpliste la meta semanal. Pagaste ${formatCurrency(
              paidAmount,
            )} y cierras la semana con ${formatCurrency(nextReserve)} disponibles.`
          : `Pagaste ${formatCurrency(paidAmount)}. Aun queda un atraso acumulado de ${formatCurrency(
              arrears,
            )} y cierras la semana con ${formatCurrency(nextReserve)} para la siguiente semana.`,
    });
  }

  function handleConfirmWeekPayment() {
    commitWeekPayment(draftPayment);
  }

  function handleApplySuggestedPayment(amount) {
    setDraftPayment(amount);
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

  async function handleFinishMission() {
    setMissionCompleted(true);
    heroApi?.setInteractiveState?.(viewId, {
      completed: true,
      type: "whatWouldYouDo",
      score: totalScore,
      countsTowardScore: true,
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
        weeklyStates: gameState.weeklyStates,
        totalPaid: gameState.totalPaid,
        finalAvailableMoney,
        netProfit,
        finalStateLabel,
        selectedOfferId: gameState.selectedOfferId,
        selectedOfferJustification: gameState.selectedOfferJustification,
        offersReviewed: gameState.openedOfferIds,
        approved: isApproved,
      },
    });
    await heroApi?.advanceCurrentView?.();
  }

  const currentStepTitle = content.stepTitles[gameState.step - 1];

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
    handleFinishMission,
  };
}
