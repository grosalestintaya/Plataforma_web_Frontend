import { useCallback, useEffect, useMemo, useState } from "react";
import {
  evaluateOpportunity,
  formatCollectCurrency,
  getCaptureScore,
  getCollectObjectsModel,
  getRequiredAmount,
} from "./collectObjects.config";
import { getCollectObjectsRuntime } from "./collectObjects.runtime";

const EMPTY_ENGINE_STATE = Object.freeze({
  collected: 0,
  completed: false,
  failed: false,
  currentRound: 0,
  completionWeek: 0,
  restartCount: 0,
  history: [],
});

export function useCollectObjectsController({ view, data, heroApi }) {
  const model = useMemo(
    () => getCollectObjectsModel({ view, data, heroApi }),
    [data, heroApi, view],
  );
  const [engineState, setEngineState] = useState(EMPTY_ENGINE_STATE);
  const hasSurplus = model.sourcePayload.surplusAmount > 0;
  const [surplusStep, setSurplusStep] = useState(
    hasSurplus ? "intro" : "noSurplus",
  );
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [surplusResult, setSurplusResult] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [surplusCompleted, setSurplusCompleted] = useState(false);

  useEffect(() => {
    setEngineState(EMPTY_ENGINE_STATE);
    setSurplusStep(hasSurplus ? "intro" : "noSurplus");
    setSelectedOpportunityId(null);
    setSurplusResult(null);
    setValidationMessage("");
    setSurplusCompleted(false);
  }, [hasSurplus, model.viewId]);

  const selectedOpportunity = model.surplus.opportunities.find(
    (item) => item.id === selectedOpportunityId,
  );
  const captureScore = getCaptureScore(
    engineState.completionWeek,
    engineState.restartCount,
  );
  const missionScore =
    model.mode === "falling"
      ? captureScore
      : model.sourcePayload.captureScore + (surplusResult?.score ?? 0);

  const buildSurplusInteractiveState = useCallback(
    (completed = surplusCompleted) => ({
      type: "collectObjects",
      completed,
      score: surplusResult?.score ?? 0,
      missionScoreOverride: missionScore,
      collected:
        surplusResult?.finalSurplusAmount ?? model.sourcePayload.surplusAmount,
      payload: {
        mode: "surplusDecision",
        step: surplusStep,
        selectedOpportunityId,
        ...model.sourcePayload,
        ...surplusResult,
        totalScore: missionScore,
      },
    }),
    [
      missionScore,
      model.sourcePayload,
      selectedOpportunityId,
      surplusCompleted,
      surplusResult,
      surplusStep,
    ],
  );

  const handleEngineStateChange = useCallback((nextState) => {
    setEngineState(nextState);
  }, []);

  useEffect(() => {
    if (!model.viewId) return;

    if (model.mode === "falling") {
      const protectedGoalAmount = Math.min(
        engineState.collected,
        model.targetAmount,
      );
      heroApi?.setInteractiveState?.(model.viewId, {
        type: "collectObjects",
        completed: engineState.completed,
        score: captureScore,
        collected: engineState.collected,
        payload: {
          targetAmount: model.targetAmount,
          collectedAmount: engineState.collected,
          protectedGoalAmount,
          surplusAmount: Math.max(0, engineState.collected - model.targetAmount),
          captureScore,
          completionWeek: engineState.completionWeek,
          restartCount: engineState.restartCount,
          history: engineState.history,
          target: model.target,
        },
      });
      return;
    }

    heroApi?.setInteractiveState?.(
      model.viewId,
      buildSurplusInteractiveState(),
    );
  }, [
    captureScore,
    buildSurplusInteractiveState,
    engineState,
    heroApi,
    missionScore,
    model,
    selectedOpportunityId,
    surplusCompleted,
    surplusResult,
    surplusStep,
  ]);

  function selectOpportunity(opportunity) {
    setSelectedOpportunityId(opportunity?.id ?? null);
    setValidationMessage("");
  }

  function continueToDistribution() {
    if (!selectedOpportunity) {
      setValidationMessage("Selecciona una oportunidad para continuar.");
      return;
    }
    if (
      getRequiredAmount(selectedOpportunity) >
      model.sourcePayload.surplusAmount
    ) {
      setValidationMessage("No tienes excedente suficiente para esta oportunidad.");
      return;
    }
    setValidationMessage("");
    setSurplusStep("distribution");
  }

  function resolveOpportunity() {
    if (!selectedOpportunity) return;
    setSurplusResult(
      evaluateOpportunity(
        selectedOpportunity,
        model.sourcePayload.surplusAmount,
      ),
    );
    setSurplusStep("result");
  }

  const detailItems =
    model.mode === "falling"
      ? engineState.history.map((entry) => ({
          label: `${model.engine.roundLabel} ${entry.round}: ${entry.label}`,
          value: `${entry.amount >= 0 ? "+" : "-"}${formatCollectCurrency(Math.abs(entry.amount))}`,
        }))
      : [
          {
            label: "Oportunidad elegida",
            value: selectedOpportunity?.title ?? "Sin seleccionar",
          },
          {
            label: "Excedente inicial",
            value: formatCollectCurrency(model.sourcePayload.surplusAmount),
          },
          {
            label: "Excedente final",
            value: formatCollectCurrency(
              surplusResult?.finalSurplusAmount ??
                model.sourcePayload.surplusAmount,
            ),
          },
        ];

  return {
    ...model,
    engineState,
    captureScore,
    missionScore,
    surplusStep,
    selectedOpportunity,
    selectedOpportunityId,
    surplusResult,
    validationMessage,
    surplusCompleted,
    detailItems,
    handleEngineStateChange,
    selectOpportunity,
    continueToDistribution,
    resolveOpportunity,
    goToIntro: () => setSurplusStep(hasSurplus ? "intro" : "noSurplus"),
    goToOpportunities: () => setSurplusStep("opportunities"),
    goBackToOpportunities: () => setSurplusStep("opportunities"),
    finalizeSurplus: () => {
      setSurplusCompleted(true);
      heroApi?.setInteractiveState?.(
        model.viewId,
        buildSurplusInteractiveState(true),
      );
    },
  };
}

export function CollectObjectsMissionController({ renderRuntime, ...props }) {
  const controller = useCollectObjectsController(props);
  return renderRuntime(getCollectObjectsRuntime(controller));
}
