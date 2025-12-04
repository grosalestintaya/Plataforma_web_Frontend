import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ShowDashboardTitle from "../../Components/Ui/ShowDashboardTitle";

export default function LogOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // 🔥 Limpia token + user + localStorage
    navigate("/login"); // 🔥 Redirige al login
  };

  return (
    <div className="p-6">
      <ShowDashboardTitle>Salir</ShowDashboardTitle>

      <p className="text-gray-700 mt-4 mb-6">
        ¿Estás seguro de que deseas cerrar sesión?
      </p>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
        Cerrar sesión
      </button>
    </div>
  );
}
