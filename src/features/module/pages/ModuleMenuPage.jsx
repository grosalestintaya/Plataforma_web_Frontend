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
    learnBlock,
    canPlay,
    ctaLabel,
    mascotText,
  } = useModuleMenuData(moduleCode);

  const handlePlay = () => {
    if (!selectedActivity || !moduleData) return;
    if (selectedActivity.status === "locked") return;

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
      <div className="relative">
        <QuipuHeader
          title={moduleData.title}
          themeHex={modulePrimaryHex}
          onBack={() => navigate("/")}
          onOpenSettings={() => console.log("open settings")}
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
              learnBlock={learnBlock}
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
