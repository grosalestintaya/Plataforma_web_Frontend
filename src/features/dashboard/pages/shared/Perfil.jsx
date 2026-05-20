import React, { useEffect, useMemo, useRef, useState } from "react";
import ShowDashboardTitle from "../../components/ShowDashboardTitle";
import { UserService } from "../../services/user.service";
import { useAuth } from "../../../auth/components/AuthContext";

const getAvatarPath = (imgKey) => `/avatars/${imgKey}.webp`;
const getgifPath = (imgKey) => `/activity/avatars/${imgKey}.webp`;
const FRASES = [
  "Ey… regresaste ✨",
  "Sabía que hoy avanzaríamos un poco más 🎒",
  "¿List@? Yo ya preparé el modo enfoque 📚",
  "Mientras tú aprendes, yo subo contigo 🚀",
  "Tengo una buena sensación sobre hoy 🌟",
  "Tu progreso me está sorprendiendo 👀",
  "Vamos por otra victoria pequeña 🪙",
  "Me gusta cuando apareces por aquí ☕",
  "Hoy podríamos desbloquear algo importante 🔓",
  "Prometo hacer esta misión menos aburrida 🎮",
  "Tu disciplina está empezando a notarse 📈",
  "¿Continuamos donde nos quedamos? 🧭",
  "Cada día sabes un poco más 💡",
  "Sigo aquí… acompañando el progreso ⚡",
  "Las metas grandes también empiezan así 🌱",
  "Tu versión del futuro nos está observando 👁️",
  "Oye… vamos bastante bien 😌",
  "Las monedas van y vienen, el conocimiento se queda 📚",
  "Tengo energía suficiente para otra misión 🔋",
  "Hoy toca tomar decisiones inteligentes 🎯",
  "Tu progreso acaba de subir otro nivel ⬆️",
  "Nada mal… nada mal en absoluto ✨",
  "Confío en el proceso… y en ti 🌤️",
  "Tu esfuerzo ya está acumulando resultados 📦",
  "Seguimos construyendo algo grande 🏗️",
  "Tu constancia tiene estilo 😎",
  "La misión financiera continúa 🛰️",
  "Me agrada este ritmo 📊",
  "Un paso más sigue siendo avance 🚶",
  "No hace falta correr para llegar lejos 🌌",
  "Estoy oficialmente orgullos@ de este progreso 🥹",
  "Tu inventario de conocimiento sigue creciendo 🎒",
  "Cada decisión cuenta… incluso las pequeñas 🧩",
  "¿Sabes? Ya se nota la diferencia 🌠",
  "Hora de ganar experiencia otra vez 🕹️",
  "Hoy podemos hacer que las monedas trabajen mejor 💰",
  "No subestimes lo mucho que has avanzado 📍",
  "Me alegra seguir esta aventura contigo 🌈",
  "Tu progreso tiene buena pinta 📡",
];

