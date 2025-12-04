import React, { useEffect, useState } from "react";
import ShowDashboardTitle from "../../../Components/Ui/ShowDashboardTitle";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [dni, setDni] = useState("");
  const [pinnedImg, setPinnedImg] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const token = localStorage.getItem("token");

  // ======================== LISTAR USUARIOS ========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar usuarios");
        const data = await res.json();
        setUsers(data);
        setFiltered(data);
      } catch (err) {
        setError("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // 🔎 FILTRO DE BÚSQUEDA
  useEffect(() => {
    const results = users.filter((u) =>
      `${u.name} ${u.lastname} ${u.username} ${u.rol}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, users]);

  // ======================== ABRIR MODAL DE EDICIÓN ========================
  const openModal = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/get_user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Error al obtener usuario");

      const u = data.user;
      setEditUser(u);
      setName(u.name || "");
      setLastname(u.lastname || "");
      setUsername(u.username || "");
      setDni(u.dni || "");
      setPinnedImg(u.pinned_img || "");
      setPassword("");
      setIsActive(u.is_active);

      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar la información del usuario");
    }
  };

  // ======================== GUARDAR CAMBIOS ========================
  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      const res = await fetch("http://localhost:5000/api/user/editUserData", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: editUser.id_user,
          name,
          lastname,
          username,
          dni,
          pinned_img: pinnedImg,
          password,
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // actualizar tabla local
      setUsers((prev) =>
        prev.map((u) => (u.id_user === editUser.id_user ? { ...u, name, lastname, username, dni, pinned_img: pinnedImg, is_active: isActive } : u))
      );
      setFiltered((prev) =>
        prev.map((u) => (u.id_user === editUser.id_user ? { ...u, name, lastname, username, dni, pinned_img: pinnedImg, is_active: isActive } : u))
      );

      setShowModal(false);
      alert("Usuario actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios");
    }
  };

  return (
    <div className="p-6">
      <ShowDashboardTitle>Usuarios</ShowDashboardTitle>

      {/* 🔎 Buscador */}
      <div className="w-full mt-4">
        <input
          type="text"
          placeholder="Buscar usuario, rol, nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg bg-white text-black shadow-sm focus:ring focus:ring-blue-300"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 mt-4">Cargando usuarios...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 mt-4">No se encontraron coincidencias.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Usuario</th>
                <th className="p-3 text-left">Rol</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id_user}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="p-3">
                    {user.name} {user.lastname}
                  </td>
                  <td className="p-3 text-gray-700">@{user.username}</td>
                  <td className="p-3 font-medium">{user.rol}</td>
                  <td className="p-3">
                    {user.is_active ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded-lg transition"
                      onClick={() => openModal(user.id_user)}
                    >
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL ================= */}
   {/* ================= MODAL PROFESIONAL 3 COLUMNAS ================= */}
{showModal && editUser && (
  <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-8 z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Editar Usuario</h2>

      <form onSubmit={handleSave} className="grid grid-cols-3 gap-6">
        {/* COLUMNA 1: Imagen */}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Imagen de perfil
          </label>
          <img
            src={`/profile/${pinnedImg}.png`}
            alt="preview"
            className="w-32 h-32 rounded-full border mb-2"
          />
          <input
            type="text"
            value={pinnedImg}
            onChange={(e) => setPinnedImg(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Nombre de imagen"
          />
        </div>

        {/* COLUMNA 2: Datos solo lectura y algunos editables */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">ID Usuario</label>
            <input
              type="text"
              value={editUser.id_user}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Rol</label>
            <input
              type="text"
              value={editUser.rol?.name || ""}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
              <div>
            <label className="block text-sm font-medium text-gray-600">colegio</label>
            <input
              type="text"
              value={editUser.school?.name || ""}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Grado</label>
            <input
              type="text"
              value={editUser.grade?.name || ""}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* COLUMNA 3: Datos editables */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Apellidos</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">DNI</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Opcional"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-600">Activo</label>
          </div>
        </div>

        {/* BOTONES: Ocupan toda la base del modal */}
        <div className="col-span-3 flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
