import React, { useEffect, useState } from "react";
import ShowDashboardTitle from "../../components/ui/ShowDashboardTitle";
import PerfilCard from "../../components/Perfil/PerfilCard";
import { useAuth } from "../../context/AuthContext";
import { UserService } from "../../services/user.service";

const Perfil = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchUser = async () => {
      try {
        const data = await UserService.me();
        const u = data?.user;

        if (!u || !alive) return;

        // Nota: NO incluimos dni ni fechaRegistro en el objeto que renderiza la UI
        setUser({
           fechaRegistro: u.created_at,  // sensible → oculto
          nombre: u.name,
          apellidos: u.lastname,
          nombreUsuario: u.username,
          colegio: u.school?.name || "Sin asignar",
          rol: u.rol?.name || "Sin rol",
          grado: u.grade?.name || "Sin grado",
           dni: u.dni,                  // sensible → oculto
          isActive: Boolean(u.is_active),
          avatar: u.pinned_img || "default",
        });
      } catch (error) {
        // 401 lo maneja el apiClient (logout + redirect)
        if (error?.status !== 401) {
          console.error("❌ Error cargando perfil:", error);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      alive = false;
    };
  }, []);

  // ---------------------------
  // Loading / Empty states (theme-aware)
  // ---------------------------
  if (loading) {
    return (
      <div className="w-full min-h-screen p-6">
        <ShowDashboardTitle>Perfil</ShowDashboardTitle>

        <div
          className="mt-6 rounded-2xl border p-6 shadow-sm"
          style={{
            backgroundColor: "var(--chip-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl animate-pulse" style={{ backgroundColor: "var(--progress-track)" }} />
            <div className="flex-1">
              <div className="h-4 w-56 rounded animate-pulse" style={{ backgroundColor: "var(--progress-track)" }} />
              <div className="mt-3 h-3 w-80 rounded animate-pulse" style={{ backgroundColor: "var(--progress-track)" }} />
            </div>
          </div>

          <p className="mt-5 text-sm" style={{ color: "var(--card-muted)" }}>
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen p-6">
        <ShowDashboardTitle>Perfil</ShowDashboardTitle>

        <div
          className="mt-6 rounded-2xl border p-6 shadow-sm"
          style={{
            backgroundColor: "var(--chip-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--card-text)" }}>
            No se pudo cargar el perfil.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--card-muted)" }}>
            Verifica tu sesión o vuelve a intentar.
          </p>

          <div
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border"
            style={{
              borderColor: "var(--usercard-border)",
              backgroundColor: "var(--usercard-bg)",
              color: "var(--sidebar)",
            }}
          >
            Estado: error de carga
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------
  // View
  // ---------------------------
  return (
    <div className="w-full min-h-screen p-6">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div className="mt-6">
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            backgroundColor: "var(--chip-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          {/* Header mini (contexto + estado) */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--card-text)" }}>
                @{user.nombreUsuario}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--card-muted)" }}>
                Estilo activo:{" "}
                <span className="font-semibold" style={{ color: "var(--sidebar)" }}>
                  {authUser?.style ?? "green"}
                </span>
              </p>
            </div>

            {/* Badge estado cuenta */}
            <div
              className="px-3 py-2 rounded-xl text-xs font-semibold border"
              style={{
                backgroundColor: user.isActive ? "rgba(0,200,83,0.12)" : "rgba(255,64,129,0.12)",
                borderColor: user.isActive ? "rgba(0,200,83,0.25)" : "rgba(255,64,129,0.25)",
                color: user.isActive ? "#0A7136" : "#C2185B",
              }}
            >
              {user.isActive ? "Cuenta activa" : "Pendiente de activación"}
            </div>
          </div>

          {/* Card principal */}
          <PerfilCard user={user} />
        </div>
      </div>
    </div>
  );
};

export default Perfil;
