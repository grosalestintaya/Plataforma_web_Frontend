import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Lock, Shield, Sparkles, Trophy, X } from "lucide-react";

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
const isPerfectName = (name) => /\s+Perfecto$/i.test(normalize(name));
const getBaseName = (name) =>
  normalize(name)
    .replace(/\s+Perfecto$/i, "")
    .trim();

function formatAwardedAt(date) {
  if (!date) return "No desbloqueada";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "No desbloqueada";
  }
}

function buildLockedDescription(baseName, variant) {
  if (variant === "perfect") {
    return `Versión perfecta de ${baseName}. Aún no la has desbloqueado.`;
  }
  return `Insignia base de ${baseName}. Completa el progreso necesario para obtenerla.`;
}

export default function InsigniasCard() {
  const token = localStorage.getItem("token");

  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  const fetchInsignias = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setRaw(Array.isArray(json?.insignias) ? json.insignias : []);
    } catch (error) {
      console.error("Error cargando insignias:", error);
      setRaw([]);
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
      if (isPerfectName(name)) {
        entry.perfect = true;
      } else {
        entry.normal = true;
      }
      map.set(base, entry);
    });
    return map;
  }, [raw]);

  const exactByName = useMemo(() => {
    const map = new Map();
    raw.forEach((row) => {
      const name = normalize(row?.insignia?.name);
      if (!name) return;
      map.set(name, row);
    });
    return map;
  }, [raw]);

  const unlockedCount = useMemo(() => {
    return Array.isArray(raw) ? raw.length : 0;
  }, [raw]);

  const collectionItems = useMemo(() => {
    return MODULE_SLOTS.flatMap((slot) => {
      const normalName = slot.baseName;
      const perfectName = `${slot.baseName} Perfecto`;
      const normalRow = exactByName.get(normalName);
      const perfectRow = exactByName.get(perfectName);
      const normalIns = normalRow?.insignia ?? {};
      const perfectIns = perfectRow?.insignia ?? {};
      return [
        {
          key: `${slot.baseName}-normal`,
          name: normalName,
          baseName: slot.baseName,
          variant: "normal",
          unlocked: !!normalRow,
          perfect: false,
          img: normalRow
            ? resolveImg(normalIns?.pinnedImg || slot.img)
            : resolveImg(slot.img),
          description: normalRow
            ? normalIns?.description || ""
            : buildLockedDescription(slot.baseName, "normal"),
          value: normalRow ? (normalIns?.value ?? 0) : 0,
          awardedAt: normalRow?.awardedAt ?? null,
        },
        {
          key: `${slot.baseName}-perfect`,
          name: perfectName,
          baseName: slot.baseName,
          variant: "perfect",
          unlocked: !!perfectRow,
          perfect: true,
          img: perfectRow
            ? resolveImg(perfectIns?.pinnedImg || slot.imgPerfect)
            : resolveImg(slot.imgPerfect),
          description: perfectRow
            ? perfectIns?.description || ""
            : buildLockedDescription(slot.baseName, "perfect"),
          value: perfectRow ? (perfectIns?.value ?? 0) : 0,
          awardedAt: perfectRow?.awardedAt ?? null,
        },
      ];
    });
  }, [exactByName]);

  const selectedItem = useMemo(() => {
    return (
      collectionItems.find((item) => item.key === selectedKey) ||
      collectionItems.find((item) => item.unlocked) ||
      collectionItems[0] ||
      null
    );
  }, [collectionItems, selectedKey]);

  useEffect(() => {
    if (!collectionItems.length) {
      setSelectedKey(null);
      return;
    }
    const exists = collectionItems.some((item) => item.key === selectedKey);
    if (!exists) {
      const firstUnlocked =
        collectionItems.find((item) => item.unlocked) || collectionItems[0];
      setSelectedKey(firstUnlocked.key);
    }
  }, [collectionItems, selectedKey]);

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
        // ANTES
        className="w-full min-w-0 rounded-2xl border px-6 py-0 shadow-sm backdrop-blur"
        // DESPUÉS — py-2 ya estaba bien, pero reducimos mb-3 del título
        style={{
          background: "color-mix(in srgb, var(--accent) 30%, transparent)",
          borderColor: "var(--usercard-border)",
        }}>
        <h3
          className="mb-1 text-center text-[15px] font-extrabold"
          style={{ color: "var(--background)" }}>
          Insignias
        </h3>
        <div className="w-full min-w-0">
          <div className="flex items-center justify-between gap-1 py-1">
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
                  <div
                    className="group relative flex flex-col items-center"
                    style={{ cursor: "pointer", flex: "1 1 0", minWidth: 0 }}
                    onClick={() => {
                      setSelectedKey(`${slot.baseName}-normal`);
                      setOpen(true);
                    }}>
                    <div
                      className="relative flex items-center justify-center rounded-full transition mx-auto"
                      style={{
                        width: "clamp(2.4rem, 6vw, 3.8rem)",
                        height: "clamp(2.4rem, 6vw, 3.8rem)",
                        background: unlocked
                          ? "var(--primary)/90"
                          : "var(--usercard-border)",
                        boxShadow: perfect
                          ? `0 0 14px var(--accent)`
                          : unlocked
                            ? "0 4px 10px rgba(0,0,0,0.12)"
                            : "none",
                      }}>
                      <img
                        src={resolveImg(img)}
                        alt={slot.baseName}
                        draggable={false}
                        className={`object-contain ${unlocked ? "" : "grayscale opacity-40"}`}
                        style={{
                          width: "clamp(1.8rem, 4.5vw, 3rem)",
                          height: "clamp(1.8rem, 4.5vw, 3rem)",
                        }}
                      />
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-3 w-3 text-black/50" />
                        </div>
                      )}
                    </div>

                    <div
                      className="mt-1 text-center font-semibold leading-tight truncate w-full px-0.5"
                      style={{
                        color: "var(--background)",
                        fontSize: "clamp(7px, 1.1vw, 10px)",
                      }}>
                      {slot.baseName}
                    </div>

                    {/* Tooltip — ahora hacia ABAJO para evitar clip */}
                    <div className="pointer-events-none absolute top-full z-50 mt-2 hidden group-hover:block">
                      <div className="whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[10px] font-semibold text-white shadow">
                        {tooltip}
                      </div>
                    </div>
                  </div>

                  {idx !== MODULE_SLOTS.length - 1 && (
                    <div
                      className="h-px flex-1 bg-white/80"
                      style={{ minWidth: 8 }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 md:p-6"
          onClick={() => setOpen(false)}>
          <div
            className="flex h-[min(88vh,820px)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border shadow-2xl"
            style={{
              background: "color-mix(in srgb, var(--app-bg) 88%, white)",
              borderColor: "var(--usercard-border)",
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
              }}>
              <div>
                <div
                  className="text-lg font-extrabold"
                  style={{ color: "var(--dash-title-text)" }}>
                  Colección de insignias
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(100,116,139,0.95)" }}>
                  {loading
                    ? "Cargando..."
                    : `${unlockedCount} / 12 desbloqueadas`}
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-3 py-2 text-sm font-semibold transition"
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

            <div className="min-h-0 flex-1 p-4 md:p-5">
              <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
                <div
                  className="min-h-0 rounded-3xl border p-3"
                  style={{
                    borderColor: "var(--usercard-border)",
                    background:
                      "color-mix(in srgb, var(--accent) 6%, transparent)",
                  }}>
                  <div
                    className="mb-3 px-2 text-xs font-black uppercase tracking-[0.16em]"
                    style={{ color: "rgba(100,116,139,0.95)" }}>
                    Inventario
                  </div>

                  <div className="max-h-full space-y-2 overflow-y-auto pr-1">
                    {collectionItems.map((item) => {
                      const active = selectedItem?.key === item.key;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedKey(item.key)}
                          className="flex w-full items-center gap-2 rounded-2xl border p-1 text-left transition"
                          style={{
                            borderColor: active
                              ? "color-mix(in srgb, var(--primary) 62%, white)"
                              : "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                            background: active
                              ? "linear-gradient(135deg, color-mix(in srgb, var(--primary) 13%, white), color-mix(in srgb, var(--accent) 8%, white))"
                              : "color-mix(in srgb, var(--accent) 3%, white)",
                            boxShadow: active
                              ? "0 12px 24px rgba(0,0,0,0.12)"
                              : "none",
                            opacity: item.unlocked ? 1 : 0.78,
                          }}>
                          <div
                            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                              background: "#fff",
                            }}>
                            <img
                              src={item.img}
                              alt={item.name}
                              className={`h-14 w-14 object-contain p-2 ${
                                item.unlocked ? "" : "grayscale opacity-35"
                              }`}
                              draggable={false}
                            />

                            {!item.unlocked && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="rounded-full bg-black/55 p-1.5">
                                  <Lock className="h-3.5 w-3.5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className="truncate text-sm font-extrabold"
                              style={{ color: "var(--dash-title-text)" }}>
                              {item.name}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold"
                                style={{
                                  background: item.perfect
                                    ? "color-mix(in srgb, #f59e0b 16%, white)"
                                    : "color-mix(in srgb, var(--primary) 12%, white)",
                                  color: item.perfect
                                    ? "#b45309"
                                    : "var(--primary)",
                                }}>
                                {item.perfect ? (
                                  <Sparkles className="h-3 w-3" />
                                ) : (
                                  <Shield className="h-3 w-3" />
                                )}
                                {item.perfect ? "Perfecta" : "Base"}
                              </span>

                              {!item.unlocked ? (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold"
                                  style={{
                                    background: "rgba(15,23,42,0.08)",
                                    color: "rgba(15,23,42,0.58)",
                                  }}>
                                  <Lock className="h-3 w-3" />
                                  Bloqueada
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="min-h-0 rounded-3xl border p-4 md:p-5"
                  style={{
                    borderColor: "var(--usercard-border)",
                    background:
                      "linear-gradient(180deg, color-mix(in srgb, var(--accent) 7%, white), color-mix(in srgb, var(--app-bg) 86%, white))",
                  }}>
                  {selectedItem ? (
                    <div className="grid h-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                      <div className="flex flex-col">
                        <div
                          className="flex min-h-[300px] items-center justify-center rounded-[30px] border p-6"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--usercard-border) 75%, transparent)",
                            background: selectedItem.unlocked
                              ? "radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--primary) 12%, white), #ffffff 62%)"
                              : "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.88), rgba(241,245,249,0.96) 62%)",
                            boxShadow:
                              selectedItem.perfect && selectedItem.unlocked
                                ? "0 0 0 1px rgba(255,255,255,0.7), 0 18px 34px rgba(0,0,0,0.12), 0 0 36px color-mix(in srgb, var(--accent) 25%, transparent)"
                                : "0 18px 34px rgba(0,0,0,0.10)",
                          }}>
                          <img
                            src={selectedItem.img}
                            alt={selectedItem.name}
                            draggable={false}
                            className={`max-h-[300px] w-full object-contain ${
                              selectedItem.unlocked
                                ? ""
                                : "grayscale opacity-40"
                            }`}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div
                            className="rounded-2xl border p-3"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                              background: selectedItem.perfect
                                ? "color-mix(in srgb, #f59e0b 12%, white)"
                                : "color-mix(in srgb, var(--primary) 8%, white)",
                            }}>
                            <div
                              className="text-[11px] font-bold uppercase tracking-[0.14em]"
                              style={{ color: "rgba(100,116,139,0.9)" }}>
                              Rareza
                            </div>
                            <div
                              className="mt-1 text-sm font-extrabold"
                              style={{ color: "var(--dash-title-text)" }}>
                              {selectedItem.perfect ? "Perfecta" : "Estándar"}
                            </div>
                          </div>

                          <div
                            className="rounded-2xl border p-3"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                              background: selectedItem.unlocked
                                ? "color-mix(in srgb, var(--accent) 8%, white)"
                                : "rgba(15,23,42,0.04)",
                            }}>
                            <div
                              className="text-[11px] font-bold uppercase tracking-[0.14em]"
                              style={{ color: "rgba(100,116,139,0.9)" }}>
                              Estado
                            </div>
                            <div
                              className="mt-1 text-sm font-extrabold"
                              style={{ color: "var(--dash-title-text)" }}>
                              {selectedItem.unlocked
                                ? "Desbloqueada"
                                : "Bloqueada"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex min-h-0 flex-col">
                        <div
                          className="text-xs font-black uppercase tracking-[0.18em]"
                          style={{
                            color: selectedItem.perfect
                              ? "#b45309"
                              : "var(--primary)",
                          }}>
                          Detalle del ítem
                        </div>

                        <h3
                          className="mt-2 text-2xl font-black md:text-3xl"
                          style={{ color: "var(--dash-title-text)" }}>
                          {selectedItem.name}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold"
                            style={{
                              background: selectedItem.unlocked
                                ? "color-mix(in srgb, var(--primary) 12%, white)"
                                : "rgba(15,23,42,0.08)",
                              color: selectedItem.unlocked
                                ? "var(--primary)"
                                : "rgba(15,23,42,0.58)",
                            }}>
                            {selectedItem.unlocked ? (
                              <Trophy className="h-3.5 w-3.5" />
                            ) : (
                              <Lock className="h-3.5 w-3.5" />
                            )}
                            {selectedItem.unlocked
                              ? "Disponible"
                              : "Aún no disponible"}
                          </span>

                          {selectedItem.perfect ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold"
                              style={{
                                background:
                                  "color-mix(in srgb, #f59e0b 16%, white)",
                                color: "#b45309",
                              }}>
                              <Sparkles className="h-3.5 w-3.5" />
                              Versión perfecta
                            </span>
                          ) : null}
                        </div>

                        <div
                          className="mt-5 rounded-3xl border p-4"
                          style={{
                            borderColor:
                              "color-mix(in srgb, var(--usercard-border) 72%, transparent)",
                            background:
                              "color-mix(in srgb, var(--accent) 4%, white)",
                          }}>
                          <div
                            className="text-xs font-black uppercase tracking-[0.14em]"
                            style={{ color: "rgba(100,116,139,0.95)" }}>
                            Descripción
                          </div>

                          <p
                            className="mt-2 text-sm leading-7 md:text-[15px]"
                            style={{ color: "var(--dash-title-text)" }}>
                            {selectedItem.description ||
                              "Esta insignia forma parte de tu colección de progreso dentro de la plataforma."}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div
                            className="rounded-2xl border p-4"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                              background:
                                "color-mix(in srgb, var(--primary) 6%, white)",
                            }}>
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                className="h-4 w-4"
                                style={{ color: "var(--primary)" }}
                              />
                              <span
                                className="text-xs font-black uppercase tracking-[0.14em]"
                                style={{ color: "rgba(100,116,139,0.95)" }}>
                                Obtenida
                              </span>
                            </div>

                            <div
                              className="mt-2 text-sm font-extrabold"
                              style={{ color: "var(--dash-title-text)" }}>
                              {formatAwardedAt(selectedItem.awardedAt)}
                            </div>
                          </div>

                          <div
                            className="rounded-2xl border p-4"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                              background:
                                "color-mix(in srgb, var(--accent) 7%, white)",
                            }}>
                            <div className="flex items-center gap-2">
                              <Trophy
                                className="h-4 w-4"
                                style={{ color: "var(--primary)" }}
                              />
                              <span
                                className="text-xs font-black uppercase tracking-[0.14em]"
                                style={{ color: "rgba(100,116,139,0.95)" }}>
                                Valor
                              </span>
                            </div>

                            <div
                              className="mt-2 text-sm font-extrabold"
                              style={{ color: "var(--dash-title-text)" }}>
                              {selectedItem.unlocked ? selectedItem.value : "—"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div
                            className="rounded-2xl border p-4"
                            style={{
                              borderColor:
                                "color-mix(in srgb, var(--usercard-border) 70%, transparent)",
                              background: selectedItem.unlocked
                                ? "linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, white), color-mix(in srgb, var(--accent) 8%, white))"
                                : "linear-gradient(135deg, rgba(15,23,42,0.04), rgba(15,23,42,0.02))",
                            }}>
                            <div
                              className="text-xs font-black uppercase tracking-[0.14em]"
                              style={{ color: "rgba(100,116,139,0.95)" }}>
                              Estado de colección
                            </div>

                            <div
                              className="mt-2 text-sm leading-6"
                              style={{ color: "var(--dash-title-text)" }}>
                              {selectedItem.unlocked
                                ? "Esta insignia ya forma parte de tu colección. Puedes revisarla aquí como en una vista de inventario de juego."
                                : "Este espacio muestra la vista previa del ítem bloqueado. Cuando lo desbloquees, aquí aparecerán sus datos completos."}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-5">
                          <div
                            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: "rgba(100,116,139,0.85)" }}>
                            {selectedItem.baseName}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-2xl border p-4 text-sm"
                      style={{
                        borderColor: "var(--usercard-border)",
                        background:
                          "color-mix(in srgb, var(--accent) 8%, transparent)",
                        color: "var(--dash-title-text)",
                      }}>
                      No hay insignias para mostrar.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className="flex justify-end border-t px-5 py-4"
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
