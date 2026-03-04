import React from "react";
import QuipuHeader from "../../components/headers/ActivityHeader";
import SceneBackground from "@/components/backgrounds/SceneBackground";
import NextButton from "@/components/ui/NextButton";

export default function SceneConcept({ scene, game, locked }) {
  const d = scene?.data || {};
  const ui = scene?.ui || {};

  const backgroundHex = ui.backgroundHex || d.backgroundHex || "#0B1020";
  const themeHex = ui.themeHex || d.themeHex || backgroundHex;

  const paragraphs = Array.isArray(d.explanation)
    ? d.explanation
    : String(d.explanation || "")
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

  return (
    <SceneBackground themeHex={themeHex} backgroundHex={backgroundHex}>
      {/* Header */}
      <QuipuHeader
        title={d.title || game.activityDef?.title}
        //subtitle={d.subtitle}
        onSettings={() => {}}
        //falta la
      />

      {/* Body (sin scroll, prioridad al texto) */}
      <div className="flex-1 min-h-0 px-3 md:px-6 pb-28 pt-4 md:pt-6">
        <div className="max-w-6xl mx-auto h-full">
          <section className="h-full grid md:grid-cols-[1.35fr_0.85fr] gap-4 md:gap-6">
            {/* Texto (PRIORIDAD) */}
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4 md:p-6 flex flex-col">
              <h2 className="text-white text-xl md:text-3xl font-extrabold tracking-tight">
                {d.subtitle}
              </h2>

              {/* Texto principal más “rico” */}
              <div className="mt-3 text-white/90 text-sm md:text-base leading-relaxed font-medium space-y-3">
                {paragraphs.length ? (
                  <>
                    {/* Primer párrafo más visible */}
                    <p className="line-clamp-4 md:line-clamp-5">
                      {paragraphs[0]}
                    </p>

                    {/* Resto como bullets compactos */}
                    {paragraphs.slice(1, 5).length > 0 && (
                      <div className="space-y-2">
                        {paragraphs.slice(1, 5).map((p, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="mt-2 w-2 h-2 rounded-full bg-white/70 shrink-0" />
                            <p className="line-clamp-2 text-white/85">{p}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="opacity-70">Sin contenido.</p>
                )}
              </div>

              {/* Caption opcional al final */}
              {d.mediaCaption && (
                <p className="mt-auto pt-4 text-white/70 text-xs md:text-sm line-clamp-2">
                  {d.mediaCaption}
                </p>
              )}
            </div>

            {/* Imagen (secundaria pero presente) */}
            <div className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden h-full">
              {d.media?.src ? (
                <img
                  src={d.media.src}
                  alt={d.media.alt || "Referencia"}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-white/50">
                  (sin imagen)
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Next fijo abajo-derecha */}
      <div className="fixed right-0 bottom-3 md:right-0 md:bottom-6 z-50">
        <NextButton
          disabled={locked}
          onClick={() => game.next()}
          src="/assets/next.png"
          w={100}
          h={50}
        />
      </div>
    </SceneBackground>
  );
}
