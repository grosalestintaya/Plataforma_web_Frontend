// src/pages/ModuleMenuPageBeta.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";



import { getLearnFor } from "../utils/activityLearn";
import { getModuleTheme, MODULE_COLORS_HEX } from "../utils/moduleTheme";
import { getMascotForModule } from "../../guidepet/utils/mascotCatalog";
import QuipuHeader from "../components/QuipuHeader";
import ActivityDots from "../components/ActivityDots";
import MascotTutorDemo from "../../guidepet/MascotTutorDemo";
const API_OVERVIEW = "http://localhost:5000/api/progress/overview";



  // const [mostrar, setMostrar] = useState(false);





// -------- helpers UI (alpha local) ----------
function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// -------- domain helpers ----------
function moduleKeyToSortOrder(moduleKey) {
  const n = String(moduleKey || "").replace(/\D/g, "");
  const num = Number(n);
  return Number.isFinite(num) ? num : null;
}

function statusPriority(s) {
  if (s === "completed") return 3;
  if (s === "unlocked" || s === "in_progress") return 2;
  if (s === "locked") return 1;
  return 0;
}
function pickModuleByKey(overviewModules, moduleKey) {
  const so = moduleKeyToSortOrder(moduleKey);
  if (!so) return null;

  const candidates = (overviewModules || []).filter(
    (m) => Number(m.sortOrder) === so,
  );
  if (candidates.length === 0) return null;

  const sorted = [...candidates].sort((a, b) => {
    const pa = statusPriority(a.status);
    const pb = statusPriority(b.status);
    if (pb !== pa) return pb - pa;

    const ca = Number(a.completedActivities || 0);
    const cb = Number(b.completedActivities || 0);
    if (cb !== ca) return cb - ca;

    return Number(b.moduleId || 0) - Number(a.moduleId || 0);
  });

  return sorted[0];
}
function buildEffectiveActivities(moduleStatus, activities) {
  const list = [...(activities || [])].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );

  if (moduleStatus === "locked") {
    return list.map((a) =>
      a.status === "completed" ? a : { ...a, status: "locked" },
    );
  }

  const eff = list.map((a) => ({ ...a }));

  // módulo unlocked => A1 unlocked (si no está completed)
  const a1 = eff.find((x) => Number(x.sortOrder) === 1);
  if (a1 && a1.status !== "completed") a1.status = "unlocked";

  // secuencial: A1 completed => A2 unlocked
  const a2 = eff.find((x) => Number(x.sortOrder) === 2);
  if (a2 && a1?.status === "completed" && a2.status !== "completed")
    a2.status = "unlocked";

  // secuencial: A2 completed => A3 unlocked
  const a3 = eff.find((x) => Number(x.sortOrder) === 3);
  if (a3 && a2?.status === "completed" && a3.status !== "completed")
    a3.status = "unlocked";

  return eff;
}

function prettyType(type) {
  if (type === "conceptual") return "Conceptual";
  if (type === "procedimental") return "Procedimental";
  if (type === "actitudinal") return "Actitudinal";
  return type || "Actividad";
}

