import React from "react";
import UserCard from "../../Components/Usercards/UserCard";
import UserBody from "../../Components/Usercards/UserBody";
import NivelActualCard from "../../Components/Usercards/NivelActualCard";
import InsigniasCard from "../../Components/Usercards/InsigniasCard";

const Inicio = () => {
  const user = {
    nombre: "George Rosales Tintaya",
    puntos: 3000,
    nivel: "Chasque",
    progreso: 70,
    institucion: "IE San Francisco",
    seccion: "3ro Grado",
    monedas: 69,
    foto: "https://unavatar.io/kikobeats",
  };

  const insignias = [
    "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    "https://cdn-icons-png.flaticon.com/512/616/616554.png",
    "https://cdn-icons-png.flaticon.com/512/616/616490.png",
  ];

  return (
    <div className="flex flex-col gap-4">
      <UserCard user={user} />

      <div className="flex flex-col lg:flex-row w-full justify-between items-start">
        <div className="flex-1">
          <UserBody />
        </div>

        <div className="flex flex-row lg:flex-col gap-4 mt-4 lg:mt-0 lg:ml-4">
          <NivelActualCard nivel={user.nivel} logo="/nivel-logo.png" />
          <InsigniasCard insignias={insignias} />
        </div>
      </div>
    </div>
  );
};

export default Inicio;
