import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
export default function LogoutModal({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleLogout = () => {
    logout(); // limpia contexto + localStorage
    navigate("/login"); // redirige
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] max-w-[90%] p-6">
        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Cerrar sesión
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas cerrar sesión?
        </p>

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
            Cancelar
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
