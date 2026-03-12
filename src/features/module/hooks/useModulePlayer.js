import { useCallback, useMemo, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

/**
 * nav.mode soportados (por ahora):
 * - "normal"   : Atrás/Siguiente (y en la última: Finalizar)
 * - "cta"      : solo un botón central (Ej: Empezar)
 * - "locked"   : botones deshabilitados (procedimental en juego)
 *
 * view.nav ejemplo:
 * { "mode":"cta", "label":"Empezar" }
 * { "mode":"locked", "label":"En progreso..." }
 */
export function useModulePlayer(moduleData, { onFinishMission } = {}) {
  const missionKeys = Object.keys(moduleData.missions || {});
  const initialMission = moduleData.state?.missionKey ?? missionKeys[0];

  const [missionKey, setMissionKey] = useState(initialMission);
  const [viewIndex, setViewIndex] = useState(moduleData.state?.viewIndex ?? 0);

  const mission = moduleData.missions?.[missionKey];
  const views = mission?.views ?? [];
  const safeIndex = views.length ? clamp(viewIndex, 0, views.length - 1) : 0;
  const view = views[safeIndex];

  const isFirst = safeIndex === 0;
  const isLast = views.length ? safeIndex === views.length - 1 : true;

  const goTo = useCallback(
    (idx) => setViewIndex(views.length ? clamp(idx, 0, views.length - 1) : 0),
    [views.length]
  );

  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);
  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  // API que el Hero/Minijuegos pueden usar (ej: avanzar cuando completes)
  const heroApi = useMemo(
    () => ({
      goNext,
      goPrev,
      goTo,
      setMission: (mk) => {
        setMissionKey(mk);
        setViewIndex(0);
      },
    }),
    [goNext, goPrev, goTo]
  );

  // Modelo para el footer (solo UI)
  const footerModel = useMemo(() => {
    if (!view) {
      return { type: "normal", left: { enabled: false }, right: { enabled: false } };
    }

    const navMode = view.nav?.mode ?? "normal";

    // CTA ONLY (Empezar)
    if (navMode === "cta") {
      return {
        type: "cta",
        center: {
          label: view.nav?.label ?? "Empezar",
          enabled: true,
          onClick: () => {
            // por defecto: avanzar a la siguiente vista
            goNext();
          },
        },
      };
    }

    // LOCKED (procedimental durante juego)
    if (navMode === "locked") {
      return {
        type: "locked",
        left: { label: "◀ Atrás", enabled: false },
        centerText: view.nav?.label ?? "En progreso…",
        right: { label: "Siguiente ▶", enabled: false },
      };
    }

    // NORMAL
    const rightLabel = isLast ? "Finalizar" : "Siguiente ▶";
    const rightEnabled = true; // incluso en last
    const rightClick = () => {
      if (isLast) {
        onFinishMission?.({ missionKey });
      } else {
        goNext();
      }
    };

    return {
      type: "normal",
      left: { label: "◀ Atrás", enabled: !isFirst, onClick: goPrev },
      centerText: "Quipu Yachay",
      right: { label: rightLabel, enabled: rightEnabled, onClick: rightClick },
    };
  }, [view, isFirst, isLast, goNext, goPrev, onFinishMission, missionKey]);

  return {
    missionKey,
    setMissionKey,
    viewIndex: safeIndex,
    view,
    viewsCount: views.length,
    footerModel,
    heroApi,
  };
}