import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShowDashboardTitle from "../../../components/ui/ShowDashboardTitle";
export default function TeacherGrades() {
  const token = localStorage.getItem("token");

  const [grades, setGrades] = useState([]); // [{id_grade, name}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGrades = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/data/grades", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setGrades(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e?.message || "Error al cargar grados");
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
                  <ShowDashboardTitle>Estudiantes</ShowDashboardTitle>

          <div className="space-y-5 bg-white p-6 rounded-3xl ring-1 ring-slate-200">

      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Grados</h1>
          <p className="mt-1 text-sm text-slate-600">
            Selecciona un grado para ver el listado de estudiantes.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="mt-4 h-10 w-full rounded-2xl bg-slate-200" />
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

        {!loading && !error && grades.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            <div className="font-extrabold text-slate-900">Sin grados</div>
            <div className="mt-1">No hay grados registrados.</div>
          </div>
        )}

        {!loading && !error && grades.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {grades.map((g) => (
              <GradeCard key={g.id_grade} idGrade={g.id_grade} name={g.name} />
            ))}
          </div>
        )}
      </div>
    </div>
    </div>

  );
}

function GradeCard({ idGrade, name }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold text-slate-900">{name}</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">
            Ver estudiantes de este grado
          </div>
        </div>

        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2962FF]/10 text-sm font-extrabold text-[#2962FF] ring-1 ring-[#2962FF]/20">
          {name?.[0]?.toUpperCase() ?? "G"}
        </div>
      </div>

      <div className="mt-4">
        <Link
          to={`/app/teacher/students/${idGrade}`}
          className="inline-flex w-full justify-center rounded-2xl bg-[#2962FF] px-4 py-3 text-sm font-extrabold text-white hover:opacity-95"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
