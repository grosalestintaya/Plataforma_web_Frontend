import React from "react";
import { resolveInsignia } from "../helpers/helpers";

export default function InsigniasGrid({ loading, insignias, count }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-border bg-secondary/50"
          />
        ))}
      </div>
    );
  }

  if (!insignias || insignias.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
        Aún no tienes insignias.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Colección
        </div>
        <div className="text-xs font-bold text-foreground">
          {typeof count === "number" ? `${count} total` : ""}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {insignias.slice(0, 9).map((ui) => {
          const b = ui.insignia;
          const imgSrc = resolveInsignia(b?.pinnedImg);
          const title = `${b?.name ?? "Insignia"} • Valor ${b?.value ?? 0}\n${b?.description ?? ""}`;

          return (
            <div
              key={ui.userInsigniaId}
              title={title}
              className="group relative flex flex-col items-center justify-center rounded-xl border border-border bg-gradient-to-br from-secondary to-secondary/50 p-3 shadow-sm transition-transform hover:scale-[1.02]"
            >
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/60 ring-1 ring-border">
                <img
                  src={imgSrc}
                  alt={b?.name ?? "Insignia"}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = resolveInsignia("default.png");
                    // ERROR bucle
                    console.log("insgnia ");
                  }}
                />
              </div>

              <div className="mt-2 w-full truncate text-center text-[11px] font-extrabold text-foreground">
                {b?.name ?? "Insignia"}
              </div>

              <div className="mt-1 text-[10px] font-semibold text-muted-foreground">
                +{b?.value ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Pasa el mouse por una insignia para ver su descripción.
      </p>
    </div>
  );
}
