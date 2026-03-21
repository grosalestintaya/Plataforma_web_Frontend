// src/features/modules/hooks/useModuleMenuData.js
import { useEffect, useMemo, useState } from "react";
import { getLearnFor } from "../utils/activityLearn";
import { api } from "@/services/apiClient";

import {
  buildEffectiveActivities,
  getCtaLabel,
  getMascotText,
  pickModuleByKey,
} from "../utils/moduleMenu.helpers";

export default function useModuleMenuData(moduleKey) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
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
    return pickModuleByKey(overview?.modules, moduleKey);
  }, [overview?.modules, moduleKey]);

  const effectiveActivities = useMemo(() => {
    if (!moduleData) return [];
    return buildEffectiveActivities(moduleData.status, moduleData.activities);
  }, [moduleData]);

  useEffect(() => {
    if (!effectiveActivities.length) return;

    const firstActivity =
      effectiveActivities.find(
        (activity) => Number(activity.sortOrder) === 1,
      ) || effectiveActivities[0];

    setSelectedActivityId(firstActivity.activityId);
  }, [moduleData?.moduleId, effectiveActivities]);

  const selectedActivity = useMemo(() => {
    return (
      effectiveActivities.find(
        (activity) =>
          String(activity.activityId) === String(selectedActivityId),
      ) || null
    );
  }, [effectiveActivities, selectedActivityId]);

  const learnBlock = useMemo(() => {
    if (!selectedActivity) return null;
    return getLearnFor(moduleKey, selectedActivity.type);
  }, [moduleKey, selectedActivity]);

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
    learnBlock,
    canPlay,
    ctaLabel,
    mascotText,
  };
}
