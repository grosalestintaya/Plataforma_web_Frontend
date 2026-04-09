import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/apiClient";

import {
  buildEffectiveActivities,
  getCtaLabel,
  getMascotText,
  pickModuleByKey,
} from "../utils/moduleMenu.helpers";

export default function useModuleMenuData(
  moduleKey,
  { preferredActivityType = null } = {},
) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      // El menu siempre lee progreso fresco antes de pintar el modulo.
      setLoading(true);
      setError("");

      try {
        const json = await api.get("api/progress/overview");
        setOverview(json || null);
      } catch (e) {
        setError(e?.message || "Error al cargar overview");
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [moduleKey]);

  const moduleData = useMemo(() => {
    // El overview puede traer varias filas; elegimos la mejor candidata del modulo.
    return pickModuleByKey(overview?.modules, moduleKey);
  }, [overview?.modules, moduleKey]);

  const effectiveActivities = useMemo(() => {
    if (!moduleData) return [];
    return buildEffectiveActivities(moduleData.status, moduleData.activities);
  }, [moduleData]);

  useEffect(() => {
    if (!effectiveActivities.length) return;

    // PostGame puede pedir que el menu abra la siguiente mision ya seleccionada.
    const preferredActivity = preferredActivityType
      ? effectiveActivities.find(
          (activity) => activity?.type === preferredActivityType,
        )
      : null;

    // Si no hay preferencia, cae en la primera actividad del flujo.
    const firstActivity =
      preferredActivity ||
      effectiveActivities.find(
        (activity) => Number(activity.sortOrder) === 1,
      ) || effectiveActivities[0];

    setSelectedActivityId(firstActivity.activityId);
  }, [effectiveActivities, moduleData?.moduleId, preferredActivityType]);

  const selectedActivity = useMemo(() => {
    return (
      effectiveActivities.find(
        (activity) =>
          String(activity.activityId) === String(selectedActivityId),
      ) || null
    );
  }, [effectiveActivities, selectedActivityId]);

  const wallet = useMemo(() => {
    return overview?.wallet || { xp: 0, coins: 0 };
  }, [overview]);

  const canPlay = !!selectedActivity && selectedActivity.status !== "locked";

  const ctaLabel = useMemo(
    () => getCtaLabel(selectedActivity),
    [selectedActivity],
  );

  const mascotText = useMemo(
    () => getMascotText(selectedActivity),
    [selectedActivity],
  );

  return {
    overview,
    wallet,
    loading,
    error,
    moduleData,
    effectiveActivities,
    selectedActivity,
    selectedActivityId,
    setSelectedActivityId,
    canPlay,
    ctaLabel,
    mascotText,
  };
}
