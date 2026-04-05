import React, { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { UserService } from "../../services/user.service";
import { useAuth } from "../../../auth/components/AuthContext";

const getAvatarPath = (imgKey) => `/avatars/${imgKey}.png`;

function buildProfileUser(u) {
  return {
    nombre: u.name || "Sin nombre",
    apellidos: u.lastname || "Sin apellidos",
    nombreUsuario: u.username || "Sin usuario",
    colegio: u.school?.name || "Sin asignar",
    rol: u.rol?.name || "Sin rol",
    grado: u.grade?.name || "Sin grado",
    isActive: Boolean(u.is_active),
    avatar: u.pinned_img || "avatar_m_base",
  };
}

function InfoRow({ label, value }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 xl:px-5 xl:py-4"
      style={{
        backgroundColor: "var(--chip-bg)",
        borderColor: "var(--card-border)",
      }}>
      <span
        className="text-[11px] font-extrabold uppercase tracking-[0.18em]"
        style={{ color: "var(--card-muted)" }}>
        {label}
      </span>

      <span
        className="min-w-0 truncate text-right text-sm font-bold xl:text-[15px] 2xl:text-base"
        style={{ color: "var(--card-text)" }}>
        {value}
      </span>
    </div>
  );
}

function StatusPill({ active }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em]"
      style={{
        backgroundColor: active ? "var(--dash-title-bg)" : "var(--usercard-bg)",
        borderColor: "var(--usercard-border)",
        color: active ? "var(--dash-title-text)" : "var(--sidebar)",
      }}>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: active ? "var(--primary)" : "var(--accent)",
          boxShadow: "0 0 10px currentColor",
        }}
      />
      {active ? "Activa" : "Pendiente"}
    </div>
  );
}

function SmallChip({ label, value }) {
  return (
    <div
      className="rounded-2xl border px-3 py-2.5"
      style={{
        backgroundColor: "var(--usercard-bg)",
        borderColor: "var(--usercard-border)",
      }}>
      <p
        className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
        style={{ color: "var(--card-muted)" }}>
        {label}
      </p>
      <p
        className="mt-1 text-sm font-extrabold xl:text-[15px]"
        style={{ color: "var(--sidebar)" }}>
        {value}
      </p>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden ">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div
        className="mt-6 grid w-full grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.85fr]"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_400px] 2xl:grid-cols-[minmax(0,1.5fr)_460px]">
          <div
            className="rounded-[24px] border p-5 xl:p-6"
            style={{
              backgroundColor: "var(--usercard-bg)",
              borderColor: "var(--usercard-border)",
            }}>
            <div className="flex items-center gap-4 xl:gap-5">
              <div
                className="h-24 w-24 animate-pulse rounded-full xl:h-28 xl:w-28"
                style={{ backgroundColor: "var(--progress-track)" }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="h-5 w-52 animate-pulse rounded"
                  style={{ backgroundColor: "var(--progress-track)" }}
                />
                <div
                  className="mt-2 h-4 w-40 animate-pulse rounded"
                  style={{ backgroundColor: "var(--progress-track)" }}
                />
                <div className="mt-3 flex gap-2">
                  <div
                    className="h-9 w-28 animate-pulse rounded-2xl"
                    style={{ backgroundColor: "var(--progress-track)" }}
                  />
                  <div
                    className="h-9 w-24 animate-pulse rounded-2xl"
                    style={{ backgroundColor: "var(--progress-track)" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[58px] animate-pulse rounded-2xl border"
                  style={{
                    backgroundColor: "var(--chip-bg)",
                    borderColor: "var(--card-border)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[58px] animate-pulse rounded-2xl border"
                style={{
                  backgroundColor: "var(--chip-bg)",
                  borderColor: "var(--card-border)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyView() {
  return (
    <div className="w-full h-full min-h-0 overflow-x-hidden p-4 lg:p-5 xl:p-6">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div
        className="mx-auto mt-5 w-full max-w-[1600px] rounded-[28px] border p-5 xl:p-6"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
        }}>
        <p
          className="text-base font-extrabold"
          style={{ color: "var(--card-text)" }}>
          No se pudo cargar el perfil.
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--card-muted)" }}>
          Verifica tu sesión o vuelve a intentarlo.
        </p>
      </div>
    </div>
  );
}

const Perfil = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const styleName = useMemo(
    () => authUser?.style ?? "green",
    [authUser?.style],
  );

  useEffect(() => {
    let alive = true;

    const fetchUser = async () => {
      try {
        const data = await UserService.me();
        const u = data?.user;

        if (!u || !alive) return;
        setUser(buildProfileUser(u));
      } catch (error) {
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

  if (loading) return <LoadingView />;
  if (!user) return <EmptyView />;

  return (
    <div className="w-full h-full min-h-0 overflow-x-hidden  lg:p-5 xl:p-0">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <section
        className="mx-auto mt-6 w-full max-w-[2000px] rounded-[28px] border  shadow-sm xl:p-0 2xl:p-0"
        style={{
          backgroundColor: "var(--chip-bg)",
          borderColor: "var(--card-border)",
          boxShadow:
            "0 14px 34px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_400px] 2xl:grid-cols-[minmax(0,1.5fr)_460px]">
          <div
            className="min-w-0 rounded-[24px] border p-5 xl:p-6"
            style={{
              background:
                "linear-gradient(180deg, var(--usercard-bg) 0%, var(--chip-bg) 100%)",
              borderColor: "var(--usercard-border)",
            }}>
            <div className="flex items-center gap-4 xl:gap-5">
              <div className="relative shrink-0">
                <div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ backgroundColor: "var(--sidebar)", opacity: 0.2 }}
                />
                <img
                  src={getAvatarPath(user.avatar)}
                  alt={user.nombreUsuario}
                  className="relative h-24 w-24 rounded-full border-[3px] object-cover xl:h-28 xl:w-28 2xl:h-32 2xl:w-32"
                  style={{
                    borderColor: "var(--sidebar)",
                    backgroundColor: "var(--app-bg)",
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-[11px] font-extrabold uppercase tracking-[0.18em]"
                  style={{ color: "var(--card-muted)" }}>
                  Perfil del jugador
                </p>

                <h2
                  className="mt-1 truncate text-2xl font-extrabold tracking-tight xl:text-3xl 2xl:text-[2.1rem]"
                  style={{ color: "var(--card-text)" }}>
                  {user.nombre} {user.apellidos}
                </h2>

                <p
                  className="mt-1 truncate text-sm font-semibold xl:text-base"
                  style={{ color: "var(--card-muted)" }}>
                  @{user.nombreUsuario}
                </p>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  <StatusPill active={user.isActive} />
                  <SmallChip label="Tema" value={styleName} />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              <InfoRow label="Colegio" value={user.colegio} />
              <InfoRow label="Grado" value={user.grado} />
              <InfoRow label="Rol" value={user.rol} />
              <InfoRow
                label="Estado"
                value={user.isActive ? "Disponible" : "Restringido"}
              />
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <InfoRow label="Usuario" value={`@${user.nombreUsuario}`} />
            <InfoRow label="Nombres" value={user.nombre} />
            <InfoRow label="Apellidos" value={user.apellidos} />
            <InfoRow label="Clase actual" value={user.grado} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Perfil;
