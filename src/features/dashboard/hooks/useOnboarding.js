// src/hooks/useOnboarding.js
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function useOnboarding(steps, storageKey) {
  useEffect(() => {
    if (!steps?.length) return;
    if (localStorage.getItem(storageKey)) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: "Siguiente →",
      prevBtnText: "← Atrás",
      doneBtnText: "¡Empezar!",
      progressText: "{{current}} de {{total}}",
      onDestroyStarted: () => {
        localStorage.setItem(storageKey, "true");
        driverObj.destroy();
      },
      steps,
    });

    const timer = setTimeout(() => driverObj.drive(), 700);
    return () => clearTimeout(timer);
  }, [storageKey]);
}
