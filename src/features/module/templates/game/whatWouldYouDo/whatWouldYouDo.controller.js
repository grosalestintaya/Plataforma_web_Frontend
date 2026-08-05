import { useMemo, useReducer } from "react";
import {
  createLoanInitialState,
  formatLoanCurrency,
  getWhatWouldYouDoModel,
  loanReducer,
  selectLoanGame,
} from "./whatWouldYouDo.config";
import { getWhatWouldYouDoRuntime } from "./whatWouldYouDo.runtime";
import { useMissionStatePersistence } from "../shared/useMissionStatePersistence";

function getMessage(copy, key, fallback) {
  return copy?.messages?.[key] ?? fallback;
}

function createAside(model, state, selection) {
  const copy = model.copy;

  if (state.step === 1) {
    return {
      title: model.stepTitles?.[0] ?? "Inicio del emprendimiento",
      sectionTitle: copy.step1.asideTitle ?? "Productos a vender",
      cards: model.products.map((product) => ({
        id: product.id,
        title: product.sidebarLabel ?? product.label,
        text: `${product.quantity} unidades`,
        media: product.media,
      })),
      metrics: [
        {
          label: copy.step1.ownMoneyLabel ?? "Dinero propio",
          value: formatLoanCurrency(model.ownMoney),
        },
        {
          label: "Dinero necesario",
          value: formatLoanCurrency(selection.fundingNeeded),
        },
      ],
      message: state.message,
    };
  }

  if (state.step === 2) {
    const offer = selection.activeOffer;
    const loanAmount = Number(offer?.amount);
    const loanTotal = Number(offer?.totalToRepay);
    const interest =
      Number.isFinite(loanAmount) && Number.isFinite(loanTotal)
        ? Math.max(0, loanTotal - loanAmount)
        : null;

    return {
      _legacyTitle: copy.step2.mainTitle ?? "Comparo préstamos",
      metrics: [
        {
          label: copy.step2.neededMoneyLabel ?? "Dinero que necesito",
          value: formatLoanCurrency(selection.fundingNeeded),
        },
        {
          label: "Oferta revisada",
          value: offer?.name ?? "Selecciona una oferta",
        },
        {
          label: "Total a devolver",
          value: Number.isFinite(Number(offer?.totalToRepay))
            ? formatLoanCurrency(offer.totalToRepay)
            : "No informado",
        },
      ],
      title: model.stepTitles?.[1] ?? "Comparo préstamos",
      offerName: offer?.name ?? "Selecciona una oferta",
      detailMetrics: [
        {
          label: "Monto prestado",
          value: Number.isFinite(loanAmount)
            ? formatLoanCurrency(loanAmount)
            : "No informado",
        },
        {
          label: "Total a devolver",
          value: Number.isFinite(loanTotal)
            ? formatLoanCurrency(loanTotal)
            : "No informado",
        },
        {
          label: "Interes",
          value: Number.isFinite(interest)
            ? formatLoanCurrency(interest)
            : "No informado",
        },
        {
          label: "Plazo",
          value: Number.isFinite(Number(offer?.termWeeks))
            ? `${offer.termWeeks} semanas`
            : "Poco claro",
        },
      ],
      review: {
        title: copy.step2.reviewTitle ?? "Revisa la oferta seleccionada",
        text:
          copy.step2.reviewText ??
          "Comprueba si el monto te alcanza y si el pago final se puede organizar.",
      },
      message: state.message,
      action: {
        label: copy.step2.chooseButton ?? "Elegir esta oferta",
        disabled: !offer,
      },
    };
  }

  if (state.step === 3) {
    const selectedOffer = selection.selectedOffer;
    const loanAmount = Number(selectedOffer?.amount);
    const loanTotal = Number(selectedOffer?.totalToRepay);
    const interest =
      Number.isFinite(loanAmount) && Number.isFinite(loanTotal)
        ? Math.max(0, loanTotal - loanAmount)
        : null;
    const surplus =
      Number.isFinite(loanAmount) && Number.isFinite(selection.fundingNeeded)
        ? Math.max(0, loanAmount - selection.fundingNeeded)
        : null;
    const termWeeks = Number(selectedOffer?.termWeeks);
    const installment =
      Number.isFinite(loanTotal) && Number.isFinite(termWeeks) && termWeeks > 0
        ? loanTotal / termWeeks
        : null;

    return {
      title: state.paymentPlanConfirmed
        ? copy.step3.executionTitle ?? "Cumplo mi plan de pagos"
        : copy.step3.sidebarHeroTitle ?? "Armando mi plan de pago",
      sectionTitle: "Información previa",
      detailMetrics: [
        {
          label: "Prestamo (P)",
          value: Number.isFinite(loanAmount)
            ? formatLoanCurrency(loanAmount)
            : "-",
        },
        {
          label: "Plazo",
          value: Number.isFinite(termWeeks) ? `${termWeeks} semanas` : "-",
        },
        {
          label: "Interes (I)",
          value: Number.isFinite(interest) ? formatLoanCurrency(interest) : "-",
        },
        {
          label: "Gastado (G)",
          value: formatLoanCurrency(selection.fundingNeeded),
        },
        {
          label: "Total (P + I)",
          value: Number.isFinite(loanTotal) ? formatLoanCurrency(loanTotal) : "-",
        },
        {
          label: "Sobrante (P - G)",
          value: Number.isFinite(surplus) ? formatLoanCurrency(surplus) : "-",
        },
      ],
      review: {
        title: "Cuota aproximada por semana",
        text: Number.isFinite(installment)
          ? `Se divide el total a pagar (${formatLoanCurrency(loanTotal)}) entre el plazo (${termWeeks} semanas) ${formatLoanCurrency(installment)} aprox.`
          : "Revisa el total a pagar y el plazo para calcular la cuota.",
      },
      metrics: [
        {
          label: "Oferta elegida",
          value: selection.selectedOffer?.name ?? "-",
        },
        {
          label: "Deuda pendiente",
          value: formatLoanCurrency(state.debtRemaining),
        },
        {
          label: "Semana actual",
          value: `${state.currentWeek} de ${model.weeks.length}`,
        },
        {
          label: "Disponible",
          value: formatLoanCurrency(selection.availableThisWeek),
        },
      ],
      message: state.message,
    };
  }

  return {
    title: copy.step4.generalInfoTitle ?? "Resultado",
    metrics: [
      { label: "Puntaje", value: `${selection.totalScore}/100` },
      {
        label: "Préstamo pagado",
        value: formatLoanCurrency(state.totalPaid),
      },
      {
        label: "Caja final",
        value: formatLoanCurrency(selection.finalAvailableMoney),
      },
      {
        label: "Ganancia neta",
        value: formatLoanCurrency(selection.netProfit),
      },
    ],
  };
}

