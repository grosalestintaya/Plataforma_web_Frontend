import React from "react";
import imageSrc from "/hero.png";
export default function HeroLp({ onIniciarSesion }) {
  return (
    <section
      className="relative w-full flex-1 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 px-6 sm:px-12 lg:px-16 pb-10 sm:pb-0"
      style={{ background: "#FFF146", minHeight: "100%" }}>
      {/* Blob amarillo decorativo */}
      <div
        className="absolute bottom-0 right-0 w-62 h-48 sm:w-88 sm:h-80 pointer-events-none"
        style={{
          background: "#FFE31B",
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          transform: "translate(20%, 40%)",
        }}
      />{" "}
      <div
        className="absolute bottom-0 right-70 w-32 h-28 sm:w-48 sm:h-40 pointer-events-none"
        style={{
          background: "#FFE31B",
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          transform: "translate(20%, 40%)",
        }}
      />
      {/* Contenido izquierdo */}
      <div className="relative flex flex-col w-full  pb-0 pl-9">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black m-0"
          style={{ color: "#BB6C02" }}>
          Tu aventura financiera comienza aquí
        </h1>{" "}
        <br />
        <span
          className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-black leading-tight"
          style={{ color: "#7C4DFF" }}>
          • Aprende a tomar mejores decisiones
        </span>
        <span
          className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-black leading-tight"
          style={{ color: "#E91E8C" }}>
          • Juega y completas desafíos
        </span>
        <span
          className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-black leading-tight mb-4 sm:mb-5"
          style={{ color: "#00C853" }}>
          • Avanza hacia tus metas
        </span>
        <br />
        <p
          className="text-sm sm:text-xl md:text-base font-bold leading-relaxed mb-6 sm:mb-7 "
          style={{ color: "#BB6C02" }}>
          Aprende finanzas personales paso a paso mediante misiones dinámicas,
          retos prácticos y recompensas por tu progreso.
          <br />
          Aquí no solo aprendes teoría: tomas decisiones, practicas situaciones
          reales y avanzas mientras desarrollas mejores hábitos financiero
        </p>{" "}
        <button
          onClick={onIniciarSesion}
          className="self-start text-xs sm:text-sm font-bold px-5 sm:px-7 py-2 sm:py-2.5 rounded-md border-2 border-white transition-colors"
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
      {/* Imagen sin fondo - derecha */}
      <div className="relative flex-shrink-0 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-160 lg:h-160 pb-2.5">
        <img
          src={imageSrc}
          alt="Ilustración hero"
          className="w-full h-full object-contain"
        />
      </div>
    </section>
  );
}
