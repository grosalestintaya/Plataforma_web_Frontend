import React, { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { useAuth } from "../../../auth/components/AuthContext";
import { UserService } from "../../services/user.service";

function hexToRgba(hex, alpha = 1) {
  const clean = String(hex || "#000").replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0");

  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const STYLE_META = {
  green: {
    label: "Bosque",
    color: "#00C853",
    glow: "#7CFFB2",
    icon: "🌿",
  },
  blue: {
    label: "Océano",
    color: "#2962FF",
    glow: "#82B1FF",
    icon: "💎",
  },
  lila: {
    label: "Arcano",
    color: "#7C4DFF",
    glow: "#C5B3FF",
    icon: "✨",
  },
};

function ReadonlyField({ label, value, color }) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-[11px] font-black uppercase tracking-[0.18em]"
        style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
        {label}
      </label>

      <div
        className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold xl:min-h-[52px]"
        style={{
          borderColor: hexToRgba(color, 0.18),
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.84))",
          color: "var(--card-text, #0f172a)",
          boxShadow: `0 10px 24px ${hexToRgba(color, 0.06)}`,
        }}>
        {value || "—"}
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  color,
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-[11px] font-black uppercase tracking-[0.18em]"
        style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
        style={{
          borderColor: hexToRgba(color, 0.18),
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.90))",
          color: "var(--card-text, #0f172a)",
          boxShadow: `0 10px 24px ${hexToRgba(color, 0.06)}`,
        }}
      />
    </div>
  );
}

function PanelShell({ color, children, className = "" }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border ${className}`}
      style={{
        background: `
          radial-gradient(circle at top right, ${hexToRgba(
            color,
            0.14,
          )}, transparent 28%),
          radial-gradient(circle at bottom left, ${hexToRgba(
            color,
            0.08,
          )}, transparent 22%),
          linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.90))
        `,
        borderColor: hexToRgba(color, 0.22),
        boxShadow: `0 24px 60px ${hexToRgba(color, 0.1)}`,
      }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12px 12px, ${hexToRgba(color, 0.08)} 1.2px, transparent 1.4px)
          `,
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative h-full">{children}</div>
    </section>
  );
}

function LoadingView() {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden flex flex-col">
      <ShowDashboardTitle>Ajustes</ShowDashboardTitle>

      <div className="mt-6 flex-1 min-h-0 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <div className="h-full animate-pulse rounded-[28px] bg-white/60" />
        <div className="h-full animate-pulse rounded-[28px] bg-white/60" />
      </div>
    </div>
  );
}

