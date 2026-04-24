import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/activity/ActivityHeader";
import Hero from "../components/activity/ActivityHero";
import Footer from "../components/activity/ActivityFooter";
import ContentBackground from "../components/ui/ContentBackground";
import ActivityExitConfirmModal from "../components/sections/ActivityExitConfirmModal";
import ConfiguracionModal from "../components/sections/ConfiguracionModal";
import { MODULE_CONTENT_MAP } from "../content/content.registry";
import {
  useActivityExitGuards,
  useActivityFooterModel,
  useActivityInteractiveState,
  useActivityMissionCompletion,
  useMissionAttempt,
  useModulePlayer,
} from "../hooks/activity";
import useGameAudio from "@/features/audio/useGameAudio";
import { getModuleMusicSrc } from "../utils/moduleAudio";

const ACTIVITY_BACKGROUND_PROPS = {
  vignetteStrength: 0.16,
  topGlow: 0.07,
  bottomShade: 0.61,
  patternSize: 320,
  patternOpacity: 0.41,
  ambientOpacity: 0.85,
  className: "overflow-hidden",
};

const ACTIVITY_GRID_STYLE = {
  gridTemplateRows:
    "var(--activity-header-height, auto) minmax(0, 1fr) var(--activity-footer-height, auto)",
};

const ACTIVITY_GRID_CLASS = "grid h-full min-h-0 w-full overflow-hidden";
const MISSING_CONTENT_CLASS =
  "grid min-h-dvh place-items-center bg-slate-950 px-6 text-center text-white";

/**
 * ModuleActivityPage:
 * - Controla header, hero y footer de la actividad.
 * - Maneja intentos, salida voluntaria y advertencias al salir/recargar.
 */
export default function ModuleActivtyPage() {
  const { moduleCode, missionKey: missionKeyParam } = useParams();
  const moduleData = MODULE_CONTENT_MAP[moduleCode];

  if (!moduleData) {
    return (
      <div className={MISSING_CONTENT_CLASS}>
        No existe contenido para {moduleCode}
      </div>
    );
  }

  return (
    <ModuleActivityShell
      moduleCode={moduleCode}
      missionKeyParam={missionKeyParam}
      moduleData={moduleData}
    />
  );
}

