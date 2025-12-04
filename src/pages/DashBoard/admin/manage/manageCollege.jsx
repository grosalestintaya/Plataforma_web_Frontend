import { useEffect, useState } from "react";
import ShowDashboardTitle from "../../../../Components/Ui/ShowDashboardTitle";
import { useNavigate } from "react-router-dom";

export default function ManageCollege() {
  const [schools, setSchools] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add o edit
const navigate = useNavigate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  // ========================
  // 📌 OBTENER COLEGIOS
  // ========================
  const fetchSchools = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/data/schools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setSchools(data);
      else setSchools([]);
    } catch (err) {
      console.error("Error al listar colegios:", err);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // ========================
  // 📌 ABRIR MODAL
  // ========================
  const openAddModal = () => {
    setModalMode("add");
    setName("");
    setAddress("");
    setShowModal(true);
  };

  const openEditModal = (school) => {
    setModalMode("edit");
    setEditId(school.id_school);
    setName(school.name);
    setAddress(school.address);
    setShowModal(true);
  };

  // ========================
  // 📌 GUARDAR (ADD O EDIT)
  // ========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !address) return alert("Llena todos los campos");

    const url =
      modalMode === "add"
        ? "http://localhost:5000/api/schools"
        : `http://localhost:5000/api/schools/${editId}`;

    const method = modalMode === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, address }),
      });

      const data = await res.json();
      if (data.error) alert("Error: " + data.error);
      else {
        alert(modalMode === "add" ? "Colegio agregado" : "Colegio actualizado");
        setShowModal(false);
        fetchSchools();
      }
    } catch (err) {
      console.error("Error al guardar colegio:", err);
    }
  };

  return (
    <div className="p-6 relative">
        
        <ShowDashboardTitle>Administrar colegios</ShowDashboardTitle>
        <br />


<div className="flex justify-end gap-9 mb-6">
  <button
    onClick={openAddModal}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
  >
    Agregar Colegio
  </button>

  <button
    onClick={() => navigate(-1)}
    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
  >
    ← Volver
  </button>
</div>



      {/* ======================== LISTA DE COLEGIOS ======================== */}
      {schools.length === 0 ? (
        <p>No hay colegios registrados.</p>
      ) : (
        <ul className="space-y-3">
          {schools.map((school) => (
            <li
              key={school.id_school}
              className="p-3 bg-gray-100 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold capitalize">{school.name}</p>
                <p className="text-sm text-gray-700">{school.address}</p>
              </div>

              <button
                onClick={() => openEditModal(school)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ======================== MODAL SUPERPUESTO ======================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 relative">
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === "add" ? "Agregar Colegio" : "Editar Colegio"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del colegio"
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Dirección"
                className="w-full p-2 border rounded"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    modalMode === "add" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {modalMode === "add" ? "Agregar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
          
        </div>
        
      )}
       <div className="p-6 flex justify-end">

</div>
    </div>
    
  );
}