export default function ModuleMenuPageBeta() {
  const { moduleKey } = useParams(); // m01
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const mascot = useMemo(() => getMascotForModule(moduleKey), [moduleKey]);

  const theme = useMemo(() => getModuleTheme(moduleKey), [moduleKey]);
  const modulePrimaryHex = MODULE_COLORS_HEX[moduleKey] || theme.primary;

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_OVERVIEW, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setOverview(json || null);
      console.log("Overview data:", json);
    } catch (e) {
      setError(e?.message || "Error al cargar overview");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  const moduleData = useMemo(() => {
    return pickModuleByKey(overview?.modules, moduleKey);
  }, [overview?.modules, moduleKey]);

  const effectiveActivities = useMemo(() => {
    if (!moduleData) return [];
    return buildEffectiveActivities(moduleData.status, moduleData.activities);
  }, [moduleData]);

  // Selección inicial: primera burbuja
  useEffect(() => {
    if (!effectiveActivities.length) return;
    const first =
      effectiveActivities.find((a) => Number(a.sortOrder) === 1) ||
      effectiveActivities[0];
    setSelectedActivityId(first.activityId);
  }, [moduleData?.moduleId, effectiveActivities.length]);

  const selectedActivity = useMemo(() => {
    return (
      effectiveActivities.find(
        (a) => String(a.activityId) === String(selectedActivityId),
      ) || null
    );
  }, [effectiveActivities, selectedActivityId]);

  const learnBlock = useMemo(() => {
    if (!selectedActivity) return null;
    return getLearnFor(moduleKey, selectedActivity.type);
  }, [moduleKey, selectedActivity]);

  const canPlay = selectedActivity && selectedActivity.status !== "locked";

  const ctaLabel = useMemo(() => {
    if (!selectedActivity) return "—";
    if (selectedActivity.status === "completed") return "Nuevo intento";
    if (
      selectedActivity.status === "unlocked" ||
      selectedActivity.status === "in_progress"
    )
      return "Realizar actividad";
    return "Bloqueada";
  }, [selectedActivity]);

  const onPlay = () => {
    if (!selectedActivity) return;
    if (selectedActivity.status === "locked") return;
    navigate(
      `/play/m0${moduleData.sortOrder}/a0${selectedActivity.activityId}`,
      //  <ModuleFrame></ModuleFrame>

    );
  };

  const mascotMood = useMemo(() => {
    if (!selectedActivity) return "neutral";
    if (selectedActivity.status === "locked") return "warn";
    if (selectedActivity.status === "completed") return "happy";
    return "neutral";
  }, [selectedActivity]);

  const mascotText = useMemo(() => {
    if (!selectedActivity) return "Selecciona una actividad para empezar.";
    if (selectedActivity.status === "locked")
      return "Aún no. Completa la actividad anterior y volvemos.";
    if (selectedActivity.status === "completed")
      return "¡Buen trabajo! ¿Quieres intentar mejorar tu score?";
    if (selectedActivity.type === "conceptual")
      return "Aquí construimos la idea base. Lee con calma.";
    if (selectedActivity.type === "procedimental")
      return "Hora de practicar. Prueba y mejora.";
    if (selectedActivity.type === "actitudinal")
      return "Piensa en tu vida diaria: decide con intención.";
    return "Dale. En esta actividad avanzaremos paso a paso.";
  }, [selectedActivity]);

  if (loading) return <div className="p-6 text-white">Cargando módulo...</div>;
  if (error) return <div className="p-6 text-red-300">{error}</div>;
  if (!moduleData)
    return (
      <div className="p-6 text-white">Módulo no encontrado: {moduleKey}</div>
    );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `${theme.tintRadial}, ${theme.bgGradient}`,
      }}>
      {/* patrón muy sutil */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, white 1px, transparent 1px), radial-gradient(circle at 82% 64%, white 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      <div className="relative">
        {/* HEADER full width */}
        <QuipuHeader
          title={moduleData.title}
          subtitle="El inicio del Camino del Quipu"
          themeHex={modulePrimaryHex}
          wallet={overview?.wallet || { xp: 0, coins: 0 }}
          onBack={() => navigate(-1)}
          onOpenSettings={() => console.log("open settings")} // luego lo cambias
        />

        {/* CONTENIDO con padding */}
        <main className="px-4 md:px-8 lg:px-10 pt-1 pb-12">
          {/* acciones superiores */}

          {/* 3 columnas: dots | detalle | mascota */}
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Izquierda: 3 círculos vertical */}
            <aside className="col-span-12 md:col-span-3 lg:col-span-2 flex justify-center md:justify-start">
              <ActivityDots
                activities={effectiveActivities}
                selectedId={selectedActivityId}
                onSelect={setSelectedActivityId}
                themeHex={modulePrimaryHex}
              />
            </aside>

            {/* Centro: detalle + CTA */}
            {/* Centro: detalle + CTA (CARTOON CARD) */}
            <section className="col-span-12 md:col-span-6 lg:col-span-6">
              <div
                className="relative p-6 md:p-7"
                style={{
                  borderRadius: 28,
                  background: `linear-gradient(180deg, ${withAlpha("#ffffff", 0.08)}, ${withAlpha(
                    "#000000",
                    0.18,
                  )})`,
                  boxShadow: `
        0 18px 55px rgba(0,0,0,0.35),
        0 0 0 2px ${withAlpha("#ffffff", 0.14)},
        0 0 0 6px ${withAlpha(modulePrimaryHex, 0.1)},
        0 30px 90px ${withAlpha(modulePrimaryHex, 0.18)}
      `,
                }}>
                {/* Outline sticker */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    borderRadius: 28,
                    border: `2px solid ${withAlpha("#ffffff", 0.18)}`,
                  }}
                />

                {/* Shine top */}
                <div
                  className="pointer-events-none absolute left-6 right-6 top-4 h-10"
                  style={{
                    borderRadius: 999,
                    background: `linear-gradient(90deg, transparent, ${withAlpha(
                      "#ffffff",
                      0.1,
                    )}, transparent)`,
                    filter: "blur(6px)",
                  }}
                />

                {/* Soft glow bottom */}
                <div
                  className="pointer-events-none absolute left-6 right-6 bottom-3 h-8"
                  style={{
                    borderRadius: 999,
                    background: `linear-gradient(90deg, transparent, ${withAlpha(
                      modulePrimaryHex,
                      0.12,
                    )}, transparent)`,
                    filter: "blur(10px)",
                  }}
                />

                {/* Content */}
                <div className="relative">
                  {selectedActivity ? (
                    <>
                      <div className="text-xs text-white/60 uppercase tracking-wide">
                        {prettyType(selectedActivity.type)}
                      </div>

                      <h2 className="mt-1 text-2xl font-semibold text-white/95">
                        {selectedActivity.title}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/70">
                        <span>
                          Estado:{" "}
                          <b className="text-white/85">
                            {selectedActivity.status}
                          </b>
                        </span>
                        <span>
                          Intentos:{" "}
                          <b className="text-white/85">
                            {selectedActivity.attemptsCount ?? 0}
                          </b>
                        </span>
                        <span>
                          Mejor score:{" "}
                          <b className="text-white/85">
                            {selectedActivity.bestScore ?? "—"}
                          </b>
                        </span>
                      </div>

                      {/* Aprenderás (cartoon block) */}
                      <div
                        className="mt-6 p-4"
                        style={{
                          borderRadius: 22,
                          background: `linear-gradient(180deg, ${withAlpha("#ffffff", 0.06)}, ${withAlpha(
                            "#000000",
                            0.22,
                          )})`,
                          boxShadow: `0 0 0 2px ${withAlpha("#ffffff", 0.1)}`,
                        }}>
                        <div className="text-sm font-semibold text-white/90 mb-2">
                          Aprenderás
                        </div>

                        {learnBlock?.learn?.length ? (
                          <ul className="list-disc ml-5 text-sm text-white/75 space-y-1">
                            {learnBlock.learn.map((x, idx) => (
                              <li key={idx}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-white/60">
                            (Aún no hay contenido definido para esta actividad.)
                          </div>
                        )}

                        {learnBlock?.outcome && (
                          <div className="text-sm mt-3 text-white/75">
                            Resultado esperado:{" "}
                            <b className="text-white/90">
                              {learnBlock.outcome}
                            </b>
                          </div>
                        )}
                      </div>

                      {/* CTA row (cartoon button) */}
                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div className="text-xs text-white/55">
                          {selectedActivity.status === "completed"
                            ? "Puedes repetir para practicar o mejorar tu score."
                            : selectedActivity.status === "locked"
                              ? "Completa la actividad anterior para desbloquear."
                              : "Cuando estés listo, inicia."}
                        </div>

                        <button
                          disabled={!canPlay}
                          // onClick={() => setMostrar(true)}
                          onClick={onPlay}
                          className="px-5 py-2.5 rounded-2xl border transition font-semibold"
                          style={{
                            borderColor: canPlay
                              ? withAlpha("#ffffff", 0.18)
                              : withAlpha("#ffffff", 0.1),
                            background: canPlay
                              ? `linear-gradient(180deg, ${withAlpha(
                                  modulePrimaryHex,
                                  0.28,
                                )}, ${withAlpha(modulePrimaryHex, 0.14)})`
                              : withAlpha("#ffffff", 0.05),
                            color: canPlay
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.40)",
                            boxShadow: canPlay
                              ? `
                    0 14px 40px ${withAlpha(modulePrimaryHex, 0.22)},
                    0 0 0 2px ${withAlpha("#ffffff", 0.12)}
                  `
                              : "none",
                          }}
                          title={
                            canPlay
                              ? "Iniciar / Nuevo intento"
                              : "Actividad bloqueada"
                          }>
                          {ctaLabel}
                        </button>
                        {/* {mostrar && <ModuleFrame/>} */}

                      </div>
                    </>
                  ) : (
                    <div className="text-white/70">
                      Selecciona una actividad.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Derecha: animal tutelar (demo) */}
            <aside className="col-span-12 md:col-span-3 lg:col-span-4">
              <MascotTutorDemo
                gifSrc={mascot.gif}
                name={mascot.name}
                themeHex={modulePrimaryHex}
                text={mascotText}
              />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
