import { api } from "@/services/apiClient";

export const ModulesService = {
  // GET .../module-control → { schoolId, schoolName, mode }
  getControl: () => api.get("/api/teacher/school/module-control"),

  // PATCH .../module-control { mode } → alterna manual/automatic
  setMode: (mode) => api.patch("/api/teacher/school/module-control", { mode }),

  // GET .../modules/overview → { schoolId, modules: [...] }
  getOverview: () => api.get("/api/teacher/modules/overview"),

  // PATCH .../modules/:moduleId/lock
  lockModule: (moduleId) => api.patch(`/api/teacher/modules/${moduleId}/lock`),

  // PATCH .../modules/:moduleId/unlock
  unlockModule: (moduleId) =>
    api.patch(`/api/teacher/modules/${moduleId}/unlock`),
};
