import React from "react";
import { useNavigate } from "react-router-dom";

const ModuleItem = ({ number, title, duration, route }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(route)}
      className="flex items-center justify-between w-full bg-white shadow-md rounded-xl p-4 my-3 cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2962FF] text-white font-bold text-lg">
          {number}
        </div>
        <div>
          <h3 className="text-gray-800 font-semibold text-lg">{title}</h3>
        </div>
      </div>
      <span className="text-gray-500 text-sm">{duration}</span>
    </div>
  );
};

export default ModuleItem;
