import React from "react";
import rope from "/assets/coin.png"; // tu cuerda
import { useNavigate } from "react-router-dom";
function hexToRgba(hex, a = 1) {
  const h = String(hex || "#000").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export default function QuipuHeader({
  title,
  subtitle,
  themeHex = "#7130F7",
  onBack,
  wallet = { xp: 0, coins: 0 },
  onOpenSettings,

  // ✅ tú ajustas rutas
  xpIconSrc = "/assets/xp.png",
  coinIconSrc = "/assets/coin.png",
  gearIconSrc = "/assets/gear.png",
}) {
  const navigate = useNavigate(); // ✅ aquí adentro

  const handleBack = () => {
    if (onBack) return onBack(); // ✅ si pasas callback, úsalo
    navigate("/"); // ✅ fallback
  };
  return (
    <header className="relative w-full overflow-hidden">
      {/* fondo integrado */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            ${hexToRgba(themeHex, 0.24)},
            ${hexToRgba("#000000", 0.14)} 55%,
            ${hexToRgba("#000000", 0)} 100%
          )`,
        }}
      />

      <div className="relative px-3 md:px-8 lg:px-10 pt-4 pb-3">
        {/* fila superior */}
        <div className="flex items-center justify-between gap-3">
          {/* LEFT: salir */}
          <div className="flex items-center gap-3 min-w-[110px]">
            <button
              onClick={() => navigate("/")}
              className="group relative px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300"
              style={{
                background: `linear-gradient(180deg, ${themeHex}22, ${themeHex}99)`,
                boxShadow: `0 10px 30px ${themeHex}40`,
                border: "1px solid rgba(255,255,255,0.18)",
                color: "white",
              }}>
              <span className="flex items-center gap-2">← Volver</span>

              {/* brillo superior */}
              <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
            </button>
          </div>

          {/* CENTER: título */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-white text-xl md:text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-white/70 text-xs md:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {/* RIGHT: wallet + settings */}
          <div className="flex items-center justify-end gap-2 min-w-[210px]">
            {/* XP tile */}
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{
                background: hexToRgba("#ffffff", 0.08),
                boxShadow: `0 10px 24px ${hexToRgba("#000000", 0.22)}`,
              }}
              title="XP">
              {/* icon fixed */}
              <div
                className="w-8 h-8 rounded-xl grid place-items-center"
                style={{
                  background: hexToRgba(themeHex, 0.2),
                }}>
                <img
                  src={xpIconSrc}
                  alt="XP"
                  draggable={false}
                  className="w-5 h-5 object-contain"
                />
              </div>

              <div className="leading-tight">
                <div className="text-[10px] text-white/60 font-semibold">
                  XP
                </div>
                <div className="text-sm text-white/90 font-extrabold">
                  {wallet?.xp ?? 0}
                </div>
              </div>
            </div>

            {/* COINS tile */}
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{
                background: hexToRgba("#ffffff", 0.08),
                boxShadow: `0 10px 24px ${hexToRgba("#000000", 0.22)}`,
              }}
              title="Coins">
              {/* icon fixed */}
              <div
                className="w-8 h-8 rounded-xl grid place-items-center"
                style={{
                  background: "rgba(255,196,0,0.18)",
                }}>
                <img
                  src={coinIconSrc}
                  alt="Intis"
                  draggable={false}
                  className="w-full h- object-contain"
                />
              </div>

              <div className="leading-tight">
                <div className="text-[10px] text-white/60 font-semibold">
                  Intis
                </div>
                <div className="text-sm text-white/90 font-extrabold">
                  {wallet?.coins ?? 0}
                </div>
              </div>
            </div>

            {/* SETTINGS (tuerca como imagen, sin border) */}
            <button
              onClick={onOpenSettings}
              type="button"
              className="group w-[60px] h-[60px] rounded-2xl grid place-items-center transition active:scale-[0.98]"
              style={{}}
              title="Configuración">
              <img
                src={gearIconSrc}
                alt="Configuración"
                draggable={false}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:rotate-90"
              />

              {/* glow hover */}
              <span
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
                style={{
                  boxShadow: `0 0 18px ${hexToRgba(themeHex, 0.38)}`,
                }}
              />
            </button>
          </div>
        </div>

        {/* cuerda full width sin espacios laterales */}
        <div className="mt-2 -mx-3 md:-mx-8 lg:-mx-10">
          <img
            src={rope}
            alt="Cuerda del Quipu"
            className="block w-full h-[74px] object-cover"
            draggable={false}
          />
        </div>
      </div>
    </header>
  );
}
