// src/pages/analytics/AnalyticsChartsPage.jsx
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAnalyticsCharts } from "../../hooks/useAnalyticsCharts";
import SafeResponsive from "../../charts/SafeResponsive";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const RC_DEBOUNCE = 120;

function parseNum(x) {
  const n = Number(x);
  return Number.isNaN(n) ? 0 : n;
}

function pct(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(0)}%`;
}

function getVar(el, name, fallback) {
  if (!el || typeof window === "undefined") return fallback;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

function formatDateShort(iso) {
  // iso: YYYY-MM-DD -> DD/MM
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function tooltipDateLabel(label) {
  return label;
}

export default function Graficos() {
  const { data, isLoading, isError, error } = useAnalyticsCharts();

  const containerRef = useRef(null);
  const [colors, setColors] = useState({
    primary: "#2962ff",
    accent: "#00b0ff",
    text: "#0f172a",
    grid: "rgba(15,23,42,0.08)",
    border: "rgba(15,23,42,0.12)",
    fail: "rgba(15,23,42,0.35)",
  });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setColors({
      primary: getVar(el, "--primary", "#2962ff"),
      accent: getVar(el, "--accent", "#00b0ff"),
      text: getVar(el, "--dash-title-text", "#0f172a"),
      grid: "rgba(15,23,42,0.08)",
      border: getVar(el, "--card-border", "rgba(15,23,42,0.12)"),
      fail: "rgba(15,23,42,0.35)",
    });
  }, []);

  const avgScoreByModule = useMemo(() => {
    const arr = data?.avgScoreByModule ?? [];
    return [...arr]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((m) => ({
        key: `M${m.sort_order}`,
        module: m.module,
        avg: parseNum(m.avg_score),
      }));
  }, [data]);

  const insigniasTop10 = useMemo(() => {
    const arr = data?.insigniasTop10 ?? [];
    return [...arr]
      .sort((a, b) => (parseNum(b.count) ?? 0) - (parseNum(a.count) ?? 0))
      .map((x) => ({ name: x.name, count: parseNum(x.count) }));
  }, [data]);

  const xpByDay = useMemo(() => {
    const arr = data?.xpByDay ?? [];
    return [...arr]
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((d) => ({
        date: d.date,
        d: formatDateShort(d.date),
        xp: parseNum(d.xp),
      }));
  }, [data]);

  const attemptsByDay = useMemo(() => {
    const arr = data?.attemptsByDay ?? [];
    return [...arr]
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((d) => ({
        date: d.date,
        d: formatDateShort(d.date),
        attempts: parseNum(d.attempts),
      }));
  }, [data]);

  const passFailByDay = useMemo(() => {
    const arr = data?.passFailByDay ?? [];
    return [...arr]
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((d) => ({
        date: d.date,
        d: formatDateShort(d.date),
        pass: parseNum(d.pass),
        fail: parseNum(d.fail),
        total: parseNum(d.total),
        pass_pct: parseNum(d.pass_pct),
      }));
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="w-full min-w-0"
      style={{ background: "var(--app-bg)" }}>
      <div className="p-6">
        <header
          className="rounded-2xl border p-4 mb-6"
          style={{
            background: "var(--dash-title-bg)",
            borderColor: "var(--card-border)",
          }}>
          <div
            className="text-lg font-semibold"
            style={{ color: "var(--dash-title-text)" }}>
            Gráficos de Rendimiento y Actividad
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "rgba(100,116,139,0.95)" }}>
            Rango:{" "}
            <span className="font-medium">{data?.rangeDays ?? 30} días</span>
          </div>
        </header>

        {isLoading ? (
          <Panel> Cargando gráficos… </Panel>
        ) : isError ? (
          <Panel>
            <div
              className="text-sm font-semibold"
              style={{ color: "var(--dash-title-text)" }}>
              Error al cargar charts
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "rgba(100,116,139,0.95)" }}>
              {String(error?.message || "Error desconocido")}
            </div>
          </Panel>
        ) : (
          <>
            {/* Fila 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Panel
                title="Score promedio por módulo"
                subtitle="Mejor score promedio por módulo (0–100)">
                <SafeResponsive height={320} debounce={RC_DEBOUNCE}>
                  <BarChart
                    data={avgScoreByModule}
                    layout="vertical"
                    margin={{ left: 12, right: 16 }}>
                    <CartesianGrid stroke={colors.grid} vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="key"
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15,23,42,0.04)" }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: colors.border,
                      }}
                      labelFormatter={() => ""}
                      formatter={(v, _k, p) => [
                        `${Number(v).toFixed(1)}%`,
                        p?.payload?.module,
                      ]}
                    />
                    <Bar
                      dataKey="avg"
                      fill={colors.primary}
                      radius={[10, 10, 10, 10]}
                    />
                  </BarChart>
                </SafeResponsive>
              </Panel>

              <Panel
                title="Top insignias"
                subtitle="Ranking de insignias otorgadas">
                <SafeResponsive height={320} debounce={RC_DEBOUNCE}>
                  <BarChart
                    data={insigniasTop10}
                    layout="vertical"
                    margin={{ left: 12, right: 16 }}>
                    <CartesianGrid stroke={colors.grid} vertical={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={150}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15,23,42,0.04)" }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: colors.border,
                      }}
                      formatter={(v) => [`${v}`, "Otorgadas"]}
                    />
                    <Bar
                      dataKey="count"
                      fill={colors.accent}
                      radius={[10, 10, 10, 10]}
                    />
                  </BarChart>
                </SafeResponsive>
              </Panel>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Panel
                title="Intentos por día"
                subtitle="Volumen de intentos (engagement)">
                <SafeResponsive height={300} debounce={RC_DEBOUNCE}>
                  <LineChart
                    data={attemptsByDay}
                    margin={{ left: 8, right: 16 }}>
                    <CartesianGrid stroke={colors.grid} vertical={false} />
                    <XAxis
                      dataKey="d"
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ stroke: colors.grid }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: colors.border,
                      }}
                      labelFormatter={tooltipDateLabel}
                      formatter={(v, _k, p) => [
                        `${v}`,
                        `Intentos · ${p?.payload?.date}`,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="attempts"
                      stroke={colors.primary}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </SafeResponsive>
              </Panel>

              <Panel
                title="XP por día"
                subtitle="XP total acumulado por día (gamificación)">
                <SafeResponsive height={300} debounce={RC_DEBOUNCE}>
                  <AreaChart data={xpByDay} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid stroke={colors.grid} vertical={false} />
                    <XAxis
                      dataKey="d"
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ stroke: colors.grid }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: colors.border,
                      }}
                      labelFormatter={tooltipDateLabel}
                      formatter={(v, _k, p) => [
                        `${v}`,
                        `XP · ${p?.payload?.date}`,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      stroke={colors.accent}
                      strokeWidth={2}
                      fill={colors.accent}
                      fillOpacity={0.18}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </SafeResponsive>
              </Panel>
            </div>

            {/* Fila 3 */}
            <div className="mb-6">
              <Panel
                title="Aprobados vs Reprobados por día"
                subtitle="Barras apiladas por fecha + % aprobación">
                <SafeResponsive height={340} debounce={RC_DEBOUNCE}>
                  <BarChart
                    data={passFailByDay}
                    margin={{ left: 8, right: 16 }}>
                    <CartesianGrid stroke={colors.grid} vertical={false} />
                    <XAxis
                      dataKey="d"
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: colors.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15,23,42,0.04)" }}
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: colors.border,
                      }}
                      labelFormatter={tooltipDateLabel}
                      formatter={(v, key, p) => {
                        if (key === "pass")
                          return [`${v}`, `Aprobados · ${p?.payload?.date}`];
                        if (key === "fail")
                          return [`${v}`, `Reprobados · ${p?.payload?.date}`];
                        return [v, key];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="pass"
                      stackId="pf"
                      fill={colors.primary}
                      radius={[10, 10, 0, 0]}
                    />
                    <Bar
                      dataKey="fail"
                      stackId="pf"
                      fill={colors.fail}
                      radius={[0, 0, 10, 10]}
                    />
                  </BarChart>
                </SafeResponsive>

                {/* mini resumen debajo (sin “tabla”) */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {passFailByDay.map((d) => (
                    <div
                      key={d.date}
                      className="rounded-2xl border p-3"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--dash-title-bg)",
                      }}>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: "var(--dash-title-text)" }}>
                        {d.date}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "rgba(100,116,139,0.95)" }}>
                        Pass: {d.pass} · Fail: {d.fail} · Total: {d.total} ·{" "}
                        {pct(d.pass_pct)}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** ---------- UI ---------- **/

function Panel({ title, subtitle, children }) {
  return (
    <section
      className="rounded-2xl border p-4 shadow-sm min-w-0"
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
