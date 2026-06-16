// useTour.js
import { useContext } from "react";
import { TourContext } from "../context/TourContext";

export function useTour() {
  const ctx = useContext(TourContext);
  // Retorna un objeto vacío seguro si no hay provider
  return (
    ctx ?? {
      state: { active: false, completed: false },
      startTour: () => {},
      resetTour: () => {},
      isFirst: true,
      isLast: false,
      currentStep: 0,
      totalSteps: 0,
    }
  );
}
