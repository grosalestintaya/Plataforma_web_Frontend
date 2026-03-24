import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/activity/ActivityHeader";
import Hero from "../components/activity/ActivityHero";
import Footer from "../components/activity/ActivityFooter";
import SceneBackground from "../components/ui/SceneBackground";
import { MODULE_CONTENT_MAP } from "../content/content.registry";
import { useModulePlayer } from "../hooks/useModulePlayer";
import { useMissionAttempt } from "../hooks/useMissionAttempt";

function getComparableInteractiveState(result = {}) {
  // Compara solo los campos que afectan navegacion, score o ramas.
  return {
    completed: Boolean(result?.completed),
    score: Number(result?.score ?? 0),
    type: result?.type ?? "interactive",
    countsTowardScore: result?.countsTowardScore,
    selectedOptionId: result?.selectedOptionId ?? null,
    balance: result?.balance ?? null,
    total: result?.total ?? null,
    selectedProductIds: Array.isArray(result?.selectedProductIds)
      ? [...result.selectedProductIds].sort()
      : null,
  };
}

function hasInteractiveStateChanged(previousResult, nextResult) {
  return (
    JSON.stringify(getComparableInteractiveState(previousResult)) !==
    JSON.stringify(getComparableInteractiveState(nextResult))
  );
}

function canUseBackendAttempt(activityId, missionAttempt) {
  // Solo hay attempt real cuando la mision tiene activityId y ya se presiono Empezar.
  return (
    Boolean(activityId) &&
    missionAttempt.status === "active" &&
    Boolean(missionAttempt.attemptId)
  );
}

