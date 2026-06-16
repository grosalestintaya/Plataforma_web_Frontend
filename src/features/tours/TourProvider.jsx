import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { TourContext } from "./context/TourContext";
import { TOUR_FLOW } from "./config/tourFlow";
import { loadTour, saveTour, clearTour } from "./services/tourStorage";

function buildFlatSteps(flow) {
  return flow.flatMap((route) =>
    route.steps.map((step) => ({
      ...step,
      route: route.route,
      routeId: route.id,
    })),
  );
}

const FLAT_STEPS = buildFlatSteps(TOUR_FLOW);

export default function TourProvider({ children }) {
  const navigate = useNavigate();
  const driverRef = useRef(null);
  const [state, setState] = useState(loadTour);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const isFirst = state.stepIndex === 0;
  const isLast = state.stepIndex === FLAT_STEPS.length - 1;

  const destroyDriver = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
  }, []);

  const save = useCallback((next) => {
    setState(next);
    saveTour(next);
  }, []);

  const launchStep = useCallback(
    (stepIndex) => {
      destroyDriver();

      const step = FLAT_STEPS[stepIndex];
      if (!step) return;

      const totalFlat = FLAT_STEPS.length;

      driverRef.current = driver({
        animate: true,
        smoothScroll: true,
        allowClose: false,
        allowHTMLInPopover: true,
        overlayOpacity: 0.55,
        stagePadding: 10,
        showButtons: ["next", "previous", "close"],
        nextBtnText: stepIndex === totalFlat - 1 ? "¡Listo! 🎉" : "Siguiente →",
        prevBtnText: "← Atrás",
        doneBtnText: "¡Listo! 🎉",
        progressText: "{{current}} de {{total}}",
        showProgress: true,
        onNextClick: () => {
          const current = stateRef.current;
          if (current.stepIndex >= FLAT_STEPS.length - 1) {
            destroyDriver();
            save({ active: false, stepIndex: 0, completed: true });
            return;
          }
          const nextIndex = current.stepIndex + 1;
          const nextStep = FLAT_STEPS[nextIndex];
          destroyDriver();
          save({ ...current, stepIndex: nextIndex, active: true });
          if (nextStep.route !== FLAT_STEPS[current.stepIndex].route) {
            navigate(nextStep.route);
          }
        },
        onPrevClick: () => {
          const current = stateRef.current;
          if (current.stepIndex <= 0) return;
          const prevIndex = current.stepIndex - 1;
          const prevStep = FLAT_STEPS[prevIndex];
          destroyDriver();
          save({ ...current, stepIndex: prevIndex, active: true });
          if (prevStep.route !== FLAT_STEPS[current.stepIndex].route) {
            navigate(prevStep.route);
          }
        },
        onCloseClick: () => {
          destroyDriver();
          save({ active: false, stepIndex: 0, completed: true });
        },
        onDestroyStarted: () => {
          destroyDriver();
          save({ active: false, stepIndex: 0, completed: true });
        },
        steps: FLAT_STEPS.map((s) => ({
          element: s.selector ?? undefined,
          popover: {
            title: s.title,
            description: s.text,
          },
        })),
      });

      let attempts = 0;
      const tryDrive = () => {
        if (!step.selector) {
          driverRef.current?.drive(stepIndex);
          return;
        }
        const el = document.querySelector(step.selector);
        if (el) {
          driverRef.current?.drive(stepIndex);
        } else if (attempts < 8) {
          attempts++;
          setTimeout(tryDrive, 200);
        }
      };
      setTimeout(tryDrive, 350);
    },
    [navigate, save, destroyDriver],
  );

  useEffect(() => {
    if (!state.active) {
      destroyDriver();
      return;
    }
    launchStep(state.stepIndex);
  }, [state.active, state.stepIndex]);

  useEffect(() => () => destroyDriver(), []);

  function startTour() {
    const next = { active: true, stepIndex: 0, completed: false };
    save(next);
    navigate(FLAT_STEPS[0].route);
  }

  function resetTour() {
    clearTour();
    startTour();
  }

  const value = useMemo(
    () => ({
      state,
      startTour,
      resetTour,
      isFirst,
      isLast,
      currentStep: state.stepIndex + 1,
      totalSteps: FLAT_STEPS.length,
    }),
    [state],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
