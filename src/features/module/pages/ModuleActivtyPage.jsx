import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/activity/ActivityHeader";
import Hero from "../components/activity/ActivityHero";
import Footer from "../components/activity/ActivityFooter";
import SceneBackground from "../components/ui/SceneBackground";
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

/**
 * ModuleActivityPage:
 * - Controla header, hero y footer de la actividad.
 * - Maneja intentos, salida voluntaria y advertencias al salir/recargar.
 */
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
  const moduleMenuPath = `/modules/${moduleCode}`;
  const missionAttempt = useMissionAttempt(activityId, { mode: "manual" });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const audio = useGameAudio({
    musicSrc: getModuleMusicSrc(moduleCode),
    musicScopeKey: moduleCode,
  });

  useEffect(() => {
    audio.playMusic();
  }, [audio.playMusic]);

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
    missionAttemptTrack: missionAttempt.track,
  });

  const { missionCompletion, nextMissionKey, registerMissionCompletion } =
    useActivityMissionCompletion(moduleData, safeMissionKey);

  const actions = useMemo(
    () => ({
      startMissionAttempt: async () => {
        if (!activityId) return { next: true };

        await missionAttempt.start();
        return { next: true };
      },
      /**
       * El CTA de postGame regresa al menu y deja la siguiente mision seleccionada.
       */
      goToNextMissionMenu: async ({ missionKey }) => {
        const preferredMissionKey = nextMissionKey ?? missionKey;

        navigate(moduleMenuPath, {
          state: {
            selectedActivityType: preferredMissionKey,
          },
        });

        return { next: false };
      },
    }),
    [activityId, missionAttempt, moduleMenuPath, navigate, nextMissionKey],
  );

  const player = useModulePlayer(moduleData, {
    initialMissionKey: safeMissionKey,
    actions,
    isViewAvailable,
    onFinishMission: async ({ missionKey, nextView, phase }) => {
      if (activityId && missionAttempt.attemptId) {
        const completionResult = await missionAttempt.completeMission({
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
  });

  useEffect(() => {
    if (player.missionKey !== safeMissionKey) player.setMission(safeMissionKey);
  }, [player.missionKey, player.setMission, safeMissionKey]);

  const footerModel = useActivityFooterModel({
    activityId,
    missionAttempt,
    footerModel: player.footerModel,
    currentView: player.view,
    interactiveState,
  });

  const heroApi = useMemo(
    () => ({
      ...player.heroApi,
      track: missionAttempt.track,
      setInteractiveState: setInteractiveViewState,
      getInteractiveState,
      resolveNextViewId,
      // Expone el resumen final para que Lobby postGame lea XP/coins reales.
      getMissionCompletion: () => missionCompletion,
      nextMissionKey,
    }),
    [
      getInteractiveState,
      missionCompletion,
      missionAttempt.track,
      nextMissionKey,
      player.heroApi,
      resolveNextViewId,
      setInteractiveViewState,
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
    missionKey: player.missionKey,
    moduleMenuPath,
    navigate,
    currentTemplate: player.view?.template,
    getInteractiveResponses: buildInteractiveResponsesPayload,
  });

  function handleOpenSettings() {
    setIsSettingsOpen(true);
  }

  function handleCloseSettings() {
    setIsSettingsOpen(false);
    audio.playSfx?.("closeModal");
  }

  return (
    <>
      <SceneBackground moduleCode={moduleCode} className="overflow-hidden">
        <div
          className="grid h-full min-h-0 w-full overflow-hidden"
          style={{
            // La pagina reparte header, hero y footer con alturas controladas.
            gridTemplateRows:
              "var(--activity-header-height, auto) minmax(0, 1fr) var(--activity-footer-height, auto)",
          }}>
          <Header
            moduleData={moduleData}
            missionKey={player.missionKey}
            themeHex={moduleData?.theme?.color}
            audioState={audio}
            onExitActivity={handleExitToMenu}
            onOpenSettings={handleOpenSettings}
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
            themeHex={moduleData?.theme?.color}
          />
        </div>
      </SceneBackground>

      <ConfiguracionModal
        open={isSettingsOpen}
        onRequestClose={handleCloseSettings}
        onRequestAbandon={() => {
          setIsSettingsOpen(false);
          handleExitToMenu();
        }}
        sfx={audio.sfx}
        music={audio.music}
        onChangeSfx={audio.setSfx}
        onChangeMusic={audio.setMusic}
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
