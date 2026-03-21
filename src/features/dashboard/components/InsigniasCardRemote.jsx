import React, { useEffect, useMemo, useState } from "react";
import { Lock, X } from "lucide-react";

const API = "http://localhost:5000/api/me/insignias";
const INSIGNIA_BASE_URL = "/insignias";

const MODULE_SLOTS = [
  { baseName: "Suyu", img: "suyu.png", imgPerfect: "suyu_perfecto.png" },
  {
    baseName: "Antisuyo",
    img: "antisuyo.png",
    imgPerfect: "antisuyo_perfecto.png",
  },
  {
    baseName: "Collasuyo",
    img: "collasuyo.png",
    imgPerfect: "collasuyo_perfecto.png",
  },
  {
    baseName: "Contisuyo",
    img: "contisuyo.png",
    imgPerfect: "contisuyo_perfecto.png",
  },
  {
    baseName: "Chinchaysuyo",
    img: "chinchaysuyo.png",
    imgPerfect: "chinchaysuyo_perfecto.png",
  },
  { baseName: "Centro", img: "centro.png", imgPerfect: "centro_perfecto.png" },
];

const resolveImg = (f) => `${INSIGNIA_BASE_URL}/${f}`;
const normalize = (n) => String(n || "").trim();
const isPerfect = (n) => /\s+Perfecto$/i.test(normalize(n));
const baseName = (n) =>
  normalize(n)
    .replace(/\s+Perfecto$/i, "")
    .trim();

