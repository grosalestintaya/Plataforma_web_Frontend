export function moduleKeyToSortOrder(moduleKey) {
  const n = String(moduleKey || "").replace(/\D/g, "");
  const num = Number(n);
  return Number.isFinite(num) ? num : null;
}

export function statusPriority(status) {
  if (status === "completed") return 3;
  if (status === "unlocked" || status === "in_progress") return 2;
  if (status === "locked") return 1;
  return 0;
}

export function pickModuleByKey(overviewModules, moduleKey) {
  const sortOrder = moduleKeyToSortOrder(moduleKey);
  if (!sortOrder) return null;

  const candidates = (overviewModules || []).filter(
    (module) => Number(module.sortOrder) === sortOrder,
  );

  if (!candidates.length) return null;

  return [...candidates].sort((a, b) => {
    const pa = statusPriority(a.status);
    const pb = statusPriority(b.status);
    if (pb !== pa) return pb - pa;

    const ca = Number(a.completedActivities || 0);
    const cb = Number(b.completedActivities || 0);
    if (cb !== ca) return cb - ca;

    return Number(b.moduleId || 0) - Number(a.moduleId || 0);
  })[0];
}

export function buildEffectiveActivities(moduleStatus, activities) {
  const list = [...(activities || [])].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );

  if (moduleStatus === "locked") {
    return list.map((activity) =>
      activity.status === "completed"
        ? activity
        : { ...activity, status: "locked" },
    );
  }

  const effective = list.map((activity) => ({ ...activity }));

  const a1 = effective.find((x) => Number(x.sortOrder) === 1);
  const a2 = effective.find((x) => Number(x.sortOrder) === 2);
  const a3 = effective.find((x) => Number(x.sortOrder) === 3);

  if (a1 && a1.status !== "completed") a1.status = "unlocked";
  if (a2 && a1?.status === "completed" && a2.status !== "completed") {
    a2.status = "unlocked";
  }
  if (a3 && a2?.status === "completed" && a3.status !== "completed") {
    a3.status = "unlocked";
  }

  return effective;
}

export function getCtaLabel(activity) {
  if (!activity) return "-";
  if (activity.status === "completed") return "Nuevo intento";
  if (activity.status === "unlocked" || activity.status === "in_progress") {
    return "Realizar actividad";
  }
  return "Bloqueada";
}

export function getMascotText(activity) {
  if (!activity) return "Selecciona una actividad para empezar.";
  if (activity.status === "locked") {
    return "Aun no. Completa la actividad anterior y volvemos.";
  }
  if (activity.score === 100) {
    return "Buen trabajo";
  }
  if (activity.type === "conceptual") {
    return "Aqui construimos la idea base. Lee con calma.";
  }
  if (activity.type === "procedimental") {
    return "Hora de practicar. Prueba y mejora.";
  }
  if (activity.type === "actitudinal") {
    return "Piensa en tu vida diaria: decide con intencion.";
  }
  return "Dale. En esta actividad avanzaremos paso a paso.";
}
