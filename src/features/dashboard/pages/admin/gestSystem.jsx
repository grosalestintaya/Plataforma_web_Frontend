import React, { useMemo } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { School, GraduationCap, Award, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GestSystem() {
  const navigate = useNavigate();

  // Si GestSystem vive dentro de /app, te recomiendo rutas RELATIVAS:
  // - colegio: "manage/college"
  // - grado:   "manage/grade"
  // etc (según tus routes actuales)
  const modules = useMemo(
    () => [
      {
        title: "Administrar Colegios",
        desc: "Gestiona los colegios registrados.",
        icon: <School size={28} />,
        path: "../manage/college",
      },
      {
        title: "Administrar Grados",
        desc: "Configura los grados del sistema.",
        icon: <GraduationCap size={28} />,
        path: "../manage/grade",
      },
      {
        title: "Administrar Insignias",
        desc: "Crea y organiza insignias.",
        icon: <Award size={28} />,
        path: "../manage/insignia",
      },
      {
        title: "Administrar Roles",
        desc: "Controla permisos y roles del sistema.",
        icon: <Shield size={28} />,
        path: "../manage/rol",
      },
    ],
    [],
  );

  return (
    <div className="p-6">
      <ShowDashboardTitle>Administrar sistema</ShowDashboardTitle>

      {/* Panel de contexto */}
      <div
        className="mt-6 rounded-2xl border p-5 shadow-sm"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--card-text)" }}>
          Módulos de gestión
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--card-muted)" }}>
          Administra las entidades base del sistema (colegios, grados, insignias
          y roles).
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {modules.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => navigate(m.path)}
            className="text-left rounded-3xl border shadow-lg transition w-full p-6 group"
            style={{
              backgroundColor: "var(--ui-surface, #fff)",
              borderColor: "var(--card-border)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 4px var(--sidebar-accent)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
            {/* Header card */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--chip-bg)",
                    borderColor: "var(--card-border)",
                    color: "var(--sidebar)",
                  }}>
                  {m.icon}
                </div>

                <div className="min-w-0">
                  <h2
                    className="text-base font-bold truncate"
                    style={{ color: "var(--card-text)" }}>
                    {m.title}
                  </h2>
                  <p
                    className="text-sm mt-1 line-clamp-2"
                    style={{ color: "var(--card-muted)" }}>
                    {m.desc}
                  </p>
                </div>
              </div>

              <ArrowRight
                className="mt-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition"
                size={18}
                style={{ color: "var(--card-muted)" }}
              />
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-xl border"
                style={{
                  backgroundColor: "rgba(41,98,255,0.08)",
                  borderColor: "rgba(41,98,255,0.18)",
                  color: "var(--sidebar)",
                }}>
                Acceder
              </span>

              <span className="text-xs" style={{ color: "var(--card-muted)" }}>
                Click para administrar
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
