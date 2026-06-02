import ShowDashboardTitle from "@/features/dashboard/components/ShowDashboardTitle";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ModulesService } from "../../services/Modules.Service";

function getVar(el, name, fallback) {
  if (!el || typeof window === "undefined") return fallback;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

export default function GestModules() {
  const containerRef = useRef(null);

  const [tokens, setTokens] = useState({
    primary: "#2962ff",
    primaryFg: "#ffffff",
    accent: "#7c4dff",
    accentFg: "#ffffff",
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
      accent: getVar(el, "--accent", "#7c4dff"),
      accentFg: getVar(el, "--accent-foreground", "#ffffff"),
      dashText: getVar(el, "--dash-title-text", "#0f172a"),
      dashBg: getVar(el, "--dash-title-bg", "rgba(0,0,0,0.05)"),
      appBg: getVar(el, "--app-bg", "#f8fafc"),
      cardBorder: getVar(el, "--card-border", "rgba(15,23,42,0.12)"),
      usercardBg: getVar(el, "--usercard-bg", "rgba(255,255,255,0.85)"),
      usercardBorder: getVar(el, "--usercard-border", "rgba(15,23,42,0.12)"),
    });
  }, []);

  const [control, setControl] = useState(null);
  const [modules, setModules] = useState([]);
  const [loadingInit, setLoadingInit] = useState(false);
  const [errorInit, setErrorInit] = useState("");
  const [togglingMode, setTogglingMode] = useState(false);
  const [loadingAction, setLoadingAction] = useState({});
  const [actionResult, setActionResult] = useState({});

  const fetchAll = useCallback(async () => {
    setLoadingInit(true);
    setErrorInit("");
    try {
      const [ctrl, overview] = await Promise.all([
        ModulesService.getControl(),
        ModulesService.getOverview(),
      ]);
      setControl(ctrl);
      setModules(Array.isArray(overview.modules) ? overview.modules : []);
    } catch (e) {
      if (e?.status !== 401)
        setErrorInit(e?.message || "Error al cargar datos");
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggleMode = async () => {
    if (!control || togglingMode) return;
    const newMode = control.mode === "manual" ? "auto" : "manual";
    setTogglingMode(true);
    try {
      await ModulesService.setMode(newMode);
      setControl((prev) => ({ ...prev, mode: newMode }));
    } catch (e) {
      if (e?.status !== 401) alert(e?.message || "No se pudo cambiar el modo");
    } finally {
      setTogglingMode(false);
    }
  };

  const handleAction = async (moduleId, action) => {
    if (loadingAction[moduleId]) return;
    setLoadingAction((prev) => ({ ...prev, [moduleId]: action }));
    setActionResult((prev) => ({ ...prev, [moduleId]: null }));
    try {
      if (action === "lock") await ModulesService.lockModule(moduleId);
      else await ModulesService.unlockModule(moduleId);
      setActionResult((prev) => ({ ...prev, [moduleId]: action }));
      const overview = await ModulesService.getOverview();
      setModules(Array.isArray(overview.modules) ? overview.modules : []);
    } catch (e) {
      if (e?.status !== 401)
        alert(
          e?.message ||
            `Error al ${action === "lock" ? "bloquear" : "desbloquear"} el módulo`,
        );
    } finally {
      setLoadingAction((prev) => ({ ...prev, [moduleId]: null }));
    }
  };

  const isManual = control?.mode === "manual";

  return (
    <div
      ref={containerRef}
      className="space-y-5"
      style={{ background: tokens.appBg }}>
      <ShowDashboardTitle>Módulos</ShowDashboardTitle>

      <div
        className="space-y-5 p-6 rounded-3xl border shadow-sm"
        style={{ background: "#ffff", borderColor: tokens.cardBorder }}>
        {/* ── cabecera ── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight"
              style={{ color: tokens.dashText }}>
              Colegio {control ? control.schoolName : "Cargando información..."}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ModeSwitch
              isManual={isManual}
              loading={togglingMode || loadingInit}
              onToggle={handleToggleMode}
              tokens={tokens}
            />
            <button
              type="button"
              onClick={fetchAll}
              disabled={loadingInit}
              className="rounded-2xl px-4 py-2 text-sm font-extrabold border transition"
              style={{
                background: tokens.dashBg,
                borderColor: tokens.cardBorder,
                color: tokens.dashText,
                opacity: loadingInit ? 0.5 : 1,
              }}>
              Actualizar
            </button>
          </div>
        </div>

        {/* ── banner de modo ── */}
        {control && <ModeBanner isManual={isManual} tokens={tokens} />}

        {/* ── cuerpo ── */}
        <div
          className="rounded-3xl p-4 border"
          style={{ background: tokens.appBg, borderColor: tokens.cardBorder }}>
          {/* skeleton */}
          {loadingInit && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-5 border"
                  style={{
                    borderColor: tokens.cardBorder,
                    background: "rgba(15,23,42,0.04)",
                  }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-9 w-9 rounded-2xl"
                      style={{ background: "rgba(15,23,42,0.10)" }}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-4 w-2/3 rounded"
                        style={{ background: "rgba(15,23,42,0.10)" }}
                      />
                      <div
                        className="h-3 w-1/3 rounded"
                        style={{ background: "rgba(15,23,42,0.07)" }}
                      />
                    </div>
                    <div
                      className="h-9 w-24 rounded-2xl"
                      style={{ background: "rgba(15,23,42,0.08)" }}
                    />
                    <div
                      className="h-9 w-28 rounded-2xl"
                      style={{ background: "rgba(15,23,42,0.08)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* error */}
          {!loadingInit && errorInit && (
            <div
              className="rounded-3xl border p-4 text-sm"
              style={{
                borderColor: "rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.08)",
                color: "#b91c1c",
              }}>
              <div className="font-extrabold">
                No se pudo cargar la información
              </div>
              <div className="mt-1 opacity-90">{errorInit}</div>
            </div>
          )}

          {/* vacío */}
          {!loadingInit && !errorInit && modules.length === 0 && (
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
                Sin módulos registrados
              </div>
              <div className="mt-1">
                No se encontraron módulos para esta institución.
              </div>
            </div>
          )}

          {/* lista */}
          {!loadingInit && !errorInit && modules.length > 0 && (
            <div className="space-y-3">
              {modules.map((mod) => (
                <ModuleCard
                  key={mod.moduleId}
                  mod={mod}
                  isManual={isManual}
                  actionLoading={loadingAction[mod.moduleId]}
                  lastResult={actionResult[mod.moduleId]}
                  onLock={() => handleAction(mod.moduleId, "lock")}
                  onUnlock={() => handleAction(mod.moduleId, "unlock")}
                  tokens={tokens}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ModeSwitch ────────────────────────────────────────────────────────────────
function ModeSwitch({ isManual, loading, onToggle, tokens }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className="flex items-center gap-3 rounded-2xl border transition-all"
      style={{
        padding: "8px 16px 8px 10px",
        background: isManual
          ? `color-mix(in srgb, ${tokens.primary} 8%, ${tokens.appBg})`
          : tokens.dashBg,
        borderColor: isManual
          ? `color-mix(in srgb, ${tokens.primary} 30%, transparent)`
          : tokens.cardBorder,
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}>
      {/* píldora M/A */}
      <span
        className="flex items-center rounded-xl px-2 py-0.5 text-xs font-extrabold"
        style={{
          background: isManual ? tokens.primary : "rgba(15,23,42,0.12)",
          color: isManual ? tokens.primaryFg : "rgba(100,116,139,0.9)",
          minWidth: 24,
          justifyContent: "center",
        }}>
        {isManual ? "M" : "A"}
      </span>

      {/* track + thumb */}
      <span
        className="relative inline-flex shrink-0 items-center"
        style={{ width: 42, height: 24 }}>
        <span
          className="block w-full h-full rounded-full transition-colors duration-300"
          style={{
            background: isManual
              ? `color-mix(in srgb, ${tokens.primary} 90%, transparent)`
              : "rgba(15,23,42,0.18)",
          }}
        />
        <span
          className="absolute rounded-full transition-all duration-300"
          style={{
            width: 18,
            height: 18,
            top: 3,
            left: isManual ? 21 : 3,
            background: "#ffffff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}
        />
      </span>

      {/* etiqueta */}
      <span
        className="text-sm font-extrabold transition-colors duration-200"
        style={{ color: isManual ? tokens.primary : tokens.dashText }}>
        {loading ? "Cambiando..." : isManual ? "Manual" : "Automático"}
      </span>
    </button>
  );
}

// ── ModeBanner ────────────────────────────────────────────────────────────────
function ModeBanner({ isManual, tokens }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border px-4 py-3"
      style={
        isManual
          ? {
              background: `color-mix(in srgb, ${tokens.primary} 6%, ${tokens.appBg})`,
              borderColor: `color-mix(in srgb, ${tokens.primary} 22%, transparent)`,
              color: tokens.primary,
            }
          : {
              background: tokens.appBg,
              borderColor: tokens.cardBorder,
              color: "rgba(100,116,139,0.95)",
            }
      }>
      <span
        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-extrabold"
        style={{
          background: isManual
            ? `color-mix(in srgb, ${tokens.primary} 14%, transparent)`
            : "rgba(15,23,42,0.07)",
        }}>
        {isManual ? "M" : "A"}
      </span>
      <div>
        <p className="text-sm font-extrabold">
          {isManual ? "Modo manual activo" : "Modo automático activo"}
        </p>
        <p className="mt-0.5 text-xs font-medium opacity-80">
          {isManual
            ? "Puede bloquear o desbloquear cada módulo de forma individual. Los cambios se aplican de inmediato."
            : "El sistema gestiona el acceso a los módulos automáticamente según el progreso de los estudiantes."}
        </p>
      </div>
    </div>
  );
}

// ── ModuleCard ────────────────────────────────────────────────────────────────
function ModuleCard({
  mod,
  isManual,
  actionLoading,
  onLock,
  onUnlock,
  tokens,
}) {
  const isLocking = actionLoading === "lock";
  const isUnlocking = actionLoading === "unlock";
  const busy = !!actionLoading;

  return (
    <div
      className="rounded-3xl border p-4 transition-colors duration-150"
      style={{ borderColor: tokens.usercardBorder, background: tokens.appBg }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = tokens.usercardBg)
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = tokens.appBg)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* número de orden */}
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border text-sm font-extrabold"
          style={{
            background: `color-mix(in srgb, ${tokens.primary} 10%, transparent)`,
            color: tokens.primary,
            borderColor: `color-mix(in srgb, ${tokens.primary} 20%, transparent)`,
          }}>
          {mod.sortOrder}
        </div>

        {/* título + chips */}
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-sm font-extrabold"
            style={{ color: tokens.dashText }}>
            {mod.title}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <StatusChip
              label={`${mod.lockedCount} bloqueados`}
              variant="locked"
              tokens={tokens}
            />
            <StatusChip
              label={`${mod.unlockedCount} desbloqueados`}
              variant="unlocked"
              tokens={tokens}
            />
            <StatusChip
              label={`${mod.completedCount} completados`}
              variant="completed"
              tokens={tokens}
            />
          </div>
        </div>

        {/* acciones */}
        <div className="flex shrink-0 gap-2">
          <ActionButton
            label={isLocking ? "Bloqueando..." : "Bloquear"}
            disabled={!isManual || busy}
            loading={isLocking}
            onClick={onLock}
            style={
              isManual
                ? {
                    background: tokens.accent,
                    color: tokens.accentFg,
                    borderColor: `color-mix(in srgb, ${tokens.accent} 60%, transparent)`,
                  }
                : {
                    background: "rgba(15,23,42,0.05)",
                    color: "rgba(100,116,139,0.5)",
                    borderColor: tokens.cardBorder,
                  }
            }
          />
          <ActionButton
            label={isUnlocking ? "Desbloqueando..." : "Desbloquear"}
            disabled={!isManual || busy}
            loading={isUnlocking}
            onClick={onUnlock}
            style={
              isManual
                ? {
                    background: tokens.primary,
                    color: tokens.primaryFg,
                    borderColor: `color-mix(in srgb, ${tokens.primary} 60%, transparent)`,
                  }
                : {
                    background: "rgba(15,23,42,0.05)",
                    color: "rgba(100,116,139,0.5)",
                    borderColor: tokens.cardBorder,
                  }
            }
          />
        </div>
      </div>
    </div>
  );
}

// ── StatusChip ────────────────────────────────────────────────────────────────
function StatusChip({ label, variant, tokens }) {
  const styles = {
    locked: {
      background: "rgba(239,68,68,0.08)",
      color: "#b91c1c",
      borderColor: "rgba(239,68,68,0.2)",
    },
    unlocked: {
      background: `color-mix(in srgb, ${tokens?.primary ?? "#2962ff"} 8%, transparent)`,
      color: tokens?.primary ?? "#2962ff",
      borderColor: `color-mix(in srgb, ${tokens?.primary ?? "#2962ff"} 20%, transparent)`,
    },
    completed: {
      background: `color-mix(in srgb, ${tokens?.accent ?? "#7c4dff"} 8%, transparent)`,
      color: tokens?.accent ?? "#7c4dff",
      borderColor: `color-mix(in srgb, ${tokens?.accent ?? "#7c4dff"} 20%, transparent)`,
    },
  };

  return (
    <span
      className="inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-extrabold"
      style={styles[variant]}>
      {label}
    </span>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────
function ActionButton({ label, disabled, loading, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border px-3 py-2 text-xs font-extrabold transition"
      style={{
        ...style,
        opacity: disabled && !loading ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: 118,
      }}>
      {loading ? (
        <span className="flex items-center justify-center gap-1.5">
          <SpinnerIcon />
          {label}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

// ── SpinnerIcon ───────────────────────────────────────────────────────────────
function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      style={{ width: 12, height: 12 }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
