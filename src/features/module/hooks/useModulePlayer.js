import { useCallback, useMemo, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

/**
 * Player de misión:
 * - missionKey/viewIndex
 * - footerModel según view.nav.mode
 */
export function useModulePlayer(
  moduleData,
  { initialMissionKey, onFinishMission, actions } = {},
) {
  const missions = moduleData?.missions ?? {};
  const missionKeys = Object.keys(missions);

  const startMissionKey = missions?.[initialMissionKey]
    ? initialMissionKey
    : missionKeys[0];

  const [missionKey, setMissionKey] = useState(startMissionKey);
  const [viewIndex, setViewIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const views = missions?.[missionKey]?.views ?? [];
  const safeIndex = views.length ? clamp(viewIndex, 0, views.length - 1) : 0;
  const view = views[safeIndex];

  const isFirst = safeIndex === 0;
  const isLast = views.length ? safeIndex === views.length - 1 : true;

  const goTo = useCallback(
    (idx) => setViewIndex(views.length ? clamp(idx, 0, views.length - 1) : 0),
    [views.length],
  );

  const next = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);
  const prev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  const setMission = useCallback(
    (mk) => {
      if (!missions?.[mk]) return;
      setMissionKey(mk);
      setViewIndex(0); // reset de vista al cambiar misión
    },
    [missions],
  );

  const heroApi = useMemo(
    () => ({ next, prev, goTo, setMission }),
    [next, prev, goTo, setMission],
  );

  const footerModel = useMemo(() => {
    if (!view) {
      return {
        type: "normal",
        left: { enabled: false },
        right: { enabled: false },
        centerText: "Quipu Yachay",
      };
    }

    const mode = view.nav?.mode ?? "normal";

    // CTA (Ej: Empezar)
    if (mode === "cta") {
      return {
        type: "cta",
        center: {
          label: view.nav?.label ?? "Empezar",
          enabled: !finishing,
          onClick: async () => {
            const actionKey = view.nav?.action;

            // Acción custom (opcional)
            if (actionKey && actions?.[actionKey]) {
              const result = await actions[actionKey]({
                missionKey,
                viewIndex: safeIndex,
                view,
              });

              // Si la acción dice “no avanzar”, se respeta
              if (result?.next === false) return;
            }

            // Por defecto: avanzar a la siguiente vista
            return next();
          },
        },
      };
    }

    // Locked (deshabilita botones)
    if (mode === "locked") {
      return {
        type: "locked",
        left: { label: "◀ Atrás", enabled: false },
        centerText: view.nav?.label ?? "En progreso…",
        right: { label: "Siguiente ▶", enabled: false },
      };
    }

    // Normal (última -> Finalizar)
    return {
      type: "normal",
      left: {
        label: "◀ Atrás",
        enabled: !isFirst && !finishing,
        onClick: prev,
      },
      centerText: "Quipu Yachay",
      right: {
        label: isLast ? "Finalizar" : "Siguiente ▶",
        enabled: !finishing,
        onClick: async () => {
          if (!isLast) return next();
          try {
            setFinishing(true);
            await onFinishMission?.({ missionKey });
          } finally {
            setFinishing(false);
          }
        },
      },
    };
  }, [
    view,
    isFirst,
    isLast,
    prev,
    next,
    onFinishMission,
    missionKey,
    finishing,
    actions, // ✅ clave: evita usar actions “viejo”
  ]);

  return {
    missionKey,
    viewIndex: safeIndex,
    view,
    heroApi,
    footerModel,
    setMission,
    goTo,
  };
}
