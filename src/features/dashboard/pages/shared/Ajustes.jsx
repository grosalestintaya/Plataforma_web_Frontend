import React, { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { useAuth } from "../../../auth/components/AuthContext";
import { UserService } from "../../services/user.service";

const getAvatarPath = (imgKey) => `/avatars/${imgKey}.png`;

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

const STYLE_OPTIONS = [
  {
    value: "green",
    label: "Verde",
    short: "Bosque",
    color: "#00C853",
    glow: "#7CFFB2",
    icon: "🌿",
  },
  {
    value: "blue",
    label: "Azul",
    short: "Océano",
    color: "#2962FF",
    glow: "#82B1FF",
    icon: "💎",
  },
  {
    value: "lila",
    label: "Lila",
    short: "Arcano",
    color: "#7C4DFF",
    glow: "#C5B3FF",
    icon: "✨",
  },
];

function ReadonlyField({ label, value }) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
        {label}
      </label>

      <div
        className="w-full rounded-2xl border px-4 py-3 text-sm font-medium"
        style={{
          borderColor: "var(--card-border, rgba(15,23,42,0.10))",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.82))",
          color: "var(--card-text, #0f172a)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
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
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-xs font-semibold uppercase tracking-[0.18em]"
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
          borderColor: "var(--card-border, rgba(15,23,42,0.10))",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.90))",
          color: "var(--card-text, #0f172a)",
          boxShadow:
            "0 10px 24px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.75)",
        }}
      />
    </div>
  );
}

function StyleCard({ option, active, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => onClick(option.value)}
      disabled={disabled}
      className="group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        borderColor: active
          ? hexToRgba(option.color, 0.95)
          : "var(--card-border, rgba(15,23,42,0.10))",
        background: active
          ? `
            radial-gradient(circle at top left, ${hexToRgba(option.glow, 0.28)}, transparent 55%),
            linear-gradient(180deg, ${hexToRgba(option.color, 0.16)}, rgba(255,255,255,0.96))
          `
          : `
            radial-gradient(circle at top left, ${hexToRgba(option.color, 0.12)}, transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88))
          `,
        boxShadow: active
          ? `0 0 0 1px ${hexToRgba(option.color, 0.24)}, 0 16px 32px ${hexToRgba(option.color, 0.22)}`
          : "0 10px 24px rgba(15,23,42,0.07)",
        transform: active ? "translateY(-2px) scale(1.01)" : "translateY(0)",
      }}
      title={option.label}>
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18), transparent 45%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
              style={{
                background: `linear-gradient(180deg, ${hexToRgba(
                  option.color,
                  0.24,
                )}, ${hexToRgba(option.color, 0.12)})`,
                border: `1px solid ${hexToRgba(option.color, 0.35)}`,
                boxShadow: `0 8px 20px ${hexToRgba(option.color, 0.18)}`,
              }}>
              {option.icon}
            </div>

            <div>
              <p
                className="text-sm font-extrabold tracking-wide"
                style={{ color: "var(--card-text, #0f172a)" }}>
                {option.label}
              </p>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: hexToRgba(option.color, 0.9) }}>
                {option.short}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-2.5 rounded-full"
                style={{
                  width: i === 3 ? 22 : 14,
                  background: hexToRgba(option.color, 0.86),
                  boxShadow: `0 0 12px ${hexToRgba(option.color, 0.4)}`,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="mt-1 flex h-7 min-w-[84px] items-center justify-center rounded-full px-3 text-[11px] font-extrabold uppercase tracking-[0.16em]"
          style={{
            background: active
              ? hexToRgba(option.color, 0.16)
              : "rgba(15,23,42,0.06)",
            color: active
              ? hexToRgba(option.color, 0.96)
              : "var(--card-muted, rgba(15,23,42,0.65))",
            border: `1px solid ${
              active ? hexToRgba(option.color, 0.35) : "rgba(15,23,42,0.08)"
            }`,
          }}>
          {active ? "Activo" : "Elegir"}
        </div>
      </div>
    </button>
  );
}

