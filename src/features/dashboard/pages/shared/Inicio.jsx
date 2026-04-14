import React, { useEffect, useState } from "react";
import UserCard from "../../components/UserCard";
import InsigniasCard from "../../components/InsigniasCardRemote";
import StudentModulesCenter from "../../components/StudentModulesCenter";
import { getHomeUser } from "@/features/dashboard/services/home.service";
import HomeProgressRope from "../../components/maincard";
import ModulesRope from "../../components/maincard";
import module1 from "@/assets/modulepics/module-1.png";
import module2 from "@/assets/modulepics/module-2.png";
import module3 from "@/assets/modulepics/module-3.png";
import module4 from "@/assets/modulepics/module-4.png";
import module5 from "@/assets/modulepics/module-5.png";
import { useProgressOverview } from "../../hooks/useProgressOverview";

import bg from "@/assets/dashboard/bg3.png";
const MODULE_IMAGES = {
  1: module1,
  2: module2,
  3: module3,
  4: module4,
  5: module5,
};

const Inicio = () => {
  const { data, loading } = useProgressOverview();
  console.log("Home user data:", data?.modules || []);

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
        const datas = await getHomeUser();
        if (!mounted) return;
        setUser(datas);
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
    <div
      className="flex h-full w-full min-w-0 flex-col overflow-hidden pb-0 "
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <div className="shrink-0">
        <UserCard user={user} />
      </div>

      <div className="min-h-0 flex-1">
        <ModulesRope
          modules={data?.modules || []}
          moduleImages={MODULE_IMAGES}
          className="h-full"
        />
      </div>

      <div className="shrink-0 -pb-0">
        <InsigniasCard />
      </div>
    </div>
  );
};

export default Inicio;