const BurbujaAvatar = ({ color = "#7F77DD" }) => {
  const [idx, setIdx] = React.useState(() =>
    Math.floor(Math.random() * FRASES.length),
  );
  const [animating, setAnimating] = React.useState(false);

  const siguiente = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setIdx((prev) => (prev + 1) % FRASES.length);
      setAnimating(false);
    }, 180);
  };

  return (
    <div
      onClick={siguiente}
      className="relative cursor-pointer select-none"
      style={{ maxWidth: "260px" }}>
      {/* Burbuja */}
      <div
        style={{
          background: "#fff",
          border: `2.5px solid ${color}`,
          borderRadius: "18px",
          padding: "10px 16px",
          boxShadow: `4px 4px 0px ${color}`,
          transition: "opacity 0.18s, transform 0.18s",
          opacity: animating ? 0 : 1,
          transform: animating ? "scale(0.96)" : "scale(1)",
          fontFamily: "'Nunito', 'Segoe UI', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(11px, 1.1vw, 13px)",
          color: "#1e1b4b",
          lineHeight: "1.4",
          userSelect: "none",
        }}>
        {FRASES[idx]}
      </div>

      {/* Cola de burbuja apuntando hacia abajo-izquierda */}
      {/* Cola de burbuja apuntando hacia abajo al centro */}
      <svg
        width="28"
        height="18"
        viewBox="0 0 28 18"
        style={{ display: "block", margin: "0 auto", marginTop: "-2px" }}
        xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,0 24,0 14,18" fill="#fff" />
        <polyline
          points="4,0 14,18 24,0"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Hint de click */}
      <p
        style={{
          fontSize: "9px",
          color: color,
          opacity: 0.6,
          textAlign: "center",
          marginTop: "2px",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}></p>
    </div>
  );
};
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
      className={cn(
        "relative h-full min-h-0 overflow-hidden rounded-[24px] border",
        "transition-shadow duration-200",
        className,
      )}
      style={{
        borderColor: hexToRgba(color, 0.2),
        background: `
          radial-gradient(circle at top right, ${hexToRgba(color, 0.14)}, transparent 28%),
          radial-gradient(circle at bottom left, ${hexToRgba(color, 0.1)}, transparent 24%),
          linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.91))
        `,
        boxShadow: `0 14px 34px ${hexToRgba(color, 0.08)}`,
      }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          backgroundImage: `radial-gradient(circle at 12px 12px, ${hexToRgba(
            color,
            0.065,
          )} 1.2px, transparent 1.4px)`,
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative h-full min-h-0">{children}</div>
    </section>
  );
}

function SectionLabel({ children, color }) {
  return (
    <p
      className="text-[10px] font-black uppercase tracking-[0.18em]"
      style={{ color: hexToRgba(color, 0.92) }}>
      {children}
    </p>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <div
      className="rounded-[18px] border px-3 py-2.5"
      style={{
        borderColor: hexToRgba(color, 0.14),
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.85))",
        boxShadow: `0 8px 18px ${hexToRgba(color, 0.04)}`,
      }}>
      <p
        className="text-[9px] font-black uppercase tracking-[0.16em]"
        style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
        {label}
      </p>
      <p
        className="mt-1 break-words text-[13px] font-extrabold leading-tight xl:text-sm"
        style={{ color: "var(--card-text, #0f172a)" }}>
        {value || "—"}
      </p>
    </div>
  );
}

function StatusPill({ active, color }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]"
      style={{
        borderColor: hexToRgba(color, 0.24),
        background: active ? hexToRgba(color, 0.11) : "rgba(15,23,42,0.06)",
        color: active
          ? hexToRgba(color, 0.95)
          : "var(--card-muted, rgba(15,23,42,0.62))",
      }}>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: active ? color : "var(--accent, #f59e0b)",
          boxShadow: active
            ? `0 0 10px ${hexToRgba(color, 0.55)}`
            : "0 0 10px rgba(245,158,11,0.40)",
        }}
      />
      {active ? "Cuenta activa" : "Pendiente"}
    </div>
  );
}

function SmallChip({ label, value, color }) {
  return (
    <div
      className="rounded-[18px] border px-3 py-2"
      style={{
        borderColor: hexToRgba(color, 0.16),
        background: `linear-gradient(180deg, ${hexToRgba(
          color,
          0.07,
        )}, rgba(255,255,255,0.82))`,
      }}>
      <p
        className="text-[9px] font-black uppercase tracking-[0.16em]"
        style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
        {label}
      </p>
      <p
        className="mt-1 text-[13px] font-black leading-none"
        style={{ color: hexToRgba(color, 0.96) }}>
        {value}
      </p>
    </div>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
  actionText = "Abrir",
  color,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full max-w-[250px] items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left",
        "transition-all duration-200 hover:shadow-md active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-4",
      )}
      style={{
        borderColor: hexToRgba(color, 0.2),
        background: `linear-gradient(180deg, ${hexToRgba(
          color,
          0.07,
        )}, rgba(255,255,255,0.92))`,
        boxShadow: `0 10px 20px ${hexToRgba(color, 0.06)}`,
        "--tw-ring-color": hexToRgba(color, 0.16),
      }}>
      <span
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
        style={{
          background: hexToRgba(color, 0.16),
          border: `1px solid ${hexToRgba(color, 0.24)}`,
        }}>
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-black leading-none"
          style={{ color: "var(--card-text, #0f172a)" }}>
          {title}
        </p>
        <p
          className="mt-1 text-[11px] leading-tight"
          style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
          {subtitle}
        </p>
      </div>

      <span
        className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
        style={{
          background: hexToRgba(color, 0.12),
          color: hexToRgba(color, 0.95),
          border: `1px solid ${hexToRgba(color, 0.2)}`,
        }}>
        {actionText}
      </span>
    </button>
  );
}

