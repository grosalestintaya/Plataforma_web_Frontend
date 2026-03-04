import React from "react";

const ShowDashboardTitle = ({ children, className = "" }) => {
  return (
    <div
      className={`block rounded-lg h-[70px] w-full p-3 shadow-lg flex items-center ${className}`}
      style={{ backgroundColor: "var(--dash-title-bg)" }}>
      <h5
        className="text-[36px] font-bold ml-4 font-primary"
        style={{
          color: "var(--dash-title-text)",
          lineHeight: "1",
        }}>
        {children}
      </h5>
    </div>
  );
};

export default ShowDashboardTitle;
