import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ShowDashboardTitle from "../../../components/ui/ShowDashboardTitle";
export default function GradeStudents() {
  const token = localStorage.getItem("token");
  const { id_grade } = useParams(); // interno

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 9);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 });
  const [gradeName, setGradeName] = useState(""); // lo resolvemos desde /api/data/grades
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    const total = Number(pagination?.total ?? 0);
    const lim = Number(pagination?.limit ?? limit);
    return Math.max(1, Math.ceil(total / lim));
  }, [pagination, limit]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next);
  };

  const goToPage = (p) => updateParams({ page: Math.min(Math.max(1, p), totalPages) });

  const fetchGradeName = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/data/grades", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const arr = Array.isArray(json) ? json : [];
      const found = arr.find((g) => String(g.id_grade) === String(id_grade));
      if (found?.name) setGradeName(found.name);
    } catch {
      // silencioso: no es crítico
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL("http://localhost:5000/api/teacher/students");
      url.searchParams.set("q", q);
      url.searchParams.set("id_grade", String(id_grade));
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setItems(Array.isArray(json?.items) ? json.items : []);
      setPagination(json?.pagination ?? { page, limit, total: 0 });
    } catch (e) {
      setError(e?.message || "Error al cargar estudiantes");
      setItems([]);
      setPagination({ page: 1, limit, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_grade]);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, limit, id_grade]);

  return (
    <div className="space-y-5">    
                  <ShowDashboardTitle>Estudiantes</ShowDashboardTitle>
<div className="space-y-5 bg-white p-6 rounded-3xl ring-1 ring-slate-200">

      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div >
          <div className="flex flex-wrap items-center gap-2">
 

            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {gradeName || "Estudiantes"}
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-600">
            Lista de estudiantes del grado seleccionado. No se muestran identificadores internos.
          </p>
        </div>
     
            <div className="md:flex md:items-center md:gap-4">
                    <Link
              to="/app/teacher/students"
              className="rounded-xl bg-green-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-200"
            >
              ← Volver
            </Link>
                    <div className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
          
          Total: <span className="font-extrabold text-slate-900">{pagination.total ?? 0}</span>
        </div>
            </div>
  
        
      </div>

      {/* Search + limit */}
      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-9">
            <label className="text-xs font-extrabold text-slate-700">Buscar</label>
            <input
              value={q}
              onChange={(e) => updateParams({ q: e.target.value, page: 1 })}
              placeholder="Nombre o usuario (username)…"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#2962FF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-extrabold text-slate-700">Límite</label>
            <select
              value={limit}
              onChange={(e) => updateParams({ limit: Number(e.target.value), page: 1 })}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#2962FF]"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={18}>18</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="button"
              onClick={() => setSearchParams({ page: "1", limit: String(limit) })}
              className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-200"
            >
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
              <div key={i} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

        {!loading && !error && items.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            <div className="font-extrabold text-slate-900">Sin resultados</div>
            <div className="mt-1">No hay estudiantes para este grado con el filtro actual.</div>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              {items.map((s) => (
                <StudentCard key={s.id_user} student={s} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="text-sm font-semibold text-slate-700">
                Página <span className="font-extrabold text-slate-900">{pagination.page}</span> de{" "}
                <span className="font-extrabold text-slate-900">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div></div>

  );
}

function StudentCard({ student }) {
  const status = student.is_active ? "Activo" : "Inactivo";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">{student.full_name}</div>
          <div className="mt-2">
            <span className="rounded-full bg-[#2962FF]/10 px-3 py-1 text-xs font-extrabold text-[#2962FF] ring-1 ring-[#2962FF]/20">
              @{student.username}
            </span>
          </div>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ring-1",
            student.is_active
              ? "bg-[#00C853]/10 text-[#00C853] ring-[#00C853]/20"
              : "bg-slate-100 text-slate-600 ring-slate-200",
          ].join(" ")}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Link
          to={`/app/teacher/students/view/${student.id_user}`}
          className="rounded-2xl bg-[#2962FF] px-4 py-2 text-xs font-extrabold text-white hover:opacity-95"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
}
