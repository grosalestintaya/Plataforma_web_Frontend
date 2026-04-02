import React, { useEffect, useState } from "react";
import UserCard from "../../components/UserCard";
import InsigniasCard from "../../components/InsigniasCardRemote";
import StudentModulesCenter from "../../components/StudentModulesCenter";
import { getHomeUser } from "@/features/dashboard/services/home.service";

const Inicio = () => {
  const [user, setUser] = useState({
    nombre: "",
    puntos: 0,
    nivel: "Yachaq",
    progreso: 0,
    institucion: "",
    seccion: "",
    monedas: 0,
    foto: "default",
  });

  useEffect(() => {
    let mounted = true;

    const loadHomeUser = async () => {
      try {
        const data = await getHomeUser();
        if (!mounted) return;
        setUser(data);
      } catch (error) {
        console.error("Error cargando home user:", error);
      }
    };

    loadHomeUser();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <UserCard user={user} />

      <div className="w-full min-w-0">
        <StudentModulesCenter />
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <InsigniasCard />
      </div>
    </div>
  );
};


export default Inicio;