function StyleCard({ option, active, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(option.value)}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border p-3.5 text-left",
        "transition-all duration-200 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-4",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
      style={{
        borderColor: active
          ? hexToRgba(option.color, 0.92)
          : "rgba(15,23,42,0.08)",
        background: active
          ? `
            radial-gradient(circle at top left, ${hexToRgba(
              option.glow,
              0.24,
            )}, transparent 55%),
            linear-gradient(180deg, ${hexToRgba(
              option.color,
              0.14,
            )}, rgba(255,255,255,0.96))
          `
          : `
            radial-gradient(circle at top left, ${hexToRgba(
              option.color,
              0.09,
            )}, transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.89))
          `,
        boxShadow: active
          ? `0 0 0 1px ${hexToRgba(
              option.color,
              0.2,
            )}, 0 12px 24px ${hexToRgba(option.color, 0.14)}`
          : "0 8px 16px rgba(15,23,42,0.06)",
        "--tw-ring-color": hexToRgba(option.color, 0.16),
      }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.16), transparent 45%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
              style={{
                background: `linear-gradient(180deg, ${hexToRgba(
                  option.color,
                  0.22,
                )}, ${hexToRgba(option.color, 0.12)})`,
                border: `1px solid ${hexToRgba(option.color, 0.3)}`,
              }}>
              {option.icon}
            </div>

            <div className="min-w-0">
              <p
                className="truncate text-sm font-black"
                style={{ color: "var(--card-text, #0f172a)" }}>
                {option.label}
              </p>
              <p
                className="truncate text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: hexToRgba(option.color, 0.92) }}>
                {option.short}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-2 rounded-full"
                style={{
                  width: i === 3 ? 18 : 12,
                  background: hexToRgba(option.color, active ? 0.9 : 0.72),
                  boxShadow: active
                    ? `0 0 10px ${hexToRgba(option.color, 0.32)}`
                    : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="mt-0.5 flex h-7 min-w-[78px] shrink-0 items-center justify-center rounded-full px-3 text-[10px] font-black uppercase tracking-[0.14em]"
          style={{
            background: active
              ? hexToRgba(option.color, 0.14)
              : "rgba(15,23,42,0.06)",
            color: active
              ? hexToRgba(option.color, 0.96)
              : "var(--card-muted, rgba(15,23,42,0.65))",
            border: `1px solid ${
              active ? hexToRgba(option.color, 0.28) : "rgba(15,23,42,0.08)"
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
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] xl:grid-rows-[minmax(0,1fr)_auto]">
        <div className="h-full animate-pulse rounded-[24px] bg-white/60 xl:row-span-1" />
        <div className="h-full animate-pulse rounded-[24px] bg-white/60" />
        <div className="h-full animate-pulse rounded-[24px] bg-white/60 xl:col-span-2" />
      </div>
    </div>
  );
}

function EmptyView() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div
        className="rounded-[24px] border p-6"
        style={{
          background: "rgba(255,255,255,0.9)",
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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [profile, setProfile] = useState(null);
  const [ownedAvatars, setOwnedAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const [draftStyle, setDraftStyle] = useState("green");
  const [savedStyle, setSavedStyle] = useState("green");

  const [loading, setLoading] = useState(true);
  const [savingStyle, setSavingStyle] = useState(false);
  const [equipping, setEquipping] = useState(false);
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

  const isStyleDirty = draftStyle !== savedStyle;
  const displayAvatar =
    selectedAvatar?.img_avatar || profile?.pinned_img || "avatar_m_base";

  useEffect(() => {
    if (!showPasswordModal && !showAvatars) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showPasswordModal && !savingPassword) {
          setShowPasswordModal(false);
          setNewPassword("");
          setConfirmPassword("");
          setPasswordError("");
        }
        if (showAvatars && !equipping) {
          setShowAvatars(false);
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showPasswordModal, showAvatars, savingPassword, equipping]);

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

  const handleOpenPasswordModal = () => {
    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    if (savingPassword) return;
    setShowPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleSavePassword = async () => {
    const trimmed = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmed || !trimmedConfirm) {
      setPasswordError("Completa ambos campos.");
      return;
    }

    if (trimmed.length < 4) {
      setPasswordError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (trimmed !== trimmedConfirm) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setSavingPassword(true);
    setPasswordError("");
    setMessage("");

    try {
      const res = await UserService.editMyData({
        username: profile.username?.trim() || "",
        style: savedStyleRef.current || draftStyle || "green",
        password: trimmed,
      });

      setMessage(res?.msg || "Contraseña actualizada correctamente.");
      handleClosePasswordModal();
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setPasswordError(
        error?.message || "No se pudo actualizar la contraseña.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleStyleChange = (value) => {
    if (!value || value === draftStyle || savingStyle) return;
    setDraftStyle(value);
    setMessage("");
    updateStyleRef.current?.(value);
  };

  const handleSaveStyle = async () => {
    if (!profile || savingStyle || !isStyleDirty) return;

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

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] xl:grid-rows-[minmax(0,1fr)_auto]">
        <div className="min-h-0 xl:row-span-1">
          <PanelShell
            color={currentStyleMeta.color}
            className="p-4 lg:p-4 xl:p-5">
            <div className="flex h-full min-h-0 flex-col gap-5">
              {/* HEADER */}
              <div
                className="relative overflow-hidden rounded-[28px] border p-5 lg:p-6"
                style={{
                  borderColor: hexToRgba(currentStyleMeta.color, 0.18),
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.88))",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
                }}>
                {/* top accent line */}
                <div
                  className="absolute left-0 top-0 h-[3px] w-full"
                  style={{
                    background: `linear-gradient(
          90deg,
          transparent,
          ${hexToRgba(currentStyleMeta.color, 0.95)},
          transparent
        )`,
                  }}
                />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* LEFT SIDE */}
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                    {/* AVATAR */}
                    <div className="relative mx-auto shrink-0 sm:mx-0">
                      <div
                        className="absolute inset-[-12px] rounded-full blur-2xl"
                        style={{
                          background: `radial-gradient(circle, ${hexToRgba(
                            currentStyleMeta.color,
                            0.22,
                          )} 0%, transparent 70%)`,
                        }}
                      />

                      <img
                        src={getAvatarPath(displayAvatar)}
                        alt={profile.username}
                        className="relative rounded-full border-[4px] object-cover"
                        style={{
                          width: "clamp(90px, 7vw, 112px)",
                          height: "clamp(90px, 7vw, 112px)",
                          borderColor: currentStyleMeta.color,
                          backgroundColor: "var(--app-bg, #f8fafc)",
                          boxShadow: `0 0 0 8px ${hexToRgba(
                            currentStyleMeta.color,
                            0.1,
                          )}`,
                        }}
                      />
                    </div>

                    {/* INFO */}
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <SectionLabel color={currentStyleMeta.color}>
                        Perfil del jugador
                      </SectionLabel>

                      <h2
                        className="mt-2 break-words text-[clamp(1.2rem,1.7vw,1.9rem)] font-black leading-tight"
                        style={{ color: "var(--card-text, #0f172a)" }}>
                        {profile.name} {profile.lastname}
                      </h2>

                      <p
                        className="mt-1 break-all text-sm font-semibold"
                        style={{
                          color: "var(--card-muted, rgba(15,23,42,0.62))",
                        }}>
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <button
                    type="button"
                    onClick={handleOpenPasswordModal}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl px-5 py-4",
                      "transition-all duration-200",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "cursor-pointer",
                    )}
                    style={{
                      border: `1px solid ${hexToRgba(currentStyleMeta.color, 0.2)}`,
                      background: `linear-gradient(
            180deg,
            ${hexToRgba(currentStyleMeta.color, 0.7)},
            rgba(255,255,255,11.95)
          )`,
                    }}>
                    <div className="flex items-center gap-3 --primary">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
                        style={{
                          background: hexToRgba(currentStyleMeta.color, 0.14),
                          border: `1px solid ${hexToRgba(
                            currentStyleMeta.color,
                            0.2,
                          )}`,
                        }}>
                        🔐
                      </div>

                      <div className="text-left">
                        <p
                          className="text-sm font-black "
                          style={{ color: "var(--card-text, #0f172a)" }}>
                          Cambiar contraseña
                        </p>

                        <p
                          className="text-[12px]"
                          style={{
                            color: "var(--card-muted, rgba(15,23,42,0.62))",
                          }}>
                          Actualiza tu acceso
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* CONTENT */}
              <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
                {/* ACADEMIC */}
                <div
                  className="space-y-4 rounded-[24px] border p-5"
                  style={{
                    borderColor: hexToRgba(currentStyleMeta.color, 0.14),
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.82))",
                  }}>
                  <SectionLabel color={currentStyleMeta.color}>
                    Datos académicos
                  </SectionLabel>

                  <div className="grid gap-3">
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
                  </div>
                </div>
                <div
                  className="space-y-4 rounded-[24px] border p-5"
                  style={{
                    borderColor: hexToRgba(currentStyleMeta.color, 0.14),
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.82))",
                  }}>
                  <SectionLabel color={currentStyleMeta.color}>
                    platarforma
                  </SectionLabel>

                  <div className="grid gap-3">
                    <InfoRow
                      label="Avatar"
                      value={selectedAvatar?.name || "Activo"}
                      color={currentStyleMeta.color}
                    />

                    <InfoRow
                      label="tema"
                      value={currentStyleMeta.label}
                      color={currentStyleMeta.color}
                    />
                  </div>
                </div>
                {/* STATUS CHIPS */}

                {/* GENERAL */}
                <div
                  className="space-y-4 rounded-[24px] border p-5"
                  style={{
                    borderColor: hexToRgba(currentStyleMeta.color, 0.14),
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.82))",
                  }}>
                  <SectionLabel color={currentStyleMeta.color}>
                    Información general
                  </SectionLabel>

                  <div className="grid gap-3 sm:grid-cols-1">
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
                </div>
              </div>
            </div>
          </PanelShell>
        </div>

        <div className="min-h-0">
          <PanelShell
            color={currentStyleMeta.color}
            className="p-4 lg:p-4 xl:p-5">
            <div className="flex h-full min-h-0 flex-col gap-3">
              <SectionLabel color={currentStyleMeta.color}>
                Avatar activo
              </SectionLabel>

              {/* Card principal — portrait style */}
              <div
                className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[22px]"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${hexToRgba(currentStyleMeta.color, 0.13)} 0%, transparent 70%)`,
                }}>
                {/* corner badge — rareza */}

                <BurbujaAvatar color={currentStyleMeta.color} />

                {/* Avatar protagonista */}
                <img
                  src={getgifPath(displayAvatar)}
                  alt="avatar actual"
                  className="object-contain drop-shadow-xl"
                  style={{
                    width: "clamp(140px, 16vw, 480px)",
                    height: "clamp(140px, 16vw, 480px)",
                  }}
                />

                {/* Nombre */}
                <p
                  className="mt-2 text-[clamp(13px,1.2vw,15px)] font-black leading-tight"
                  style={{ color: "var(--card-text, #0f172a)" }}>
                  {equipping
                    ? "Equipando..."
                    : selectedAvatar?.name || "Avatar base"}
                </p>
              </div>

              {/* Botón cambiar avatar */}
              <button
                type="button"
                onClick={() => setShowAvatars(true)}
                className="group relative w-full overflow-hidden rounded-[16px] py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${currentStyleMeta.color}, ${hexToRgba(currentStyleMeta.color, 0.75)})`,
                  color: "#fff",
                  boxShadow: `0 10px 24px ${hexToRgba(currentStyleMeta.color, 0.28)}`,
                }}>
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.14), transparent 60%)",
                  }}
                />
                Cambiar avatar
              </button>

              {/* keyframe para el anillo */}
              <style>{`@keyframes spinRing { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            </div>

            {showAvatars && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-black/30 p-3 backdrop-blur-sm"
                onClick={() => !equipping && setShowAvatars(false)}>
                <div
                  className="max-h-[80vh] w-full max-w-[430px] overflow-y-auto rounded-[22px] border p-4 shadow-2xl"
                  style={{
                    borderColor: hexToRgba(currentStyleMeta.color, 0.22),
                    background: `
                      radial-gradient(circle at top center, ${hexToRgba(
                        currentStyleMeta.color,
                        0.12,
                      )}, transparent 35%),
                      linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.93))
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
                      onClick={() => !equipping && setShowAvatars(false)}
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
                            className={cn(
                              "rounded-[20px] p-2.5 transition-all duration-200 active:scale-[0.99]",
                              "disabled:cursor-not-allowed disabled:opacity-60",
                              "focus-visible:outline-none focus-visible:ring-4",
                            )}
                            style={{
                              border: `2px solid ${
                                isSelected
                                  ? hexToRgba(currentStyleMeta.color, 0.92)
                                  : "rgba(15,23,42,0.08)"
                              }`,
                              background: isSelected
                                ? hexToRgba(currentStyleMeta.color, 0.12)
                                : "rgba(255,255,255,0.82)",
                              boxShadow: isSelected
                                ? `0 10px 20px ${hexToRgba(
                                    currentStyleMeta.color,
                                    0.18,
                                  )}`
                                : "0 8px 16px rgba(15,23,42,0.06)",
                              "--tw-ring-color": hexToRgba(
                                currentStyleMeta.color,
                                0.16,
                              ),
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

        <div className="min-h-0 xl:col-span-2">
          <PanelShell
            color={currentStyleMeta.color}
            className="p-4 lg:p-4 xl:p-5">
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.18em]"
                    style={{ color: hexToRgba(currentStyleMeta.color, 0.92) }}>
                    Estilo de interfaz
                  </p>
                  <h3
                    className="mt-1 text-lg font-black"
                    style={{ color: "var(--card-text, #0f172a)" }}>
                    Personaliza tu zona de juego
                  </h3>
                  <p
                    className="mt-1.5 text-sm"
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
                    borderColor: hexToRgba(currentStyleMeta.color, 0.22),
                    background: hexToRgba(currentStyleMeta.color, 0.08),
                  }}>
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{
                      background: currentStyleMeta.color,
                      boxShadow: `0 0 12px ${hexToRgba(
                        currentStyleMeta.color,
                        0.5,
                      )}`,
                    }}
                  />
                  <span
                    className="text-xs font-black uppercase tracking-[0.14em]"
                    style={{ color: hexToRgba(currentStyleMeta.color, 0.94) }}>
                    {currentStyleMeta.label}
                  </span>
                </div>
              </div>

              <div className="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveStyle}
                  disabled={savingStyle || !isStyleDirty}
                  className={cn(
                    "rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.14em]",
                    "transition-all duration-200 active:scale-[0.99]",
                    "focus-visible:outline-none focus-visible:ring-4",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                  style={{
                    background: `linear-gradient(180deg, ${hexToRgba(
                      currentStyleMeta.color,
                      0.98,
                    )}, ${hexToRgba(currentStyleMeta.color, 0.82)})`,
                    color: "#fff",
                    boxShadow: `0 14px 26px ${hexToRgba(
                      currentStyleMeta.color,
                      0.28,
                    )}`,
                    "--tw-ring-color": hexToRgba(currentStyleMeta.color, 0.16),
                  }}>
                  {savingStyle
                    ? "Guardando..."
                    : isStyleDirty
                      ? "Guardar estilo"
                      : "Estilo guardado"}
                </button>

                {message && (
                  <div
                    className="rounded-2xl border px-4 py-2 text-sm font-semibold"
                    style={{
                      borderColor: hexToRgba(currentStyleMeta.color, 0.16),
                      background: "rgba(255,255,255,0.88)",
                      color: "var(--card-text, #0f172a)",
                    }}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </PanelShell>
        </div>
      </div>

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={handleClosePasswordModal}>
          <div
            className="w-full max-w-md rounded-[26px] border p-5 shadow-2xl sm:p-6"
            style={{
              borderColor: hexToRgba(currentStyleMeta.color, 0.24),
              background: `
                radial-gradient(circle at top, ${hexToRgba(
                  currentStyleMeta.color,
                  0.12,
                )}, transparent 38%),
                linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94))
              `,
            }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.18em]"
                  style={{ color: hexToRgba(currentStyleMeta.color) }}>
                  Seguridad
                </p>
                <h3
                  className="mt-1 text-xl font-black"
                  style={{ color: "var(--card-text, #0f172a)" }}>
                  Cambiar contraseña
                </h3>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
                  Ingresa una nueva contraseña para tu cuenta.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePasswordModal}
                className="rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]"
                style={{
                  background: "rgba(15,23,42,0.06)",
                  color: "var(--card-text, #0f172a)",
                  border: "1px solid rgba(15,23,42,0.08)",
                }}>
                Cerrar
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.16em]"
                  style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Escribe la nueva contraseña"
                  className="h-12 w-full rounded-2xl border px-4 outline-none transition-all duration-200 focus:border-transparent focus:ring-4"
                  style={{
                    borderColor: hexToRgba(currentStyleMeta.color, 0.18),
                    background: "rgba(255,255,255,0.95)",
                    color: "var(--card-text, #0f172a)",
                    "--tw-ring-color": hexToRgba(currentStyleMeta.color, 0.16),
                  }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.16em]"
                  style={{ color: "var(--card-muted, rgba(15,23,42,0.62))" }}>
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="h-12 w-full rounded-2xl border px-4 outline-none transition-all duration-200 focus:border-transparent focus:ring-4"
                  style={{
                    borderColor: hexToRgba(currentStyleMeta.color, 0.18),
                    background: "rgba(255,255,255,0.95)",
                    color: "var(--card-text, #0f172a)",
                    "--tw-ring-color": hexToRgba(currentStyleMeta.color, 0.16),
                  }}
                />
              </div>

              {passwordError && (
                <div
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold"
                  style={{
                    borderColor: "rgba(239,68,68,0.18)",
                    background: "rgba(254,242,242,0.95)",
                    color: "#b91c1c",
                  }}>
                  {passwordError}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                  className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.14em] transition-all duration-200 active:scale-[0.99] disabled:opacity-60"
                  style={{
                    background: `linear-gradient(180deg, ${hexToRgba(
                      currentStyleMeta.color,
                      0.98,
                    )}, ${hexToRgba(currentStyleMeta.color, 0.82)})`,
                    color: "#fff",
                    boxShadow: `0 14px 24px ${hexToRgba(
                      currentStyleMeta.color,
                      0.24,
                    )}`,
                  }}>
                  {savingPassword ? "Guardando..." : "Actualizar"}
                </button>

                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={savingPassword}
                  className="rounded-2xl border px-5 py-3 text-sm font-black uppercase tracking-[0.14em] transition-all duration-200 active:scale-[0.99] disabled:opacity-60"
                  style={{
                    borderColor: "rgba(15,23,42,0.10)",
                    background: "rgba(255,255,255,0.82)",
                    color: "var(--card-text, #0f172a)",
                  }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
