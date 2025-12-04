import React from "react";
import ShowDashboardTitle from "../../../Components/Ui/ShowDashboardTitle";
import { School, GraduationCap, Award, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    title: "Administrar Colegios",
    desc: "Gestiona los colegios registrados.",
    icon: <School size={40} />,
    path: "/manage_college",
  },
  {
    title: "Administrar Grados",
    desc: "Configura los grados del sistema.",
    icon: <GraduationCap size={40} />,
    path: "/manage_grade",
  },
  {
    title: "Administrar Insignias",
    desc: "Crea y organiza insignias.",
    icon: <Award size={40} />,
    path: "/manage_insignia",
  },
  {
    title: "Administrar Roles",
    desc: "Controla permisos y roles del sistema.",
    icon: <Shield size={40} />,
    path: "/manage_rol",
  },
];

export default function GestSystem() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <ShowDashboardTitle>Administrar sistema</ShowDashboardTitle>

      <div className="grid grid-cols-3 gap-6 mt-2">
        {modules.map((m, i) => (
          <div
            key={i}
            onClick={() => navigate(m.path)} // ← CLICK EN TODA LA CARD
            className="p-5 rounded-2xl shadow-lg bg-white hover:shadow-xl hover:scale-105 transition cursor-pointer"
          >
            <div className="text-blue-600 mb-4">{m.icon}</div>
            <h2 className="text-xl font-semibold">{m.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{m.desc}</p>

            <button
              onClick={(e) => {
                e.stopPropagation(); // evita que se dispare el click del card
                navigate(m.path);
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Administrar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
