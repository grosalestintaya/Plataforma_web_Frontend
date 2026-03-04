import React, { useMemo } from "react";
import SceneBackground from "@/components/backgrounds/SceneBackground";
import QuipuHeader from "../../components/headers/ActivityHeader";
import StartButton from "@/components/ui/StartButton";

import MascotTutorDemo from "@/components/mascot/MascotTutorDemo";
import { getMascotForModule } from "../../game/mascot/mascotCatalog";

export default function SceneIntro({ scene, game, locked }) {
  const d = scene?.data || {};
  const ui = scene?.ui || {};

  const themeHex = d.themeHex || ui.themeHex || "#7130F7";
  const backgroundHex = d.backgroundHex || ui.backgroundHex || "#0B1020";

  // viene en tu JSON: "moduleCode": "m01"
  const moduleCode = d.moduleCode || ui.moduleCode || "m01";

  const tips = Array.isArray(d.tips) ? d.tips.filter(Boolean) : [];

  // Mascota (data interna)
  const mascot = useMemo(() => {
    try {
      return getMascotForModule(moduleCode);
    } catch {
      return null;
    }
  }, [moduleCode]);

  // Texto de la mascota (puedes cambiarlo por lo que quieras o traerlo del JSON)
  const mascotText =
    d.mascotText || "Estoy aquí para guiarte. Respira, lee con calma y avanza.";

  return (
    <SceneBackground themeHex={themeHex} backgroundHex={backgroundHex}>
      <QuipuHeader title={d.title} onSettings={() => {}} />

      {/* Body */}
      <div className="px-3 md:px-6 pb-28 pt-4 md:pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
            {/* Izquierda: Panel principal */}
            <section
              className="col-span-12 md:col-span-8 lg:col-span-8 relative overflow-hidden rounded-2xl border border-white/12 bg-white/6 p-5 md:p-8"
              style={{
                boxShadow: `0 0 0 1px ${themeHex}22 inset, 0 18px 50px rgba(0,0,0,.35)`,
              }}>
              {/* Glow superior (game feel) */}
              <div
                className="absolute inset-x-0 -top-24 h-48 opacity-70 pointer-events-none"
                style={{
                  background: `radial-gradient(600px 220px at 50% 0%, ${themeHex}66 0%, transparent 65%)`,
                }}
              />

              {/* Body protagonista */}
              <div className="relative">
                <p className="text-white text-lg md:text-3xl font-extrabold tracking-tight leading-snug">
                  {d.body}
                </p>

                {/* Subtexto opcional (si quieres, si no, bórralo) */}
                <p className="mt-2 text-white/75 text-sm md:text-base leading-relaxed max-w-2xl">
                  Responde con calma. No hay penalidad por fallar.
                </p>
              </div>

              {/* Tips estilo “objetivos” */}
              {tips.length > 0 && (
                <div className="relative mt-5">
                  <div className="text-white/85 font-extrabold text-sm md:text-base tracking-wide">
                    OBJETIVOS
                  </div>

                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    {tips.slice(0, 6).map((t, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                        style={{ boxShadow: `0 0 0 1px ${themeHex}14 inset` }}>
                        <div
                          className="mt-1 w-6 h-6 rounded-xl grid place-items-center shrink-0"
                          style={{
                            background: `linear-gradient(180deg, ${themeHex}55 0%, ${themeHex}22 100%)`,
                            boxShadow: `0 0 0 1px ${themeHex}33 inset`,
                          }}>
                          <span className="text-white text-sm font-black">
                            ✓
                          </span>
                        </div>

                        <p className="text-white/85 text-sm md:text-base leading-snug line-clamp-2">
                          {t}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint final */}
              <p className="relative mt-5 text-white/70 text-sm md:text-base">
                Cuando estés listo, presiona{" "}
                <span className="text-white font-extrabold">Empezar</span>.
              </p>
            </section>

            {/* Derecha: Mascota */}
            <aside className="col-span-12 md:col-span-4 lg:col-span-4">
              {mascot ? (
                <MascotTutorDemo
                  gifSrc={mascot.gif}
                  name={mascot.name}
                  themeHex={themeHex}
                  text={mascotText}
                />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                  (sin mascota)
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Start fijo abajo-derecha */}
      <div className="fixed right-0 bottom-3 md:bottom-6 z-50">
        <StartButton
          disabled={locked}
          onClick={() => game.next()}
          src="/assets/start.png"
          w={320}
          h={200}
          ariaLabel="Empezar"
        />
      </div>
    </SceneBackground>
  );
}
