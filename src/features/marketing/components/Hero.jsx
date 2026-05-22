import { Link } from "react-router-dom";
import hero from "@/assets/marketing/hero.webp"; // tu imagen hero

export default function Hero({ onIniciarSesion }) {
  return (
    <section className="relative overflow-hidden bg-slate-50">
      {/* IMAGEN PEGADA AL BORDE DERECHO (viewport) */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-full w-full md:w-[55%]"
        style={{
          backgroundImage: `url(${hero})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          backgroundSize: "contain",
        }}
      />

      {/* Overlay suave para que el texto no “choque” si la imagen invade */}
      <div
        aria-hidden="true"
        className="absolute inset-0 md:bg-gradient-to-r md:from-slate-50 md:via-slate-50/95 md:to-transparent"
      />

      {/* CONTENIDO ALINEADO A TU GRID */}
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* IZQUIERDA: TEXTO */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-[#00C853]" />
              Plataforma educativa para estudiantes
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Quipu Yachay
            </h1>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              Tejiendo saberes, ordenando tu futuro.
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700">
              Aprende finanzas personales paso a paso con misiones cortas, retos
              simples y recompensas. Aquí no memorizas: practicas, decides y
              avanzas.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onIniciarSesion}
                className="rounded-2xl bg-[#00C853] px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95">
                Inciar sesión
              </button>

              <Link
                to="/i"
                className="rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100">
                Introducción
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Chip className="bg-[#2962FF]/10 text-[#2962FF]">Misiones</Chip>
              <Chip className="bg-[#7C4DFF]/10 text-[#7C4DFF]">Insignias</Chip>
              <Chip className="bg-[#FF4081]/10 text-[#FF4081]">Ranking</Chip>
              <Chip className="bg-[#FFC400]/20 text-slate-900">Progreso</Chip>
            </div>
          </div>

          {/* DERECHA: ESPACIO PARA RESPIRAR (en desktop la imagen ya está absoluta) */}
          <div className="hidden md:block" />
        </div>
      </div>
    </section>
  );
}

function Chip({ className, children }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ring-slate-200 ${className}`}>
      {children}
    </span>
  );
}
