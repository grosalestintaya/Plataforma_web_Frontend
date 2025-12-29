import React from "react";
import { useNavigate } from "react-router-dom";
import { modules } from "../../content/modules"; // ajusta la ruta si tu estructura difiere

const colors = ["#FF4081", "#5991FF"];

const ModulePath = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-8 w-full h-auto p-6">
      {modules
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((mod, index) => (
          <div
            key={mod.id}
            onClick={() => navigate(`/modulos/${mod.id}`)}   // <-- AQUÍ el cambio
            className="relative group flex justify-center items-center rounded-full text-white font-bold cursor-pointer transition-all duration-300 hover:scale-110"
            style={{
              width: "110px",
              height: "110px",
              backgroundColor: colors[index % 2],
              marginTop: index % 2 === 0 ? "0px" : "60px",
              marginBottom: index % 2 === 0 ? "60px" : "0px",
            }}
          >
            <span className="text-3xl">{index + 1}</span>

            {/* Tooltip */}
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-800 p-3 rounded-xl shadow-lg w-56 -bottom-28 z-10">
              <h3 className="text-sm font-semibold">{mod.title}</h3>
              <p className="text-xs text-gray-500">
                {mod.description || "Módulo de aprendizaje"}
              </p>
            </div>

            {/* Línea de conexión */}
            {index < modules.length - 1 && (
              <div
                className="absolute w-16 h-1 bg-gray-300 -right-16 hidden md:block"
                style={{
                  top: "50%",
                  transform: index % 2 === 0 ? "rotate(10deg)" : "rotate(-10deg)",
                }}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default ModulePath;
