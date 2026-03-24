import modulesCatalog from "../content/modulos.json";

function findModule(moduleKey) {
  // Resuelve tanto codigos nuevos como aliases legacy.
  return (
    modulesCatalog.modules.find(
      (moduleItem) =>
        moduleItem.code === moduleKey ||
        moduleItem.legacyCodes?.includes(moduleKey),
    ) || null
  );
}

export function getModuleDefinition(moduleKey) {
  return findModule(moduleKey);
}

export function getModuleDisplayTitle(moduleKey) {
  const moduleItem = findModule(moduleKey);
  return moduleItem?.name || moduleItem?.title || "";
}

export function getMissionDefinition(moduleKey, missionKey) {
  const moduleItem = findModule(moduleKey);
  return moduleItem?.missions?.[missionKey] ?? null;
}

export function getMissionDisplayContent(moduleKey, missionKey) {
  const mission = getMissionDefinition(moduleKey, missionKey);
  if (!mission) return null;

  // Expone una sola forma de leer la metadata del menu.
  return {
    title: mission.title || "",
    learn: Array.isArray(mission.learn) ? mission.learn.filter(Boolean) : [],
    outcome: mission.outcome || "",
  };
}
