import { useMemo } from "react";

function canUseBackendAttempt(activityId, missionAttempt) {
  return (
    Boolean(activityId) &&
    missionAttempt.status === "active" &&
    Boolean(missionAttempt.attemptId)
  );
}

/**
 * Ajusta el footer base del player con reglas de backend e interactividad.
 * Asi la pagina no necesita rehacer estas validaciones en linea.
 */
export function useActivityFooterModel({
  activityId,
  missionAttempt,
  footerModel,
  currentView,
  interactiveState,
}) {
  return useMemo(() => {
    const model = footerModel;
    if (model?.type !== "normal") return model;

    const currentViewId = currentView?.id ?? currentView?.viewId;
    const currentInteractiveState = currentViewId ? interactiveState[currentViewId] : null;
    const requiresCompletion = currentView?.nav?.mode === "lockedUntilComplete";
    const hasBackendAttempt = canUseBackendAttempt(activityId, missionAttempt);

    if (requiresCompletion) {
      const canAdvance =
        Boolean(currentInteractiveState?.completed) &&
        (!activityId || hasBackendAttempt);
      const centerText = canAdvance
        ? model.centerText
        : missionAttempt.status === "starting"
          ? "Conectando..."
          : currentView?.nav?.label ?? "Completa el minijuego";

      return {
        ...model,
        centerText,
        right: {
          ...model.right,
          enabled: model.right.enabled && canAdvance,
        },
      };
    }

    const isFinal = model.right?.label === "Finalizar";
    if (!isFinal) return model;

    const canFinish = !activityId || hasBackendAttempt;

    return {
      ...model,
      centerText: canFinish
        ? model.centerText
        : missionAttempt.status === "starting"
          ? "Conectando..."
          : "Presiona Empezar",
      right: {
        ...model.right,
        enabled: model.right.enabled && canFinish,
        label: "Finalizar",
      },
    };
  }, [activityId, currentView, footerModel, interactiveState, missionAttempt]);
}
