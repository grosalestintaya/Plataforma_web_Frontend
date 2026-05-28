import React, { useState, useEffect, useRef } from "react";
import Headerlp from "../components/headerlp.jsx";
import FooterLp from "../components/footerlp.jsx";
import HeroLp from "../components/herolp.jsx";

// ─── Sección "Cómo funciona" ───────────────────────────────────────────────
function PorQueEducacionFinanciera() {
  return (
    <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 py-10 gap-12">
      {/* Gancho */}
      <div className="max-w-xl">
        <h2
          className="text-3xl sm:text-4xl font-black mb-3 leading-tight"
          style={{ color: "#FFC400" }}>
          ¿Y si nadie te
          <br />
          enseñó sobre dinero?
        </h2>
        <p
          style={{ color: "#ffff" }}
          className="text-sm sm:text-base font-semibold opacity-75 leading-relaxed">
          Estás estudiando para el futuro. El dinero también es parte de él.{" "}
          <br />
          Aprenderlo hoy es la decisión más inteligente que puedes tomar.
        </p>
      </div>

      <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Stats */}
      <div>
        <p
          className="text-xs font-black tracking-widest uppercase mb-5"
          style={{ color: "#FFC400" }}>
          La realidad en números
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              n: "43%",
              desc: "de adultos peruanos no tiene cuenta en el sistema financiero",
              src: "INEI / SBS 2023",
            },
            {
              n: "46.1",
              desc: "puntaje de inclusión financiera del Perú — por debajo del promedio regional",
              src: "Credicorp 2024",
            },
            {
              n: "87%",
              desc: "de iniciativas de educación financiera dirigidas solo a adultos, no a jóvenes",
              src: "SBS 2024",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl p-4 flex flex-col gap-1"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,196,0,0.25)",
              }}>
              <div
                className="text-4xl font-black leading-none"
                style={{ color: "#FFC400" }}>
                {s.n}
              </div>
              <div
                style={{ color: "#fffffe" }}
                className="text-xs opacity-75 leading-relaxed">
                {s.desc}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "#FF4081", opacity: 0.7 }}>
                {s.src}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Razones */}
      <div>
        <p
          className="text-xs center font-black tracking-widest uppercase mb-5"
          style={{ color: "#FFC400" }}>
          ¿Por qué aprender ahora?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "💸",
              title: "Evitas deudas que te atrapan",
              body: "Sin conocer tasas de interés, plazos ni condiciones, una deuda pequeña puede convertirse en un problema grande.",
            },
            {
              icon: "🏦",
              title: "Tomas decisiones reales",
              body: "Ahorrar, invertir, emprender — todo depende de saber manejar tu dinero. No es para ricos. Es para cualquiera.",
            },
            {
              icon: "📈",
              title: "Rompes el ciclo",
              body: "El nivel educativo es el factor más determinante en la inclusión financiera. Lo que aprendes hoy cambia lo que construyes mañana.",
            },
          ].map((r) => (
            <div
              key={r.title}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: "rgba(255,64,129,0.08)",
                border: "1px solid rgba(255,64,129,0.25)",
              }}>
              <div className="text-3xl">{r.icon}</div>
              <div className="font-black text-sm" style={{ color: "#FF4081" }}>
                {r.title}
              </div>
              <div
                style={{ color: "#fffffe" }}
                className="text-xs opacity-80 leading-relaxed">
                {r.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Mitos vs Realidad */}
      <div>
        <p
          className="text-xs font-black tracking-widest uppercase mb-5"
          style={{ color: "#FFC400" }}>
          Mitos que frenan a muchos
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              mito: '"Las finanzas son para gente con dinero"',
              realidad:
                "Saber manejar lo poco que tienes es exactamente de lo que trata la educación financiera.",
            },
            {
              mito: '"Eso se aprende con la experiencia"',
              realidad:
                "Aprender con errores financieros reales sale muy caro. Mejor aprenderlo antes de cometerlos.",
            },
            {
              mito: '"Con lo que gano no vale la pena"',
              realidad:
                "El hábito del ahorro y la planificación funcionan sin importar el monto. Empezar pequeño es empezar.",
            },
          ].map((m) => (
            <div key={m.mito} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="rounded-xl p-4 text-xs leading-relaxed"
                style={{
                  background: "rgba(255,64,129,0.1)",
                  border: "1px solid rgba(255,64,129,0.3)",
                  color: "#fffffe",
                }}>
                <span
                  className="block text-xs font-black tracking-widest uppercase mb-1"
                  style={{ color: "#FF4081" }}>
                  ✕ Mito
                </span>
                {m.mito}
              </div>
              <div
                className="rounded-xl p-4 text-xs leading-relaxed"
                style={{
                  background: "rgba(255,196,0,0.1)",
                  border: "1px solid rgba(255,196,0,0.35)",
                  color: "#fffffe",
                }}>
                <span
                  className="block text-xs font-black tracking-widest uppercase mb-1"
                  style={{ color: "#FFC400" }}>
                  ✓ Realidad
                </span>
                {m.realidad}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function ComoFunciona() {
  return (
    <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 py-10 gap-12">
      {/* Intro */}
      <div className="text-center max-w-xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-black mb-3"
          style={{ color: "#FFC400" }}>
          ¿Cómo funciona?
        </h2>
        <p
          style={{ color: "#fffffe" }}
          className="font-semibold text-sm sm:text-base opacity-85">
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
              style={{ color: "#FFC400" }}>
              {s.n}
            </div>
            <div
              style={{ color: "#fffffe" }}
              className="font-bold text-sm mt-1 opacity-80">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Insignias */}
      <div className="max-w-2xl mx-auto w-full">
        <h3
          className="font-black text-xl mb-5 text-center"
          style={{ color: "#FFC400" }}>
          Insignias que puedes ganar
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              img: "/insignias/chinchaysuyo.webp",
              name: "chinchaysuyo",
              desc: "Completa el modulo de chinchaysuyo perfectamente",
            },
            {
              img: "/insignias/contisuyo.webp",
              name: "contisuyo",
              desc: "Completa el modulo de contisuyo",
            },
            {
              img: "/insignias/suyu.webp",
              name: "suyu",
              desc: "Completa el modulo de suyusuyo",
            },
          ].map((b) => (
            <div
              key={b.name}
              className="rounded-xl p-4 flex gap-3 items-center"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,64,129,0.3)",
              }}>
              <img
                src={b.img}
                alt={b.name}
                className="w-12 h-12 object-contain flex-shrink-0"
              />
              <div>
                <div
                  style={{ color: "#fffffe" }}
                  className="text-xs opacity-75 mt-0.5">
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
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,196,0,0.3)",
        }}>
        <div className="text-6xl">
          <img src="src/assets/dashboard/coin.webp" alt="intis" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-black text-xl mb-1" style={{ color: "#FFC400" }}>
            Intis — la moneda del juego
          </h3>
          <p
            style={{ color: "#fffffe" }}
            className="text-sm opacity-80 leading-relaxed">
            Cada actividad completada te da XP e Intis. Úsalos para desbloquear
            contenido, personalizar tu perfil y subir de nivel. Cuanto más
            aprendes, más acumulas.
          </p>
        </div>
        <div className="flex flex-col gap-3 flex-shrink-0">
          {[
            { accion: "Misión conceptual", xp: "+10 XP", intis: "+10🪙" },
            { accion: "Misión procedimental", xp: "+20 XP", intis: "+15 🪙" },
            { accion: "Misión actitudinal", xp: "+15 XP", intis: "+20 🪙" },
          ].map((r) => (
            <div key={r.accion} className="flex items-center gap-3">
              <span
                style={{ color: "#fffffe" }}
                className="text-xs font-semibold opacity-75 w-32">
                {r.accion}
              </span>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: "#FFC400", color: "#1a1a2e" }}>
                {r.xp}
              </span>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,64,129,0.15)",
                  color: "#FF4081",
                  border: "1px solid #FF4081",
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
        position:absolute;border-radius:50%;background:#ffffff;
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
  const irAYsi = () => {
    setVista("ysi");
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
        style={{ background: "#00C853" }}>
        <Headerlp
          title="Quipu Yachay"
          themeHex="#00C853"
          onComoFunciona={irAComoFunciona}
          onInicio={irAHero}
          onIniciarSesion={iniciarSesion}
          OnYsi={irAYsi}
        />

        <main className="flex-1 flex flex-col">
          <div key={vista} className="seccion-enter flex-1 flex flex-col">
            {vista === "hero" ? (
              <HeroLp onIniciarSesion={iniciarSesion} />
            ) : vista === "como" ? (
              <ComoFunciona />
            ) : vista === "ysi" ? (
              <PorQueEducacionFinanciera />
            ) : null}
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
