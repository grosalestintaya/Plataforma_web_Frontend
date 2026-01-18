// src/pages/analytics/AnalyticsStatsPage.jsx
import { useMemo, useState } from "react";
import { useAnalyticsStats } from "../../../hooks/useAnalyticsStats";
import ShowDashboardTitle from "@/components/ui/ShowDashboardTitle";
function msToMin(ms) {
  const n = Number(ms) || 0;
  const min = n / 60000;
  return `${min.toFixed(1)} min`;
}

function n2(x, d = 2) {
  const n = Number(x);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(d);
}

function pct(x, d = 0) {
  const n = Number(x);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(d)}%`;
}

export default function Estadísticas() {
  const { data, isLoading, isError, error } = useAnalyticsStats();
  const [activeWindow, setActiveWindow] = useState("last30d"); // last7d | last14d | last30d

  const kpis = useMemo(() => {
    if (!data) return null;

    const active = data.activeStudents?.[activeWindow] ?? 0;

    return {
      activeStudents: active,
      attemptsTotal: data.attempts?.total ?? 0,
      passPct: data.attempts?.passPct ?? 0,
      avgDuration: msToMin(data.attempts?.avgDurationMs ?? 0),
    };
  }, [data, activeWindow]);

  const byModule = useMemo(() => {
    const arr = data?.avgScore?.byModule ?? [];
    return [...arr].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [data]);

  const thresholds = useMemo(() => {
    const arr = data?.thresholdsByModule ?? [];
    return [...arr].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [data]);

  const funnel = useMemo(() => {
    const arr = data?.completionFunnel ?? [];
    return [...arr].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [data]);

  const byActivity = useMemo(() => {
    const arr = data?.avgScore?.byActivity ?? [];
    // orden: módulo, sort_order actividad si lo tuvieras; aquí por id_activity como fallback
    return [...arr].sort((a, b) => {
      const ma = a.module_sort_order ?? 0;
      const mb = b.module_sort_order ?? 0;
      if (ma !== mb) return ma - mb;
      return (a.id_activity ?? 0) - (b.id_activity ?? 0);
    });
  }, [data]);

  const attemptsByActivity = useMemo(() => {
    const arr = data?.engagement?.avgAttemptsByActivity ?? [];
    return [...arr].sort((a, b) => {
      const ma = a.module_sort_order ?? 0;
      const mb = b.module_sort_order ?? 0;
      if (ma !== mb) return ma - mb;
      return (a.id_activity ?? 0) - (b.id_activity ?? 0);
    });
  }, [data]);

  const topInsignias = data?.topInsignias ?? [];

  return (
    <div className="w-full" style={{ background: "var(--app-bg)" }}>
      <div className="p-6">
        <ShowDashboardTitle>Resumen de Estadísticas del Curso</ShowDashboardTitle>
<br />
        {isLoading ? (
          <Panel>Cargando estadísticas…</Panel>
        ) : isError ? (
          <Panel>
            <div className="text-sm font-semibold" style={{ color: "var(--dash-title-text)" }}>
              Error al cargar estadísticas
            </div>
            <div className="text-xs mt-1" style={{ color: "rgba(100,116,139,0.95)" }}>
              {String(error?.message || "Error desconocido")}
            </div>
          </Panel>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                title="Estudiantes activos"
                value={kpis?.activeStudents ?? "—"}
                subtitle="Ventana"
                right={
                  <WindowToggle value={activeWindow} onChange={setActiveWindow} />
                }
              />
              <KpiCard
                title="Intentos (30 días)"
                value={kpis?.attemptsTotal ?? "—"}
                subtitle="Total de intentos"
              />
              <KpiCard
                title="Aprobación"
                value={pct(kpis?.passPct ?? 0, 2)}
                subtitle="Porcentaje de intentos aprobados"
              />
              <KpiCard
                title="Duración promedio"
                value={kpis?.avgDuration ?? "—"}
                subtitle="Tiempo promedio por intento"
              />
            </div>

            {/* Row: Funnel + Avg Score by Module */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Panel title="Embudo de avance por módulo" subtitle="Cuántos estudiantes llegaron a cada módulo">
                <FunnelList rows={funnel} />
              </Panel>

              <Panel title="Score promedio por módulo" subtitle="Mejor score promedio (best_score)">
                <BarChart
                  rows={byModule.map((m) => ({
                    label: `M${m.sort_order}`,
                    name: m.title,
                    value: Number(m.avg_best_score) || 0,
                  }))}
                  maxValue={100}
                  valueSuffix="%"
                />
              </Panel>
            </div>

            {/* Row: Thresholds */}
            <div className="mb-6">
              <Panel
                title="Distribución por umbrales (≥70, ≥80, ≥90)"
                subtitle="Porcentaje de estudiantes con data que alcanzan cada umbral por módulo"
              >
                <Table
                  columns={[
                    { key: "module", label: "Módulo" },
                    { key: "students", label: "Con data", align: "right" },
                    { key: "ge70", label: "≥70", align: "right" },
                    { key: "ge80", label: "≥80", align: "right" },
                    { key: "ge90", label: "≥90", align: "right" },
                  ]}
                  rows={thresholds.map((m) => ({
                    module: `M${m.sort_order} · ${m.title}`,
                    students: m.students_with_data ?? 0,
                    ge70: `${m.pct_ge_70 ?? 0}%`,
                    ge80: `${m.pct_ge_80 ?? 0}%`,
                    ge90: `${m.pct_ge_90 ?? 0}%`,
                  }))}
                />
              </Panel>
            </div>

            {/* Row: AvgScore by Activity + Engagement attempts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Panel title="Score promedio por actividad" subtitle="Detalle por actividad (best_score)">
                <Table
                  dense
                  columns={[
                    { key: "activity", label: "Actividad" },
                    { key: "type", label: "Tipo", align: "center" },
                    { key: "module", label: "Módulo", align: "center" },
                    { key: "score", label: "Avg score", align: "right" },
                  ]}
                  rows={byActivity.map((a) => ({
                    activity: a.title,
                    type: a.type,
                    module: `M${a.module_sort_order}`,
                    score: `${n2(a.avg_best_score, 2)}%`,
                  }))}
                />
              </Panel>

              <Panel title="Engagement: intentos promedio" subtitle="Promedio de intentos por actividad">
                <Table
                  dense
                  columns={[
                    { key: "activity", label: "Actividad" },
                    { key: "module", label: "Módulo", align: "center" },
                    { key: "avg", label: "Avg intentos", align: "right" },
                  ]}
                  rows={attemptsByActivity.map((a) => ({
                    activity: a.title,
                    module: `M${a.module_sort_order}`,
                    avg: n2(a.avg_attempts, 2),
                  }))}
                />
              </Panel>
            </div>

            {/* Top insignias */}
            <div className="mb-6">
              <Panel title="Insignias más obtenidas" subtitle="Top insignias otorgadas">
                <BadgeList items={topInsignias} />
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** ---------------- UI Components ---------------- **/

function Panel({ title, subtitle, children }) {
  return (
    <section
      className="rounded-2xl border p-4 shadow-sm"
      style={{ background: "#fff", borderColor: "var(--card-border)" }}
    >
      {title ? (
        <div className="mb-3">
          <div className="text-sm font-semibold" style={{ color: "var(--dash-title-text)" }}>
            {title}
          </div>
          {subtitle ? (
            <div className="text-xs mt-1" style={{ color: "rgba(100,116,139,0.95)" }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function KpiCard({ title, value, subtitle, right }) {
  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        background: "#fff",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
            {title}
          </div>
          <div className="text-2xl font-semibold mt-1" style={{ color: "var(--dash-title-text)" }}>
            {value}
          </div>
          {subtitle ? (
            <div className="text-[11px] mt-1" style={{ color: "rgba(148,163,184,0.95)" }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
    </div>
  );
}

function WindowToggle({ value, onChange }) {
  const options = [
    { key: "last7d", label: "7d" },
    { key: "last14d", label: "14d" },
    { key: "last30d", label: "30d" },
  ];

  return (
    <div
      className="rounded-xl border p-1 flex gap-1"
      style={{ borderColor: "var(--card-border)", background: "var(--dash-title-bg)" }}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className="px-2 py-1 rounded-lg text-xs font-medium transition"
            style={{
              background: active ? "var(--primary)" : "transparent",
              color: active ? "var(--primary-foreground)" : "rgba(100,116,139,0.95)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function BarChart({ rows, maxValue = 100, valueSuffix = "" }) {
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const v = Math.max(0, Math.min(maxValue, Number(r.value) || 0));
        const w = (v / maxValue) * 100;
        return (
          <div key={r.label} className="flex items-center gap-3">
            <div className="w-14 text-xs font-semibold" style={{ color: "rgba(100,116,139,0.95)" }}>
              {r.label}
            </div>
            <div className="flex-1">
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${w}%`,
                    background: "var(--primary)",
                  }}
                />
              </div>
              <div className="text-[11px] mt-1 truncate" style={{ color: "rgba(100,116,139,0.95)" }}>
                {r.name}
              </div>
            </div>
            <div className="w-16 text-right text-xs font-semibold" style={{ color: "var(--dash-title-text)" }}>
              {v.toFixed(0)}
              {valueSuffix}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FunnelList({ rows }) {
  const max = Math.max(1, ...rows.map((r) => Number(r.reached) || 0));

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const v = Number(r.reached) || 0;
        const w = (v / max) * 100;

        return (
          <div key={r.id_module} className="flex items-center gap-3">
            <div className="w-14 text-xs font-semibold" style={{ color: "rgba(100,116,139,0.95)" }}>
              M{r.sort_order}
            </div>

            <div className="flex-1">
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${w}%`,
                    background: "var(--accent)",
                  }}
                />
              </div>
              <div className="text-[11px] mt-1 truncate" style={{ color: "rgba(100,116,139,0.95)" }}>
                {r.title}
              </div>
            </div>

            <div className="w-10 text-right text-xs font-semibold" style={{ color: "var(--dash-title-text)" }}>
              {v}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Table({ columns, rows, dense = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
            {columns.map((c) => (
              <th
                key={c.key}
                className={dense ? "py-2 px-2 text-[11px]" : "py-3 px-3 text-xs"}
                style={{
                  color: "rgba(100,116,139,0.95)",
                  textAlign: c.align || "left",
                  fontWeight: 600,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={dense ? "py-2 px-2 text-xs" : "py-3 px-3 text-sm"}
                  style={{
                    color: "var(--dash-title-text)",
                    textAlign: c.align || "left",
                    verticalAlign: "top",
                  }}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BadgeList({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((b) => (
        <div
          key={b.id_insignia}
          className="rounded-2xl border px-3 py-2"
          style={{
            background: "var(--dash-title-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="text-xs font-semibold" style={{ color: "var(--dash-title-text)" }}>
            {b.insignia_name}
          </div>
          <div className="text-[11px]" style={{ color: "rgba(100,116,139,0.95)" }}>
            {b.count} otorgadas
          </div>
        </div>
      ))}
      {!items.length ? (
        <div className="text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
          Sin datos.
        </div>
      ) : null}
    </div>
  );
}
