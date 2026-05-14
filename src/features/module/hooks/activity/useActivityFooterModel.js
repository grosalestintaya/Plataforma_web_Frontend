import { useMemo } from "react";

function canUseBackendAttempt(activityId, missionAttempt) {
  // Una actividad con backend solo puede avanzar cuando ya existe attempt activo.
  return (
    Boolean(activityId) &&
    missionAttempt.status === "active" &&
    Boolean(missionAttempt.attemptId)
  );
}

function getViewId(view) {
  // Soporta vistas normalizadas y contenido legacy.
  return view?.id ?? view?.viewId ?? null;
}

function isFinishAction(model) {
  // `action` es el contrato nuevo; el label queda como fallback legacy.
  return model?.right?.action === "finish" || model?.right?.label === "Finalizar";
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

    const currentViewId = getViewId(currentView);
    const currentInteractiveState = currentViewId ? interactiveState[currentViewId] : null;
    const requiresCompletion = currentView?.nav?.mode === "lockedUntilComplete";
    const hasBackendAttempt = canUseBackendAttempt(activityId, missionAttempt);

    if (requiresCompletion) {
      // lockedUntilComplete delega en el estado interactivo de la vista actual.
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

    const isFinal = isFinishAction(model);
    if (!isFinal) return model;

    // La mision no debe poder cerrarse si existe actividad backend sin attempt.
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
