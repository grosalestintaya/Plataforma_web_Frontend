import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ⚠️ COMPLETAR: nombres y fotos reales de los ganadores del trimestre.
// Las fotos van en public/assets/winners/ — si falta una, la card muestra
// las iniciales del nombre en su lugar.
const WINNERS = [
  {
    place: 1,
    label: "Primer lugar",
    short: "1°",
    medal: "🥇",
    name: "Por completar",
    grade: "",
    photo: "/assets/winners/winner-1.webp",
    prize: "Adidas Trionda — Balón oficial del Mundial 2026",
    prizeImage: "/assets/prizes/prize-1.webp",
  },
  {
    place: 2,
    label: "Segundo lugar",
    short: "2°",
    medal: "🥈",
    name: "Por completar",
    grade: "",
    photo: "/assets/winners/winner-2.webp",
    prize: "Xiaomi Smart Band 7",
    prizeImage: "/assets/prizes/prize-2.webp",
  },
  {
    place: 3,
    label: "Tercer lugar",
    short: "3°",
    medal: "🥉",
    name: "Por completar",
    grade: "",
    photo: "/assets/winners/winner-3.webp",
    prize: "Xiaomi Mi Pocket Speaker 2",
    prizeImage: "/assets/prizes/prize-3.webp",
  },
];

const BADGE = {
  1: "bg-yellow-50 text-yellow-800",
  2: "bg-slate-100 text-slate-600",
  3: "bg-orange-50 text-orange-700",
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function WinnerCard({ winner, isHero }) {
  const inner = (
    <div
      className={`hover:scale-105 transition-transform duration-150 flex flex-col rounded-[14px] overflow-hidden bg-white ${
        !isHero ? "border border-gray-100" : ""
      }`}>
      {/* Foto del ganador — proporción fija: las fotos son verticales (520x839),
          así la del 1er lugar no se recorta aunque su columna sea más ancha */}
      <div className="relative w-full aspect-[0.62] bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        <img
          src={winner.photo}
          alt={winner.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <span
          className={`absolute inset-0 items-center justify-center hidden font-bold text-gray-300 ${
            isHero ? "text-6xl" : "text-4xl"
          }`}
          aria-hidden="true">
          {getInitials(winner.name)}
        </span>
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span
            className={`text-[10px] font-medium px-3 py-0.5 rounded-full whitespace-nowrap ${BADGE[winner.place]}`}>
            {winner.medal}
            {/* En pantallas angostas la etiqueta larga se parte en 3 líneas
                y tapa la foto, así que ahí solo va el puesto */}
            <span className="hidden sm:inline"> {winner.label}</span>
            <span className="sm:hidden"> {winner.short}</span>
          </span>
        </div>
      </div>

      {/* Nombre */}
      <div
        className={`flex flex-col flex-1 border-t border-gray-100 bg-white ${isHero ? "px-3 py-2.5" : "px-2.5 py-2"}`}>
        <p
          className={`font-semibold text-gray-900 leading-tight ${isHero ? "text-sm" : "text-xs"}`}>
          {winner.name}
        </p>
        {winner.grade && (
          <p className="text-gray-400 text-[11px] leading-snug">
            {winner.grade}
          </p>
        )}
      </div>

      {/* Premio que ganó */}
      <div className="flex items-center gap-1.5 border-t border-gray-100 px-2.5 py-1.5">
        <img
          src={winner.prizeImage}
          alt=""
          className="w-6 h-6 rounded object-cover flex-shrink-0"
          aria-hidden="true"
        />
        <p className="text-gray-500 text-[10px] leading-tight line-clamp-2">
          {winner.prize}
        </p>
      </div>
    </div>
  );

  if (!isHero) return inner;

  // Wrapper aurora: el gradiente animado es el fondo del wrapper,
  // el card inner tiene padding de 2px que deja ver el borde
  return (
    <div
      className="rounded-2xl p-[3px]"
      style={{
        background:
          "linear-gradient(120deg, #FFD700, #00C853, #00BFFF, #FF6FD8, #FFD700)",
        backgroundSize: "300% 300%",
        animation: "aurora 3s linear infinite",
      }}>
      {inner}
    </div>
  );
}

export function AnnouncementModal({ isOpen, onClose }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleGoToRanking = () => {
    handleClose();
    navigate("/app/ranking");
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 rounded-2xl ${
        visible ? "bg-black/70" : "bg-black/0"
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div
        className={`w-full max-w-xl rounded-2xl p-[4px] transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{
          background:
            "linear-gradient(120deg, #FFD700, #FFA500, #FFD700, #FFC400, #FFD700)",
          backgroundSize: "300% 300%",
          animation: "aurora 3s linear infinite",
        }}>
        {/* Header */}
        <div className="relative bg-[#00C853] px-5 py-4 flex items-center rounded-t-2xl justify-between">
          <div className="text-center">
            <h1 className="text-white text-xl font-bold leading-tight">
              🎉 ¡Tenemos ganadores!
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Estos son los mejores estudiantes del trimestre. ¡Felicitaciones!
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full hover:scale-115 transition-transform duration-150 flex items-center justify-center bg-white/20 hover:bg-white/35 text-white flex-shrink-0 ml-4"
            aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Podio — 2° | 1° | 3° */}
        <div
          className="grid grid-cols-[1fr_1.45fr_1fr] items-center gap-3 p-3"
          style={{ background: "var(--color-bg, #fff)" }}>
          <WinnerCard winner={WINNERS[1]} isHero={false} />
          <WinnerCard winner={WINNERS[0]} isHero={true} />
          <WinnerCard winner={WINNERS[2]} isHero={false} />
        </div>

        {/* Footer */}
        <div
          className="flex gap-2 px-3 pb-4 border-t border-gray-100 pt-3 rounded-b-2xl"
          style={{ background: "var(--color-bg, #fff)" }}>
          <button
            onClick={handleClose}
            className="hover:scale-110 transition-transform duration-150 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cerrar
          </button>
          <button
            onClick={handleGoToRanking}
            className="hover:scale-103 transition-transform duration-150 flex-1 py-2.5 text-sm font-medium text-white bg-[#00C853] hover:bg-[#00b349] active:scale-[0.98] rounded-xl transition-all">
            Ver el ranking completo
          </button>
        </div>
      </div>
    </div>
  );
}
