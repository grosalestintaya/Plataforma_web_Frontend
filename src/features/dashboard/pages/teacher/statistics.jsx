import { useMemo, useState } from "react";
import { useAnalyticsStats } from "../../hooks/useAnalyticsStats";
import ShowDashboardTitle from "@/features/dashboard/components/ShowDashboardTitle";

/** ---------------- Helpers ---------------- **/

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function firstDefined(...values) {
  for (const value of values) {
    if (hasValue(value)) return value;
  }
  return null;
}

function msToMin(ms) {
  const n = toFiniteNumber(ms);
  if (n === null) return "—";
  return `${(n / 60000).toFixed(1)} min`;
}

function n2(x, d = 2) {
  const n = toFiniteNumber(x);
  if (n === null) return "—";
  return n.toFixed(d);
}

function pct(x, d = 0) {
  const n = toFiniteNumber(x);
  if (n === null) return "—";
  return `${n.toFixed(d)}%`;
}

function sortByNumericField(arr, field) {
  return [...arr].sort((a, b) => {
    const av = toFiniteNumber(a?.[field]) ?? Number.MAX_SAFE_INTEGER;
    const bv = toFiniteNumber(b?.[field]) ?? Number.MAX_SAFE_INTEGER;
    return av - bv;
  });
}

function mergeRecords(
  prev,
  curr,
  { numericFields = [], textFields = [] } = {},
) {
  const merged = { ...prev, ...curr };

  for (const field of numericFields) {
    const prevNum = toFiniteNumber(prev?.[field]);
    const currNum = toFiniteNumber(curr?.[field]);
    merged[field] = currNum ?? prevNum ?? null;
  }

  for (const field of textFields) {
    merged[field] = firstDefined(curr?.[field], prev?.[field]);
  }

  return merged;
}

function dedupeRecords(items, getKey, mergeOptions) {
  const map = new Map();

  for (const item of items ?? []) {
    const key = getKey(item);

    if (!hasValue(key)) continue;

    if (!map.has(key)) {
      map.set(key, item);
      continue;
    }

    const prev = map.get(key);
    map.set(key, mergeRecords(prev, item, mergeOptions));
  }

  return [...map.values()];
}

function buildModuleKey(item) {
  return firstDefined(
    item?.id_module,
    item?.module_id,
    item?.sort_order,
    item?.module_sort_order,
    item?.title,
  );
}

function buildActivityKey(item) {
  return firstDefined(
    item?.id_activity,
    item?.activity_id,
    `${item?.module_sort_order ?? "x"}-${item?.title ?? "untitled"}`,
  );
}

function buildBadgeKey(item) {
  return firstDefined(item?.id_insignia, item?.insignia_name);
}

/** ---------------- Page ---------------- **/

