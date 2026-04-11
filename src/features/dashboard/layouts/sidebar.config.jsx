import { BarChart2, Home, User, Trophy, Settings, Store } from "lucide-react";
import {
  FaUsers,
  FaUserPlus,
  FaUserCog,
  FaChartPie,
  FaThLarge,
} from "react-icons/fa";

export const COMMON_ITEMS = [
  {
    name: "Perfil",
    path: "perfil",
    icon: FaUserCog,
  },
];

export const NAV_BY_ROLE = {
  Estudiante: [
    {
      name: "Inicio",
      path: "",
      icon: Home,
    },
    {
      name: "Tienda",
      path: "store",
      icon: Store,
    },
    {
      name: "Ranking",
      path: "ranking",
      icon: Trophy,
    },
  ],

  Docente: [
    {
      name: "General",
      path: "teacher/heatmap",
      icon: FaThLarge,
    },
    {
      name: "Estudiantes",
      path: "teacher/students",
      icon: FaUsers,
    },
    {
      name: "Estadísticas",
      path: "teacher/statistics",
      icon: BarChart2,
    },
    {
      name: "Gráficas",
      path: "teacher/graphs",
      icon: FaChartPie,
    },
    {
      name: "Ranking",
      path: "ranking",
      icon: Trophy,
    },
  ],

  Administrador: [
    {
      name: "Usuarios",
      path: "users",
      icon: FaUsers,
    },
    {
      name: "Administrar sistema",
      path: "admin",
      icon: Settings,
    },
    {
      name: "Agregar usuario",
      path: "add_user",
      icon: FaUserPlus,
    },
  ],
};

export function getMenuItemsByRole(roleName) {
  return [...(NAV_BY_ROLE[roleName] ?? []), ...COMMON_ITEMS];
}
