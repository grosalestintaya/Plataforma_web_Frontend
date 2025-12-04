import React, { useEffect, useState } from "react";
import ShowDashboardTitle from "../../Components/Ui/ShowDashboardTitle";
import PerfilCard from "../../Components/Perfil/PerfilCard";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Error obteniendo perfil");
        }

        const data = await res.json();
        console.log("📌 Perfil recibido:", data);

        const u = data.user;

        setUser({
          fechaRegistro: u.created_at,
          nombre: u.name,
          apellidos: u.lastname,
          nombreUsuario: u.username,
          colegio: u.school?.name || "Sin asignar",
          rol: u.rol?.name || "Sin rol",
          grado: u.grade?.name || "Sin grado",
          dni: u.dni,
          isActive: u.is_active,
          avatar: u.pinned_img,
        });

      } catch (error) {
        console.error("❌ Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="p-5 text-center text-lg font-semibold">
        Cargando perfil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-5 text-center text-red-500 font-semibold">
        No se pudo cargar el perfil.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-5">
      <ShowDashboardTitle>Perfil</ShowDashboardTitle>

      <div className="mt-5">
        <PerfilCard user={user} />
      </div>
    </div>
  );
};

export default Perfil;
