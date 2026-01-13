// src/pages/Ajustes/Ajustes.jsx
import React, { useEffect, useMemo, useState } from "react";
import ShowDashboardTitle from "../../components/ui/ShowDashboardTitle";
import { useAuth } from "../../context/AuthContext";

const Ajustes = () => {
  const { user: authUser, updateStyle } = useAuth(); // updateStyle: función que debes exponer en AuthContext
  const [user, setUser] = useState(null);

  const [selectedAvatar, setSelectedAvatar] = useState("default");
  const [showAvatars, setShowAvatars] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Lista de avatares válidos dentro de /public/profile/
  const avatarCodes = ["default", "img-1", "img-2", "img-3", "img-4"];

  // Convertir codigo → imagen real
  const getAvatarPath = (code) => `/profile/${code}.png`;

  // Options de style (deben calzar con tu enum en DB)
  const styleOptions = useMemo(
    () => [
      { value: "green", label: "Verde" },
      { value: "blue", label: "Azul" },
      { value: "lila", label: "Lila" },
    ],
    []
  );

  // =============================
  // 1️⃣ Cargar datos con /me
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.user) {
          setUser({
            ...data.user,
            pinned_img: data.user.pinned_img || "default",
            style: data.user.style || authUser?.style || "green",
          });

          setSelectedAvatar(data.user.pinned_img || "default");
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <p className="p-6">Cargando ajustes...</p>;

  // =============================
  // 2️⃣ Manejo de inputs
  // =============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Cambiar theme visual al instante (sin guardar aún)
  const handleStyleChange = (e) => {
    const value = e.target.value;
    setUser((prev) => ({ ...prev, style: value }));
    updateStyle?.(value); // aplica theme class en el layout inmediatamente
  };

  // =============================
  // 3️⃣ Guardar cambios
  // =============================
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      dni: user.dni,
      pinned_img: selectedAvatar,
      style: user.style, // ✅ NUEVO
    };

    if (user.password && user.password.length > 0) {
      payload.password = user.password;
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/editmydata", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setMessage(data.msg || "Cambios guardados con éxito");
    } catch (error) {
      console.error("Error al guardar:", error);
      setMessage("Error al guardar");
    }

    setSaving(false);
  };

  // =============================
  // 4️⃣ Seleccionar avatar
  // =============================
  const handleAvatarSelect = (code) => {
    setSelectedAvatar(code);
    setUser((prev) => ({ ...prev, pinned_img: code }));
    setShowAvatars(false);
  };

  return (
    <div className="w-full h-100% p-6">
      <ShowDashboardTitle>Ajustes</ShowDashboardTitle>

      <div className="flex flex-row justify-between w-full h-full mt-6">
        {/* ========================= */}
        {/* IZQUIERDA - FORMULARIO   */}
        {/* ========================= */}
        <div
          className="w-[68%] p-6 rounded-2xl shadow-md border"
          style={{
            backgroundColor: "var(--ui-surface, #fff)",
            borderColor: "var(--card-border, rgba(15,23,42,0.10))",
          }}
        >
          <form className="space-y-5" onSubmit={handleSave}>
            {/* Theme selector */}
            <div className="rounded-2xl p-4 border flex items-center justify-between gap-4"
                 style={{
                   backgroundColor: "var(--chip-bg, rgba(255,255,255,0.90))",
                   borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                 }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--card-text, #0f172a)" }}>
                  Estilo de la interfaz
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                  Se aplica al instante; guarda para conservarlo.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Preview dot */}
                <div
                  className="h-10 w-10 rounded-xl border shadow-sm"
                  title="Vista previa del color"
                  style={{
                    backgroundColor: "var(--sidebar)",
                    borderColor: "var(--usercard-border, rgba(15,23,42,0.10))",
                  }}
                />
                <select
                  name="style"
                  value={user.style || "green"}
                  onChange={handleStyleChange}
                  className="h-10 rounded-xl px-3 border outline-none"
                  style={{
                    backgroundColor: "white",
                    borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                    color: "var(--card-text, #0f172a)",
                    outlineColor: "var(--sidebar-accent)",
                  }}
                >
                  {styleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm mb-1" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                  Nombres
                </label>
                <input
                  name="name"
                  type="text"
                  value={user.name}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-2 outline-none"
                  style={{
                    borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                    backgroundColor: "white",
                  }}
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm mb-1" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                  Apellidos
                </label>
                <input
                  name="lastname"
                  type="text"
                  value={user.lastname}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-2 outline-none"
                  style={{
                    borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                    backgroundColor: "white",
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                Nombre de usuario
              </label>
              <input
                name="username"
                type="text"
                value={user.username}
                onChange={handleChange}
                className="w-full border rounded-xl p-2 outline-none"
                style={{
                  borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                  backgroundColor: "white",
                }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                DNI
              </label>
              <input
                name="dni"
                type="text"
                value={user.dni}
                onChange={handleChange}
                className="w-full border rounded-xl p-2 outline-none"
                style={{
                  borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                  backgroundColor: "white",
                }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                Nueva contraseña (opcional)
              </label>
              <input
                name="password"
                type="password"
                placeholder="Escribe una nueva contraseña"
                value={user.password || ""}
                onChange={handleChange}
                className="w-full border rounded-xl p-2 outline-none"
                style={{
                  borderColor: "var(--card-border, rgba(15,23,42,0.10))",
                  backgroundColor: "white",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 px-6 py-2 rounded-xl shadow transition-all disabled:opacity-60"
              style={{
                backgroundColor: "var(--sidebar)",
                color: "var(--sidebar-foreground)",
              }}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            {message && (
              <p className="text-sm text-center mt-2" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                {message}
              </p>
            )}
          </form>
        </div>

        {/* ========================= */}
        {/* DERECHA - AVATAR CARD     */}
        {/* ========================= */}
        <div
          className="w-[28%] p-6 rounded-2xl shadow-md flex flex-col items-center text-center relative border"
          style={{
            backgroundColor: "var(--ui-surface, #fff)",
            borderColor: "var(--card-border, rgba(15,23,42,0.10))",
          }}
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--card-text, #0f172a)" }}>
            Avatar
          </h2>

          <div className="relative">
            <img
              src={getAvatarPath(selectedAvatar)}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover border-4"
              style={{ borderColor: "var(--sidebar)" }}
            />

            <button
              onClick={() => setShowAvatars(!showAvatars)}
              className="absolute bottom-0 right-0 rounded-full p-2 text-xs shadow"
              style={{
                backgroundColor: "var(--sidebar)",
                color: "var(--sidebar-foreground)",
              }}
              title="Cambiar avatar"
            >
              ✏️
            </button>
          </div>

          {/* Selector de avatares con blur */}
          {showAvatars && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 rounded-2xl">
              <div
                className="bg-white/80 backdrop-blur-md border rounded-xl p-4 shadow-lg flex gap-3 flex-wrap justify-center w-72"
                style={{ borderColor: "var(--card-border, rgba(15,23,42,0.10))" }}
              >
                {avatarCodes.map((code) => (
                  <img
                    key={code}
                    src={getAvatarPath(code)}
                    onClick={() => handleAvatarSelect(code)}
                    className="w-14 h-14 rounded-full cursor-pointer transition"
                    style={{
                      outline: selectedAvatar === code ? `4px solid var(--sidebar)` : "none",
                      transform: selectedAvatar === code ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="mt-3 text-lg font-semibold" style={{ color: "var(--card-text, #0f172a)" }}>
            {user.username}
          </p>
          <p style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>{user.rol?.name}</p>

          {/* Mini preview del theme actual */}
          <div className="mt-5 w-full rounded-2xl p-4 border text-left"
               style={{ borderColor: "var(--card-border, rgba(15,23,42,0.10))" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
              Estilo actual
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border shadow-sm"
                   style={{ backgroundColor: "var(--sidebar)", borderColor: "var(--card-border, rgba(15,23,42,0.10))" }} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold" style={{ color: "var(--card-text, #0f172a)" }}>
                  {styleOptions.find((s) => s.value === (user.style || "green"))?.label ?? "Verde"}
                </span>
                <span className="text-xs" style={{ color: "var(--card-muted, rgba(15,23,42,0.65))" }}>
                  Se sincroniza con tu cuenta.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;