export default function ModuleActivtyPage() {
  const navigate = useNavigate();
  const { moduleCode, missionKey: missionKeyParam } = useParams();

  const moduleData = MODULE_CONTENT_MAP[moduleCode];
  if (!moduleData) return <div>No existe contenido para {moduleCode}</div>;

  const missionKeys = Object.keys(moduleData.missions ?? {});
  const safeMissionKey = moduleData.missions?.[missionKeyParam]
    ? missionKeyParam
    : missionKeys[0];
  const activityId = moduleData.missions?.[safeMissionKey]?.activityId;

  // Guarda el resultado del minijuego actual para el score final.
  const [interactiveState, setInteractiveState] = useState({});
  // El attempt sigue siendo manual: se abre desde la vista intro con "Empezar".
  const missionAttempt = useMissionAttempt(activityId, { mode: "manual" });

  useEffect(() => {
    // Cambiar de mision limpia el estado local del score.
    setInteractiveState({});
  }, [safeMissionKey]);

  const setInteractiveViewState = useCallback(
    (viewId, result) => {
      if (!viewId) return;

      let didChange = false;

      setInteractiveState((prev) => {
        const nextResult = {
          ...prev[viewId],
          ...result,
        };

        // Evita re-render y tracking cuando el estado util no cambio.
        if (!hasInteractiveStateChanged(prev[viewId], nextResult)) {
          return prev;
        }

        didChange = true;

        return {
          ...prev,
          [viewId]: nextResult,
        };
      });

      if (!didChange) return;

      // Cada minijuego reporta su progreso para enviarlo al cerrar.
      missionAttempt.track({
        type: "interactive_result",
        viewId,
        gameType: result?.type ?? "interactive",
        completed: Boolean(result?.completed),
        score: Number(result?.score ?? 0),
      });
    },
    [missionAttempt.track],
  );

  const isViewAvailable = useCallback(
    (view) => {
      const rule = view?.when;
      if (!rule) return true;

      const sourceState = interactiveState[rule.viewId];
      const sourceValue = sourceState?.[rule.stateKey];

      // Permite mostrar una vista solo si el array incluye un valor concreto.
      if (rule.includes !== undefined) {
        return Array.isArray(sourceValue) && sourceValue.includes(rule.includes);
      }

      // Permite mostrar una vista solo si el valor coincide exactamente.
      if (rule.equals !== undefined) {
        return sourceValue === rule.equals;
      }

      // Permite ocultar una vista cuando un valor ya fue elegido antes.
      if (rule.notIncludes !== undefined) {
        return !Array.isArray(sourceValue) || !sourceValue.includes(rule.notIncludes);
      }

      return true;
    },
    [interactiveState],
  );

  const missionScore = useMemo(() => {
    // Solo usa las vistas que realmente cuentan para el score final.
    const scores = Object.values(interactiveState)
      .filter((entry) => entry?.countsTowardScore !== false)
      .map((entry) => Number(entry?.score))
      .filter((value) => Number.isFinite(value));

    if (!scores.length) return 0;

    return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  }, [interactiveState]);

  const actions = useMemo(
    () => ({
      // Esta accion la invoca la vista inicial de la mision.
      startMissionAttempt: async () => {
        // Si no existe backend todavia, la intro solo desbloquea la mision local.
        if (!activityId) return { next: true };

        await missionAttempt.start();
        return { next: true };
      },
    }),
    [activityId, missionAttempt],
  );

  const player = useModulePlayer(moduleData, {
    initialMissionKey: safeMissionKey,
    actions,
    // Las ramas usan el estado interactivo para decidir si una vista existe o se salta.
    isViewAvailable,
    onFinishMission: async ({ missionKey }) => {
      // Si existe backend y el attempt esta activo, cierra el intento real.
      if (activityId && missionAttempt.attemptId) {
        await missionAttempt.completeMission({
          score: missionScore,
          extraPayload: { moduleCode, missionKey },
        });
      }

      navigate(`/modules/${moduleCode}`);
    },
  });

  useEffect(() => {
    // Si cambia la URL, el player se mueve a esa mision.
    if (player.missionKey !== safeMissionKey) player.setMission(safeMissionKey);
  }, [player.missionKey, player.setMission, safeMissionKey]);

  const footerModel = useMemo(() => {
    const model = player.footerModel;
    if (model?.type !== "normal") return model;

    const currentView = player.view;
    const currentInteractiveState = currentView ? interactiveState[currentView.id] : null;
    const requiresCompletion = currentView?.nav?.mode === "lockedUntilComplete";
    const hasBackendAttempt = canUseBackendAttempt(activityId, missionAttempt);

    if (requiresCompletion) {
      // El minijuego debe marcarse como completo antes de avanzar o finalizar.
      const canAdvance =
        Boolean(currentInteractiveState?.completed) &&
        (!activityId || hasBackendAttempt);

      return {
        ...model,
        right: {
          ...model.right,
          enabled: model.right.enabled && canAdvance,
          label: canAdvance
            ? model.right.label
            : missionAttempt.status === "starting"
              ? "Conectando..."
              : "Completa el minijuego",
        },
      };
    }

    const isFinal = model.right?.label === "Finalizar";
    if (!isFinal) return model;

    // El cierre final solo exige attempt si la mision realmente usa backend.
    const canFinish = !activityId || hasBackendAttempt;

    return {
      ...model,
      right: {
        ...model.right,
        enabled: model.right.enabled && canFinish,
        label: canFinish
          ? "Finalizar"
          : missionAttempt.status === "starting"
            ? "Conectando..."
            : "Presiona Empezar",
      },
    };
  }, [
    activityId,
    interactiveState,
    missionAttempt,
    player.footerModel,
    player.view,
  ]);

  const getInteractiveState = useCallback(
    (viewId) => interactiveState[viewId] ?? null,
    [interactiveState],
  );

  const heroApi = useMemo(
    () => ({
      ...player.heroApi,
      // Los bloques interactivos usan esto para registrar eventos finos.
      track: missionAttempt.track,
      // Los minijuegos usan esto para subir score y estado de completado.
      setInteractiveState: setInteractiveViewState,
      // Permite que una vista consulte resultados previos del mismo recorrido.
      getInteractiveState,
    }),
    [getInteractiveState, missionAttempt.track, player.heroApi, setInteractiveViewState],
  );

  return (
    <SceneBackground moduleCode={moduleCode} className="overflow-hidden">
      <div className="grid min-h-screen w-full grid-rows-[auto_minmax(0,1fr)_auto]">
        <Header
          moduleData={moduleData}
          missionKey={player.missionKey}
          themeHex={moduleData?.theme?.color}
        />

        <Hero
          moduleData={moduleData}
          missionKey={player.missionKey}
          viewIndex={player.viewIndex}
          heroApi={heroApi}
        />

        <Footer model={footerModel} />
      </div>
    </SceneBackground>
  );
}
