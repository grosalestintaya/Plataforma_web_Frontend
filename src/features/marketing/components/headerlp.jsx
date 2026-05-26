import React from "react";
import HeaderRopeSvg from "@/features/module/components/HeaderRopeSvg.jsx";
import logo from "/logo_full.webp";
export default function Headerlp({
  title,
  themeHex = "#fffff",
  onBack,
  onIniciarSesion,
  onComoFunciona,
  onInicio,
}) {
  return (
    <header className="relative w-full overflow-hidden">
      <div className="relative px-4 sm:px-6 lg:px-8 justify-between">
        <div className="flex justify-between h-[60px] gap-0">
          <div className="flex items-center flex-shrink-0">
            <img src={logo} alt="Logo" className="h-full pt-3 " />
          </div>

          {/* Nav central */}

          {/* CTA */}
          <div className="flex items-center flex-shrink-0 ml-auto sm:ml-0 px-3.5">
            <nav className="hidden sm:flex items-center gap-10 mx-auto pr-15">
              <a
                onClick={onComoFunciona}
                className="text-lg font-bold transition-opacity hover:opacity-70"
                style={{
                  color: "#ffff",
                  fontFamily: "'Nunito', sans-serif",
                }}>
                ¿Cómo funciona?
              </a>
              <a
                onClick={onInicio}
                className="text-lg font-bold transition-opacity hover:opacity-70"
                style={{
                  color: "#ffff",
                  fontFamily: "'Nunito', sans-serif",
                }}>
                Ver introducción
              </a>
            </nav>
            <button
              onClick={onIniciarSesion}
              className=" text-xs sm:text-sm font-bold px-5 sm:px-7 py-2 sm:py-2.5 rounded-md border-2 border-white transition-colors pt-1.5"
              style={{ background: "#FFFFFF", color: "#00C853" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FFE600";
                e.currentTarget.style.borderColor = "#FFE600";
                e.currentTarget.style.color = "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.borderColor = "#FFFFFF";
                e.currentTarget.style.color = "#00C853";
              }}>
              Iniciar sesión
            </button>
          </div>
        </div>

        <div className="-mx-4 -mt-2  sm:-mx-6 lg:-mx-8 overflow-hidden">
          <HeaderRopeSvg
            themeHex={themeHex}
            className="block w-full select-none h-[30px] sm:h-[54px] md:h-[78px] lg:h-[90px]"
          />
        </div>
      </div>
    </header>
  );
}
