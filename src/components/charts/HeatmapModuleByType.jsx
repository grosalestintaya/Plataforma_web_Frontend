// src/components/charts/HeatmapModuleByType.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

function clamp01(x) {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function formatPct(v) {
  const n = Number(v) || 0;
  return `${n}%`;
}

/** ---- color helpers (HEX/RGBA) ---- **/
function parseCssColorToRgb(input) {
  const s = String(input || "").trim();

  // rgba(255, 0, 0, 0.2) / rgb(255,0,0)
  const rgba = s.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0)?)\s*)?\)$/
  );
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] == null ? 1 : Number(rgba[4]),
    };
  }

  // hex: #RGB, #RRGGBB, #RRGGBBAA
  if (s.startsWith("#")) {
    const h = s.slice(1);
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return { r, g, b, a: 1 };
    }
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    if (h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = parseInt(h.slice(6, 8), 16) / 255;
      return { r, g, b, a };
    }
  }

  // fallback
  return { r: 0, g: 0, b: 0, a: 1 };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(ca, cb, t) {
  return {
    r: lerp(ca.r, cb.r, t),
    g: lerp(ca.g, cb.g, t),
    b: lerp(ca.b, cb.b, t),
    a: lerp(ca.a ?? 1, cb.a ?? 1, t),
  };
}

function rgbaString({ r, g, b, a = 1 }) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

