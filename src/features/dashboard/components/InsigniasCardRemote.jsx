import React, { useEffect, useMemo, useState } from "react";
import { Lock, X } from "lucide-react";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/me/insignias`;
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

const resolveImg = (file) => `${INSIGNIA_BASE_URL}/${file}`;
const normalize = (name) => String(name || "").trim();
const isPerfect = (name) => /\s+Perfecto$/i.test(normalize(name));
const getBaseName = (name) =>
  normalize(name)
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

      const base = getBaseName(name);
      const entry = map.get(base) || {};

      if (isPerfect(name)) {
        entry.perfect = true;
      } else {
        entry.normal = true;
      }

      map.set(base, entry);
    });

    return map;
  }, [raw]);

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

    items.sort(
      (a, b) =>
        new Date(b.awardedAt || 0).getTime() -
        new Date(a.awardedAt || 0).getTime(),
    );

    return items;
  }, [raw]);

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
        className="w-full min-w-0 rounded-2xl border px-6 py-2 shadow-sm backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--accent) 80%, transparent)",
          borderColor: "var(--usercard-border)",
        }}
      >
        <h3
          className="mb-3 text-center text-[15px] font-extrabold"
          style={{ color: "var(--background)" }}
        >
          Insignias
        </h3>

        <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden">
          <div className="flex min-w-max items-center gap-2 py-1">
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
                <React.Fragment key={slot.baseName}>
                  <div className="group relative flex shrink-0 flex-col items-center">
                    <div
                      className="relative flex items-center justify-center rounded-full transition"
                      style={{
                        width: "clamp(2.4rem, 3.2vw, 3rem)",
                        height: "clamp(2.4rem, 3.2vw, 3rem)",
                        background: unlocked ? "#fff" : "rgba(0,0,0,0.08)",
                        boxShadow: perfect
                          ? `0 0 14px var(--accent)`
                          : unlocked
                            ? "0 4px 10px rgba(0,0,0,0.12)"
                            : "none",
                      }}
                    >
                      <img
                        src={resolveImg(img)}
                        alt={slot.baseName}
                        draggable={false}
                        className={`object-contain ${
                          unlocked ? "" : "grayscale opacity-30"
                        }`}
                        style={{
                          width: "clamp(1.4rem, 2vw, 2rem)",
                          height: "clamp(1.4rem, 2vw, 2rem)",
                        }}
                      />

                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-3.5 w-3.5 text-black/50" />
                        </div>
                      )}
                    </div>

                    <div
                      className="mt-1 text-center text-[10px] font-semibold leading-tight"
                      style={{ color: "var(--background)" }}
                    >
                      {slot.baseName}
                    </div>

                    <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden group-hover:block">
                      <div className="whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[10px] font-semibold text-white shadow">
                        {tooltip}
                      </div>
                    </div>
                  </div>

                  {idx !== MODULE_SLOTS.length - 1 && (
                    <div className="h-px min-w-[20px] flex-1 bg-white/80 sm:min-w-[26px] lg:min-w-[32px]" />
                  )}
                </React.Fragment>
              );
            })}

            <button
              onClick={() => setOpen(true)}
              className="ml-2 shrink-0 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition hover:bg-black/5"
              style={{
                borderColor: "var(--usercard-border)",
                background: "var(--usercard-accent)",
                color: "var(--chip-bg)",
              }}
            >
              Ver todas
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl"
            style={{
              background: "color-mix(in srgb, var(--app-bg) 85%, white)",
              borderColor: "var(--usercard-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
              }}
            >
              <div>
                <div
                  className="text-lg font-extrabold"
                  style={{ color: "var(--dash-title-text)" }}
                >
                  Tus insignias
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(100,116,139,0.95)" }}
                >
                  {loading
                    ? "Cargando..."
                    : `${modalItems.length} / 12 desbloqueadas`}
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-2 text-sm font-semibold transition hover:bg-black/5"
                style={{
                  borderColor: "var(--usercard-border)",
                  color: "var(--dash-title-text)",
                  background:
                    "color-mix(in srgb, var(--accent) 10%, transparent)",
                }}
                title="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {modalItems.length === 0 ? (
                <div
                  className="rounded-2xl border p-4 text-sm"
                  style={{
                    borderColor: "var(--usercard-border)",
                    background:
                      "color-mix(in srgb, var(--accent) 8%, transparent)",
                    color: "var(--dash-title-text)",
                  }}
                >
                  Aún no tienes insignias desbloqueadas.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {modalItems.map((it) => (
                    <div
                      key={it.key}
                      className="group flex flex-col items-center gap-2 rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        borderColor: "var(--usercard-border)",
                        background:
                          "color-mix(in srgb, var(--accent) 6%, white)",
                      }}
                      title={it.description || it.name}
                    >
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl border"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                          background: "#fff",
                        }}
                      >
                        <img
                          src={it.img}
                          alt={it.name}
                          className="h-14 w-14 object-contain p-2"
                          draggable={false}
                        />
                      </div>

                      <div
                        className="line-clamp-2 text-center text-xs font-extrabold"
                        style={{ color: "var(--dash-title-text)" }}
                      >
                        {it.name}
                      </div>

                      <div
                        className="hidden text-center text-[11px] leading-snug group-hover:block"
                        style={{ color: "rgba(100,116,139,0.95)" }}
                      >
                        {it.description || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="flex justify-end border-t px-5 py-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-extrabold transition"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}