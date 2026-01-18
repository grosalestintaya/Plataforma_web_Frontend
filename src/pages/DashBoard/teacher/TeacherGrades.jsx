import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ShowDashboardTitle from "../../../components/ui/ShowDashboardTitle";
import { GradesService } from "@/services/grades.service";

function getVar(el, name, fallback) {
  if (!el || typeof window === "undefined") return fallback;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

export default function TeacherGrades() {
  const [grades, setGrades] = useState([]); // [{id_grade, name}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // theme tokens
  const containerRef = useRef(null);
  const [tokens, setTokens] = useState({
    primary: "#2962ff",
    primaryFg: "#ffffff",
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
      dashText: getVar(el, "--dash-title-text", "#0f172a"),
      dashBg: getVar(el, "--dash-title-bg", "rgba(0,0,0,0.05)"),
      appBg: getVar(el, "--app-bg", "#f8fafc"),
      cardBorder: getVar(el, "--card-border", "rgba(15,23,42,0.12)"),
      usercardBg: getVar(el, "--usercard-bg", "rgba(255,255,255,0.85)"),
      usercardBorder: getVar(el, "--usercard-border", "rgba(15,23,42,0.12)"),
    });
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    setError("");

    try {
      const json = await GradesService.list();
      setGrades(Array.isArray(json) ? json : []);
    } catch (e) {
      // 401 lo maneja apiClient (logout/redirect). Aquí no “ensuciamos” UI por 401.
      if (e?.status !== 401) setError(e?.message || "Error al cargar grados");
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
    <div ref={containerRef} className="space-y-5" style={{ background: tokens.appBg }}>
      <ShowDashboardTitle>Grados</ShowDashboardTitle>

      <div
        className="space-y-5 p-6 rounded-3xl border shadow-sm"
        style={{ background: "#fff", borderColor: tokens.cardBorder }}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: tokens.dashText }}>
              Grados
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(100,116,139,0.95)" }}>
              Selecciona un grado para ver el listado de estudiantes.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchGrades}
            className="rounded-2xl px-4 py-2 text-sm font-extrabold border transition"
            style={{
              background: tokens.dashBg,
              borderColor: tokens.cardBorder,
              color: tokens.dashText,
            }}
          >
            Actualizar
          </button>
        </div>

        <div className="rounded-3xl p-4 border" style={{ background: "#fff", borderColor: tokens.cardBorder }}>
          {loading && (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-5 border"
                  style={{ borderColor: tokens.cardBorder, background: "rgba(15,23,42,0.04)" }}
                >
                  <div className="h-4 w-1/2 rounded" style={{ background: "rgba(15,23,42,0.14)" }} />
                  <div className="mt-4 h-10 w-full rounded-2xl" style={{ background: "rgba(15,23,42,0.12)" }} />
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
              }}
            >
              <div className="font-extrabold">No se pudo cargar</div>
              <div className="mt-1 opacity-90">{error}</div>
            </div>
          )}

          {!loading && !error && grades.length === 0 && (
            <div
              className="rounded-3xl border p-6 text-sm"
              style={{
                borderColor: tokens.cardBorder,
                background: "rgba(15,23,42,0.04)",
                color: "rgba(100,116,139,0.95)",
              }}
            >
              <div className="font-extrabold" style={{ color: tokens.dashText }}>
                Sin grados
              </div>
              <div className="mt-1">No hay grados registrados.</div>
            </div>
          )}

          {!loading && !error && grades.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {grades.map((g) => (
                <GradeCard key={g.id_grade} idGrade={g.id_grade} name={g.name} tokens={tokens} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GradeCard({ idGrade, name, tokens }) {
  return (
    <div
      className="rounded-3xl border p-5 transition"
      style={{
        borderColor: tokens.usercardBorder,
        background: "#fff",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = tokens.usercardBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold" style={{ color: tokens.dashText }}>
            {name}
          </div>
          <div className="mt-1 text-sm font-semibold" style={{ color: "rgba(100,116,139,0.95)" }}>
            Ver estudiantes de este grado
          </div>
        </div>

        <div
          className="grid h-10 w-10 place-items-center rounded-2xl border text-sm font-extrabold"
          style={{
            background: `color-mix(in srgb, ${tokens.primary} 12%, transparent)`,
            color: tokens.primary,
            borderColor: `color-mix(in srgb, ${tokens.primary} 22%, transparent)`,
          }}
          aria-hidden="true"
        >
          {name?.[0]?.toUpperCase() ?? "G"}
        </div>
      </div>

      <div className="mt-4">
        <Link
          to={`/app/teacher/students/${encodeURIComponent(String(idGrade))}`}
          className="inline-flex w-full justify-center rounded-2xl px-4 py-3 text-sm font-extrabold border transition"
          style={{
            background: tokens.primary,
            color: tokens.primaryFg,
            borderColor: `color-mix(in srgb, ${tokens.primary} 40%, transparent)`,
          }}
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
