import React from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero.jsx";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Background playful blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#7C4DFF]/15 blur-2xl" />
        <div className="absolute top-28 -right-24 h-80 w-80 rounded-full bg-[#2962FF]/12 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#00C853]/10 blur-2xl" />
        <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-[#FFC400]/18 blur-2xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur bg-yellow-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 ">
          <div className="flex items-center gap-3 ">
            <img src="/logo_full.webp" alt="Quipu Yachay" className="h-12 " />
            <div className="  leading-tight ">
              <div className="pl-10 text-xl text-slate-600 text-yellow-700 ">
                Tejiendo saberes, ordenando tu futuro.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ">
            <a
              href="#como-funciona"
              className="pr-10 px hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-flex">
              ¿Cómo funciona?
            </a>
            <Link
              to="/login"
              className="rounded-xl bg-[#2962FF] px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-95">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <Hero />

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* HERO NUEVO (con /public/hero/hero.webp) */}

        {/* What you do here */}
        <section id="que-haras-aqui" className="mt-10">
          <h2 className="text-xl font-extrabold tracking-tight">
            ¿Qué harás aquí?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
            Quipu Yachay te guía paso a paso: aprendes el concepto, lo practicas
            y luego tomas decisiones más inteligentes en situaciones reales.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <BigCard
              title="Aprender"
              desc="Entiendes ideas clave con ejemplos simples."
              accent="from-[#2962FF]/15 to-transparent"
              dot="#2962FF"
              items={["Ingresos vs gastos", "Ahorro", "Metas"]}
            />
            <BigCard
              title="Practicar"
              desc="Resuelves retos rápidos y recibes feedback."
              accent="from-[#00C853]/15 to-transparent"
              dot="#00C853"
              items={["Presupuesto", "Decisiones", "Prioridades"]}
            />
            <BigCard
              title="Ganar"
              desc="Subes progreso y desbloqueas insignias."
              accent="from-[#7C4DFF]/15 to-transparent"
              dot="#7C4DFF"
              items={["Insignias", "Ranking", "Logros"]}
            />
          </div>
        </section>
        {/* Rewards */}
        <section className="mt-10" id="recompensas">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Recompensas y progreso
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
                Cada misión te da puntos. Con puntos subes de nivel, desbloqueas
                insignias y mejoras tu progreso.
              </p>
            </div>

            <Link
              to="/login"
              className="mt-3 inline-flex w-fit rounded-2xl bg-[#00C853] px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:opacity-95 md:mt-0">
              Entrar y ver mis recompensas
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <RewardCard
              title="Insignias"
              desc="Logros por completar misiones."
              tag="Colección"
              color="bg-[#7C4DFF]"
            />
            <RewardCard
              title="Racha"
              desc="Días seguidos aprendiendo."
              tag="Constancia"
              color="bg-[#FF4081]"
            />
            <RewardCard
              title="Nivel"
              desc="Subes con tus puntos."
              tag="Progreso"
              color="bg-[#2962FF]"
            />
            <RewardCard
              title="Ranking"
              desc="Tu avance comparado con tu salón."
              tag="Motivación"
              color="bg-[#FFC400]"
              darkText
            />
          </div>

          {/* Simple badge row (visual) */}
          <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">
                Ejemplos de insignias
              </div>
              <div className="text-xs font-semibold text-slate-600">
                Se desbloquean por desempeño
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <BadgePill
                label="Ahorrista"
                bg="bg-[#00C853]/10"
                text="text-[#00C853]"
              />
              <BadgePill
                label="Planificador"
                bg="bg-[#2962FF]/10"
                text="text-[#2962FF]"
              />
              <BadgePill
                label="Decisor"
                bg="bg-[#FFC400]/30"
                text="text-slate-900"
              />
              <BadgePill
                label="Constante"
                bg="bg-[#FF4081]/10"
                text="text-[#FF4081]"
              />
              <BadgePill
                label="Avanzado"
                bg="bg-[#7C4DFF]/10"
                text="text-[#7C4DFF]"
              />
              <BadgePill
                label="Finalista"
                bg="bg-[#FF890A]/15"
                text="text-[#FF890A]"
              />
            </div>
          </div>
        </section>

        {/* How it works timeline */}
        <section id="como-funciona" className="mt-10">
          <h2 className="text-xl font-extrabold tracking-tight">
            ¿Cómo funciona una misión?
          </h2>

          <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-4 md:grid-cols-4">
              <Step
                n="1"
                title="Historia"
                desc="Te presentan un caso corto."
                color="bg-[#FFC400]"
              />
              <Step
                n="2"
                title="Actividad"
                desc="Respondes, eliges o completas."
                color="bg-[#2962FF]"
              />
              <Step
                n="3"
                title="Feedback"
                desc="Te explican el porqué."
                color="bg-[#00C853]"
              />
              <Step
                n="4"
                title="Recompensa"
                desc="Ganas puntos e insignias."
                color="bg-[#7C4DFF]"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-800">
                Todo en pantallas cortas para avanzar rápido.
              </div>
              <Link
                to="/login"
                className="rounded-2xl bg-[#2962FF] px-5 py-3 text-sm font-extrabold text-white hover:opacity-95">
                Entrar y comenzar
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Improved footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/logo_full.webp"
                  alt="Quipu Yachay"
                  className="h-11"
                />
                <div>
                  <div className="text-xs text-slate-600">
                    Tejiendo saberes, ordenando tu futuro.
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Plataforma gamificada de educación financiera para estudiantes.
                Aprendes con misiones, practicas con retos y avanzas con
                recompensas.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-[#00C853]" />
                  Para colegios
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-[#2962FF]" />
                  En la web
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-[#FFC400]" />
                  Misiones cortas
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="md:pl-6">
              <div className="text-sm font-extrabold">Accesos</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    className="font-semibold text-slate-700 hover:text-slate-900"
                    to="/login">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link
                    className="font-semibold text-slate-700 hover:text-slate-900"
                    to="/i">
                    Introducción
                  </Link>
                </li>
                <li>
                  <a
                    className="font-semibold text-slate-700 hover:text-slate-900"
                    href="#como-funciona">
                    ¿Cómo funciona una misión?
                  </a>
                </li>
              </ul>

              <div className="mt-6 text-sm font-extrabold">Ayuda</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <span className="text-slate-700">
                    Preguntas frecuentes (próximamente)
                  </span>
                </li>
                <li>
                  <span className="text-slate-700">Soporte del colegio</span>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div className="md:pl-6">
              <div className="text-sm font-extrabold">Información</div>
              <div className="mt-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-800">
                  Consejo rápido
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  No necesitas “ser bueno en mate” para aprender finanzas. Solo
                  constancia: misiones cortas, todos los días.
                </p>
              </div>

              <div className="mt-4 text-xs text-slate-600">
                Al usar la plataforma, se aplican las normas de tu institución
                educativa y las políticas internas del sistema.
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <div className="text-xs text-slate-600">
              © {new Date().getFullYear()} Quipu Yachay
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00C853]" />
              <span className="h-2 w-2 rounded-full bg-[#2962FF]" />
              <span className="h-2 w-2 rounded-full bg-[#FFC400]" />
              <span className="h-2 w-2 rounded-full bg-[#FF4081]" />
              <span className="h-2 w-2 rounded-full bg-[#7C4DFF]" />
              <span className="h-2 w-2 rounded-full bg-[#FF890A]" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BigCard({ title, desc, accent, dot, items }) {
  return (
    <div
      className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 bg-gradient-to-br ${accent}`}>
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: dot }}
        />
        <div className="text-lg font-extrabold">{title}</div>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-700">{desc}</div>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ n, title, desc, color }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-9 w-9 place-items-center rounded-2xl text-sm font-extrabold text-white ${color}`}>
          {n}
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="text-sm text-slate-700">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function RewardCard({ title, desc, tag, color, darkText }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-extrabold text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-700">
            {desc}
          </div>
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-2xl ${color} ${darkText ? "text-slate-900" : "text-white"} font-extrabold`}>
          ★
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        {tag}
      </div>
    </div>
  );
}

function BadgePill({ label, bg, text }) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-extrabold ring-1 ring-slate-200 ${bg} ${text}`}>
      {label}
    </span>
  );
}

function RuleCard({ n, title, desc, color, darkText }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start gap-4">
        <div
          className={`grid h-10 w-10 place-items-center rounded-2xl ${color} ${darkText ? "text-slate-900" : "text-white"} text-sm font-extrabold`}>
          {n}
        </div>
        <div>
          <div className="text-base font-extrabold text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-700">
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}
