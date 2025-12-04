import React, { useEffect, useState } from "react";
import ShowDashboardTitle from "../../../Components/Ui/ShowDashboardTitle";

export default function AddUsers() {
  const [roles, setRoles] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schools, setSchools] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState({
    id_rol: "",
    id_grade: "",
    id_school: "",
    name: "",
    lastname: "",
    username: "",
    dni: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData("roles", setRoles);
    fetchData("grades", setGrades);
    fetchData("schools", setSchools);
  }, []);

  const fetchData = async (type, setter) => {
    try {
      const res = await fetch(`http://localhost:5000/api/data/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error al cargar ${type}`);

      const data = await res.json();
      setter(data);
    } catch (error) {
      console.error("Error cargando data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === "id_rol") {
      setSelectedRole(String(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    const payload = {
      ...formData,
      id_rol: Number(formData.id_rol),
      id_grade: Number(formData.id_grade) || null,
      id_school: Number(formData.id_school) || null,
    };

    try {
      const res = await fetch("http://localhost:5000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear usuario");
      } else {
        setMessage("✅ Usuario creado exitosamente");

        // limpiar formulario
        setFormData({
          id_rol: "",
          id_grade: "",
          id_school: "",
          name: "",
          lastname: "",
          username: "",
          dni: "",
          password: "",
        });

        setSelectedRole("");
      }
    } catch (error) {
      setError("Error del servidor");
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <ShowDashboardTitle>Agregar Usuarios</ShowDashboardTitle>

      {/* Mensajes */}
      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
        
        {/* SELECT ROL */}
        <div className="col-span-2">
          <label className="text-sm font-semibold">Rol</label>
          <select
            name="id_rol"
            value={formData.id_rol}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-white text-black"
          >
            <option value="">Seleccione un rol...</option>
            {roles.map((r) => (
              <option key={r.id_rol} value={String(r.id_rol)}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* ESTUDIANTE */}
        {selectedRole === "3" && (
          <>
            <div>
              <label className="text-sm font-semibold">Grado</label>
              <select
                name="id_grade"
                value={formData.id_grade}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg bg-white text-black"
              >
                <option value="">Seleccione grado</option>
                {grades.map((g) => (
                  <option key={g.id_grade} value={g.id_grade}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Colegio</label>
              <select
                name="id_school"
                value={formData.id_school}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg bg-white text-black"
              >
                <option value="">Seleccione colegio</option>
                {schools.map((s) => (
                  <option key={s.id_school} value={s.id_school}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* DOCENTE */}
        {selectedRole === "2" && (
          <div className="col-span-2">
            <label className="text-sm font-semibold">Colegio</label>
            <select
              name="id_school"
              value={formData.id_school}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg bg-white text-black"
            >
              <option value="">Seleccione colegio</option>
              {schools.map((s) => (
                <option key={s.id_school} value={s.id_school}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* CAMPOS GENERALES */}
        <input name="name" placeholder="Nombre" onChange={handleChange} value={formData.name} className="p-2 border rounded-lg text-black" />
        <input name="lastname" placeholder="Apellido" onChange={handleChange} value={formData.lastname} className="p-2 border rounded-lg text-black" />
        <input name="username" placeholder="Username" onChange={handleChange} value={formData.username} className="p-2 border rounded-lg text-black" />
        <input name="dni" placeholder="Número de DNI" onChange={handleChange} value={formData.dni} className="p-2 border rounded-lg text-black" />
        <input name="password" placeholder="Contraseña" type="password" onChange={handleChange} value={formData.password} className="p-2 border rounded-lg text-black" />

        <button
          type="submit"
          disabled={loading}
          className={`col-span-2 p-3 rounded-lg text-white 
            ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {loading ? "Creando usuario..." : "Crear Usuario"}
        </button>
      </form>
    </div>
  );
}
