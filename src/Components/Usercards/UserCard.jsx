import React from "react";

const UserCard = ({ user }) => {
  return (
    <div className="bg-[rgba(41,98,255,0.1)] rounded-2xl shadow-md p-6 flex justify-between items-center w-full h-[130px]">
      {/* Imagen de perfil */}
      <div className="flex items-center gap-4">
        <img
          src={user.foto}
          alt="Perfil"
          className="w-24 h-24 object-cover rounded-2xl border border-[#2962FF]/30"
        />

        {/* Info principal */}
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-bold text-gray-900">{user.nombre}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Nivel: {user.nivel} — {user.puntos} pts para siguiente nivel
          </p>

          {/* Barra de progreso */}
          <div className="w-100 bg-gray-300 rounded-full h-3 mt-2">
            <div
              className="bg-[#00C853] h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${user.progreso}%` }}
            ></div>
          </div>

          {/* Cards pequeños */}
          <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl shadow-sm">
              <div className="w-4 h-4 bg-[#2962FF] rounded-sm"></div>
              <span className="text-sm text-gray-700">{user.institucion}</span>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl shadow-sm">
              <div className="w-4 h-4 bg-[#00C853] rounded-sm"></div>
              <span className="text-sm text-gray-700">{user.seccion}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#E29800] text-white rounded-2xl w-[365px] py-6 text-center shadow-md flex flex-col justify-center items-center">
        <span className="text-4xl font-bold">{user.monedas}</span>
        <span className="text-lg font-semibold mt-1">Intis</span>
      </div>
    </div>
  );
};

export default UserCard;
