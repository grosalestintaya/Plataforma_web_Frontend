import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart2, PieChart, Home, User, Trophy, Settings, LogOut,Store } from "lucide-react";
import { FaUsers, FaUserPlus, FaUserCog ,FaChartPie,FaTh,FaThLarge} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import LogoutModal from "../components/Modals/LogoutModal";
import HeatMap from "@/pages/DashBoard/heatMap";

const SideBar = () => {
  const { user } = useAuth();
  const [openLogout, setOpenLogout] = useState(false);

  const themeClass = useMemo(() => `theme-${user?.style ?? "green"}`, [user?.style]);

  const baseItems = [];

  const studentItems = [{ name: "Inicio", path: "", icon: <Home size={20} /> }, { name: "Tienda", path: "store", icon: <Store size={20} /> },{ name: "Ranking", path: "ranking", icon: <Trophy size={20} /> }, 
   ];

  const teacherItems = [
        { name: "General", path: "teacher/heatmap", icon: <FaThLarge size={20} /> },
    { name: "Estudiantes", path: "teacher/students", icon: <FaUsers size={20} /> },
    { name: "Estadisticas", path: "teacher/statistics", icon: <BarChart2 size={20} /> },
    { name: "Gráficas", path: "teacher/graphs", icon: <FaChartPie size={20} /> },
    { name: "Ranking", path: "ranking", icon: <Trophy size={20} /> },
  ];

  const adminItems = [
    { name: "Usuarios", path: "users", icon: <FaUsers size={20} /> },
    { name: "Administrar sistema", path: "admin", icon: <Settings size={20} /> },

    { name: "Agregar usuario", path: "add_user", icon: <FaUserPlus size={20} /> },
  ];

  let menuItems = [...baseItems];
  if (user?.role.name === "Estudiante") menuItems.push(...studentItems);
  if (user?.role.name === "Docente") menuItems.push(...teacherItems);
  if (user?.role.name === "Administrador") menuItems.push(...adminItems);

  menuItems.push(
    { name: "Perfil", path: "perfil", icon: <User size={20} /> },
    { name: "Ajustes", path: "ajustes", icon: <FaUserCog size={20} /> }
  );

  return (
<div
  className={`flex min-h-screen ${themeClass} transition-colors duration-300`}
  style={{ backgroundColor: "var(--app-bg)" }}
>

      <aside
        className="h-[94vh] w-50 shadow-lg flex flex-col justify-between
        rounded-tr-2xl rounded-br-2xl mt-5 mb-3 fixed left-0"
        style={{
          backgroundColor: "var(--sidebar)",
          color: "var(--sidebar-foreground)",
        }}
      >
        {/* Header */}
        <div>
          <div className="flex flex-col items-center py-1">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-35 h-35 object-contain mb-2"
            />
          </div>

          {/* Menu */}
          <nav className="flex flex-col">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                end={item.path == ""}
                className={({ isActive }) =>
                  `sidebar-link flex items-center gap-3 py-2 px-4 my-1
                   rounded-xl mx-3 transition-colors duration-200
                   ${isActive ? "sidebar-link--active" : "sidebar-link--inactive"}`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="mb-4">
          <button
            onClick={() => setOpenLogout(true)}
            className="sidebar-logout w-[calc(100%-1.5rem)] mx-3
              flex items-center gap-3 py-2 px-4 rounded-xl
              transition-colors duration-200"
          >
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-50 p-6">
        <Outlet />
      </main>

      <LogoutModal open={openLogout} onClose={() => setOpenLogout(false)} />
    </div>
  );
};

export default SideBar;
