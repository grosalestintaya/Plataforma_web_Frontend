
import Header from "../components/activity/ActivityHeader";
import Hero from "../components/activity/ActivityHero";
import Footer from "../components/activity/ActivityFooter";
import SceneBackground from "../components/ui/SceneBackground";
import { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MODULE_CONTENT_MAP } from "../content/content.registry";
import { useModulePlayer } from "../hooks/useModulePlayer";

import { useMissionAttempt } from "../hooks/useMissionAttempt";

export default function ModuleActivtyPage() {
  const navigate = useNavigate();
  const { moduleCode, missionKey: missionKeyParam } = useParams();

  const moduleData = MODULE_CONTENT_MAP[moduleCode];
  if (!moduleData) return <div>No existe contenido para {moduleCode}</div>;

  // Misión válida (fallback a la primera)
  const missionKeys = Object.keys(moduleData.missions ?? {});
  const safeMissionKey = moduleData.missions?.[missionKeyParam]
    ? missionKeyParam
    : missionKeys[0];

  // activityId por misión (para attempt)
  const activityId = moduleData.missions?.[safeMissionKey]?.activityId;

  // Attempt manual (se inicia con botón Empezar)
  const missionAttempt = useMissionAttempt(activityId, { mode: "manual" });

  // Acciones para CTA (objeto estable)
  const actions = useMemo(
    () => ({
      startMissionAttempt: async () => {
        await missionAttempt.start(); // POST start
        return { next: true }; // que el player avance a vista 1
      },
    }),
    [missionAttempt],
  );

  // Player (vistas/footermodel)
  const player = useModulePlayer(moduleData, {
    initialMissionKey: safeMissionKey,
    actions,
    onFinishMission: async ({ missionKey }) => {
      await missionAttempt.completeMission({
        score: 0,
        extraPayload: { moduleCode, missionKey },
      });
      navigate(`/modules/${moduleCode}`);
    },
  });

  // Sync: si cambias /learning/:moduleCode/:missionKey, actualiza el player
  useEffect(() => {
    if (player.missionKey !== safeMissionKey) player.setMission(safeMissionKey);
  }, [safeMissionKey, player]);

  // Finalizar: solo habilitado si attempt está activo (ya se presionó Empezar)
  const footerModel = useMemo(() => {
    const m = player.footerModel;
    if (m?.type !== "normal") return m;

    const isFinal = m.right?.label === "Finalizar";
    if (!isFinal) return m;

    const canFinish =
      missionAttempt.status === "active" && Boolean(missionAttempt.attemptId);

    return {
      ...m,
      right: {
        ...m.right,
        enabled: m.right.enabled && canFinish,
        label: canFinish
          ? "Finalizar"
          : missionAttempt.status === "starting"
            ? "Conectando..."
            : "Presiona Empezar",
      },
    };
  }, [player.footerModel, missionAttempt.status, missionAttempt.attemptId]);

  // track para enviar eventos durante misión
  const heroApi = { ...player.heroApi, track: missionAttempt.track };
  return (
    <SceneBackground moduleCode={moduleCode} className="overflow-hidden">
      <div className="min-h-screen w-full grid grid-rows-[auto_minmax(0,1fr)_auto]">
        <Header
          moduleData={moduleData}
          missionKey={player.missionKey}
          themeHex={moduleData?.theme?.color}
        />

        {/* <main className="min-h-0 overflow-hidden"> */}
          <Hero
            moduleData={moduleData}
            missionKey={player.missionKey}
            viewIndex={player.viewIndex}
            heroApi={heroApi}
          />
        {/* </main> */}

        <Footer model={footerModel} />
      </div>
    </SceneBackground>
  );
}
