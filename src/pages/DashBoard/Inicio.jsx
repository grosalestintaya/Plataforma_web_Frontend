import React from "react";
import UserCard from "../../components/Usercards/UserCard";
import InsigniasCard from "../../components/Usercards/InsigniasCardRemote";
import StudentModulesCenter from "../../components/center/StudentModulesCenter";

const Inicio = () => {
  const user = {
    nombre: "George Rosales Tintaya",
    puntos: 300,
    nivel: "Chasque",
    progreso: 98,
    institucion: "IE San Francisco",
    seccion: "3ro Grado",
    monedas: 100,
    foto: "https://unavatar.io/kikobeats",
  };

  const insignias = [
    "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    "https://cdn-icons-png.flaticon.com/512/616/616554.png",
    "https://cdn-icons-png.flaticon.com/512/616/616490.png",
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <UserCard user={user} />

      {/* SIEMPRE FILA */}
      <div className="flex w-full items-start gap-4">
        {/* CENTRO: se expande */}
        <div className="flex-1 min-w-0">
          <StudentModulesCenter />
        </div>

        {/* DERECHA: ancho fijo + pegado a la derecha */}
        <div className="w-[160px] shrink-0 ml-auto">
          <InsigniasCard insignias={insignias} />
        </div>
      </div>
    </div>
  );
};

export default Inicio;
