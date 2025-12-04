import React from "react";

const InsigniasCard = ({ insignias }) => {
  return (
    <div className=" w-[160px] sm:w-[180px] md:w-[200px] min-h-[220px] sm:min-h-[260px] bg-[#5991FF] rounded-2xl shadow-md flex flex-col items-center text-white p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">
        Insignias
      </h3>
      <div className="flex flex-col items-center gap-3">
        {insignias.map((insignia, index) => (
          <img
            key={index}
            src={insignia}
            alt={`Insignia ${index + 1}`}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
        ))}
      </div>
    </div>
  );
};

export default InsigniasCard;
