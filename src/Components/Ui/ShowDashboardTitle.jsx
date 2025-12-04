import React from "react";

const ShowDashboardTitle = ({
  children,
  bgColor = "bg-green3/10", // color de fondo por defecto
  textColor = "text-lilac3", // color de texto por defecto
}) => {
  return (
    <div
      className={`block rounded-lg h-[70px] w-full ${bgColor} p-3 shadow-lg flex items-center`}
    >
      <h5
        className={`text-[36px] font-bold ${textColor} ml-4 font-primary`}
        style={{ lineHeight: "1" }}
      >
        {children}
      </h5>
    </div>
  );
};

export default ShowDashboardTitle;
