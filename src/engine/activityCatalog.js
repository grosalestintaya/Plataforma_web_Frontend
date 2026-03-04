const files = import.meta.glob("/src/content/modules/**/activities/*.json", {
  eager: true,
});

function normalize(mod) {
  return mod?.default ?? mod;
}

const catalog = Object.values(files).reduce((acc, mod) => {
  const a = normalize(mod);
  if (!a?.moduleCode || !a?.activityCode) return acc;
  acc[`${a.moduleCode}:${a.activityCode}`] = a;
  return acc;
}, {});

export function getActivityDef(moduleCode, activityCode) {
  return catalog[`${moduleCode}:${activityCode}`] || null;
}