function getVarFromElement(el, name, fallback) {
  if (!el || typeof window === "undefined") return fallback;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

function getCellColor(t, low, mid, high) {
  // 0..1 -> low->mid->high (soporta alpha)
  const L = parseCssColorToRgb(low);
  const M = parseCssColorToRgb(mid);
  const H = parseCssColorToRgb(high);

  const color =
    t <= 0.5 ? lerpColor(L, M, t / 0.5) : lerpColor(M, H, (t - 0.5) / 0.5);

  // devolvemos rgba para respetar alpha de low si existe
  return rgbaString(color);
}

function getReadableTextColor(t, dashText, primaryFg) {
  return t >= 0.45 ? primaryFg : dashText;
}

const DEFAULT_TOKENS = {
  heatLow: "rgba(41, 98, 255, 0.10)",
  heatMid: "#2962ff",
  heatHigh: "#00b0ff",
  primary: "#2962ff",
  dashText: "#0f172a",
  primaryFg: "#ffffff",
  cardBorder: "rgba(15, 23, 42, 0.12)",
  dashBg: "rgba(41, 98, 255, 0.10)",
  appBg: "#f8fafc",
};

export default function HeatmapModuleByType({ data, themeKey }) {
  const { modules, types, matrix, meta } = data;

  const containerRef = useRef(null);

  // escala
  const flat = useMemo(() => matrix.flat().map((c) => Number(c.value) || 0), [matrix]);
  const max = useMemo(() => Math.max(1, ...flat), [flat]);

  // selección
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected && modules?.length && types?.length && matrix?.length) {
      setSelected({ module: modules[0], type: types[0], cell: matrix?.[0]?.[0] });
    }
  }, [modules, types, matrix, selected]);

  // ✅ tokens: se recalculan cuando el ref existe y cuando cambia themeKey
  const [tokens, setTokens] = useState(DEFAULT_TOKENS);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const heatLow = getVarFromElement(el, "--heat-low", DEFAULT_TOKENS.heatLow);
    const heatMid = getVarFromElement(el, "--heat-mid", DEFAULT_TOKENS.heatMid);
    const heatHigh = getVarFromElement(el, "--heat-high", DEFAULT_TOKENS.heatHigh);

    const primary = getVarFromElement(el, "--primary", DEFAULT_TOKENS.primary);
    const dashText = getVarFromElement(el, "--dash-title-text", DEFAULT_TOKENS.dashText);
    const primaryFg = getVarFromElement(el, "--primary-foreground", DEFAULT_TOKENS.primaryFg);

    const cardBorder = getVarFromElement(el, "--usercard-border", DEFAULT_TOKENS.cardBorder);
    const dashBg = getVarFromElement(el, "--dash-title-bg", DEFAULT_TOKENS.dashBg);
    const appBg = getVarFromElement(el, "--app-bg", DEFAULT_TOKENS.appBg);

    setTokens({
      heatLow,
      heatMid,
      heatHigh,
      primary,
      dashText,
      primaryFg,
      cardBorder,
      dashBg,
      appBg,
    });
  }, [themeKey]); // si no pasas themeKey igual se ejecuta al montar; con themeKey soporta cambio en caliente

  return (
    <div
      ref={containerRef}
      className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]  gap-6"
    >
      {/* Heatmap */}
      <div
        className="rounded-2xl p-4 shadow-sm border"
        style={{ background: "#fff", borderColor: tokens.cardBorder }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-base font-semibold" style={{ color: tokens.dashText }}>
              Heatmap: módulo vs tipo de actividad
            </div>
            <div className="text-xs mt-1" style={{ color: "rgba(100,116,139,0.95)" }}>
              Métrica: <span className="font-medium">{meta.metric}</span> · Rango:{" "}
              <span className="font-medium">{meta.rangeDays} días</span> · Estudiantes:{" "}
              <span className="font-medium">{meta.studentsTotal}</span>
            </div>
          </div>

          <Legend max={max} tokens={tokens} />
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid gap-2 pr-1 py-1"
            style={{
              gridTemplateColumns: `340px repeat(${types.length}, minmax(130px, 1fr))`,
              alignItems: "center",
            }}
          >
            <div />
            {types.map((t) => (
              <div
                key={t.key}
                className="text-sm font-semibold text-center"
                style={{ color: tokens.dashText }}
              >
                {t.label}
              </div>
            ))}

            {modules.map((m, r) => (
              <Row
                key={m.id}
                module={m}
                rowCells={matrix[r]}
                types={types}
                max={max}
                selected={selected}
                onSelect={(type, cell) => setSelected({ module: m, type, cell })}
                tokens={tokens}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
          Click en una celda para ver el detalle a la derecha.
        </div>
      </div>

      <SidePanel selected={selected} meta={meta} tokens={tokens} />
    </div>
  );
}

function Row({ module, rowCells, types, max, selected, onSelect, tokens }) {
  return (
    <>
      <div className="pr-4">
        <div className="text-sm font-semibold truncate" style={{ color: tokens.dashText }}>
          {module.title}
        </div>
        <div className="text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
          M{module.sort_order}
        </div>
      </div>

      {types.map((t, idx) => {
        const cell = rowCells?.[idx] || { value: 0, stats: null };
        const v = Number(cell.value) || 0;
        const intensity = clamp01(v / max);

        const isSelected =
          selected?.module?.id === module.id && selected?.type?.key === t.key;

        const bg = getCellColor(intensity, tokens.heatLow, tokens.heatMid, tokens.heatHigh);
        const fg = getReadableTextColor(intensity, tokens.dashText, tokens.primaryFg);

        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onSelect(t, cell)}
            className="h-12 rounded-2xl border relative select-none transition focus:outline-none"
              style={{
                borderColor: isSelected ? "#0f172a" : tokens.primary,
              boxShadow: isSelected ? "0 0 0 3px #0f172a" : "none",
                background: bg,
                backgroundColor: isSelected ? "#ff0000" : bg,
                color: isSelected ? "#ffffff" : fg,
              }}


            aria-label={`${module.title} / ${t.label}: ${v}%`}
            title={`${t.label} · ${formatPct(v)}`}
          >
            <div className="relative h-full flex items-center justify-center">
              <div className="text-sm font-semibold" style={{ color: fg }}>
                {formatPct(v)}
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}

function SidePanel({ selected, meta, tokens }) {
  const s = selected?.cell?.stats;

  return (
<aside
  className="w-[420px] shrink-0 rounded-2xl p-4 shadow-sm border h-fit lg:sticky lg:top-4"
  style={{
    background: "#fff",
    borderColor: tokens.cardBorder,
    borderTop: `4px solid ${tokens.primary}`, // ✅ énfasis por tema
  }}
>
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="text-sm font-semibold" style={{ color: tokens.primary }}>
        Detalle
      </div>

      <div className="text-xs mt-1" style={{ color: "rgba(100,116,139,0.95)" }}>
        {meta.metric} · {meta.rangeDays} días
      </div>
    </div>

    <div
      className="rounded-2xl border px-3 py-2 text-center"
      style={{ background: tokens.dashBg, borderColor: tokens.cardBorder }}
    >
      <div className="text-[11px]" style={{ color: "rgba(100,116,139,0.95)" }}>
        Valor
      </div>
      {/* ✅ valor resaltado por tema */}
      <div className="text-lg font-semibold" style={{ color: tokens.primary }}>
        {selected ? `${selected.cell?.value ?? 0}%` : "—"}
      </div>
    </div>
  </div>

  <div className="mt-4 space-y-2">
    <InfoRow label="Módulo" value={selected?.module?.title || "—"} tokens={tokens} />
    <InfoRow label="Tipo" value={selected?.type?.label || "—"} tokens={tokens} />
  </div>

  <div className="mt-4 grid grid-cols-2 gap-3">
    <StatCard
      label="Completados"
      value={s ? `${s.completedStudents}/${s.studentsTotal}` : "—"}
      hint="alumnos que completaron"
      tokens={tokens}
    />
    <StatCard
      label="Con progreso"
      value={s ? `${s.studentsWithProgress}/${s.studentsTotal}` : "—"}
      hint="alumnos con actividad"
      tokens={tokens}
    />
    <StatCard
      label="Prom. score"
      value={s ? `${s.avgBestScore}` : "—"}
      hint="mejor score promedio"
      tokens={tokens}
    />
    <StatCard
      label="Prom. intentos"
      value={s ? `${s.avgAttempts}` : "—"}
      hint="intentos promedio"
      tokens={tokens}
    />
    <StatCard
      label="Intentos (rango)"
      value={s ? `${s.attemptsTotalInRange}` : "—"}
      hint="suma en el rango"
      tokens={tokens}
    />
    <StatCard
      label="Actividades"
      value={s ? `${s.activitiesCount}` : "—"}
      hint="cantidad agregada"
      tokens={tokens}
    />
  </div>

  <div
    className="mt-4 rounded-2xl border p-3"
    style={{ background: tokens.appBg, borderColor: tokens.cardBorder }}
  >
    <div className="text-xs leading-relaxed" style={{ color: "rgba(71,85,105,0.95)" }}>
      Interpretación rápida: este valor resume el rendimiento del módulo para ese tipo de
      actividad. Úsalo para detectar qué dimensión (conceptual/procedimental/actitudinal)
      requiere refuerzo.
    </div>
  </div>
</aside>

  );
}

function InfoRow({ label, value, tokens }) {
  return (
    <div className="flex gap-3">
      <div className="w-20 text-xs" style={{ color: "rgba(100,116,139,0.95)" }}>
        {label}
      </div>
      <div className="flex-1 text-xs truncate" style={{ color: tokens.dashText }}>
        {value}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, tokens }) {
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: tokens.cardBorder, background: "#ffffff" }}>
      <div className="text-[11px]" style={{ color: "rgba(100,116,139,0.95)" }}>
        {label}
      </div>
      <div className="mt-1 text-base font-semibold" style={{ color: tokens.dashText }}>
        {value}
      </div>
      {hint ? <div className="mt-1 text-[11px]" style={{ color: "rgba(148,163,184,0.95)" }}>{hint}</div> : null}
    </div>
  );
}

function Legend({ max, tokens }) {
  const stops = [0, 0.5, 1].map((t) => getCellColor(t, tokens.heatLow, tokens.heatMid, tokens.heatHigh));
  return (
    <div className="flex items-center gap-2">
      <div className="text-[11px]" style={{ color: "rgba(100,116,139,0.95)" }}>
        0
      </div>
      <div className="flex items-center gap-1">
        {stops.map((c, i) => (
          <div
            key={i}
            className="h-3 w-10 rounded-md border"
            style={{ borderColor: tokens.cardBorder, background: c }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="text-[11px]" style={{ color: "rgba(100,116,139,0.95)" }}>
        {max}
      </div>
    </div>
  );
}
