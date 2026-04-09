import React, { useEffect, useMemo, useRef, useState } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { UserService } from "../../services/user.service";
import { useAuth } from "../../../auth/components/AuthContext";

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

function buildProfileUser(
  u,
  fallbackStyle = "green",
  fallbackPinned = "avatar_m_base",
) {
  return {
    name: u?.name || "Sin nombre",
    lastname: u?.lastname || "Sin apellidos",
    username: u?.username || "Sin usuario",
    schoolName: u?.school?.name || "Sin asignar",
    roleName: u?.rol?.name || "Sin rol",
    gradeName: u?.grade?.name || "Sin grado",
    is_active: Boolean(u?.is_active),
    style: u?.style || fallbackStyle,
    pinned_img: u?.pinned_img || fallbackPinned,
  };
}

function PanelShell({ children, color, className = "" }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[26px] border ${className}`}
      style={{
        borderColor: hexToRgba(color, 0.22),
        background: `
          radial-gradient(circle at top right, ${hexToRgba(color, 0.16)}, transparent 28%),
          radial-gradient(circle at bottom left, ${hexToRgba(color, 0.1)}, transparent 24%),
          linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.90))
        `,
        boxShadow: `0 20px 44px ${hexToRgba(color, 0.11)}`,
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

function InfoRow({ label, value, color }) {
  return (
    <div
      className="rounded-2xl border px-3.5 py-3"
      style={{
        borderColor: hexToRgba(color, 0.16),
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.82))",
        boxShadow: `0 10px 20px ${hexToRgba(color, 0.05)}`,
      }}>
      <p
        className="text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
        {label}
      </p>
      <p
        className="mt-1 break-words text-sm font-extrabold lg:text-[14px]"
        style={{ color: "var(--card-text, #0f172a)" }}>
        {value || "—"}
      </p>
    </div>
  );
}

function StatusPill({ active, color }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] lg:text-[11px]"
      style={{
        borderColor: hexToRgba(color, 0.28),
        background: active ? hexToRgba(color, 0.12) : "rgba(15,23,42,0.06)",
        color: active
          ? hexToRgba(color, 0.95)
          : "var(--card-muted, rgba(15,23,42,0.62))",
      }}>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: active ? color : "var(--accent, #f59e0b)",
          boxShadow: active
            ? `0 0 12px ${hexToRgba(color, 0.65)}`
            : "0 0 12px rgba(245,158,11,0.45)",
        }}
      />
      {active ? "Cuenta activa" : "Pendiente"}
    </div>
  );
}

function SmallChip({ label, value, color }) {
  return (
    <div
      className="rounded-2xl border px-3 py-2"
      style={{
        borderColor: hexToRgba(color, 0.18),
        background: `linear-gradient(180deg, ${hexToRgba(
          color,
          0.08,
        )}, rgba(255,255,255,0.80))`,
      }}>
      <p
        className="text-[10px] font-black uppercase tracking-[0.16em]"
        style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
        {label}
      </p>
      <p
        className="mt-1 text-sm font-black"
        style={{ color: hexToRgba(color, 0.96) }}>
        {value}
      </p>
    </div>
  );
}

function StyleCard({ option, active, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(option.value)}
      className="group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        borderColor: active
          ? hexToRgba(option.color, 0.95)
          : "rgba(15,23,42,0.08)",
        background: active
          ? `
            radial-gradient(circle at top left, ${hexToRgba(
              option.glow,
              0.28,
            )}, transparent 55%),
            linear-gradient(180deg, ${hexToRgba(
              option.color,
              0.16,
            )}, rgba(255,255,255,0.96))
          `
          : `
            radial-gradient(circle at top left, ${hexToRgba(
              option.color,
              0.12,
            )}, transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88))
          `,
        boxShadow: active
          ? `0 0 0 1px ${hexToRgba(
              option.color,
              0.24,
            )}, 0 16px 28px ${hexToRgba(option.color, 0.2)}`
          : "0 8px 18px rgba(15,23,42,0.07)",
        transform: active ? "translateY(-2px) scale(1.01)" : "translateY(0)",
      }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18), transparent 45%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg"
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

            <div className="min-w-0">
              <p
                className="truncate text-sm font-black tracking-wide"
                style={{ color: "var(--card-text, #0f172a)" }}>
                {option.label}
              </p>
              <p
                className="truncate text-[11px] font-semibold uppercase tracking-[0.18em]"
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
                  width: i === 3 ? 20 : 13,
                  background: hexToRgba(option.color, 0.86),
                  boxShadow: `0 0 12px ${hexToRgba(option.color, 0.4)}`,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="mt-1 flex h-7 min-w-[82px] shrink-0 items-center justify-center rounded-full px-3 text-[10px] font-black uppercase tracking-[0.16em]"
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

function LoadingView() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.34fr)_minmax(280px,0.76fr)]">
          <div className="h-[290px] animate-pulse rounded-[26px] bg-white/60" />
          <div className="h-[290px] animate-pulse rounded-[26px] bg-white/60" />
        </div>
        <div className="h-[250px] animate-pulse rounded-[26px] bg-white/60" />
      </div>
    </div>
  );
}

function EmptyView() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div
        className="mt-3 rounded-[26px] border p-6"
        style={{
          background: "rgba(255,255,255,0.88)",
          borderColor: "var(--card-border, rgba(15,23,42,0.10))",
        }}>
        <p
          className="text-base font-black"
          style={{ color: "var(--card-text, #0f172a)" }}>
          No se pudo cargar el perfil.
        </p>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
          Verifica tu sesión o vuelve a intentarlo.
        </p>
      </div>
    </div>
  );
}

const Perfil = () => {
  const { user: authUser, updateStyle } = useAuth();

  const [profile, setProfile] = useState(null);
  const [ownedAvatars, setOwnedAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const [draftStyle, setDraftStyle] = useState("green");
  const [savedStyle, setSavedStyle] = useState("green");

  const [loading, setLoading] = useState(true);
  const [savingStyle, setSavingStyle] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [message, setMessage] = useState("");

  const mountedRef = useRef(false);
  const updateStyleRef = useRef(updateStyle);
  const savedStyleRef = useRef(savedStyle);
  const draftStyleRef = useRef(draftStyle);

  useEffect(() => {
    updateStyleRef.current = updateStyle;
  }, [updateStyle]);

  useEffect(() => {
    savedStyleRef.current = savedStyle;
  }, [savedStyle]);

  useEffect(() => {
    draftStyleRef.current = draftStyle;
  }, [draftStyle]);

  const currentStyleMeta = useMemo(() => {
    return (
      STYLE_OPTIONS.find((item) => item.value === draftStyle) ||
      STYLE_OPTIONS[0]
    );
  }, [draftStyle]);
  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [meRes, avatarsRes] = await Promise.all([
          UserService.me(),
          UserService.getMyAvatars(),
        ]);

        if (!mountedRef.current) return;

        const meUser = meRes?.user;
        const pinnedFromAvatars = avatarsRes?.pinned_img || "avatar_m_base";

        if (meUser) {
          const nextProfile = buildProfileUser(
            meUser,
            authUser?.style || "green",
            pinnedFromAvatars,
          );

          setProfile(nextProfile);
          setDraftStyle(nextProfile.style);
          setSavedStyle(nextProfile.style);

          updateStyleRef.current?.(nextProfile.style);
        }

        if (avatarsRes?.ok) {
          const mine = (avatarsRes?.data || []).map((item) => ({
            id_user_avatar: item?.id_user_avatar,
            purchased_at: item?.purchased_at,
            equipped: Boolean(item?.equipped),
            ...item?.avatar,
          }));

          setOwnedAvatars(mine);

          const equippedAvatar =
            mine.find((avatar) => avatar.equipped) ||
            mine.find((avatar) => avatar.img_avatar === meUser?.pinned_img) ||
            mine.find(
              (avatar) => avatar.img_avatar === avatarsRes?.pinned_img,
            ) ||
            null;

          setSelectedAvatar(equippedAvatar);
        }
      } catch (error) {
        if (error?.status !== 401) {
          console.error("❌ Error cargando perfil:", error);
          setMessage("No se pudo cargar la personalización del perfil.");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mountedRef.current = false;

      if (draftStyleRef.current !== savedStyleRef.current) {
        updateStyleRef.current?.(savedStyleRef.current);
      }
    };
  }, [authUser?.id]);
  const handleStyleChange = (value) => {
    if (!value || value === draftStyle || savingStyle) return;

    setDraftStyle(value);
    setMessage("");
    updateStyleRef.current?.(value);
  };

  const handleSaveStyle = async () => {
    if (!profile || savingStyle) return;

    setSavingStyle(true);
    setMessage("");

    try {
      const payload = {
        username: profile.username?.trim() || "",
        style: draftStyle || "green",
      };

      const res = await UserService.editMyData(payload);

      setSavedStyle(draftStyle);
      setProfile((prev) => ({
        ...prev,
        style: draftStyle,
      }));

      updateStyleRef.current?.(draftStyle);
      setMessage(res?.msg || "Estilo guardado correctamente.");
    } catch (error) {
      console.error("Error guardando estilo:", error);
      setDraftStyle(savedStyleRef.current);
      updateStyleRef.current?.(savedStyleRef.current);
      setMessage(error?.message || "No se pudo guardar el estilo.");
    } finally {
      setSavingStyle(false);
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
      setProfile((prev) => ({
        ...prev,
        pinned_img: avatar.img_avatar,
      }));
      setShowAvatars(false);
      setMessage(res?.message || "Avatar equipado correctamente.");
    } catch (error) {
      console.error("Error equipando avatar:", error);
      setMessage(error?.message || "No se pudo cambiar el avatar.");
    } finally {
      setEquipping(false);
    }
  };

  if (loading) return <LoadingView />;
  if (!profile) return <EmptyView />;

  const displayAvatar =
    selectedAvatar?.img_avatar || profile.pinned_img || "avatar_m_base";

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <div className="mt-0 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex min-h-full flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.34fr)_minmax(280px,0.76fr)] xl:grid-cols-[minmax(0,1.42fr)_minmax(300px,0.78fr)]">
            <div className="min-w-0">
              <PanelShell
                color={currentStyleMeta.color}
                className="h-full p-4 lg:p-5 xl:p-6">
                <div className="flex h-full flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative mx-auto shrink-0 sm:mx-0">
                        <div
                          className="absolute inset-[-10px] rounded-full blur-2xl"
                          style={{
                            background: `radial-gradient(circle, ${hexToRgba(
                              currentStyleMeta.color,
                              0.24,
                            )} 0%, transparent 70%)`,
                          }}
                        />
                        <img
                          src={getAvatarPath(displayAvatar)}
                          alt={profile.username}
                          className="relative h-22 w-22 rounded-full border-[4px] object-cover sm:h-24 sm:w-24 xl:h-28 xl:w-28"
                          style={{
                            borderColor: currentStyleMeta.color,
                            backgroundColor: "var(--app-bg, #f8fafc)",
                            boxShadow: `0 0 0 8px ${hexToRgba(
                              currentStyleMeta.color,
                              0.12,
                            )}`,
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1 text-center sm:text-left">
                        <p
                          className="text-[11px] font-black uppercase tracking-[0.2em]"
                          style={{
                            color: hexToRgba(currentStyleMeta.color, 0.92),
                          }}>
                          Perfil del jugador
                        </p>

                        <h2
                          className="mt-1 break-words text-xl font-black tracking-tight lg:text-2xl xl:text-[2rem]"
                          style={{ color: "var(--card-text, #0f172a)" }}>
                          {profile.name} {profile.lastname}
                        </h2>

                        <p
                          className="mt-1 break-all text-sm font-semibold lg:text-[15px]"
                          style={{
                            color: "var(--card-muted, rgba(15,23,42,0.62))",
                          }}>
                          @{profile.username}
                        </p>
                      </div>
                    </div>

                    <div
                      className="mx-auto w-full max-w-[250px] rounded-[20px] border px-3.5 py-3 sm:mx-0 sm:w-auto"
                      style={{
                        borderColor: hexToRgba(currentStyleMeta.color, 0.22),
                        background: `linear-gradient(180deg, ${hexToRgba(
                          currentStyleMeta.color,
                          0.1,
                        )}, rgba(255,255,255,0.82))`,
                      }}>
                      <p
                        className="text-[10px] font-black uppercase tracking-[0.18em]"
                        style={{
                          color: "var(--card-muted, rgba(15,23,42,0.62))",
                        }}>
                        Núcleo activo
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-lg"
                          style={{
                            background: hexToRgba(currentStyleMeta.color, 0.16),
                            border: `1px solid ${hexToRgba(
                              currentStyleMeta.color,
                              0.28,
                            )}`,
                          }}>
                          {currentStyleMeta.icon}
                        </span>

                        <div>
                          <p
                            className="text-sm font-black"
                            style={{ color: "var(--card-text, #0f172a)" }}>
                            {currentStyleMeta.short}
                          </p>
                          <p
                            className="text-xs"
                            style={{
                              color: "var(--card-muted, rgba(15,23,42,0.62))",
                            }}>
                            Personalización lista
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2.5 sm:justify-start">
                    <StatusPill
                      active={profile.is_active}
                      color={currentStyleMeta.color}
                    />
                    <SmallChip
                      label="Tema"
                      value={currentStyleMeta.label}
                      color={currentStyleMeta.color}
                    />
                    <SmallChip
                      label="Clase"
                      value={profile.gradeName}
                      color={currentStyleMeta.color}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow
                      label="Colegio"
                      value={profile.schoolName}
                      color={currentStyleMeta.color}
                    />
                    <InfoRow
                      label="Grado"
                      value={profile.gradeName}
                      color={currentStyleMeta.color}
                    />
                    <InfoRow
                      label="Rol"
                      value={profile.roleName}
                      color={currentStyleMeta.color}
                    />
                    <InfoRow
                      label="Estado"
                      value={profile.is_active ? "Disponible" : "Restringido"}
                      color={currentStyleMeta.color}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoRow
                      label="Usuario"
                      value={`@${profile.username}`}
                      color={currentStyleMeta.color}
                    />
                    <InfoRow
                      label="Nombres"
                      value={profile.name}
                      color={currentStyleMeta.color}
                    />
                    <InfoRow
                      label="Apellidos"
                      value={profile.lastname}
                      color={currentStyleMeta.color}
                    />
                    <InfoRow
                      label="Avatar"
                      value={selectedAvatar?.name || "Activo"}
                      color={currentStyleMeta.color}
                    />
                  </div>
                </div>
              </PanelShell>
            </div>

            <div className="min-w-0">
              <PanelShell
                color={currentStyleMeta.color}
                className="h-full min-h-[320px] p-4 lg:p-5 xl:p-6">
                <div className="flex h-full flex-col items-center text-center">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.22em]"
                    style={{ color: hexToRgba(currentStyleMeta.color, 0.94) }}>
                    Avatar activo
                  </p>

                  <div className="relative mt-4">
                    <div
                      className="absolute inset-[-14px] rounded-full blur-2xl"
                      style={{
                        background: `radial-gradient(circle, ${hexToRgba(
                          currentStyleMeta.color,
                          0.26,
                        )} 0%, transparent 70%)`,
                      }}
                    />

                    <img
                      src={getAvatarPath(displayAvatar)}
                      alt="avatar actual"
                      className="relative h-26 w-26 rounded-full border-[5px] object-cover sm:h-28 sm:w-28 lg:h-32 lg:w-32 xl:h-36 xl:w-36"
                      style={{
                        borderColor: currentStyleMeta.color,
                        boxShadow: `0 0 0 8px ${hexToRgba(
                          currentStyleMeta.color,
                          0.14,
                        )}`,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowAvatars(true)}
                      className="absolute bottom-1 right-0 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition"
                      style={{
                        background: `linear-gradient(180deg, ${hexToRgba(
                          currentStyleMeta.color,
                          0.98,
                        )}, ${hexToRgba(currentStyleMeta.color, 0.82)})`,
                        color: "#fff",
                        boxShadow: `0 12px 24px ${hexToRgba(
                          currentStyleMeta.color,
                          0.3,
                        )}`,
                      }}>
                      Editar
                    </button>
                  </div>

                  <p
                    className="mt-4 break-all text-lg font-black"
                    style={{ color: "var(--card-text, #0f172a)" }}>
                    @{profile.username}
                  </p>

                  <div
                    className="mt-3 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] lg:text-xs"
                    style={{
                      background: hexToRgba(currentStyleMeta.color, 0.12),
                      color: hexToRgba(currentStyleMeta.color, 0.96),
                      border: `1px solid ${hexToRgba(
                        currentStyleMeta.color,
                        0.24,
                      )}`,
                    }}>
                    {equipping
                      ? "Cambiando avatar..."
                      : selectedAvatar?.name || "Avatar actual"}
                  </div>

                  <div
                    className="mt-5 w-full rounded-[22px] border p-4 text-left"
                    style={{
                      borderColor: hexToRgba(currentStyleMeta.color, 0.18),
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.82))",
                    }}>
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.18em]"
                      style={{
                        color: "var(--card-muted, rgba(15,23,42,0.62))",
                      }}>
                      Personalización equipada
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
                        style={{
                          background: hexToRgba(currentStyleMeta.color, 0.16),
                          border: `1px solid ${hexToRgba(
                            currentStyleMeta.color,
                            0.28,
                          )}`,
                          boxShadow: `0 10px 20px ${hexToRgba(
                            currentStyleMeta.color,
                            0.16,
                          )}`,
                        }}>
                        {currentStyleMeta.icon}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="text-sm font-black"
                          style={{ color: "var(--card-text, #0f172a)" }}>
                          Tema {currentStyleMeta.label}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: "var(--card-muted, rgba(15,23,42,0.62))",
                          }}>
                          Avatar y estilo sincronizados
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto w-full pt-5">
                    <div className="grid w-full grid-cols-3 gap-2">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-3 rounded-full"
                          style={{
                            background:
                              n === 2
                                ? hexToRgba(currentStyleMeta.color, 0.92)
                                : hexToRgba(currentStyleMeta.color, 0.34),
                            boxShadow:
                              n === 2
                                ? `0 0 14px ${hexToRgba(
                                    currentStyleMeta.color,
                                    0.45,
                                  )}`
                                : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {showAvatars && (
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-[26px] bg-black/30 p-3 backdrop-blur-sm"
                    onClick={() => setShowAvatars(false)}>
                    <div
                      className="max-h-[82vh] w-full max-w-[420px] overflow-y-auto rounded-[24px] border p-4 shadow-2xl sm:p-5"
                      style={{
                        borderColor: hexToRgba(currentStyleMeta.color, 0.22),
                        background: `
                          radial-gradient(circle at top center, ${hexToRgba(
                            currentStyleMeta.color,
                            0.12,
                          )}, transparent 35%),
                          linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.92))
                        `,
                      }}
                      onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="text-sm font-black uppercase tracking-[0.18em]"
                            style={{ color: "var(--card-text, #0f172a)" }}>
                            Tus avatares
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{
                              color: "var(--card-muted, rgba(15,23,42,0.62))",
                            }}>
                            Selecciona uno para equiparlo al instante.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAvatars(false)}
                          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]"
                          style={{
                            background: "rgba(15,23,42,0.06)",
                            color: "var(--card-text, #0f172a)",
                            border: "1px solid rgba(15,23,42,0.08)",
                          }}>
                          Cerrar
                        </button>
                      </div>

                      {ownedAvatars.length === 0 ? (
                        <p
                          className="mt-4 text-sm"
                          style={{
                            color: "var(--card-muted, rgba(15,23,42,0.62))",
                          }}>
                          No tienes avatares disponibles.
                        </p>
                      ) : (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                                    : "rgba(255,255,255,0.76)",
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
                                <p
                                  className="mt-2 truncate text-[10px] font-black uppercase tracking-[0.12em]"
                                  style={{
                                    color: isSelected
                                      ? hexToRgba(currentStyleMeta.color, 0.96)
                                      : "var(--card-text, #0f172a)",
                                  }}>
                                  {avatar.name}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </PanelShell>
            </div>
          </div>

          <div className="min-w-0">
            <PanelShell
              color={currentStyleMeta.color}
              className="p-4 lg:p-5 xl:p-6">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p
                    className="text-xs font-black uppercase tracking-[0.22em]"
                    style={{ color: hexToRgba(currentStyleMeta.color, 0.92) }}>
                    Estilo de interfaz
                  </p>
                  <h3
                    className="mt-1 text-lg font-black lg:text-xl"
                    style={{ color: "var(--card-text, #0f172a)" }}>
                    Personaliza tu zona de juego
                  </h3>
                  <p
                    className="mt-2 text-sm"
                    style={{
                      color: "var(--card-muted, rgba(15,23,42,0.62))",
                    }}>
                    El cambio se previsualiza al instante y luego lo guardas en
                    tu cuenta.
                  </p>
                </div>

                <div
                  className="inline-flex w-fit items-center gap-2 rounded-2xl border px-3 py-2"
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {STYLE_OPTIONS.map((option) => (
                  <StyleCard
                    key={option.value}
                    option={option}
                    active={draftStyle === option.value}
                    onClick={handleStyleChange}
                    disabled={savingStyle}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveStyle}
                  disabled={savingStyle}
                  className="rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-[0.16em] transition disabled:opacity-60"
                  style={{
                    background: `linear-gradient(180deg, ${hexToRgba(
                      currentStyleMeta.color,
                      0.98,
                    )}, ${hexToRgba(currentStyleMeta.color, 0.82)})`,
                    color: "#ffffff",
                    boxShadow: `0 16px 30px ${hexToRgba(
                      currentStyleMeta.color,
                      0.34,
                    )}`,
                  }}>
                  {savingStyle ? "Guardando..." : "Guardar estilo"}
                </button>

                {message && (
                  <div
                    className="rounded-2xl border px-4 py-2 text-sm font-semibold"
                    style={{
                      borderColor: hexToRgba(currentStyleMeta.color, 0.18),
                      background: "rgba(255,255,255,0.86)",
                      color: "var(--card-text, #0f172a)",
                    }}>
                    {message}
                  </div>
                )}
              </div>
            </PanelShell>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
