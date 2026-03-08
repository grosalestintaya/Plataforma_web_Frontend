import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TeacherStudentsService } from "../../../modules/dashboard/services/teacherStudents.service"; // ajusta ruta según tu estructura

/**
 * Vista docente: lista de estudiantes asignados.
 * Endpoint:
 *  GET /api/teacher/students?q=&page=1&limit=9
 *
 * Nota: La API devuelve { items, pagination } y cada item incluye grade (string).
 * En UI NO mostramos IDs.
 */
export default function Students() {
  // Query params (persistencia en URL)
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 9);

  const [data, setData] = useState({
    items: [],
    pagination: { page: 1, limit: 9, total: 0 },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    const total = Number(data?.pagination?.total ?? 0);
    const lim = Number(data?.pagination?.limit ?? limit);
    return Math.max(1, Math.ceil(total / lim));
  }, [data, limit]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "")
        next.delete(key);
      else next.set(key, String(value));
    });

    setSearchParams(next);
  };

  const goToPage = (p) => {
    const safe = Math.min(Math.max(1, p), totalPages);
    updateParams({ page: safe });
  };

  const fetchStudents = async ({ q, page, limit }) => {
    setLoading(true);
    setError("");

    try {
      const json = await TeacherStudentsService.list({ q, page, limit });

      setData({
        items: Array.isArray(json?.items) ? json.items : [],
        pagination: json?.pagination ?? { page: 1, limit, total: 0 },
      });
    } catch (e) {
      // 401 lo maneja apiClient; aquí solo mostramos si NO es 401
      if (e?.status !== 401)
        setError(e?.message || "Error al cargar estudiantes");
      setData({ items: [], pagination: { page: 1, limit, total: 0 } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents({ q, page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, limit]);

  // Agrupar por grade (categorías)
  const grouped = useMemo(() => {
    const groups = new Map();
    for (const s of data.items) {
      const grade = (s.grade || "Sin grado").trim();
      if (!groups.has(grade)) groups.set(grade, []);
      groups.get(grade).push(s);
    }
    return Array.from(groups.entries()).sort(([a], [b]) =>
      a.localeCompare(b, "es"),
    );
  }, [data.items]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Estudiantes
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Listado por grados. Usa la búsqueda para encontrar por nombre o
            usuario.
          </p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
          Total:{" "}
          <span className="font-extrabold text-slate-900">
            {data.pagination.total ?? 0}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <label className="text-xs font-extrabold text-slate-700">
              Buscar
            </label>
            <input
              value={q}
              onChange={(e) => updateParams({ q: e.target.value, page: 1 })}
              placeholder="Nombre o usuario (username)…"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#2962FF]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-extrabold text-slate-700">
              Límite
            </label>
            <select
              value={limit}
              onChange={(e) =>
                updateParams({ limit: Number(e.target.value), page: 1 })
              }
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#2962FF]">
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={18}>18</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="button"
              onClick={() =>
                setSearchParams({ page: "1", limit: String(limit) })
              }
              className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-200">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
        {loading && (
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: Math.min(limit, 9) }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
                <div className="mt-4 h-9 w-full rounded-2xl bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-extrabold">No se pudo cargar</div>
            <div className="mt-1 opacity-90">{error}</div>
          </div>
        )}

        {!loading && !error && data.items.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            <div className="font-extrabold text-slate-900">Sin resultados</div>
            <div className="mt-1">
              Prueba con otro nombre/usuario o limpia el filtro.
            </div>
          </div>
        )}

        {!loading && !error && data.items.length > 0 && (
          <>
            <div className="space-y-6">
              {grouped.map(([grade, students]) => (
                <GradeGroup key={grade} grade={grade} count={students.length}>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {students.map((s) => (
                      <StudentCard
                        key={s.username ?? `${s.full_name}-${Math.random()}`}
                        student={s}
                      />
                    ))}
                  </div>
                </GradeGroup>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="text-sm font-semibold text-slate-700">
                Página{" "}
                <span className="font-extrabold text-slate-900">{page}</span> de{" "}
                <span className="font-extrabold text-slate-900">
                  {totalPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                  Anterior
                </button>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GradeGroup({ grade, count, children }) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2962FF]/10 text-sm font-extrabold text-[#2962FF] ring-1 ring-[#2962FF]/20">
            {grade?.[0] ?? "G"}
          </span>
          <div>
            <div className="text-sm font-extrabold text-slate-900">{grade}</div>
            <div className="text-xs font-semibold text-slate-600">
              {count} estudiante(s)
            </div>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
          Grupo
        </span>
      </div>

      {children}
    </section>
  );
}

function StudentCard({ student }) {
  const status = student.is_active ? "Activo" : "Inactivo";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">
            {student.full_name}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill text={`@${student.username}`} tone="blue" />
          </div>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
            student.is_active
              ? "bg-[#00C853]/10 text-[#00C853] ring-[#00C853]/20"
              : "bg-slate-100 text-slate-600 ring-slate-200",
          ].join(" ")}>
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end">
        {/* Mantengo tu ruta actual por ID (no se muestra en UI, pero sí en URL) */}
        <Link
          to={`/app/teacher/students/${student.id_user}`}
          className="rounded-2xl bg-[#2962FF] px-4 py-2 text-xs font-extrabold text-white hover:opacity-95">
          Ver detalles
        </Link>
      </div>
    </div>
  );
}

function Pill({ text, tone = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-[#2962FF]/10 text-[#2962FF] ring-[#2962FF]/20",
    green: "bg-[#00C853]/10 text-[#00C853] ring-[#00C853]/20",
    yellow: "bg-[#FFC400]/30 text-slate-900 ring-[#FFC400]/40",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${map[tone]}`}>
      {text}
    </span>
  );
}
