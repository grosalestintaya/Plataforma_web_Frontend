// src/pages/teacher/grades/GradeStudents.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { TeacherService } from "../../services/teacher.service";

function getVar(el, name, fallback) {
  if (!el || typeof window === "undefined") return fallback;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

export default function GradeStudents() {
  const { id_grade } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 9);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 });
  const [gradeName, setGradeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // theme tokens
  const containerRef = useRef(null);
  const [tokens, setTokens] = useState({
    primary: "#2962ff",
    primaryFg: "#ffffff",
    accent: "#00b0ff",
    dashText: "#0f172a",
    dashBg: "rgba(0,0,0,0.05)",
    appBg: "#f8fafc",
    cardBorder: "rgba(15,23,42,0.12)",
    usercardBg: "rgba(255,255,255,0.85)",
    usercardBorder: "rgba(15,23,42,0.12)",
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setTokens({
      primary: getVar(el, "--primary", "#2962ff"),
      primaryFg: getVar(el, "--primary-foreground", "#ffffff"),
      accent: getVar(el, "--accent", "#00b0ff"),
      dashText: getVar(el, "--dash-title-text", "#0f172a"),
      dashBg: getVar(el, "--dash-title-bg", "rgba(0,0,0,0.05)"),
      appBg: getVar(el, "--app-bg", "#f8fafc"),
      cardBorder: getVar(el, "--card-border", "rgba(15,23,42,0.12)"),
      usercardBg: getVar(el, "--usercard-bg", "rgba(255,255,255,0.85)"),
      usercardBorder: getVar(el, "--usercard-border", "rgba(15,23,42,0.12)"),
    });
  }, []);

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

  const goToPage = (p) =>
    updateParams({ page: Math.min(Math.max(1, p), totalPages) });

  const fetchGradeName = async () => {
    try {
      const json = await TeacherService.listGrades();
      const arr = Array.isArray(json) ? json : [];
      const found = arr.find((g) => String(g.id_grade) === String(id_grade));
      if (found?.name) setGradeName(found.name);
    } catch (e) {
      // no crítico; 401 lo maneja apiClient
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const json = await TeacherService.listStudents({
        q,
        id_grade,
        page,
        limit,
      });
      setItems(Array.isArray(json?.items) ? json.items : []);
      setPagination(json?.pagination ?? { page, limit, total: 0 });
    } catch (e) {
      if (e?.status !== 401)
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
    <div
      ref={containerRef}
      className="space-y-5"
      style={{ background: tokens.appBg }}>
      <ShowDashboardTitle>Estudiantes</ShowDashboardTitle>

      <div
        className="space-y-5 p-6 rounded-3xl border shadow-sm"
        style={{ background: "#fff", borderColor: tokens.cardBorder }}>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight"
              style={{ color: tokens.dashText }}>
              {gradeName || "Estudiantes"}
            </h1>

            <p
              className="mt-1 text-sm"
              style={{ color: "rgba(100,116,139,0.95)" }}>
              Lista de estudiantes del grado seleccionado. No se muestran
              identificadores internos.
            </p>
          </div>

          <div className="md:flex md:items-center md:gap-4">
            <Link
              to="/app/teacher/students"
              className="rounded-xl px-4 py-2 text-sm font-extrabold border transition"
              style={{
                background: tokens.dashBg,
                borderColor: tokens.cardBorder,
                color: tokens.dashText,
              }}>
              ← Volver
            </Link>

            <div
              className="rounded-2xl px-4 py-2 text-sm font-semibold border"
              style={{
                background: "#fff",
                borderColor: tokens.cardBorder,
                color: "rgba(100,116,139,0.95)",
              }}>
              Total:{" "}
              <span
                className="font-extrabold"
                style={{ color: tokens.dashText }}>
                {pagination.total ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Search + limit */}
        <div
          className="rounded-3xl p-4 border"
          style={{ background: "#fff", borderColor: tokens.cardBorder }}>
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-9">
              <label
                className="text-xs font-extrabold"
                style={{ color: "rgba(100,116,139,0.95)" }}>
                Buscar
              </label>
              <input
                value={q}
                onChange={(e) => updateParams({ q: e.target.value, page: 1 })}
                placeholder="Nombre o usuario (username)…"
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none"
                style={{
                  borderColor: tokens.cardBorder,
                  background: "rgba(15,23,42,0.04)",
                  color: tokens.dashText,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = tokens.primary)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = tokens.cardBorder)
                }
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="text-xs font-extrabold"
                style={{ color: "rgba(100,116,139,0.95)" }}>
                Límite
              </label>
              <select
                value={limit}
                onChange={(e) =>
                  updateParams({ limit: Number(e.target.value), page: 1 })
                }
                className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none"
                style={{
                  borderColor: tokens.cardBorder,
                  background: "rgba(15,23,42,0.04)",
                  color: tokens.dashText,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = tokens.primary)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = tokens.cardBorder)
                }>
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
                className="w-full rounded-2xl px-4 py-3 text-sm font-extrabold border transition"
                style={{
                  background: tokens.dashBg,
                  borderColor: tokens.cardBorder,
                  color: tokens.dashText,
                }}>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="rounded-3xl p-4 border"
          style={{ background: "#fff", borderColor: tokens.cardBorder }}>
          {loading && (
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: Math.min(limit, 9) }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-4 border"
                  style={{
                    borderColor: tokens.cardBorder,
                    background: "rgba(15,23,42,0.04)",
                  }}>
                  <div
                    className="h-4 w-2/3 rounded"
                    style={{ background: "rgba(15,23,42,0.14)" }}
                  />
                  <div
                    className="mt-3 h-3 w-1/2 rounded"
                    style={{ background: "rgba(15,23,42,0.12)" }}
                  />
                  <div
                    className="mt-4 h-9 w-full rounded-2xl"
                    style={{ background: "rgba(15,23,42,0.12)" }}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              className="rounded-3xl border p-4 text-sm"
              style={{
                borderColor: "rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.08)",
                color: "#b91c1c",
              }}>
              <div className="font-extrabold">No se pudo cargar</div>
              <div className="mt-1 opacity-90">{error}</div>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div
              className="rounded-3xl border p-6 text-sm"
              style={{
                borderColor: tokens.cardBorder,
                background: "rgba(15,23,42,0.04)",
                color: "rgba(100,116,139,0.95)",
              }}>
              <div
                className="font-extrabold"
                style={{ color: tokens.dashText }}>
                Sin resultados
              </div>
              <div className="mt-1">
                No hay estudiantes para este grado con el filtro actual.
              </div>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                {items.map((s) => (
                  <StudentCard key={s.username} student={s} tokens={tokens} />
                ))}
              </div>

              <div
                className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
                style={{ borderColor: tokens.cardBorder }}>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "rgba(100,116,139,0.95)" }}>
                  Página{" "}
                  <span
                    className="font-extrabold"
                    style={{ color: tokens.dashText }}>
                    {pagination.page}
                  </span>{" "}
                  de{" "}
                  <span
                    className="font-extrabold"
                    style={{ color: tokens.dashText }}>
                    {totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="rounded-2xl px-4 py-2 text-sm font-extrabold border transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: tokens.dashBg,
                      borderColor: tokens.cardBorder,
                      color: tokens.dashText,
                    }}>
                    Anterior
                  </button>

                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="rounded-2xl px-4 py-2 text-sm font-extrabold border transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: tokens.dashBg,
                      borderColor: tokens.cardBorder,
                      color: tokens.dashText,
                    }}>
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentCard({ student, tokens }) {
  const status = student.is_active ? "Activo" : "Inactivo";

  return (
    <div
      className="rounded-3xl border p-4 transition"
      style={{ borderColor: tokens.usercardBorder, background: "#fff" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = tokens.usercardBg)
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="truncate text-sm font-extrabold"
            style={{ color: tokens.dashText }}>
            {student.full_name}
          </div>

          <div className="mt-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-extrabold border"
              style={{
                background: `color-mix(in srgb, ${tokens.primary} 12%, transparent)`,
                color: tokens.primary,
                borderColor: `color-mix(in srgb, ${tokens.primary} 22%, transparent)`,
              }}>
              @{student.username}
            </span>
          </div>
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-extrabold border"
          style={
            student.is_active
              ? {
                  background: `color-mix(in srgb, ${tokens.primary} 12%, transparent)`,
                  color: tokens.primary,
                  borderColor: `color-mix(in srgb, ${tokens.primary} 22%, transparent)`,
                }
              : {
                  background: "rgba(15,23,42,0.06)",
                  color: "rgba(100,116,139,0.95)",
                  borderColor: tokens.cardBorder,
                }
          }>
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end">
        {/* Ruta sin IDs visibles */}
        <Link
          to={`/app/teacher/students/view/${encodeURIComponent(student.id_user)}`}
          className="rounded-2xl px-4 py-2 text-xs font-extrabold border transition"
          style={{
            background: tokens.primary,
            color: tokens.primaryFg,
            borderColor: `color-mix(in srgb, ${tokens.primary} 40%, transparent)`,
          }}>
          Ver detalles
        </Link>
      </div>
    </div>
  );
}