const Ajustes = () => {
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const currentTheme = useMemo(() => {
    const styleKey = authUser?.style || "green";
    return STYLE_META[styleKey] || STYLE_META.green;
  }, [authUser?.style]);

  useEffect(() => {
    let alive = true;

    const fetchUser = async () => {
      try {
        const data = await UserService.me();
        const u = data?.user;

        if (!u || !alive) return;

        setUser({
          name: u.name || "",
          lastname: u.lastname || "",
          username: u.username || "",
          password: "",
          school: u.school?.name || "Sin asignar",
          rol: u.rol?.name || "Sin rol",
          grade: u.grade?.name || "Sin grado",
          isActive: Boolean(u.is_active),
        });
      } catch (error) {
        if (error?.status !== 401) {
          console.error("Error cargando ajustes:", error);
          setMessage("No se pudo cargar la información de la cuenta.");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || saving) return;

    setSaving(true);
    setMessage("");

    const payload = {
      username: user.username?.trim() || "",
    };

    if (user.password?.trim()) {
      payload.password = user.password.trim();
    }

    try {
      const data = await UserService.editMyData(payload);

      setUser((prev) => ({
        ...prev,
        username: payload.username,
        password: "",
      }));

      setMessage(data?.msg || "Cambios guardados con éxito.");
    } catch (error) {
      if (error?.status !== 401) {
        console.error("Error al guardar ajustes:", error);
        setMessage(error?.message || "No se pudieron guardar los cambios.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <LoadingView />;
  }

  return (
    <div className="h-full min-h-0 w-full overflow-hidden flex flex-col">
      <div className="mt-0 mb-0 flex-1 min-h-0  w-full overflow-hidden">
        <div className="grid h-full min-h-0 w-full grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.75fr]">
          <PanelShell
            color={currentTheme.color}
            className="min-h-0 h-full p-5 xl:p-6 2xl:p-7">
            <div className="flex h-full min-h-0 flex-col">
              <div className="mb-5 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div>
                  <p
                    className="text-xs font-black uppercase tracking-[0.22em]"
                    style={{ color: hexToRgba(currentTheme.color, 0.92) }}>
                    Centro de ajustes
                  </p>

                  <h2
                    className="mt-1 text-2xl font-black xl:text-[1.8rem]"
                    style={{ color: "var(--card-text, #0f172a)" }}>
                    Cuenta y seguridad
                  </h2>

                  <p
                    className="mt-2 max-w-[760px] text-sm xl:text-[15px]"
                    style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                    Aquí puedes actualizar tu nombre de usuario y establecer una
                    nueva contraseña sin salir de tu zona de juego.
                  </p>
                </div>

                <div
                  className="inline-flex items-center gap-3 self-start rounded-[22px] border px-4 py-3"
                  style={{
                    borderColor: hexToRgba(currentTheme.color, 0.22),
                    background: `linear-gradient(180deg, ${hexToRgba(
                      currentTheme.color,
                      0.1,
                    )}, rgba(255,255,255,0.84))`,
                  }}>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
                    style={{
                      background: hexToRgba(currentTheme.color, 0.14),
                      border: `1px solid ${hexToRgba(currentTheme.color, 0.28)}`,
                      boxShadow: `0 10px 22px ${hexToRgba(
                        currentTheme.color,
                        0.16,
                      )}`,
                    }}>
                    {currentTheme.icon}
                  </div>

                  <div>
                    <p
                      className="text-sm font-black"
                      style={{ color: "var(--card-text, #0f172a)" }}>
                      Zona segura
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--card-muted, rgba(15,23,42,0.65))",
                      }}>
                      Ajustes de acceso
                    </p>
                  </div>
                </div>
              </div>

              <form
                className="flex-1 min-h-0 overflow-y-auto pr-1"
                onSubmit={handleSave}>
                <div className="space-y-5">
                  <div
                    className="rounded-[24px] border p-5 xl:p-6"
                    style={{
                      borderColor: hexToRgba(currentTheme.color, 0.2),
                      background: `
                        radial-gradient(circle at top left, ${hexToRgba(
                          currentTheme.color,
                          0.1,
                        )}, transparent 40%),
                        linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.84))
                      `,
                      boxShadow: `0 20px 40px ${hexToRgba(
                        currentTheme.color,
                        0.08,
                      )}`,
                    }}>
                    <p
                      className="text-sm font-black uppercase tracking-[0.18em]"
                      style={{ color: "var(--card-text, #0f172a)" }}>
                      Datos visibles
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: "var(--card-muted, rgba(15,23,42,0.65))",
                      }}>
                      Estos datos son informativos y no se editan aquí.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                      <ReadonlyField
                        label="Nombres"
                        value={user.name}
                        color={currentTheme.color}
                      />
                      <ReadonlyField
                        label="Apellidos"
                        value={user.lastname}
                        color={currentTheme.color}
                      />
                      <ReadonlyField
                        label="Colegio"
                        value={user.school}
                        color={currentTheme.color}
                      />
                      <ReadonlyField
                        label="Grado"
                        value={user.grade}
                        color={currentTheme.color}
                      />
                    </div>
                  </div>

                  <div
                    className="rounded-[24px] border p-5 xl:p-6"
                    style={{
                      borderColor: hexToRgba(currentTheme.color, 0.2),
                      background: `
                        radial-gradient(circle at bottom right, ${hexToRgba(
                          currentTheme.glow,
                          0.1,
                        )}, transparent 40%),
                        linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86))
                      `,
                    }}>
                    <p
                      className="text-sm font-black uppercase tracking-[0.18em]"
                      style={{ color: "var(--card-text, #0f172a)" }}>
                      Credenciales
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: "var(--card-muted, rgba(15,23,42,0.65))",
                      }}>
                      Solo se actualizará lo que envíes en este formulario.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-2">
                      <InputField
                        label="Nombre de usuario"
                        name="username"
                        value={user.username || ""}
                        onChange={handleChange}
                        placeholder="Ingresa tu nombre de usuario"
                        autoComplete="username"
                        color={currentTheme.color}
                      />

                      <div className="space-y-2">
                        <InputField
                          label="Nueva contraseña"
                          name="password"
                          type="password"
                          value={user.password || ""}
                          onChange={handleChange}
                          placeholder="Escribe una nueva contraseña"
                          autoComplete="new-password"
                          color={currentTheme.color}
                        />

                        <p
                          className="text-xs"
                          style={{
                            color: "var(--card-muted, rgba(15,23,42,0.65))",
                          }}>
                          La contraseña actual no se muestra. Este campo solo
                          sirve para reemplazarla por una nueva.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-[0.16em] shadow transition-all disabled:opacity-60"
                      style={{
                        background: `linear-gradient(180deg, ${hexToRgba(
                          currentTheme.color,
                          0.96,
                        )}, ${hexToRgba(currentTheme.color, 0.82)})`,
                        color: "#ffffff",
                        boxShadow: `0 16px 30px ${hexToRgba(
                          currentTheme.color,
                          0.34,
                        )}`,
                      }}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>

                    {message && (
                      <div
                        className="rounded-2xl border px-4 py-2 text-sm font-medium"
                        style={{
                          borderColor: hexToRgba(currentTheme.color, 0.18),
                          background: "rgba(255,255,255,0.82)",
                          color: "var(--card-text, #0f172a)",
                        }}>
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </PanelShell>

          <PanelShell
            color={currentTheme.color}
            className="min-h-0 h-full p-5 xl:p-6 2xl:p-7">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p
                  className="text-xs font-black uppercase tracking-[0.22em]"
                  style={{ color: hexToRgba(currentTheme.color, 0.92) }}>
                  Estado de la cuenta
                </p>

                <h3
                  className="mt-1 text-[1.35rem] font-black"
                  style={{ color: "var(--card-text, #0f172a)" }}>
                  Resumen rápido
                </h3>

                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                  Vista compacta para pantallas de laptop y escritorio.
                </p>

                <div className="mt-6 space-y-3">
                  <ReadonlyField
                    label="Usuario actual"
                    value={`@${user.username}`}
                    color={currentTheme.color}
                  />
                  <ReadonlyField
                    label="Rol"
                    value={user.rol}
                    color={currentTheme.color}
                  />
                  <ReadonlyField
                    label="Colegio"
                    value={user.school}
                    color={currentTheme.color}
                  />
                  <ReadonlyField
                    label="Estado"
                    value={user.isActive ? "Activo" : "Pendiente"}
                    color={currentTheme.color}
                  />
                </div>
              </div>

              <div
                className="mt-6 rounded-[24px] border p-5"
                style={{
                  borderColor: hexToRgba(currentTheme.color, 0.18),
                  background: `
                    linear-gradient(180deg, ${hexToRgba(
                      currentTheme.color,
                      0.1,
                    )}, rgba(255,255,255,0.84))
                  `,
                }}>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl"
                    style={{
                      background: hexToRgba(currentTheme.color, 0.16),
                      border: `1px solid ${hexToRgba(currentTheme.color, 0.28)}`,
                      boxShadow: `0 12px 24px ${hexToRgba(
                        currentTheme.color,
                        0.16,
                      )}`,
                    }}>
                    {currentTheme.icon}
                  </div>

                  <div>
                    <p
                      className="text-sm font-black"
                      style={{ color: "var(--card-text, #0f172a)" }}>
                      Tema activo
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "var(--card-muted, rgba(15,23,42,0.65))",
                      }}>
                      {currentTheme.label}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-3 rounded-full"
                      style={{
                        background:
                          n === 2
                            ? hexToRgba(currentTheme.color, 0.92)
                            : hexToRgba(currentTheme.color, 0.34),
                        boxShadow:
                          n === 2
                            ? `0 0 14px ${hexToRgba(currentTheme.color, 0.45)}`
                            : "none",
                      }}
                    />
                  ))}
                </div>

                <p
                  className="mt-4 text-xs leading-5"
                  style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                  La personalización visual ahora vive en Perfil. En esta vista
                  solo administras credenciales y datos de acceso.
                </p>
              </div>
            </div>
          </PanelShell>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;