export function useWhatWouldYouDoController({ view, heroApi, data }) {
  const model = useMemo(
    () => getWhatWouldYouDoModel({ view, data }),
    [data, view],
  );
  const persisted = heroApi?.getInteractiveState?.(model.viewId);
  const [state, dispatch] = useReducer(
    loanReducer,
    { model, persisted },
    ({ model: initialModel, persisted: saved }) =>
      createLoanInitialState(initialModel, saved),
  );
  const selection = selectLoanGame(model, state);
  const materialShopItems = model.materials.map((material) => ({
    ...material,
    title: { text: material.label, variant: "helper", align: "center" },
    text: {
      text: formatLoanCurrency(material.price),
      variant: "caption",
      align: "center",
    },
    interaction: { type: "selectable" },
    zoomable: false,
  }));
  const materialsCalculatorData = {
    title: {
      text: model.copy.step1.shoppingTitle ?? "Mi selección",
      variant: "h3",
      align: "center",
    },
    emptyLabel:
      model.copy.step1.emptySelectionLabel ?? "Elige uno o más materiales.",
    summaryLabels: model.copy.step1.summaryLabels,
    submitLabel: state.materialsValidated
      ? model.copy.step1.nextButton
      : model.copy.step1.reviewButton,
  };

  const snapshot = useMemo(
    () => ({
      completed: state.completed,
      type: "whatWouldYouDo",
      score: selection.totalScore,
      missionScoreOverride: selection.totalScore,
      countsTowardScore: state.completed,
      payload: {
        gameState: state,
        selectedOfferId: state.selectedOfferId,
        weeklyPayments: state.weeklyPayments,
        totalPaid: state.totalPaid,
        finalAvailableMoney: selection.finalAvailableMoney,
        netProfit: selection.netProfit,
        approved: state.completed && state.debtRemaining <= 0,
      },
    }),
    [
      selection.finalAvailableMoney,
      selection.netProfit,
      selection.totalScore,
      state,
    ],
  );
  useMissionStatePersistence({
    heroApi,
    viewId: model.viewId,
    snapshot,
  });

  function reviewMaterials() {
    dispatch({
      type: "validateMaterials",
      valid: selection.materialsCorrect,
      message: selection.materialsCorrect
        ? getMessage(model.copy, "materialsSuccess", {
            tone: "success",
            text: "La lista está completa.",
          })
        : getMessage(model.copy, "materialsGeneric", {
            tone: "warning",
            text: "Selecciona únicamente los materiales necesarios.",
          }),
    });
  }

  function chooseOffer(offerId) {
    const offer = model.loanOffers.find((item) => item.id === offerId);
    const valid =
      offer &&
      (offer.passable || offer.recommended || offer.viable) &&
      Number.isFinite(Number(offer.totalToRepay)) &&
      Number(offer.amount) >= selection.fundingNeeded;

    if (!valid) {
      dispatch({
        type: "paymentError",
        message: {
          tone: "warning",
          text: offer?.detailMessage ?? "La oferta no permite planificar el pago.",
        },
      });
      return;
    }

    dispatch({
      type: "chooseOffer",
      offer,
      fundingNeeded: selection.fundingNeeded,
    });
  }

  function updateDraftPayment(value) {
    const normalized = String(value ?? "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1");
    dispatch({ type: "setDraft", value: normalized });
  }

  function commitPayment(rawAmount) {
    const amount = Math.max(0, Number(rawAmount ?? 0));
    const allowZero = state.selectedStrategyId !== "regulated";
    if (
      (!allowZero && amount <= 0) ||
      amount > selection.availableThisWeek ||
      amount > state.debtRemaining
    ) {
      dispatch({
        type: "paymentError",
        message: getMessage(model.copy, "paymentInvalid", {
          tone: "warning",
          text: "El monto supera el dinero disponible o la deuda pendiente.",
        }),
      });
      return;
    }

    const remaining = Math.max(0, state.debtRemaining - amount);
    const expected = selection.suggestedPayment;
    const fullScore = Number(selection.currentWeek.fullScore ?? 10);
    dispatch({
      type: "payWeek",
      index: selection.currentWeekIndex,
      amount,
      remaining,
      score: amount >= Math.min(expected, state.debtRemaining)
        ? fullScore
        : Math.round(fullScore / 2),
      message: {
        tone: amount >= expected ? "success" : "warning",
        text:
          remaining <= 0
            ? "Completaste el pago del préstamo."
            : `Queda una deuda de ${formatLoanCurrency(remaining)}.`,
      },
    });
  }

  function continueAfterWeek() {
    if (
      !state.weeklyStates[selection.currentWeekIndex] &&
      state.debtRemaining > 0
    ) {
      return;
    }
    dispatch({
      type: "advanceWeek",
      finished:
        state.debtRemaining <= 0 ||
        selection.currentWeekIndex >= model.weeks.length - 1,
    });
  }

  const aside = createAside(model, state, selection);

  return {
    content: model,
    gameState: state,
    aside,
    materialsMessage: state.step === 1 ? state.message : null,
    draftPayment: state.draftPayment,
    materialShopItems,
    selectedMaterialItems: selection.selectedMaterials,
    materialsCalculatorData,
    materialsTotal: selection.materialsTotal,
    activeOffer: selection.activeOffer,
    selectedOffer: selection.selectedOffer,
    selectedPaymentStrategy: selection.selectedStrategy,
    strategyExecutionConfig: {
      mode: state.selectedStrategyId,
      suggestedPayment: selection.suggestedPayment,
    },
    currentWeekIndex: selection.currentWeekIndex,
    currentWeek: selection.currentWeek,
    currentWeekSalesSummary: selection.currentWeek.description,
    availableThisWeek: selection.availableThisWeek,
    paymentTarget: selection.suggestedPayment,
    debtPending: state.debtRemaining,
    finalAvailableMoney: selection.finalAvailableMoney,
    netProfit: selection.netProfit,
    toggleMaterial: (id) => dispatch({ type: "toggleMaterial", id }),
    removeMaterial: (item) =>
      dispatch({ type: "toggleMaterial", id: item?.id }),
    handleReviewMaterials: reviewMaterials,
    goToStep: (step) => dispatch({ type: "goToStep", step }),
    handleOpenOffer: (id) => dispatch({ type: "openOffer", id }),
    handleChooseOffer: chooseOffer,
    handleOpenPaymentStrategy: (id) =>
      dispatch({ type: "selectStrategy", id }),
    handleConfirmPaymentStrategy: (id) => {
      if (id) dispatch({ type: "selectStrategy", id });
      dispatch({ type: "confirmStrategy" });
    },
    updateDraftPayment,
    handleConfirmWeekPayment: () => commitPayment(state.draftPayment),
    handleApplySuggestedPayment: commitPayment,
    handleContinueAfterWeek: continueAfterWeek,
  };
}

export function WhatWouldYouDoMissionController({ renderRuntime, ...props }) {
  const controller = useWhatWouldYouDoController(props);
  return renderRuntime(getWhatWouldYouDoRuntime(controller));
}
