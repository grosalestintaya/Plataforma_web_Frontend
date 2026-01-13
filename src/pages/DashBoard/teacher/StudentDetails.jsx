import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ShowDashboardTitle from "@/components/ui/ShowDashboardTitle";
export default function StudentDetails() {
  const token = localStorage.getItem("token");
  const { id_user } = useParams();

  const [tab, setTab] = useState("resumen"); // resumen | actividades | respuestas | insignias
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [payload, setPayload] = useState(null);
  // payload: { student, progressOverview, insignias, activities }

  const fetchDetail = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:5000/api/teacher/students/${id_user}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setPayload(json);
    } catch (e) {
      setError(e?.message || "Error al cargar el detalle del estudiante");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_user]);

  const student = payload?.student;
  const overview = payload?.progressOverview;
  const insignias = Array.isArray(payload?.insignias) ? payload.insignias : [];
  const activities = Array.isArray(payload?.activities) ? payload.activities : [];

  const modules = useMemo(() => {
    // Agrupar actividades por módulo
    const map = new Map();
    for (const a of activities) {
      const key = `${a.id_module}|${a.module_title}|${a.module_sort_order}`;
      if (!map.has(key)) {
        map.set(key, {
          id_module: a.id_module,
          module_title: a.module_title,
          module_sort_order: a.module_sort_order,
          items: [],
        });
      }
      map.get(key).items.push(a);
    }

    // Ordenar módulos y actividades
    const arr = Array.from(map.values()).sort(
      (x, y) => Number(x.module_sort_order) - Number(y.module_sort_order)
    );

    for (const m of arr) {
      m.items.sort((x, y) => Number(x.activity_sort_order) - Number(y.activity_sort_order));
    }

    return arr;
  }, [activities]);

  const lastAttemptActivities = useMemo(() => {
    // Actividades que tienen last_payload "útil"
    return activities
      .filter((a) => a?.last_payload && Object.keys(a.last_payload || {}).length > 0)
      .sort((a, b) => {
        const da = a?.last_attempt_at ? new Date(a.last_attempt_at).getTime() : 0;
        const db = b?.last_attempt_at ? new Date(b.last_attempt_at).getTime() : 0;
        return db - da;
      });
  }, [activities]);

  return (
    <div className="space-y-5">
                  <ShowDashboardTitle>Estadisticas del estudiante</ShowDashboardTitle>

          <div className="space-y-5 bg-white p-6 rounded-3xl ring-1 ring-slate-200">

      {/* Top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
     

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {student?.full_name || "Detalle del estudiante"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              {student?.username && (
                <span className="rounded-full bg-[#2962FF]/10 px-3 py-1 text-xs font-extrabold text-[#2962FF] ring-1 ring-[#2962FF]/20">
                  @{student.username}
                </span>
              )}
              {student?.grade && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
                  {student.grade}
                </span>
              )}
              {typeof student?.is_active === "boolean" && (
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-extrabold ring-1",
                    student.is_active
                      ? "bg-[#00C853]/10 text-[#00C853] ring-[#00C853]/20"
                      : "bg-slate-100 text-slate-600 ring-slate-200",
                  ].join(" ")}
                >
                  {student.is_active ? "Activo" : "Inactivo"}
                </span>
              )}
            </div>
          </div>
          
        </div>

        <div className="flex flex-wrap items-center gap-2">
               <Link
            to={`/app/teacher/students/${student?.id_grade ?? ""}`}
            className="rounded-xl bg-green-500 px-3 py-2 text-sm font-extrabold text-white hover:bg-slate-200"
          >
            ← Volver
          </Link>
          <button
            onClick={fetchDetail}
            className="rounded-2xl bg-blue px-4 py-2 text-sm font-extrabold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="h-3 w-1/2 rounded bg-slate-200" />
                <div className="mt-3 h-6 w-1/3 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-extrabold">No se pudo cargar</div>
          <div className="mt-1 opacity-90">{error}</div>
        </div>
      )}

      {!loading && !error && payload && (
        <>
          {/* Summary cards */}
          <div className="grid gap-3 md:grid-cols-4">
            <KpiCard
              label="Completadas"
              value={`${overview?.activitiesCompleted ?? 0}/${overview?.activitiesTotal ?? 0}`}
              hint="Actividades"
              accent="text-[#00C853]"
            />
            <KpiCard
              label="Progreso"
              value={`${formatPct(overview?.completionPct)}%`}
              hint="Porcentaje"
              accent="text-[#7C4DFF]"
            />
            <KpiCard
              label="Promedio"
              value={overview?.avgBestScore != null ? `${Math.round(overview.avgBestScore)}` : "—"}
              hint="Best score"
              accent="text-[#2962FF]"
            />
            <KpiCard
              label="Intentos"
              value={`${overview?.attemptsTotal ?? 0}`}
              hint="Total"
              accent="text-[#FF4081]"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <KpiCard
              label="XP acumulado"
              value={`${overview?.xpTotal ?? 0}`}
              hint="Recompensas"
              accent="text-[#00C853]"
            />
            <KpiCard
              label="Coins acumuladas"
              value={`${overview?.coinsTotal ?? 0}`}
              hint="Recompensas"
              accent="text-[#FFC400]"
              dark
            />
            <KpiCard
              label="Última actividad"
              value={overview?.lastActivityAt ? formatDateTime(overview.lastActivityAt) : "—"}
              hint="Registro"
              accent="text-slate-900"
            />
          </div>

          {/* Student info (sin IDs internos; DNI es discutible) */}
          <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Información</div>
                <div className="mt-2 text-sm text-slate-700">
                  <div>
                    <span className="font-semibold">Nombre:</span> {student.full_name}
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">Usuario:</span> @{student.username}
                  </div>
                  {student?.dni && (
                    <div className="mt-1">
                      <span className="font-semibold">DNI:</span> {maskDni(student.dni)}
                    </div>
                  )}
                  {student?.grade && (
                    <div className="mt-1">
                      <span className="font-semibold">Grado:</span> {student.grade}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-extrabold text-slate-700">Nota</div>
                <div className="mt-1 text-sm text-slate-700">
                  En “Respuestas” solo se muestra el <span className="font-semibold">último intento</span>{" "}
                  registrado por actividad.
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-3xl bg-white p-2 ring-1 ring-slate-200">
            <div className="flex flex-wrap gap-2">
              <TabButton active={tab === "resumen"} onClick={() => setTab("resumen")}>
                Resumen
              </TabButton>
              <TabButton active={tab === "actividades"} onClick={() => setTab("actividades")}>
                Actividades
              </TabButton>
              <TabButton active={tab === "respuestas"} onClick={() => setTab("respuestas")}>
                Respuestas (último intento)
              </TabButton>
              <TabButton active={tab === "insignias"} onClick={() => setTab("insignias")}>
                Insignias
              </TabButton>
            </div>
          </div>

          {/* Tab content */}
          {tab === "resumen" && (
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="text-sm font-extrabold text-slate-900">Resumen general</div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="text-sm font-extrabold text-slate-900">Estado de avance</div>
                  <div className="mt-2 text-sm text-slate-700">
                    Ha completado{" "}
                    <span className="font-extrabold">
                      {overview?.activitiesCompleted ?? 0}
                    </span>{" "}
                    de{" "}
                    <span className="font-extrabold">{overview?.activitiesTotal ?? 0}</span>{" "}
                    actividades.
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                      <span>Progreso</span>
                      <span>{formatPct(overview?.completionPct)}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-[#7C4DFF]"
                        style={{ width: `${clampPct(overview?.completionPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="text-sm font-extrabold text-slate-900">Rendimiento</div>
                  <div className="mt-2 text-sm text-slate-700">
                    Promedio de mejor puntaje:{" "}
                    <span className="font-extrabold">
                      {overview?.avgBestScore != null ? Math.round(overview.avgBestScore) : "—"}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    Intentos totales:{" "}
                    <span className="font-extrabold">{overview?.attemptsTotal ?? 0}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    Recompensas:{" "}
                    <span className="font-extrabold">{overview?.xpTotal ?? 0} XP</span>{" "}
                    y{" "}
                    <span className="font-extrabold">{overview?.coinsTotal ?? 0} coins</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "actividades" && (
            <div className="space-y-4">
              {modules.map((m) => (
                <div key={`${m.id_module}-${m.module_sort_order}`} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{m.module_title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">
                        {m.items.length} actividad(es)
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
                      Módulo {m.module_sort_order}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {m.items.map((a) => (
                      <ActivityCard key={a.id_activity} a={a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "respuestas" && (
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Últimos intentos registrados
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Se muestra el payload del último intento por actividad (si existe).
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {lastAttemptActivities.length === 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                    <div className="font-extrabold text-slate-900">Sin payloads</div>
                    <div className="mt-1">
                      Este estudiante aún no tiene intentos con respuestas registradas.
                    </div>
                  </div>
                )}

                {lastAttemptActivities.map((a) => (
                  <div key={a.id_activity} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-900">
                          {a.title}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Pill tone="slate">{a.module_title}</Pill>
                          <Pill tone="blue">{capitalize(a.type)}</Pill>
                          <Pill tone={statusTone(a.status)}>{statusLabel(a.status)}</Pill>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-600">
                        {a.last_attempt_at ? formatDateTime(a.last_attempt_at) : "—"}
                      </div>
                    </div>

                    <div className="mt-3">
                      <pre className="max-h-72 overflow-auto rounded-2xl bg-white p-4 text-xs text-slate-800 ring-1 ring-slate-200">
{JSON.stringify(a.last_payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "insignias" && (
            <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
              <div className="text-sm font-extrabold text-slate-900">Insignias</div>
              <div className="mt-1 text-sm text-slate-600">
                Insignias obtenidas por el estudiante.
              </div>

              <div className="mt-4">
                {insignias.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                    <div className="font-extrabold text-slate-900">Sin insignias</div>
                    <div className="mt-1">Aún no ha desbloqueado insignias.</div>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-3">
                    {insignias.map((b, idx) => (
                      <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-extrabold text-slate-900">
                          {b?.name ?? "Insignia"}
                        </div>
                        {b?.description && (
                          <div className="mt-1 text-sm text-slate-700">{b.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </div>
 

  );
}

/* =========================
   UI helpers
========================= */

function KpiCard({ label, value, hint, accent, dark }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-xs font-extrabold text-slate-600">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${accent ?? "text-slate-900"}`}>
        {value}
      </div>
      {hint && (
        <div className={`mt-1 text-xs font-semibold ${dark ? "text-slate-800" : "text-slate-600"}`}>
          {hint}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-2 text-sm font-extrabold",
        active ? "bg-[#2962FF] text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ActivityCard({ a }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">{a.title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill tone="blue">{capitalize(a.type)}</Pill>
            <Pill tone={statusTone(a.status)}>{statusLabel(a.status)}</Pill>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-600">Best</div>
          <div className="text-sm font-extrabold text-slate-900">
            {a.best_score != null ? a.best_score : "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniStat label="Intentos" value={a.attempts_count ?? 0} />
        <MiniStat
          label="Último intento"
          value={a.last_attempt_at ? formatDateShort(a.last_attempt_at) : "—"}
        />
        <MiniStat label="XP" value={`${a.reward_xp_total ?? 0}/${a.max_xp ?? 0}`} />
        <MiniStat label="Coins" value={`${a.reward_coins_total ?? 0}/${a.max_coins ?? 0}`} />
      </div>

      {a.completed_at && (
        <div className="mt-3 text-xs font-semibold text-slate-600">
          Completada: <span className="font-extrabold text-slate-800">{formatDateTime(a.completed_at)}</span>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-xs font-extrabold text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function Pill({ tone = "slate", children }) {
  const map = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-[#2962FF]/10 text-[#2962FF] ring-[#2962FF]/20",
    green: "bg-[#00C853]/10 text-[#00C853] ring-[#00C853]/20",
    purple: "bg-[#7C4DFF]/10 text-[#7C4DFF] ring-[#7C4DFF]/20",
    yellow: "bg-[#FFC400]/30 text-slate-900 ring-[#FFC400]/40",
    gray: "bg-slate-200 text-slate-800 ring-slate-300",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${map[tone]}`}>
      {children}
    </span>
  );
}

/* =========================
   Domain helpers
========================= */

function statusLabel(status) {
  if (status === "completed") return "Completada";
  if (status === "unlocked") return "Desbloqueada";
  if (status === "locked") return "Bloqueada";
  return status || "—";
}

function statusTone(status) {
  if (status === "completed") return "green";
  if (status === "unlocked") return "blue";
  if (status === "locked") return "gray";
  return "slate";
}

function capitalize(s) {
  if (!s) return "—";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

function formatPct(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0.00";
  return v.toFixed(2);
}

function clampPct(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function formatDateShort(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "—";
  }
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

// En UI: opcional, para no exponer DNI completo
function maskDni(dni) {
  const s = String(dni ?? "");
  if (s.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}
