import modulesCatalog from "../content/modulos.json";

function findModule(moduleKey) {
  return (
    modulesCatalog.modules.find(
      (moduleItem) =>
        moduleItem.code === moduleKey ||
        moduleItem.legacyCodes?.includes(moduleKey),
    ) || null
  );
}

export function getLearnFor(moduleKey, activityType) {
  const moduleItem = findModule(moduleKey);
  const mission = moduleItem?.missions?.[activityType];

  if (!mission) return null;

  const learn = Array.isArray(mission.learn) ? mission.learn.filter(Boolean) : [];
  const outcome = mission.outcome || "";

  if (!learn.length && !outcome) return null;

  return {
    learn,
    outcome,
  };
}
