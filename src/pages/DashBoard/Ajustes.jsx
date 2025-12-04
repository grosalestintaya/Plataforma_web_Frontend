// src/pages/Ajustes/Ajustes.jsx
import React, { useEffect, useState } from "react";
import ShowDashboardTitle from "../../Components/Ui/ShowDashboardTitle";

const Ajustes = () => {
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
          });

          setSelectedAvatar(data.user.pinned_img || "default");
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };

    fetchData();
  }, []);

  if (!user) return <p className="p-6">Cargando ajustes...</p>;

  // =============================
  // 2️⃣ Manejo de inputs
  // =============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
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
    <div className="w-full h-full p-6">
      <ShowDashboardTitle>Ajustes</ShowDashboardTitle>

      <div className="flex flex-row justify-between w-full h-full mt-6">
        {/* ========================= */}
        {/* IZQUIERDA - FORMULARIO   */}
        {/* ========================= */}
        <div className="w-[68%] bg-white p-6 rounded-2xl shadow-md">
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm mb-1">
                  Nombres
                </label>
                <input
                  name="name"
                  type="text"
                  value={user.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="w-1/2">
                <label className="block text-gray-700 text-sm mb-1">
                  Apellidos
                </label>
                <input
                  name="lastname"
                  type="text"
                  value={user.lastname}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Nombre de usuario
              </label>
              <input
                name="username"
                type="text"
                value={user.username}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">
                DNI
              </label>
              <input
                name="dni"
                type="text"
                value={user.dni}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Nueva contraseña (opcional)
              </label>
              <input
                name="password"
                type="password"
                placeholder="Escribe una nueva contraseña"
                value={user.password || ""}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-[#2962FF] text-white rounded-lg shadow hover:bg-[#1f4ed8] transition-all"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            {message && (
              <p className="text-sm text-center text-gray-600 mt-2">
                {message}
              </p>
            )}
          </form>
        </div>

        {/* ========================= */}
        {/* DERECHA - AVATAR CARD     */}
        {/* ========================= */}
        <div className="w-[28%] bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center relative">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Avatar</h2>

          <div className="relative">
            <img
              src={getAvatarPath(selectedAvatar)}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-[#2962FF]"
            />

            <button
              onClick={() => setShowAvatars(!showAvatars)}
              className="absolute bottom-0 right-0 bg-[#2962FF] text-white rounded-full p-2 text-xs hover:bg-[#1f4ed8]"
            >
              ✏️
            </button>
          </div>

          {/* Selector de avatares con blur */}
          {showAvatars && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 rounded-2xl">
              <div className="bg-white/70 backdrop-blur-md border rounded-xl p-4 shadow-lg flex gap-3 flex-wrap justify-center w-72">
                {avatarCodes.map((code) => (
                  <img
                    key={code}
                    src={getAvatarPath(code)}
                    onClick={() => handleAvatarSelect(code)}
                    className={`w-14 h-14 rounded-full cursor-pointer transition ${
                      selectedAvatar === code
                        ? "ring-4 ring-[#2962FF] scale-105"
                        : "hover:scale-110"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="mt-3 text-lg font-semibold">{user.username}</p>
          <p className="text-gray-500">{user.rol?.name}</p>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;
