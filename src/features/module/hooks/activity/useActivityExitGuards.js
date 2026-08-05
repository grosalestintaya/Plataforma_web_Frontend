import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function isLobbyViewTemplate(template) {
  // En Lobby todavia no hay actividad real que proteger con confirmacion.
  return String(template ?? "").toLowerCase().includes("lobby");
}

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
  const abandonAndExitRef = useRef(async () => {});
  const pendingExitReasonRef = useRef("header_back");
  const guardUrlRef = useRef("");
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  const hasActiveAttempt = useMemo(
    () =>
      Boolean(
        activityId &&
        missionAttempt.attemptId &&
        missionAttempt.status === "active",
      ),
    [activityId, missionAttempt.attemptId, missionAttempt.status],
  );
  const isLobbyView = isLobbyViewTemplate(currentTemplate);
  // La confirmacion solo aplica una vez que dejamos la intro Lobby.
  const shouldConfirmExit = hasActiveAttempt && !isLobbyView;

  const buildExitPayload = useCallback(
    (reason) => ({
      moduleCode,
      missionKey,
      exitReason: reason,
      interactiveResponses: getInteractiveResponses(),
    }),
    [getInteractiveResponses, missionKey, moduleCode],
  );

  useEffect(() => {
    abandonAndExitRef.current = async (reason) => {
      if (hasActiveAttempt) {
        await missionAttempt.abandonMission({
          score: missionScore,
          extraPayload: buildExitPayload(reason),
        });
      }

      navigate(moduleMenuPath);
    };
  }, [
    buildExitPayload,
    hasActiveAttempt,
    missionAttempt,
    missionScore,
    moduleMenuPath,
    navigate,
  ]);

  const requestExitConfirmation = useCallback((reason) => {
    pendingExitReasonRef.current = reason;
    setIsExitConfirmOpen(true);
  }, []);

  const closeExitConfirmation = useCallback(() => {
    setIsExitConfirmOpen(false);
  }, []);

  const confirmExitToMenu = useCallback(() => {
    setIsExitConfirmOpen(false);

    abandonAndExitRef.current(pendingExitReasonRef.current).catch(() => {
      navigate(moduleMenuPath);
    });
  }, [moduleMenuPath, navigate]);

  useEffect(() => {
    // Intercepta el boton atras del navegador para salir de la actividad
    // de forma controlada y registrando el intento cuando corresponda.
    guardUrlRef.current = window.location.href;

    const restoreGuardState = () => {
      window.history.pushState(
        { moduleActivityGuard: true, ts: Date.now() },
        "",
        guardUrlRef.current,
      );
    };

    restoreGuardState();

    const handlePopState = () => {
      restoreGuardState();

      if (!shouldConfirmExit) {
        abandonAndExitRef.current("browser_back").catch(() => {
          navigate(moduleMenuPath);
        });
        return;
      }

      requestExitConfirmation("browser_back");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [moduleMenuPath, navigate, requestExitConfirmation, shouldConfirmExit]);

  useEffect(() => {
    /**
     * Advierte al usuario en recarga/cierre y envia un cierre best-effort
     * para que el intento quede registrado en el sistema.
     */
    const handleBeforeUnload = (event) => {
      if (!shouldConfirmExit) return;

      // keepalive permite enviar el abandono durante refresh/cierre sin await.
      missionAttempt.abandonMission({
        score: missionScore,
        keepalive: true,
        extraPayload: buildExitPayload("beforeunload"),
      });

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    buildExitPayload,
    missionAttempt,
    missionScore,
    shouldConfirmExit,
  ]);

  const runControlledExit = useCallback(
    (reason) => {
      if (!shouldConfirmExit) {
        abandonAndExitRef.current(reason).catch(() => {
          navigate(moduleMenuPath);
        });
        return;
      }

      requestExitConfirmation(reason);
    },
    [moduleMenuPath, navigate, requestExitConfirmation, shouldConfirmExit],
  );

  return {
    hasActiveAttempt,
    isExitConfirmOpen,
    closeExitConfirmation,
    confirmExitToMenu,
    handleExitToMenu: () => runControlledExit("header_back"),
    handleSettingsExit: () => runControlledExit("settings_exit"),
  };
}
