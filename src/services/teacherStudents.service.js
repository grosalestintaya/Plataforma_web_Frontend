import { api } from "./apiClient";

export const TeacherStudentsService = {
  list: ({ q = "", page = 1, limit = 9 } = {}) =>
    api.get(
      `/api/teacher/students?q=${encodeURIComponent(q)}&page=${encodeURIComponent(
        String(page)
      )}&limit=${encodeURIComponent(String(limit))}`
    ),
      getDetailById: (idUser) => api.get(`/api/teacher/students/${encodeURIComponent(String(idUser))}/detail`),

};
