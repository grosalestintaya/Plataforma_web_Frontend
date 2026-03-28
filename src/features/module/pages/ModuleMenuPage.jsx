import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMascotForModule } from "@/features/guidepet/utils/mascotCatalog";
import { getModuleTheme, MODULE_COLORS_HEX } from "../utils/moduleTheme";
import useModuleMenuData from "../hooks/useModuleMenuData";
import SceneBackground from "../components/ui/SceneBackground";
import QuipuHeader from "../components/menu/QuipuHeader";
import ModuleMenuLayout from "../components/menu/ModuleMenuLayout";
import ModuleMenuSelectorPanel from "../components/menu/ModuleMenuSelectorPanel";
import ModuleMenuActivityPanel from "../components/menu/ModuleMenuActivityPanel";
import ModuleMenuMascotPanel from "../components/menu/ModuleMenuMascotPanel";
import {
  getMissionDisplayContent,
  getModuleDisplayTitle,
} from "../utils/moduleCatalog";

export default function ModuleMenuPage() {
  const { moduleCode } = useParams();
  const navigate = useNavigate();

  const theme = useMemo(() => getModuleTheme(moduleCode), [moduleCode]);
  const mascot = useMemo(() => getMascotForModule(moduleCode), [moduleCode]);
  const modulePrimaryHex = MODULE_COLORS_HEX[moduleCode] || theme.primary;

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
  } = useModuleMenuData(moduleCode);

  const moduleTitle = useMemo(() => {
    if (!moduleCode) return "";
    // El titulo visible del menu sale de modulos.json.
    return getModuleDisplayTitle(moduleCode);
  }, [moduleCode]);

  const activityContent = useMemo(() => {
    if (!moduleCode || !selectedActivity?.type) return null;
    // La tarjeta central usa la misma metadata oficial del contenido.
    return getMissionDisplayContent(moduleCode, selectedActivity.type);
  }, [moduleCode, selectedActivity?.type]);

  const handlePlay = () => {
    if (!selectedActivity || !moduleData) return;
    if (selectedActivity.status === "locked") return;

    // El menu solo navega; el attempt se abre dentro de la mision.
    navigate(`/modules/m0${moduleData.sortOrder}/${selectedActivity.type}`);
  };

  if (loading) return <div className="p-6 text-white">Cargando modulo...</div>;
  if (error) return <div className="p-6 text-red-300">{error}</div>;

  if (!moduleData) {
    return (
      <div className="p-6 text-white">Modulo no encontrado: {moduleCode}</div>
    );
  }

  return (
    <SceneBackground moduleCode={moduleCode}>
      {console.log(moduleCode)}
      <div className="relative">
        <QuipuHeader
          title={moduleTitle || moduleData.title}
          themeHex={modulePrimaryHex}
          onBack={() => navigate("/")}
          // Placeholder mientras conectamos el modal real de configuracion.
          onOpenSettings={() => {}}
        />

        <ModuleMenuLayout
          left={
            <ModuleMenuSelectorPanel
              activities={effectiveActivities}
              selectedId={selectedActivityId}
              onSelect={setSelectedActivityId}
              themeHex={modulePrimaryHex}
            />
          }
          center={
            <ModuleMenuActivityPanel
              activity={selectedActivity}
              activityContent={activityContent}
              themeHex={modulePrimaryHex}
              canPlay={canPlay}
              ctaLabel={ctaLabel}
              onPlay={handlePlay}
            />
          }
          right={
            <ModuleMenuMascotPanel
              mascot={mascot}
              themeHex={modulePrimaryHex}
              text={mascotText}
              wallet={wallet}
            />
          }
        />
      </div>
    </SceneBackground>
  );
}