function ModuleActivityShell({ moduleCode, missionKeyParam, moduleData }) {
  const navigate = useNavigate();

  const missionKeys = Object.keys(moduleData.missions ?? {});
  const safeMissionKey = moduleData.missions?.[missionKeyParam]
    ? missionKeyParam
    : missionKeys[0];
  const activityId = moduleData.missions?.[safeMissionKey]?.activityId;
  const moduleMenuPath = `/modules/${moduleCode}`;
  const missionAttempt = useMissionAttempt(activityId, { mode: "manual" });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    attemptId,
    completeMission,
    start: startAttempt,
    track,
  } = missionAttempt;

  const audio = useGameAudio({
    musicSrc: getModuleMusicSrc(moduleCode),
    musicScopeKey: moduleCode,
  });
  const { music, playMusic, playSfx, setMusic, setSfx, sfx } = audio;

  useEffect(() => {
    playMusic();
  }, [playMusic]);

  const {
    interactiveState,
    setInteractiveViewState,
    isViewAvailable,
    missionScore,
    getInteractiveState,
    resolveNextViewId,
    buildInteractiveResponsesPayload,
  } = useActivityInteractiveState({
    missionKey: safeMissionKey,
    moduleData,
    missionAttemptTrack: track,
  });

  const { missionCompletion, nextMissionKey, registerMissionCompletion } =
    useActivityMissionCompletion(moduleData, safeMissionKey);

  const beginMissionAttempt = useCallback(async () => {
    if (!activityId) return { next: true };

    await startAttempt();
    return { next: true };
  }, [activityId, startAttempt]);

  const goToNextMissionMenu = useCallback(
    async ({ missionKey }) => {
      const preferredMissionKey = nextMissionKey ?? missionKey;

      navigate(moduleMenuPath, {
        state: {
          selectedActivityType: preferredMissionKey,
        },
      });

      return { next: false };
    },
    [moduleMenuPath, navigate, nextMissionKey],
  );

  const actions = useMemo(
    () => ({
      startMissionAttempt: beginMissionAttempt,
      goToNextMissionMenu,
    }),
    [beginMissionAttempt, goToNextMissionMenu],
  );

  const handleFinishMission = useCallback(
    async ({ missionKey, nextView, phase }) => {
      if (activityId && attemptId) {
        const completionResult = await completeMission({
          score: missionScore,
          extraPayload: {
            moduleCode,
            missionKey,
            interactiveResponses: buildInteractiveResponsesPayload(),
          },
        });

        registerMissionCompletion(completionResult);
      }

      // Antes de entrar a postGame solo cerramos el attempt y dejamos la vista avanzar.
      if (phase === "beforePostGame" && nextView) {
        return { next: true };
      }

      navigate(moduleMenuPath, {
        state: nextMissionKey
          ? {
              selectedActivityType: nextMissionKey,
            }
          : undefined,
      });
    },
    [
      activityId,
      attemptId,
      buildInteractiveResponsesPayload,
      completeMission,
      missionScore,
      moduleCode,
      moduleMenuPath,
      navigate,
      nextMissionKey,
      registerMissionCompletion,
    ],
  );

  const player = useModulePlayer(moduleData, {
    initialMissionKey: safeMissionKey,
    actions,
    isViewAvailable,
    onFinishMission: handleFinishMission,
  });
  const {
    footerModel: playerFooterModel,
    heroApi: playerHeroApi,
    missionKey: currentMissionKey,
    setMission,
    view: currentView,
    viewIndex: currentViewIndex,
  } = player;

  useEffect(() => {
    if (currentMissionKey !== safeMissionKey) setMission(safeMissionKey);
  }, [currentMissionKey, safeMissionKey, setMission]);

  const footerModel = useActivityFooterModel({
    activityId,
    missionAttempt,
    footerModel: playerFooterModel,
    currentView,
    interactiveState,
  });

  const heroApi = useMemo(
    () => ({
      ...playerHeroApi,
      track,
      setInteractiveState: setInteractiveViewState,
      getInteractiveState,
      /**
       * Expone las vistas activas de la mision para que ciertos templates
       * puedan heredar datos dinamicos (por ejemplo, el saldo acumulado).
       */
      getMissionViews: () =>
        moduleData.missions?.[currentMissionKey]?.views ?? [],
      resolveNextViewId,
      // Expone el resumen final para que Lobby postGame lea XP/coins reales.
      getMissionCompletion: () => missionCompletion,
      nextMissionKey,
    }),
    [
      getInteractiveState,
      moduleData.missions,
      missionCompletion,
      nextMissionKey,
      playerHeroApi,
      currentMissionKey,
      resolveNextViewId,
      setInteractiveViewState,
      track,
    ],
  );

  const {
    isExitConfirmOpen,
    closeExitConfirmation,
    confirmExitToMenu,
    handleExitToMenu,
  } = useActivityExitGuards({
    activityId,
    missionAttempt,
    missionScore,
    moduleCode,
    missionKey: currentMissionKey,
    moduleMenuPath,
    navigate,
    currentTemplate: currentView?.template,
    getInteractiveResponses: buildInteractiveResponsesPayload,
  });

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
    playSfx?.("closeModal");
  }, [playSfx]);

  const handleAbandonFromSettings = useCallback(() => {
    setIsSettingsOpen(false);
    handleExitToMenu();
  }, [handleExitToMenu]);

  const handleFooterUiClick = useCallback(() => {
    playSfx?.("click");
  }, [playSfx]);

  const shouldHideFooter = /quiz/i.test(String(currentView?.template ?? ""));
  const activityGridStyle = shouldHideFooter
    ? {
        gridTemplateRows: "var(--activity-header-height, auto) minmax(0, 1fr)",
      }
    : ACTIVITY_GRID_STYLE;

  return (
    <>
      <ContentBackground moduleCode={moduleCode} {...ACTIVITY_BACKGROUND_PROPS}>
        <div className={ACTIVITY_GRID_CLASS} style={activityGridStyle}>
          <Header
            moduleData={moduleData}
            missionKey={currentMissionKey}
            themeHex={moduleData?.theme?.color}
            audioState={audio}
            onExitActivity={handleExitToMenu}
            onOpenSettings={handleOpenSettings}
          />
          <Hero
            moduleData={moduleData}
            missionKey={currentMissionKey}
            viewIndex={currentViewIndex}
            heroApi={heroApi}
          />

          {!shouldHideFooter ? (
            <Footer
              model={footerModel}
              onUiClick={handleFooterUiClick}
              themeHex={moduleData?.theme?.color}
            />
          ) : null}
        </div>
      </ContentBackground>

      <ConfiguracionModal
        open={isSettingsOpen}
        onRequestClose={handleCloseSettings}
        onRequestAbandon={handleAbandonFromSettings}
        sfx={sfx}
        music={music}
        onChangeSfx={setSfx}
        onChangeMusic={setMusic}
        title="Opciones"
        description="Saldras de la actividad actual y volveras al menu del modulo."
        abandonLabel="Salir de la actividad"
      />

      <ActivityExitConfirmModal
        open={isExitConfirmOpen}
        onRequestClose={closeExitConfirmation}
        onConfirmExit={confirmExitToMenu}
      />
    </>
  );
}
