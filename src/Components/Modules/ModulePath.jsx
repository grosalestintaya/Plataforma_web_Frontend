import React from "react";
import { useNavigate } from "react-router-dom";

const modules = [
  { id: 1, title: "¿Qué son las finanzas personales?", duration: "15 min" },
  { id: 2, title: "Ingresos y gastos", duration: "20 min" },
  { id: 3, title: "Presupuesto y ahorro", duration: "25 min" },
  { id: 4, title: "Metas financieras", duration: "30 min" },
  { id: 5, title: "Uso responsable del dinero", duration: "20 min" },
  { id: 6, title: "Evaluación final", duration: "15 min" },
];

const colors = ["#FF4081", "#5991FF"];

const ModulePath = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-8 w-full h-auto p-6">
      {modules.map((mod, index) => (
        <div
          key={mod.id}
          onClick={() => navigate(`/Module_${mod.id}`)}
          className={`relative group flex justify-center items-center rounded-full text-white font-bold cursor-pointer transition-all duration-300 hover:scale-110`}
          style={{
            width: "110px",
            height: "110px",
            backgroundColor: colors[index % 2],
            marginTop: index % 2 === 0 ? "0px" : "60px",
            marginBottom: index % 2 === 0 ? "60px" : "0px",
          }}
        >
          <span className="text-3xl">{mod.id}</span>

          {/* Tooltip al pasar el mouse */}
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-800 p-3 rounded-xl shadow-lg w-48 -bottom-28 z-10">
            <h3 className="text-sm font-semibold">{mod.title}</h3>
            <p className="text-xs text-gray-500">{mod.duration}</p>
          </div>

          {/* Línea de conexión (excepto el último) */}
          {index < modules.length - 1 && (
            <div
              className="absolute w-16 h-1 bg-gray-300 -right-16 hidden md:block"
              style={{
                top: "50%",
                transform: index % 2 === 0 ? "rotate(10deg)" : "rotate(-10deg)",
              }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModulePath;
