import React, { useEffect, useMemo, useState } from "react";
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

  const handlePlay = () => {
    if (!selectedActivity || !moduleData) return;
    if (selectedActivity.status === "locked") return;

    // El menu solo navega; el attempt se abre dentro de la mision.
    navigate(`/modules/m0${moduleData.sortOrder}/${selectedActivity.type}`);
  };

  useEffect(() => {
    // El menu tambien arranca la misma musica del modulo.
    audio.playMusic();
  }, [audio.playMusic]);

  function handleOpenSettings() {
    setIsSettingsOpen(true);
  }

  function handleCloseSettings() {
    setIsSettingsOpen(false);
    audio.playSfx?.("closeModal");
  }

  function handleExitModule() {
    audio.playSfx?.("click");
    audio.stopMusic();
    setIsSettingsOpen(false);
    navigate("/");
  }

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
          style={{ gridTemplateRows: "auto minmax(0, 1fr)" }}
        >
          <ModuleMenuHeader
            title={moduleTitle || moduleData.title}
            themeHex={modulePrimaryHex}
            onBack={() => {
              audio.stopMusic();
              navigate("/");
            }}
            onOpenSettings={handleOpenSettings}
            audioState={audio}
          />

          <ModuleMenuBody
            activities={effectiveActivities}
            selectedActivity={selectedActivity}
            selectedActivityId={selectedActivityId}
            activityContent={activityContent}
            mascot={mascot}
            mascotText={mascotText}
            wallet={wallet}
            themeHex={modulePrimaryHex}
            canPlay={canPlay}
            ctaLabel={ctaLabel}
            onSelectActivity={setSelectedActivityId}
            onPlay={handlePlay}
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
        title="Opciones"
        description="Saldras del modulo actual y volveras al inicio."
        abandonLabel="Volver al inicio"
      />
    </>
  );
}
