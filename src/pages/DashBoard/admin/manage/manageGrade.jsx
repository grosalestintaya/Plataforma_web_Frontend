import { useEffect, useState } from "react";
import ShowDashboardTitle from "../../../../Components/Ui/ShowDashboardTitle";
import { useNavigate } from "react-router-dom";

export default function ManageGrade() {
  const [grades, setGrades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add o edit
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ========================
  // 📌 OBTENER GRADOS
  // ========================
  const fetchGrades = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/data/grades", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setGrades(data);
      else setGrades([]);
    } catch (err) {
      console.error("Error al listar grados:", err);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  // ========================
  // 📌 ABRIR MODAL
  // ========================
  const openAddModal = () => {
    setModalMode("add");
    setName("");
    setShowModal(true);
  };

  const openEditModal = (grade) => {
    setModalMode("edit");
    setEditId(grade.id_grade);
    setName(grade.name);
    setShowModal(true);
  };

  // ========================
  // 📌 GUARDAR (ADD O EDIT)
  // ========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return alert("Llena el nombre del grado");

    const url =
      modalMode === "add"
        ? "http://localhost:5000/api/grades"
        : `http://localhost:5000/api/grades/${editId}`;
    const method = modalMode === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.error) alert("Error: " + data.error);
      else {
        alert(modalMode === "add" ? "Grado agregado" : "Grado actualizado");
        setShowModal(false);
        fetchGrades();
      }
    } catch (err) {
      console.error("Error al guardar grado:", err);
    }
  };

  return (
    <div className="p-6 relative">
        <ShowDashboardTitle>Administrar Grados</ShowDashboardTitle>
        <br />
        <div className="flex gap-4 justify-end">
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Agregar Grado
          </button>

          <button
            onClick={() => navigate(-1)}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            ← Volver
          </button>
        </div>
        <br />

      {/* ======================== LISTA DE GRADOS ======================== */}
      {grades.length === 0 ? (
        <p>No hay grados registrados.</p>
      ) : (
        <ul className="space-y-3">
          {grades.map((grade) => (
            <li
              key={grade.id_grade}
              className="p-3 bg-gray-100 rounded-lg shadow flex justify-between items-center"
            >
              <p className="font-semibold capitalize">{grade.name}</p>
              <button
                onClick={() => openEditModal(grade)}
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
              {modalMode === "add" ? "Agregar Grado" : "Editar Grado"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del grado"
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                    modalMode === "add"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {modalMode === "add" ? "Agregar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
    