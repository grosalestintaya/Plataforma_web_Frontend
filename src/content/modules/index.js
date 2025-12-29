import m01 from "./m01-introduccion";
// import m02 from "./m02-desarrollo";
// ...

export const modules = [
  m01,
  // m02,
];

export function getModuleById(moduleId) {
  return modules.find((m) => m.id === moduleId);
}

export function getActivity(moduleId, activityId) {
  const mod = getModuleById(moduleId);
  if (!mod) return null;
  return mod.activities.find((a) => a.id === activityId) || null;
}
