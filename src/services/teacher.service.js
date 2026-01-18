import { api } from "./apiClient";

export const TeacherService = {
  listStudents: ({ q, id_grade, page, limit }) =>
    api.get(
      `/api/teacher/students?q=${encodeURIComponent(q ?? "")}` +
        `&id_grade=${encodeURIComponent(String(id_grade))}` +
        `&page=${encodeURIComponent(String(page))}` +
        `&limit=${encodeURIComponent(String(limit))}`
    ),

  listGrades: () => api.get("/api/data/grades"),
};