export default function InsigniasCard() {
  const token = localStorage.getItem("token");

  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchInsignias = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setRaw(Array.isArray(json?.insignias) ? json.insignias : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsignias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownedMap = useMemo(() => {
    const map = new Map();
    raw.forEach((row) => {
      const name = normalize(row?.insignia?.name);
      if (!name) return;
      const base = baseName(name);
      const entry = map.get(base) || {};
      isPerfect(name) ? (entry.perfect = true) : (entry.normal = true);
      map.set(base, entry);
    });
    return map;
  }, [raw]);

  // Modal: hasta 12 insignias ganadas (endpoint ya limita, igual recortamos)
  const modalItems = useMemo(() => {
    const items = (Array.isArray(raw) ? raw : []).slice(0, 12).map((row) => {
      const ins = row?.insignia ?? {};
      return {
        key: row?.userInsigniaId ?? `${ins?.id}-${row?.awardedAt}`,
        name: ins?.name ?? "Insignia",
        description: ins?.description ?? "",
        value: ins?.value ?? 0,
        img: resolveImg(ins?.pinnedImg || "placeholder.png"),
        awardedAt: row?.awardedAt,
      };
    });

    // opcional: ordenar por fecha desc si el backend no lo hace
    items.sort(
      (a, b) =>
        new Date(b.awardedAt || 0).getTime() -
        new Date(a.awardedAt || 0).getTime(),
    );
    return items;
  }, [raw]);

  // Cerrar modal con ESC
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        className="w-[160px] rounded-2xl backdrop-blur border p-2 shadow-sm"
        style={{
          background: "color-mix(in srgb, var(--accent) 80%, transparent)",
          borderColor: "var(--usercard-border)",
        }}>
        <h3
          className="text-[16px] font-extrabold text-center mb-2"
          style={{ color: "var(--background)" }}>
          Insignias
        </h3>

        {/* Ruta vertical */}
        <div className="flex flex-col items-center gap-1">
          {MODULE_SLOTS.map((slot, idx) => {
            const owned = ownedMap.get(slot.baseName);
            const unlocked = owned?.normal || owned?.perfect;
            const perfect = owned?.perfect;
            const img = perfect ? slot.imgPerfect : slot.img;

            const tooltip = unlocked
              ? perfect
                ? `${slot.baseName} Perfecto`
                : slot.baseName
              : `${slot.baseName} (bloqueado)`;

            return (
              <div
                key={slot.baseName}
                className="group relative flex flex-col items-center">
                {idx !== 0 && <div className="h-3 w-px bg-white" />}

                <div
                  className="relative h-12 w-12 rounded-full flex items-center justify-center transition"
                  style={{
                    background: unlocked ? "#fff" : "rgba(0,0,0,0.08)",
                    boxShadow: perfect
                      ? `0 0 14px var(--accent)`
                      : unlocked
                        ? "0 6px 12px rgba(0,0,0,0.12)"
                        : "none",
                  }}>
                  <img
                    src={resolveImg(img)}
                    alt={slot.baseName}
                    draggable={false}
                    className={`h-9 w-9 object-contain ${unlocked ? "" : "grayscale opacity-30"}`}
                  />

                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-black/50" />
                    </div>
                  )}
                </div>

                {idx !== MODULE_SLOTS.length - 1 && (
                  <div className="h-3 w-px bg-white/80" />
                )}

                {/* Tooltip a la izquierda */}
                <div className="pointer-events-none absolute right-full top-1/2 hidden -translate-y-1/2 group-hover:block">
                  <div className="mr-2 rounded-lg bg-black px-2 py-1 text-[10px] font-semibold text-white shadow whitespace-nowrap">
                    {tooltip}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-xl border text-[11px] font-semibold py-1.5 hover:bg-black/5 transition"
          style={{
            borderColor: "var(--usercard-border)",
            background: "var(--usercard-accent)",
            color: "var(--chip-bg)",
          }}>
          Ver todas
        </button>
      </div>

      {/* MODAL */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6"
          onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden"
            style={{
              background: "color-mix(in srgb, var(--app-bg) 85%, white)",
              borderColor: "var(--usercard-border)",
            }}
            onClick={(e) => e.stopPropagation()}>
            {/* Header modal */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
              }}>
              <div>
                <div
                  className="text-lg font-extrabold"
                  style={{ color: "var(--dash-title-text)" }}>
                  Tus insignias
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(100,116,139,0.95)" }}>
                  {loading
                    ? "Cargando..."
                    : `${modalItems.length} / 12 desbloqueadas`}
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-black/5 transition"
                style={{
                  borderColor: "var(--usercard-border)",
                  color: "var(--dash-title-text)",
                  background:
                    "color-mix(in srgb, var(--accent) 10%, transparent)",
                }}
                title="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {modalItems.length === 0 ? (
                <div
                  className="rounded-2xl border p-4 text-sm"
                  style={{
                    borderColor: "var(--usercard-border)",
                    background:
                      "color-mix(in srgb, var(--accent) 8%, transparent)",
                    color: "var(--dash-title-text)",
                  }}>
                  Aún no tienes insignias desbloqueadas.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {modalItems.map((it) => (
                    <div
                      key={it.key}
                      className="group rounded-2xl border p-3 flex flex-col items-center gap-2 transition hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        borderColor: "var(--usercard-border)",
                        background:
                          "color-mix(in srgb, var(--accent) 6%, white)",
                      }}
                      title={it.description || it.name}>
                      <div
                        className="h-16 w-16 rounded-2xl border flex items-center justify-center"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                          background: "#fff",
                        }}>
                        <img
                          src={it.img}
                          alt={it.name}
                          className="h-14 w-14 object-contain p-2"
                          draggable={false}
                        />
                      </div>

                      <div
                        className="text-xs font-extrabold text-center line-clamp-2"
                        style={{ color: "var(--dash-title-text)" }}>
                        {it.name}
                      </div>

                      {/* mini detalle (solo hover) */}
                      <div
                        className="hidden group-hover:block text-[11px] text-center leading-snug"
                        style={{ color: "rgba(100,116,139,0.95)" }}>
                        {it.description ? it.description : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex justify-end px-5 py-4 border-t"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
              }}>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-extrabold transition"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}>
                Listo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