export default function Estadisticas() {
  const { data, isLoading, isError, error } = useAnalyticsStats();
  const [activeWindow, setActiveWindow] = useState("last30d");

  const kpis = useMemo(() => {
    if (!data) return null;

    return {
      activeStudents: data.activeStudents?.[activeWindow] ?? 0,
      attemptsTotal: data.attempts?.total ?? 0,
      passPct: data.attempts?.passPct ?? null,
      avgDuration: msToMin(data.attempts?.avgDurationMs),
    };
  }, [data, activeWindow]);

  const byModule = useMemo(() => {
    const raw = data?.avgScore?.byModule ?? [];

    return sortByNumericField(
      dedupeRecords(raw, buildModuleKey, {
        numericFields: ["avg_best_score", "sort_order", "id_module"],
        textFields: ["title"],
      }),
      "sort_order",
    );
  }, [data]);

  const thresholds = useMemo(() => {
    const raw = data?.thresholdsByModule ?? [];

    return sortByNumericField(
      dedupeRecords(raw, buildModuleKey, {
        numericFields: [
          "sort_order",
          "id_module",
          "students_with_data",
          "pct_ge_70",
          "pct_ge_80",
          "pct_ge_90",
        ],
        textFields: ["title"],
      }),
      "sort_order",
    );
  }, [data]);

  const funnel = useMemo(() => {
    const raw = data?.completionFunnel ?? [];

    return sortByNumericField(
      dedupeRecords(raw, buildModuleKey, {
        numericFields: ["sort_order", "id_module", "reached"],
        textFields: ["title"],
      }),
      "sort_order",
    );
  }, [data]);

  const byActivity = useMemo(() => {
    const raw = data?.avgScore?.byActivity ?? [];

    const cleaned = dedupeRecords(raw, buildActivityKey, {
      numericFields: ["id_activity", "module_sort_order", "avg_best_score"],
      textFields: ["title", "type"],
    });

    return [...cleaned].sort((a, b) => {
      const ma =
        toFiniteNumber(a?.module_sort_order) ?? Number.MAX_SAFE_INTEGER;
      const mb =
        toFiniteNumber(b?.module_sort_order) ?? Number.MAX_SAFE_INTEGER;
      if (ma !== mb) return ma - mb;

      const aa = toFiniteNumber(a?.id_activity) ?? Number.MAX_SAFE_INTEGER;
      const ab = toFiniteNumber(b?.id_activity) ?? Number.MAX_SAFE_INTEGER;
      return aa - ab;
    });
  }, [data]);

  const attemptsByActivity = useMemo(() => {
    const raw = data?.engagement?.avgAttemptsByActivity ?? [];

    const cleaned = dedupeRecords(raw, buildActivityKey, {
      numericFields: ["id_activity", "module_sort_order", "avg_attempts"],
      textFields: ["title"],
    });

    return [...cleaned].sort((a, b) => {
      const ma =
        toFiniteNumber(a?.module_sort_order) ?? Number.MAX_SAFE_INTEGER;
      const mb =
        toFiniteNumber(b?.module_sort_order) ?? Number.MAX_SAFE_INTEGER;
      if (ma !== mb) return ma - mb;

      const aa = toFiniteNumber(a?.id_activity) ?? Number.MAX_SAFE_INTEGER;
      const ab = toFiniteNumber(b?.id_activity) ?? Number.MAX_SAFE_INTEGER;
      return aa - ab;
    });
  }, [data]);

  const topInsignias = useMemo(() => {
    const raw = data?.topInsignias ?? [];

    return dedupeRecords(raw, buildBadgeKey, {
      numericFields: ["id_insignia", "count"],
      textFields: ["insignia_name"],
    }).sort(
      (a, b) =>
        (toFiniteNumber(b?.count) ?? 0) - (toFiniteNumber(a?.count) ?? 0),
    );
  }, [data]);

  const moduleScoreRows = useMemo(() => {
    return byModule
      .filter((m) => toFiniteNumber(m?.avg_best_score) !== null)
      .map((m) => ({
        id: firstDefined(m.id_module, `module-${m.sort_order}-${m.title}`),
        label: `M${m.sort_order}`,
        name: m.title || "Sin título",
        value: toFiniteNumber(m.avg_best_score),
      }));
  }, [byModule]);

  const funnelRows = useMemo(() => {
    return funnel
      .filter((m) => toFiniteNumber(m?.reached) !== null)
      .map((m) => ({
        id: firstDefined(m.id_module, `funnel-${m.sort_order}-${m.title}`),
        sort_order: m.sort_order,
        title: m.title || "Sin título",
        reached: toFiniteNumber(m.reached),
      }));
  }, [funnel]);

  const thresholdRows = useMemo(() => {
    return thresholds.map((m) => ({
      _key: firstDefined(m.id_module, `threshold-${m.sort_order}-${m.title}`),
      module: `M${m.sort_order} · ${m.title || "Sin título"}`,
      students: n2(m.students_with_data, 0),
      ge70: pct(m.pct_ge_70, 0),
      ge80: pct(m.pct_ge_80, 0),
      ge90: pct(m.pct_ge_90, 0),
    }));
  }, [thresholds]);

  const byActivityRows = useMemo(() => {
    return byActivity.map((a) => ({
      _key: firstDefined(
        a.id_activity,
        `activity-score-${a.module_sort_order}-${a.title}`,
      ),
      activity: a.title || "Sin título",
      type: a.type || "—",
      module:
        toFiniteNumber(a.module_sort_order) !== null
          ? `M${a.module_sort_order}`
          : "—",
      score: pct(a.avg_best_score, 2),
    }));
  }, [byActivity]);

  const attemptsByActivityRows = useMemo(() => {
    return attemptsByActivity.map((a) => ({
      _key: firstDefined(
        a.id_activity,
        `activity-attempts-${a.module_sort_order}-${a.title}`,
      ),
      activity: a.title || "Sin título",
      module:
        toFiniteNumber(a.module_sort_order) !== null
          ? `M${a.module_sort_order}`
          : "—",
      avg: n2(a.avg_attempts, 2),
    }));
  }, [attemptsByActivity]);

  return (
    <div className="w-full" style={{ background: "var(--app-bg)" }}>
      <div className="p-6">
        <ShowDashboardTitle>
          Resumen de Estadísticas del Curso
        </ShowDashboardTitle>

        <div className="h-4" />

        {isLoading ? (
          <Panel>Cargando estadísticas…</Panel>
        ) : isError ? (
          <Panel>
            <div
              className="text-sm font-semibold"
              style={{ color: "var(--dash-title-text)" }}>
              Error al cargar estadísticas
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "rgba(100,116,139,0.95)" }}>
              {String(error?.message || "Error desconocido")}
            </div>
          </Panel>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                title="Estudiantes activos"
                value={kpis?.activeStudents ?? "—"}
                subtitle="Ventana"
                right={
                  <WindowToggle
                    value={activeWindow}
                    onChange={setActiveWindow}
                  />
                }
              />
              <KpiCard
                title="Intentos (30 días)"
                value={kpis?.attemptsTotal ?? "—"}
                subtitle="Total de intentos"
              />
              <KpiCard
                title="Aprobación"
                value={pct(kpis?.passPct, 2)}
                subtitle="Porcentaje de intentos aprobados"
              />
              <KpiCard
                title="Duración promedio"
                value={kpis?.avgDuration ?? "—"}
                subtitle="Tiempo promedio por intento"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Panel
                title="Embudo de avance por módulo"
                subtitle="Cuántos estudiantes llegaron a cada módulo">
                <FunnelList rows={funnelRows} />
              </Panel>

              <Panel
                title="Score promedio por módulo"
                subtitle="Mejor score promedio (best_score)">
                <BarChart
                  rows={moduleScoreRows}
                  maxValue={100}
                  valueSuffix="%"
                />
              </Panel>
            </div>

            <div className="mb-6">
              <Panel
                title="Distribución por umbrales (≥70, ≥80, ≥90)"
                subtitle="Porcentaje de estudiantes con data que alcanzan cada umbral por módulo">
                <Table
                  columns={[
                    { key: "module", label: "Módulo" },
                    { key: "students", label: "Con data", align: "right" },
                    { key: "ge70", label: "≥70", align: "right" },
                    { key: "ge80", label: "≥80", align: "right" },
                    { key: "ge90", label: "≥90", align: "right" },
                  ]}
                  rows={thresholdRows}
                  rowKey="_key"
                />
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Panel
                title="Score promedio por actividad"
                subtitle="Detalle por actividad (best_score)">
                <Table
                  dense
                  columns={[
                    { key: "activity", label: "Actividad" },
                    { key: "type", label: "Tipo", align: "center" },
                    { key: "module", label: "Módulo", align: "center" },
                    { key: "score", label: "Avg score", align: "right" },
                  ]}
                  rows={byActivityRows}
                  rowKey="_key"
                />
              </Panel>

              <Panel
                title="Engagement: intentos promedio"
                subtitle="Promedio de intentos por actividad">
                <Table
                  dense
                  columns={[
                    { key: "activity", label: "Actividad" },
                    { key: "module", label: "Módulo", align: "center" },
                    { key: "avg", label: "Avg intentos", align: "right" },
                  ]}
                  rows={attemptsByActivityRows}
                  rowKey="_key"
                />
              </Panel>
            </div>

            <div className="mb-6">
              <Panel
                title="Insignias más obtenidas"
                subtitle="Top insignias otorgadas">
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
      style={{ background: "#fff", borderColor: "var(--card-border)" }}>
      {title ? (
        <div className="mb-3">
          <div
            className="text-sm font-semibold"
            style={{ color: "var(--dash-title-text)" }}>
            {title}
          </div>
          {subtitle ? (
            <div
              className="text-xs mt-1"
              style={{ color: "rgba(100,116,139,0.95)" }}>
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
      }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
            {title}
          </div>
          <div
            className="text-2xl font-semibold mt-1"
            style={{ color: "var(--dash-title-text)" }}>
            {value}
          </div>
          {subtitle ? (
            <div
              className="text-[11px] mt-1"
              style={{ color: "rgba(148,163,184,0.95)" }}>
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
      style={{
        borderColor: "var(--card-border)",
        background: "var(--dash-title-bg)",
      }}>
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
              color: active
                ? "var(--primary-foreground)"
                : "rgba(100,116,139,0.95)",
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function BarChart({ rows, maxValue = 100, valueSuffix = "" }) {
  if (!rows.length) {
    return (
      <div className="text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
        Sin datos.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((r, idx) => {
        const raw = toFiniteNumber(r.value);
        if (raw === null) return null;

        const v = Math.max(0, Math.min(maxValue, raw));
        const w = (v / maxValue) * 100;

        return (
          <div
            key={firstDefined(r.id, `${r.label}-${idx}`)}
            className="flex items-center gap-3">
            <div
              className="w-14 text-xs font-semibold"
              style={{ color: "rgba(100,116,139,0.95)" }}>
              {r.label}
            </div>

            <div className="flex-1">
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: "rgba(15,23,42,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${w}%`,
                    background: "var(--primary)",
                  }}
                />
              </div>

              <div
                className="text-[11px] mt-1 truncate"
                style={{ color: "rgba(100,116,139,0.95)" }}>
                {r.name}
              </div>
            </div>

            <div
              className="w-16 text-right text-xs font-semibold"
              style={{ color: "var(--dash-title-text)" }}>
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
  if (!rows.length) {
    return (
      <div className="text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
        Sin datos.
      </div>
    );
  }

  const numericValues = rows
    .map((r) => toFiniteNumber(r.reached))
    .filter((v) => v !== null);

  const max = Math.max(1, ...numericValues);

  return (
    <div className="space-y-2">
      {rows.map((r, idx) => {
        const v = toFiniteNumber(r.reached);
        if (v === null) return null;

        const w = (v / max) * 100;

        return (
          <div
            key={firstDefined(r.id, `${r.sort_order}-${idx}`)}
            className="flex items-center gap-3">
            <div
              className="w-14 text-xs font-semibold"
              style={{ color: "rgba(100,116,139,0.95)" }}>
              {toFiniteNumber(r.sort_order) !== null ? `M${r.sort_order}` : "—"}
            </div>

            <div className="flex-1">
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: "rgba(15,23,42,0.08)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${w}%`,
                    background: "var(--accent)",
                  }}
                />
              </div>

              <div
                className="text-[11px] mt-1 truncate"
                style={{ color: "rgba(100,116,139,0.95)" }}>
                {r.title}
              </div>
            </div>

            <div
              className="w-10 text-right text-xs font-semibold"
              style={{ color: "var(--dash-title-text)" }}>
              {v}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Table({ columns, rows, dense = false, rowKey = "_key" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
            {columns.map((c) => (
              <th
                key={c.key}
                className={
                  dense ? "py-2 px-2 text-[11px]" : "py-3 px-3 text-xs"
                }
                style={{
                  color: "rgba(100,116,139,0.95)",
                  textAlign: c.align || "left",
                  fontWeight: 600,
                }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={firstDefined(r?.[rowKey], `row-${idx}`)}
              style={{
                borderBottom: "1px solid rgba(15,23,42,0.06)",
              }}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={dense ? "py-2 px-2 text-xs" : "py-3 px-3 text-sm"}
                  style={{
                    color: "var(--dash-title-text)",
                    textAlign: c.align || "left",
                    verticalAlign: "top",
                  }}>
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
  if (!items.length) {
    return (
      <div className="text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
        Sin datos.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((b, idx) => (
        <div
          key={firstDefined(b.id_insignia, b.insignia_name, `badge-${idx}`)}
          className="rounded-2xl border px-3 py-2"
          style={{
            background: "var(--dash-title-bg)",
            borderColor: "var(--card-border)",
          }}>
          <div
            className="text-xs font-semibold"
            style={{ color: "var(--dash-title-text)" }}>
            {b.insignia_name || "Sin nombre"}
          </div>
          <div
            className="text-[11px]"
            style={{ color: "rgba(100,116,139,0.95)" }}>
            {n2(b.count, 0)} otorgadas
          </div>
        </div>
      ))}
    </div>
  );
}
