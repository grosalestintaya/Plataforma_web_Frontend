import React, { useState, useEffect, useRef } from "react";
import Headerlp from "../components/headerlp.jsx";
import FooterLp from "../components/footerlp.jsx";
import HeroLp from "../components/herolp.jsx";

// ─── Sección "Cómo funciona" ───────────────────────────────────────────────
function ComoFunciona() {
  return (
    <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 py-10 gap-12">
      {/* Intro */}
      <div className="text-center max-w-xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-black mb-3"
          style={{ color: "#BB6C02" }}>
          ¿Cómo funciona?
        </h2>
        <p className="text-green-600  font-semibold text-sm sm:text-base opacity-90">
          Aprende finanzas completando misiones cortas. Gana XP, colecciona
          Intis y desbloquea insignias en el camino.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
        {[
          { n: "3", label: "Pasos por misión" },
          { n: "6+", label: "Tipos de insignias" },
          { n: "100%", label: "En la web" },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div
              className="text-4xl sm:text-5xl font-black"
              style={{ color: "#BB6C02" }}>
              {s.n}
            </div>
            <div className="text-green-600  font-bold text-sm mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Insignias */}
      <div className="max-w-2xl mx-auto w-full">
        <h3
          className=" font-black text-xl mb-5 text-center"
          style={{ color: "#BB6C02" }}>
          Insignias que puedes ganar
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              img: "/insignias/chinchaysuyo.png",
              name: "chinchaysuyo",
              desc: "Completa el modulo de chinchaysuyo perfectamente",
            },
            {
              img: "/insignias/contisuyo.png",
              name: "contisuyo",
              desc: "completa el modulo de contisuyo ",
            },
            {
              img: "/insignias/suyu.png",
              name: "suyu",
              desc: "completa el modulo de suyusuyo ",
            },
          ].map((b) => (
            <div
              key={b.name}
              className="rounded-xl p-4 flex gap-3 items-center"
              style={{ background: "rgba(255,255,255,0.18)" }}>
              <img
                src={b.img}
                alt={b.name}
                className="w-22 h-22 object-contain flex-shrink-0"
              />
              <div>
                <div className="text-green-600 text-xs opacity-80 mt-0.5">
                  {b.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intis */}
      <div
        className="max-w-2xl mx-auto w-full rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
        style={{ background: "rgba(255,255,255,0.18)" }}>
        <div className="text-6xl">
          <img src="src/assets/dashboard/coin.webp" alt="intis" />
        </div>
        <div
          className="flex-1 text-center sm:text-left"
          style={{ color: "#BB6C02" }}>
          <h3 className=" font-black text-xl mb-1">
            Intis — la moneda del juego
          </h3>
          <p className=" text-sm opacity-90 leading-relaxed">
            Cada actividad completada te da XP e Intis. Úsalos para desbloquear
            contenido, personalizar tu perfil y subir de nivel. Cuanto más
            aprendes, más acumulas.
          </p>
        </div>
        <div className="flex flex-col gap-3 flex-shrink-0">
          {[
            { accion: "Misión conceptual", xp: "+10 XP", intis: "+10🪙" },
            { accion: "Racha diaria", xp: "+20 XP", intis: "+15 🪙" },
            { accion: "Insignia nueva", xp: "+30 XP", intis: "+20 🪙" },
          ].map((r) => (
            <div key={r.accion} className="flex items-center gap-3">
              <span className="text-green-600 text-xs font-semibold opacity-80 w-32">
                {r.accion}
              </span>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: "#FFE600", color: "#333" }}>
                {r.xp}
              </span>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.3)",
                  color: "#BB6C02",
                }}>
                {r.intis}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [vista, setVista] = useState("hero"); // "hero" | "como"
  const mainRef = useRef(null);
  const dotsRef = useRef([]);

  // Partículas
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    const dots = [];
    for (let i = 0; i < 28; i++) {
      const el = document.createElement("div");
      const size = 4 + Math.random() * 8;
      el.style.cssText = `
        position:absolute;border-radius:50%;background:#00C853;
        width:${size}px;height:${size}px;
        top:${Math.random() * 100}%;left:${Math.random() * 100}%;
        opacity:${0.3 + Math.random() * 0.5};
        animation:lp-pulse ${1.5 + Math.random() * 2.5}s ease-in-out
        ${-(Math.random() * 3)}s infinite;
        pointer-events:none;
      `;
      container.appendChild(el);
      dots.push(el);
    }
    dotsRef.current = dots;
    return () => dots.forEach((d) => d.remove());
  }, []);

  const irAComoFunciona = () => {
    setVista("como");
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const iniciarSesion = () => {
    window.location.href = "/login";
  };
  const irAHero = () => setVista("hero");

  return (
    <>
      <style>{`
        @keyframes lp-pulse {
          0%,100% { transform:scale(1); opacity:0.35; }
          50% { transform:scale(1.8); opacity:0.85; }
        }
        .seccion-enter {
          animation: fadeSlide 0.45s ease both;
        }
        @keyframes fadeSlide {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div
        ref={mainRef}
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ background: "#FFF146" }}>
        <Headerlp
          title="Quipu Yachay"
          themeHex="#00C853"
          onComoFunciona={irAComoFunciona}
          onInicio={irAHero}
          onIniciarSesion={iniciarSesion}
        />

        <main className="flex-1 flex flex-col">
          <div key={vista} className="seccion-enter flex-1 flex flex-col">
            {vista === "hero" ? (
              <HeroLp onIniciarSesion={iniciarSesion} />
            ) : (
              <ComoFunciona />
            )}
          </div>
        </main>

        <FooterLp
          onComoFunciona={irAComoFunciona}
          onInicio={irAHero}
          onIniciarSesion={iniciarSesion}
        />
      </div>
    </>
  );
}
