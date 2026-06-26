import React, { useEffect, useState } from "react";
import UserCard from "../../components/UserCard";
import InsigniasCard from "../../components/InsigniasCardRemote";
import { getHomeUser } from "@/features/dashboard/services/home.service";
import HomeProgressRope from "../../components/maincard";
import ModulesRope from "../../components/maincard";
import { AnnouncementModal, useAnnouncement } from "@/features/announcement";

import { useProgressOverview } from "../../hooks/useProgressOverview";

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
  const { isOpen, close } = useAnnouncement(user.nombre); // o user.email, lo que tengas

  return (
    <div
      id="nav-inicio"
      className="flex h-full w-full min-w-0 flex-col overflow-hidden pb-0 "
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <AnnouncementModal isOpen={isOpen} onClose={close} />

      <div className="shrink-0">
        <UserCard user={user} />
      </div>

      <div className="min-h-0 flex-1">
        <ModulesRope modules={data?.modules || []} className="h-full" />
      </div>

      <div className="shrink-0 -pb-0" id="nav-insignias">
        <InsigniasCard />
      </div>
    </div>
  );
};

export default Inicio;
