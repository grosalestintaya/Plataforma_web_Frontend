import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/activity/ActivityHeader";
import Hero from "../components/activity/ActivityHero";
import Footer from "../components/activity/ActivityFooter";
import SceneBackground from "../components/ui/SceneBackground";
import { MODULE_CONTENT_MAP } from "../content/content.registry";
import { useModulePlayer } from "../hooks/useModulePlayer";
import { useMissionAttempt } from "../hooks/useMissionAttempt";
import useGameAudio from "@/features/audio/useGameAudio";

// Reemplaza esta ruta por tu archivo real
import missionTheme from "@/assets/audios/mission-theme.mp3";

function getComparableInteractiveState(result = {}) {
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

  const [interactiveState, setInteractiveState] = useState({});
  const missionAttempt = useMissionAttempt(activityId, { mode: "manual" });

  // Hook de audio: aquí sí va
  const audio = useGameAudio({
    musicSrc: missionTheme,
  });

  useEffect(() => {
    audio.playMusic();

    return () => {
      audio.stopMusic();
    };
  }, [audio.playMusic, audio.stopMusic]);

  useEffect(() => {
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

      if (rule.includes !== undefined) {
        return (
          Array.isArray(sourceValue) && sourceValue.includes(rule.includes)
        );
      }

      if (rule.equals !== undefined) {
        return sourceValue === rule.equals;
      }

      if (rule.notIncludes !== undefined) {
        return (
          !Array.isArray(sourceValue) || !sourceValue.includes(rule.notIncludes)
        );
      }

      return true;
    },
    [interactiveState],
  );

  const missionScore = useMemo(() => {
    const scores = Object.values(interactiveState)
      .filter((entry) => entry?.countsTowardScore !== false)
      .map((entry) => Number(entry?.score))
      .filter((value) => Number.isFinite(value));

    if (!scores.length) return 0;

    return Math.round(
      scores.reduce((sum, value) => sum + value, 0) / scores.length,
    );
  }, [interactiveState]);

  const actions = useMemo(
    () => ({
      startMissionAttempt: async () => {
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
    isViewAvailable,
    onFinishMission: async ({ missionKey }) => {
      if (activityId && missionAttempt.attemptId) {
        await missionAttempt.completeMission({
          score: missionScore,
          extraPayload: { moduleCode, missionKey },
        });
      }

      audio.stopMusic();
      navigate(`/modules/${moduleCode}`);
    },
  });

  useEffect(() => {
    if (player.missionKey !== safeMissionKey) player.setMission(safeMissionKey);
  }, [player.missionKey, player.setMission, safeMissionKey]);

  const footerModel = useMemo(() => {
    const model = player.footerModel;
    if (model?.type !== "normal") return model;

    const currentView = player.view;
    const currentViewId = currentView?.id ?? currentView?.viewId;
    // La estructura nueva usa `viewId`, asi que el footer debe leer ambos.
    const currentInteractiveState = currentViewId ? interactiveState[currentViewId] : null;
    const currentInteractiveState = currentView
      ? interactiveState[currentView.id]
      : null;
    const requiresCompletion = currentView?.nav?.mode === "lockedUntilComplete";
    const hasBackendAttempt = canUseBackendAttempt(activityId, missionAttempt);

    if (requiresCompletion) {
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
      track: missionAttempt.track,
      setInteractiveState: setInteractiveViewState,
      getInteractiveState,
    }),
    [
      getInteractiveState,
      missionAttempt.track,
      player.heroApi,
      setInteractiveViewState,
    ],
  );

  return (
    <SceneBackground moduleCode={moduleCode} className="overflow-hidden">
      <div
        className="grid h-full min-h-0 w-full overflow-hidden"
        style={{
          // La pagina reparte header, hero y footer con alturas controladas.
          gridTemplateRows:
            "var(--activity-header-height, auto) minmax(0, 1fr) var(--activity-footer-height, auto)",
        }}
      >
        <Header
          moduleData={moduleData}
          missionKey={player.missionKey}
          themeHex={moduleData?.theme?.color}
          audioState={audio}
        />
        <Hero
          moduleData={moduleData}
          missionKey={player.missionKey}
          viewIndex={player.viewIndex}
          heroApi={heroApi}
        />

        <Footer
          model={footerModel}
          onUiClick={() => audio.playSfx?.("click")}
        />
      </div>
    </SceneBackground>
  );
}
