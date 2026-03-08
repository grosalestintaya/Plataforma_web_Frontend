// src/utils/heatmapCompactTransform.js
const TYPE_BY_SORT_ORDER = {
  1: { key: "conceptual", label: "Conceptual" },
  2: { key: "procedimental", label: "Procedimental" },
  3: { key: "actitudinal", label: "Actitudinal" },
};

export function transformHeatmapToModuleByType(payload) {
  const cells = Array.isArray(payload?.cells) ? payload.cells : [];
  const studentsTotal = Number(payload?.studentsTotal) || 0;

  // Módulos únicos ordenados
  const modules = Array.from(
    new Map(
      cells.map((c) => [
        c.module.id_module,
        { id: c.module.id_module, sort_order: c.module.sort_order, title: c.module.title },
      ])
    ).values()
  ).sort((a, b) => a.sort_order - b.sort_order);

  // Columnas fijas (3 tipos)
  const types = [1, 2, 3].map((n) => ({
    sort_order: n,
    ...TYPE_BY_SORT_ORDER[n],
  }));

  // acumuladores: moduleId + typeSort -> sums
  const acc = new Map(); // key: `${moduleId}:${typeSort}`

  for (const c of cells) {
    const moduleId = c.module.id_module;
    const typeSort = Number(c.activity.sort_order); // tu regla
    if (![1, 2, 3].includes(typeSort)) continue;

    const key = `${moduleId}:${typeSort}`;
    if (!acc.has(key)) {
      acc.set(key, {
        completedStudentsSum: 0,
        studentsWithProgressSum: 0,
        attemptsTotalInRangeSum: 0,
        avgBestScoreSum: 0,
        avgAttemptsSum: 0,
        n: 0,
      });
    }

    const a = acc.get(key);
    a.completedStudentsSum += Number(c.stats?.completedStudents) || 0;
    a.studentsWithProgressSum += Number(c.stats?.studentsWithProgress) || 0;
    a.attemptsTotalInRangeSum += Number(c.stats?.attemptsTotalInRange) || 0;

    // promedios simples (si te interesa mostrarlos en tooltip)
    a.avgBestScoreSum += Number(c.stats?.avgBestScore) || 0;
    a.avgAttemptsSum += Number(c.stats?.avgAttempts) || 0;
    a.n += 1;
  }

  // matriz: rows=modules, cols=types
  const matrix = modules.map((m) =>
    types.map((t) => {
      const key = `${m.id}:${t.sort_order}`;
      const a = acc.get(key);

      if (!a || studentsTotal === 0) {
        return {
          value: 0,
          stats: {
            completedStudents: 0,
            studentsTotal,
            studentsWithProgress: 0,
            attemptsTotalInRange: 0,
            avgBestScore: 0,
            avgAttempts: 0,
            activitiesCount: 0,
          },
        };
      }

      const completionPct = (a.completedStudentsSum / studentsTotal) * 100;

      return {
        value: Math.round(completionPct), // o Number(completionPct.toFixed(1))
        stats: {
          completedStudents: a.completedStudentsSum,
          studentsTotal,
          studentsWithProgress: a.studentsWithProgressSum,
          attemptsTotalInRange: a.attemptsTotalInRangeSum,
          avgBestScore: a.n ? Number((a.avgBestScoreSum / a.n).toFixed(1)) : 0,
          avgAttempts: a.n ? Number((a.avgAttemptsSum / a.n).toFixed(2)) : 0,
          activitiesCount: a.n,
        },
      };
    })
  );

  return {
    meta: {
      metric: payload?.metric,
      rangeDays: payload?.rangeDays,
      studentsTotal,
      scope: payload?.scope,
    },
    modules,
    types,
    matrix,
  };
}
