// src/utils/heatmapTransform.js
export function transformHeatmapResponse(payload) {
  const cells = Array.isArray(payload?.cells) ? payload.cells : [];

  // 1) módulos únicos (ordenados)
  const modules = Array.from(
    new Map(
      cells.map((c) => [
        c.module.id_module,
        {
          id: c.module.id_module,
          sort_order: c.module.sort_order,
          title: c.module.title,
        },
      ])
    ).values()
  ).sort((a, b) => a.sort_order - b.sort_order);

  // 2) actividades únicas (ordenadas)
  const activities = Array.from(
    new Map(
      cells.map((c) => [
        c.activity.id_activity,
        {
          id: c.activity.id_activity,
          sort_order: c.activity.sort_order,
          title: c.activity.title,
          type: c.activity.type,
        },
      ])
    ).values()
  ).sort((a, b) => a.sort_order - b.sort_order);

  const colIndex = new Map(modules.map((m, i) => [m.id, i]));
  const rowIndex = new Map(activities.map((a, i) => [a.id, i]));

  // 3) matriz llena con 0
  const matrix = Array.from({ length: activities.length }, () =>
    Array.from({ length: modules.length }, () => 0)
  );

  // 4) cellMap: key = `${activityId}:${moduleId}` -> { value, stats, module, activity }
  const cellMap = new Map();

  for (const c of cells) {
    const r = rowIndex.get(c.activity.id_activity);
    const k = colIndex.get(c.module.id_module);
    if (r == null || k == null) continue;

    const v = Number(c.value) || 0;
    matrix[r][k] = v;
    cellMap.set(`${c.activity.id_activity}:${c.module.id_module}`, {
      value: v,
      stats: c.stats,
      module: c.module,
      activity: c.activity,
    });
  }

  return {
    meta: {
      metric: payload?.metric,
      rangeDays: payload?.rangeDays,
      studentsTotal: payload?.studentsTotal,
      scope: payload?.scope,
    },
    modules,
    activities,
    matrix,
    cellMap,
  };
}