const Ajustes = () => {
  const { user: authUser, updateStyle } = useAuth();

  const [user, setUser] = useState(null);
  const [ownedAvatars, setOwnedAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatars, setShowAvatars] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const [message, setMessage] = useState("");

  const currentStyleMeta = useMemo(
    () =>
      STYLE_OPTIONS.find((item) => item.value === (user?.style || "green")) ||
      STYLE_OPTIONS[0],
    [user?.style],
  );
  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      try {
        const [meRes, avatarsRes] = await Promise.all([
          UserService.me(),
          UserService.getMyAvatars(),
        ]);

        if (!alive) return;

        const u = meRes?.user;
        if (u) {
          const nextUser = {
            ...u,
            style: u.style || authUser?.style || "green",
            pinned_img: u.pinned_img || avatarsRes?.pinned_img || null,
          };

          setUser(nextUser);
          updateStyle?.(nextUser.style);
        }

        if (avatarsRes?.ok) {
          const mine = (avatarsRes.data || []).map((item) => ({
            id_user_avatar: item.id_user_avatar,
            purchased_at: item.purchased_at,
            equipped: Boolean(item.equipped),
            ...item.avatar,
          }));

          setOwnedAvatars(mine);

          const equippedAvatar =
            mine.find((avatar) => avatar.equipped) ||
            mine.find(
              (avatar) => avatar.img_avatar === avatarsRes?.pinned_img,
            ) ||
            null;

          setSelectedAvatar(equippedAvatar || null);
        }
      } catch (error) {
        if (error?.status !== 401) {
          console.error("Error cargando ajustes:", error);
          setMessage("No se pudo cargar la información de ajustes.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleStyleChange = (value) => {
    setUser((prev) => ({ ...prev, style: value }));
    updateStyle?.(value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    const payload = {
      username: user.username?.trim() || "",
      style: user.style || "green",
    };

    if (user.password?.trim()) {
      payload.password = user.password.trim();
    }

    try {
      const data = await UserService.editMyData(payload);

      setMessage(data?.msg || "Cambios guardados con éxito");
      setUser((prev) => ({
        ...prev,
        password: "",
        username: payload.username,
        style: payload.style,
      }));
    } catch (error) {
      if (error?.status !== 401) {
        console.error("Error al guardar:", error);
        setMessage(error?.message || "Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (avatar) => {
    if (!avatar?.id_avatar || equipping) return;

    setEquipping(true);
    setMessage("");

    try {
      const res = await UserService.equipMyAvatar(avatar.id_avatar);

      if (!res?.ok) {
        throw new Error(res?.message || "No se pudo equipar el avatar.");
      }

      setSelectedAvatar(avatar);
      setOwnedAvatars((prev) =>
        prev.map((item) => ({
          ...item,
          equipped: item.id_avatar === avatar.id_avatar,
        })),
      );
      setUser((prev) => ({
        ...prev,
        pinned_img: avatar.img_avatar,
      }));
      setShowAvatars(false);
      setMessage(res?.message || "Avatar equipado correctamente");
    } catch (error) {
      console.error("Error equipando avatar:", error);
      setMessage(error?.message || "No se pudo cambiar el avatar");
    } finally {
      setEquipping(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full p-6">
        <ShowDashboardTitle>Ajustes</ShowDashboardTitle>
        <p className="mt-6" style={{ color: "var(--card-muted)" }}>
          Cargando ajustes...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full overflow-hidden p-6">
      <ShowDashboardTitle>Ajustes</ShowDashboardTitle>

      <div className="mt-6 grid w-full grid-cols-1 gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <section
          className="relative overflow-hidden rounded-[28px] border p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
          style={{
            background: `
              radial-gradient(circle at top right, ${hexToRgba(
                currentStyleMeta.color,
                0.12,
              )}, transparent 30%),
              linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.90))
            `,
            borderColor: "var(--card-border, rgba(15,23,42,0.10))",
          }}>
          <div className="mb-6">
            <p
              className="text-xs font-black uppercase tracking-[0.22em]"
              style={{ color: hexToRgba(currentStyleMeta.color, 0.92) }}>
              Perfil del jugador
            </p>
            <h2
              className="mt-1 text-2xl font-black"
              style={{ color: "var(--card-text, #0f172a)" }}>
              Cuenta y personalización
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
              Aquí solo puedes cambiar tu nombre de usuario, tu nueva contraseña
              y el estilo visual de la interfaz.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSave}>
            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: hexToRgba(currentStyleMeta.color, 0.22),
                background: `
                  radial-gradient(circle at top left, ${hexToRgba(
                    currentStyleMeta.color,
                    0.12,
                  )}, transparent 40%),
                  linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.84))
                `,
                boxShadow: `0 20px 40px ${hexToRgba(
                  currentStyleMeta.color,
                  0.08,
                )}`,
              }}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p
                    className="text-sm font-black uppercase tracking-[0.18em]"
                    style={{ color: "var(--card-text, #0f172a)" }}>
                    Estilo de interfaz
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "var(--card-muted, rgba(15,23,42,0.65))",
                    }}>
                    El cambio se aplica al instante y se guarda con tu cuenta.
                  </p>
                </div>

                <div
                  className="hidden items-center gap-2 rounded-2xl border px-3 py-2 md:flex"
                  style={{
                    borderColor: hexToRgba(currentStyleMeta.color, 0.24),
                    background: hexToRgba(currentStyleMeta.color, 0.08),
                  }}>
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{
                      background: currentStyleMeta.color,
                      boxShadow: `0 0 14px ${hexToRgba(
                        currentStyleMeta.color,
                        0.58,
                      )}`,
                    }}
                  />
                  <span
                    className="text-xs font-black uppercase tracking-[0.16em]"
                    style={{ color: hexToRgba(currentStyleMeta.color, 0.94) }}>
                    {currentStyleMeta.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {STYLE_OPTIONS.map((option) => (
                  <StyleCard
                    key={option.value}
                    option={option}
                    active={user.style === option.value}
                    onClick={handleStyleChange}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ReadonlyField label="Nombres" value={user.name} />
              <ReadonlyField label="Apellidos" value={user.lastname} />
            </div>

            <InputField
              label="Nombre de usuario"
              name="username"
              value={user.username || ""}
              onChange={handleChange}
              placeholder="Ingresa tu nombre de usuario"
              autoComplete="username"
            />

            <div>
              <InputField
                label="Nueva contraseña"
                name="password"
                type="password"
                value={user.password || ""}
                onChange={handleChange}
                placeholder="Escribe una nueva contraseña"
                autoComplete="new-password"
              />
              <p
                className="mt-2 text-xs"
                style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                Este campo no muestra tu contraseña actual. Solo úsalo si deseas
                reemplazarla.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-[0.16em] shadow transition-all disabled:opacity-60"
                style={{
                  background: `linear-gradient(180deg, ${hexToRgba(
                    currentStyleMeta.color,
                    0.96,
                  )}, ${hexToRgba(currentStyleMeta.color, 0.82)})`,
                  color: "#ffffff",
                  boxShadow: `0 16px 30px ${hexToRgba(
                    currentStyleMeta.color,
                    0.34,
                  )}`,
                }}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>

              {message && (
                <div
                  className="rounded-2xl border px-4 py-2 text-sm font-medium"
                  style={{
                    borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                    background: "rgba(255,255,255,0.82)",
                    color: "var(--card-text, #0f172a)",
                  }}>
                  {message}
                </div>
              )}
            </div>
          </form>
        </section>

        <aside
          className="relative flex flex-col items-center rounded-[28px] border p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
          style={{
            background: `
              radial-gradient(circle at top center, ${hexToRgba(
                currentStyleMeta.color,
                0.14,
              )}, transparent 34%),
              linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.90))
            `,
            borderColor: "var(--card-border, rgba(15,23,42,0.10))",
          }}>
          <p
            className="text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: hexToRgba(currentStyleMeta.color, 0.94) }}>
            Avatar activo
          </p>

          <div className="relative mt-4">
            <div
              className="absolute inset-[-12px] rounded-full blur-2xl"
              style={{
                background: `radial-gradient(circle, ${hexToRgba(
                  currentStyleMeta.color,
                  0.28,
                )} 0%, transparent 70%)`,
              }}
            />

            <img
              src={
                selectedAvatar?.img_avatar
                  ? getAvatarPath(selectedAvatar.img_avatar)
                  : "/avatars/avatar_m_base.png"
              }
              alt="avatar actual"
              className="relative h-32 w-32 rounded-full border-[5px] object-cover"
              style={{
                borderColor: currentStyleMeta.color,
                boxShadow: `0 0 0 6px ${hexToRgba(
                  currentStyleMeta.color,
                  0.14,
                )}`,
              }}
            />

            <button
              type="button"
              onClick={() => setShowAvatars((prev) => !prev)}
              className="absolute bottom-1 right-0 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-lg transition"
              style={{
                background: `linear-gradient(180deg, ${hexToRgba(
                  currentStyleMeta.color,
                  0.98,
                )}, ${hexToRgba(currentStyleMeta.color, 0.82)})`,
                color: "#fff",
              }}
              title="Cambiar avatar">
              Editar
            </button>
          </div>

          <p
            className="mt-5 text-xl font-black"
            style={{ color: "var(--card-text, #0f172a)" }}>
            {user.username}
          </p>

          <div
            className="mt-3 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em]"
            style={{
              background: hexToRgba(currentStyleMeta.color, 0.12),
              color: hexToRgba(currentStyleMeta.color, 0.96),
              border: `1px solid ${hexToRgba(currentStyleMeta.color, 0.24)}`,
            }}>
            {equipping
              ? "Cambiando avatar..."
              : selectedAvatar?.name || "Avatar actual"}
          </div>

          <div
            className="mt-6 w-full rounded-[24px] border p-4 text-left"
            style={{
              borderColor: "var(--card-border, rgba(15,23,42,0.10))",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(255,255,255,0.78))",
            }}>
            <p
              className="text-xs font-black uppercase tracking-[0.18em]"
              style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
              Configuración activa
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg"
                style={{
                  background: hexToRgba(currentStyleMeta.color, 0.16),
                  border: `1px solid ${hexToRgba(currentStyleMeta.color, 0.28)}`,
                  boxShadow: `0 12px 24px ${hexToRgba(
                    currentStyleMeta.color,
                    0.16,
                  )}`,
                }}>
                {currentStyleMeta.icon}
              </div>

              <div>
                <p
                  className="text-sm font-black"
                  style={{ color: "var(--card-text, #0f172a)" }}>
                  Tema {currentStyleMeta.label}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                  Sincronizado con tu cuenta.
                </p>
              </div>
            </div>
          </div>

          {showAvatars && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-black/25 p-4 backdrop-blur-sm">
              <div
                className="w-full max-w-[360px] rounded-[24px] border p-5 shadow-2xl"
                style={{
                  borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                  background: `
                    radial-gradient(circle at top center, ${hexToRgba(
                      currentStyleMeta.color,
                      0.12,
                    )}, transparent 35%),
                    linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92))
                  `,
                }}>
                <p
                  className="text-sm font-black uppercase tracking-[0.18em]"
                  style={{ color: "var(--card-text, #0f172a)" }}>
                  Tus avatares
                </p>

                {ownedAvatars.length === 0 ? (
                  <p
                    className="mt-3 text-sm"
                    style={{
                      color: "var(--card-muted, rgba(15,23,42,0.65))",
                    }}>
                    No tienes avatares disponibles.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {ownedAvatars.map((avatar) => {
                      const isSelected =
                        selectedAvatar?.id_avatar === avatar.id_avatar;

                      return (
                        <button
                          key={avatar.id_avatar}
                          type="button"
                          onClick={() => handleAvatarSelect(avatar)}
                          disabled={equipping}
                          className="rounded-2xl p-2 transition disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            border: `2px solid ${
                              isSelected
                                ? hexToRgba(currentStyleMeta.color, 0.95)
                                : "rgba(15,23,42,0.08)"
                            }`,
                            background: isSelected
                              ? hexToRgba(currentStyleMeta.color, 0.12)
                              : "rgba(255,255,255,0.7)",
                            boxShadow: isSelected
                              ? `0 12px 24px ${hexToRgba(
                                  currentStyleMeta.color,
                                  0.24,
                                )}`
                              : "0 8px 18px rgba(15,23,42,0.08)",
                            transform: isSelected
                              ? "translateY(-2px) scale(1.03)"
                              : "scale(1)",
                          }}
                          title={avatar.name}>
                          <img
                            src={getAvatarPath(avatar.img_avatar)}
                            alt={avatar.name}
                            className="mx-auto h-16 w-16 rounded-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowAvatars(false)}
                  className="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em]"
                  style={{
                    background: "rgba(15,23,42,0.06)",
                    color: "var(--card-text, #0f172a)",
                    border: "1px solid var(--card-border, rgba(15,23,42,0.10))",
                  }}>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Ajustes;
