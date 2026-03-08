import React from "react";

const NivelActualCard = ({ nivel, logo }) => {
  return (
    <div className="w-[160px] sm:w-[180px] md:w-[200px] h-auto bg-[#FF4081] rounded-2xl shadow-md flex flex-col items-center justify-center text-white p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-3 text-center">
        Nivel actual
      </h3>
      <img
        src={logo}
        alt="Logo nivel"
        className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-3"
      />
      <p className="text-2xl sm:text-3xl font-bold">{nivel}</p>
    </div>
  );
};

export default NivelActualCard;
