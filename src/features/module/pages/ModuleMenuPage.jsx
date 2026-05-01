import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useGameAudio from "@/features/audio/useGameAudio";
import { getMascotForModule } from "@/features/guidepet/utils/mascotCatalog";
import {
  getMissionDisplayContent,
  getModuleDisplayTitle,
} from "../utils/moduleCatalog";
import { getModuleMusicSrc } from "../utils/moduleAudio";
import { getModuleTheme, MODULE_COLORS_HEX } from "../utils/moduleTheme";
import useModuleMenuData from "../hooks/useModuleMenuData";

import ModuleMenuHeader from "../components/menu/ModuleMenuHeader";
import SceneBackground from "../components/ui/SceneBackground";
import ModuleMenuBody from "../components/menu/ModuleMenuBody";
import ConfiguracionModal from "../components/sections/ConfiguracionModal";

export default function ModuleMenuPage() {
  const { moduleCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const audio = useGameAudio({
    musicSrc: getModuleMusicSrc(moduleCode),
    musicScopeKey: moduleCode,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lastHoverAtRef = useRef(0);

  // Si llegamos desde un postGame, el menu puede enfocar automaticamente
  // la siguiente mision sin mezclar esa logica con el layout.
  const preferredActivityType = location.state?.selectedActivityType ?? null;

  const {
    wallet,
    loading,
    error,
    moduleData,
    effectiveActivities,
    selectedActivity,
    selectedActivityId,
    setSelectedActivityId,
    canPlay,
    ctaLabel,
    mascotText,
  } = useModuleMenuData(moduleCode, {
    preferredActivityType,
  });

  // Estos datos base alimentan el frame del menu y no dependen del estado
  // interno del layout responsive.
  const mascot = useMemo(() => getMascotForModule(moduleCode), [moduleCode]);

  const modulePrimaryHex = useMemo(() => {
    return MODULE_COLORS_HEX[moduleCode] || getModuleTheme(moduleCode).primary;
  }, [moduleCode]);

  const moduleTitle = useMemo(() => {
    if (!moduleCode) return "";
    return getModuleDisplayTitle(moduleCode);
  }, [moduleCode]);

  const activityContent = useMemo(() => {
    if (!moduleCode || !selectedActivity?.type) return null;
    return getMissionDisplayContent(moduleCode, selectedActivity.type);
  }, [moduleCode, selectedActivity?.type]);

  // ModuleMenuPage.jsx
  useEffect(() => {
    audio.playMusic();
  }, [moduleCode]); // ✅ se dispara cada vez que cambia el módulo
  const playHover = useCallback(() => {
    const now = Date.now();
    if (now - lastHoverAtRef.current < 110) return;
    lastHoverAtRef.current = now;

    audio.playSfx?.("hover", { rate: 1.02 });
  }, [audio]);

  const handleSelectActivity = useCallback(
    (activityOrId) => {
      // Soporta tanto recibir el objeto activity completo como solo el id,
      // para no romper la logica actual mientras integras los hijos.
      const activity =
        typeof activityOrId === "object" && activityOrId !== null
          ? activityOrId
          : effectiveActivities.find((item) => {
              const id =
                item?.id_activity ?? item?.activityId ?? item?.id ?? null;
              return Number(id) === Number(activityOrId);
            });

      const nextId =
        activity?.id_activity ??
        activity?.activityId ??
        activity?.id ??
        activityOrId;

      if (!nextId) return;

      if (activity?.status === "locked") {
        audio.playSfx?.("error", { rate: 0.96 });
        return;
      }

      if (Number(nextId) === Number(selectedActivityId)) {
        playHover();
        return;
      }

      audio.playSfx?.("click", { rate: 1.02 });
      setSelectedActivityId(nextId);
    },
    [
      audio,
      effectiveActivities,
      playHover,
      selectedActivityId,
      setSelectedActivityId,
    ],
  );

  const handlePlay = useCallback(() => {
    if (!selectedActivity || !moduleData) return;

    if (selectedActivity.status === "locked") {
      audio.playSfx?.("error", { rate: 0.96 });
      return;
    }

    audio.playSfx?.("success", { rate: 1.03 });

    // El menu solo navega; el attempt se abre dentro de la mision.
    navigate(`/modules/m0${moduleData.sortOrder}/${selectedActivity.type}`);
  }, [audio, moduleData, navigate, selectedActivity]);

  const handleOpenSettings = useCallback(() => {
    audio.playSfx?.("openModal");
    setIsSettingsOpen(true);
  }, [audio]);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
    audio.playSfx?.("closeModal");
  }, [audio]);
  const handleClickDot = useCallback(() => {
    audio.playSfx?.("clickDot");
  }, [audio]);
  const handleExitModule = useCallback(() => {
    audio.playSfx?.("click");
    audio.stopMusic();
    setIsSettingsOpen(false);
    navigate("/");
  }, [audio, navigate]);

  const handleBack = useCallback(() => {
    audio.playSfx?.("click");
    audio.stopMusic();
    navigate("/");
  }, [audio, navigate]);

  const handleMascotClick = useCallback(() => {
    audio.playSfx?.("mascotTap");
  }, [audio]);

  if (loading) return <div className="p-6 text-white">Cargando modulo...</div>;
  if (error) return <div className="p-6 text-red-300">{error}</div>;

  if (!moduleData) {
    return (
      <div className="p-6 text-white">Modulo no encontrado: {moduleCode}</div>
    );
  }

  return (
    <>
      <SceneBackground moduleCode={moduleCode} className="overflow-hidden">
        {/* La pagina queda reducida al shell principal:
            header arriba y body abajo, como en ModuleActivityPage. */}
        <div
          className="grid h-full min-h-0 w-full overflow-hidden"
          style={{ gridTemplateRows: "auto minmax(0, 1fr)" }}>
          <ModuleMenuHeader
            title={moduleTitle || moduleData.title}
            themeHex={modulePrimaryHex}
            onBack={handleBack}
            onOpenSettings={handleOpenSettings}
            audioState={audio}
            wallet={wallet}
          />

          <ModuleMenuBody
            activities={effectiveActivities}
            selectedActivity={selectedActivity}
            selectedActivityId={selectedActivityId}
            activityContent={activityContent}
            mascot={mascot}
            mascotText={mascotText}
            themeHex={modulePrimaryHex}
            canPlay={canPlay}
            ctaLabel={ctaLabel}
            onSelectActivity={handleSelectActivity}
            onPlay={handlePlay}
            onHoverActivity={playHover}
            onClickMascot={handleMascotClick}
            audioState={audio}
            onClickDot={handleClickDot}
          />
        </div>
      </SceneBackground>

      <ConfiguracionModal
        open={isSettingsOpen}
        onRequestClose={handleCloseSettings}
        onRequestAbandon={handleExitModule}
        sfx={audio.sfx}
        music={audio.music}
        onChangeSfx={audio.setSfx}
        onChangeMusic={audio.setMusic}
        audioState={audio}
        title="Opciones"
        description="Saldras del modulo actual y volveras al inicio."
        abandonLabel="Volver al inicio"
      />
    </>
  );
}
