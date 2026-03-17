// src/pages/ModuleMenuPageBeta.jsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getModuleTheme, MODULE_COLORS_HEX } from "../utils/moduleTheme";
import { getMascotForModule } from "../../guidepet/utils/mascotCatalog";

import QuipuHeader from "../components/QuipuHeader";

import useModuleMenuData from "@/features/modules/hooks/useModuleMenuData";
import ModuleMenuLayout from "@/features/modules/components/ModuleMenuLayout";
import ModuleMenuSelectorPanel from "@/features/modules/components/ModuleMenuSelectorPanel";
import ModuleMenuActivityPanel from "@/features/modules/components/ModuleMenuActivityPanel";
import ModuleMenuMascotPanel from "@/features/modules/components/ModuleMenuMascotPanel";

export default function ModuleMenuPageBeta() {
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

    navigate(
      `/play/m0${moduleData.sortOrder}/a0${selectedActivity.activityId}`,
    );
  };

  if (loading) return <div className="p-6 text-white">Cargando módulo...</div>;
  if (error) return <div className="p-6 text-red-300">{error}</div>;
  if (!moduleData) {
    return (
      <div className="p-6 text-white">Módulo no encontrado: {moduleKey}</div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `${theme.tintRadial}, ${theme.bgGradient}`,
      }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, white 1px, transparent 1px), radial-gradient(circle at 82% 64%, white 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      <div className="relative">
        <QuipuHeader
          title={moduleData.title}
          themeHex={modulePrimaryHex}
          onBack={() => navigate(-1)}
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
    </div>
  );
}
