import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Users,
  BarChart2,
  PieChart,
  Award,
  UserPlus,
  UserCog,
} from "lucide-react";
import {
  FaUsers,
  FaChartBar,
  FaChartPie,
  FaTrophy,
  FaUserPlus,
  FaUserCog,
} from "react-icons/fa";

import {
  Home,
  User,
  Trophy,
  Settings,
  LogOut,
  BookOpen,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SideBar = () => {
  const { user } = useAuth();

  // ----- menu x rols -----
  const baseItems = [{ name: "Inicio", path: "/", icon: <Home size={20} /> }];
  // ----------------------------------------------
  const studentItems = [
    { name: "Ranking", path: "/ranking", icon: <Trophy size={20} /> },
  ];
  // ------------------------------------------------------------
  const teacherItems = [
    { name: "Estudiantes", path: "/students", icon: <FaUsers size={20} /> },
    {
      name: "Estadisticas",
      path: "/statistics",
      icon: <BarChart2 size={20} />,
    },
    { name: "Gráficas", path: "/graphs", icon: <PieChart size={20} /> },
    { name: "Ranking", path: "/ranking", icon: <Trophy size={20} /> },
  ];
  // -------------------------------------------------//
  const adminItems = [
    { name: "Usuarios", path: "/admin/users", icon: <FaUsers size={20} /> },
    {
      name: "Agregar usuario",
      path: "/admin/add_user",
      icon: <FaUserPlus size={20} />,
    },
        { name: "Administrar sistema", path: "/admin/", icon: <Settings size={20} /> },

  ];

  // Construcción dinámica del menú
  let menuItems = [...baseItems];

  if (user?.role === "Estudiante") menuItems.push(...studentItems);

  if (user?.role === "Docente") menuItems.push(...teacherItems);

  if (user?.role === "Administrador") menuItems.push(...adminItems); // Admin ve todo

  // Agregar ajustes al final
  menuItems.push(
    { name: "Perfil", path: "/perfil", icon: <User size={20} /> },

    {
      name: "Ajustes",
      path: "/ajustes",
      icon: <FaUserCog size={20} />,
    }
  );

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className="h-[94vh] w-50 bg-[#00C853] text-white shadow-lg 
        flex flex-col justify-between rounded-tr-2xl rounded-br-2xl 
        mt-5 mb-3 fixed left-0">
        {/* Header */}
        <div>
          <div className="flex flex-col items-center py-4">
            <img
              src="src/assets/logo.png"
              alt="Logo"
              className="w-12 h-12 object-contain mb-2"
            />
            <h2 className="text-xl font-bold">uipus</h2>
            <p className="text-xs opacity-80">Rol: {user?.role}</p>
          </div>

          {/* Menu dinámico */}
          <nav className="flex flex-col">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 my-1 rounded-xl mx-3 transition-colors duration-200 ${
                    isActive ? "bg-[#0A7136]" : "hover:bg-[#0A7136]/70"
                  }`
                }>
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="mb-4">
          <NavLink
            to="/logout"
            className={({ isActive }) =>
              `flex items-center gap-3 py-2 px-4 rounded-xl mx-3 transition-colors duration-200 ${
                isActive ? "bg-[#0A7136]" : "hover:bg-[#0A7136]/70"
              }`
            }>
            <LogOut size={20} />
            <span>Salir</span>
          </NavLink>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 ml-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default SideBar;
