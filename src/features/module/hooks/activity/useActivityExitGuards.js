import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Reune las salidas controladas de la actividad:
 * header, boton atras del navegador y recarga/cierre de pestana.
 */
export function useActivityExitGuards({
  activityId,
  missionAttempt,
  missionScore,
  moduleCode,
  missionKey,
  moduleMenuPath,
  navigate,
  currentTemplate,
  getInteractiveResponses,
}) {
  const confirmExitRef = useRef(() => true);
  const abandonAndExitRef = useRef(async () => {});

  const hasActiveAttempt = useMemo(
    () =>
      Boolean(
        activityId &&
        missionAttempt.attemptId &&
        missionAttempt.status === "active",
      ),
    [activityId, missionAttempt.attemptId, missionAttempt.status],
  );

  // El boton volver solo vive en vistas Lobby.
  const showHeaderBackButton = String(currentTemplate ?? "")
    .toLowerCase()
    .includes("lobby");

  useEffect(() => {
    confirmExitRef.current = () => {
      if (!hasActiveAttempt) return true;

      return window.confirm(
        "Si sales ahora, perderas el progreso actual de la actividad. El intento quedara registrado. Deseas continuar?",
      );
    };
  }, [hasActiveAttempt]);

  useEffect(() => {
    abandonAndExitRef.current = async (reason) => {
      if (hasActiveAttempt) {
        await missionAttempt.abandonMission({
          score: missionScore,
          extraPayload: {
            moduleCode,
            missionKey,
            exitReason: reason,
            interactiveResponses: getInteractiveResponses(),
          },
        });
      }

      navigate(moduleMenuPath);
    };
  }, [
    getInteractiveResponses,
    hasActiveAttempt,
    missionAttempt,
    missionKey,
    missionScore,
    moduleCode,
    moduleMenuPath,
    navigate,
  ]);

  useEffect(() => {
    // Intercepta el boton atras del navegador para salir de la actividad
    // de forma controlada y registrando el intento cuando corresponda.
    const historyState = { moduleActivityGuard: true, ts: Date.now() };
    window.history.pushState(historyState, "", window.location.href);

    const handlePopState = () => {
      if (!confirmExitRef.current()) {
        window.history.pushState(historyState, "", window.location.href);
        return;
      }

      abandonAndExitRef.current("browser_back").catch(() => {
        navigate(moduleMenuPath);
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [moduleMenuPath, navigate]);

  useEffect(() => {
    /**
     * Advierte al usuario en recarga/cierre y envia un cierre best-effort
     * para que el intento quede registrado en el sistema.
     */
    const handleBeforeUnload = (event) => {
      if (!hasActiveAttempt) return;

      missionAttempt.abandonMission({
        score: missionScore,
        keepalive: true,
        extraPayload: {
          moduleCode,
          missionKey,
          exitReason: "beforeunload",
          interactiveResponses: getInteractiveResponses(),
        },
      });

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    getInteractiveResponses,
    hasActiveAttempt,
    missionAttempt,
    missionKey,
    missionScore,
    moduleCode,
  ]);

  const runControlledExit = useCallback(
    (reason) => {
      if (!confirmExitRef.current()) return;

      abandonAndExitRef.current(reason).catch(() => {
        navigate(moduleMenuPath);
      });
    },
    [moduleMenuPath, navigate],
  );

  return {
    hasActiveAttempt,
    showHeaderBackButton,
    handleHeaderBack: () => runControlledExit("header_back"),
    handleSettingsExit: () => runControlledExit("settings_exit"),
  };
}
