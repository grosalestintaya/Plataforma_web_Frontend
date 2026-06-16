import { BarChart2, Home, User, Trophy, Settings, Store } from "lucide-react";
import {
  FaUsers,
  FaUserPlus,
  FaUserCog,
  FaChartPie,
  FaThLarge,
} from "react-icons/fa";

export const NAV_BY_ROLE = {
  Estudiante: [
    { name: "Inicio", path: "", icon: Home, id: "nav-inicio" },
    { name: "Tienda", path: "store", icon: Store, id: "nav-store" },
    { name: "Ranking", path: "ranking", icon: Trophy, id: "nav-ranking" },
  ],
  Docente: [
    {
      name: "General",
      path: "teacher/heatmap",
      icon: FaThLarge,
      id: "nav-general",
    },
    {
      name: "Estudiantes",
      path: "teacher/students",
      icon: FaUsers,
      id: "nav-estudiantes",
    },
    {
      name: "Modulos",
      path: "teacher/Gest-Modules",
      icon: FaThLarge,
      id: "nav-modulos",
    },
    {
      name: "Estadísticas",
      path: "teacher/statistics",
      icon: BarChart2,
      id: "nav-estadisticas",
    },
    {
      name: "Gráficas",
      path: "teacher/graphs",
      icon: FaChartPie,
      id: "nav-graficas",
    },
    { name: "Ranking", path: "ranking", icon: Trophy, id: "nav-ranking" },
  ],
  Administrador: [
    { name: "Usuarios", path: "users", icon: FaUsers, id: "nav-usuarios" },
    { name: "Admin", path: "admin", icon: Settings, id: "nav-admin" },
    { name: "Agregar", path: "add_user", icon: FaUserPlus, id: "nav-agregar" },
  ],
};

export const COMMON_ITEMS = [
  { name: "Perfil", path: "perfil", icon: FaUserCog, id: "nav-perfil" },
];

export function getMenuItemsByRole(roleName) {
  return [...(NAV_BY_ROLE[roleName] ?? []), ...COMMON_ITEMS];
}
