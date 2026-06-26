import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PRIZES = [
  {
    place: 1,
    label: "Primer lugar",
    title: "Adidas Trionda — Balón oficial del Mundial 2026",
    description:
      "FIFA Quality Pro, superficie sin costuras. Diseño en rojo, verde y azul inspirado en los 3 países anfitriones.",
    image: "/assets/prizes/prize-1.webp",
    emoji: "⚽",
  },
  {
    place: 2,
    label: "Segundo lugar",
    title: "Xiaomi Smart Band 7",
    description:
      'AMOLED 1.62", SpO₂, 120 modos deportivos y hasta 14 días de batería.',
    image: "/assets/prizes/prize-2.webp",
    emoji: "⌚",
  },
  {
    place: 3,
    label: "Tercer lugar",
    title: "Xiaomi Mi Pocket Speaker 2",
    description: "Bluetooth 5W, altavoces Tymphany, 7 horas de reproducción.",
    image: "/assets/prizes/prize-3.webp",
    emoji: "🔊",
  },
];

const BADGE = {
  1: "bg-yellow-50 text-yellow-800",
  2: "bg-slate-100 text-slate-600",
  3: "bg-orange-50 text-orange-700",
};

const MEDAL = { 1: "", 2: "", 3: "" };

function PrizeCard({ prize, isHero }) {
  const inner = (
    <div
      className={` hover:scale-105 transition-transform duration-150 flex flex-col rounded-[14px] overflow-hidden bg-white h-full ${
        !isHero ? "border border-gray-100" : ""
      }`}>
      {/* Imagen */}
      <div
        className={`relative w-full bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 ${
          isHero ? "h-59" : "h-59"
        }`}>
        <img
          src={prize.image}
          alt={prize.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <span
          className={`absolute inset-0 items-center justify-center hidden ${
            isHero ? "text-6xl" : "text-4xl"
          }`}
          aria-hidden="true">
          {prize.emoji}
        </span>
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span
            className={`text-[10px] font-medium px-3 py-0.5 rounded-full ${BADGE[prize.place]}`}>
            {MEDAL[prize.place]} {prize.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div
        className={`flex flex-col flex-1 border-t border-gray-100 bg-white ${isHero ? "px-3 py-2.5" : "px-2.5 py-2"}`}>
        <p
          className={`font-medium text-gray-900 leading-tight mb-1 ${isHero ? "text-sm" : "text-xs"}`}>
          {prize.title}
        </p>
        <p
          className={`text-gray-400 leading-snug line-clamp-2 ${isHero ? "text-xs" : "text-[11px]"}`}>
          {prize.description}
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
      className={`fixed inset-0 z-50  flex items-center justify-center p-4 transition-all duration-200 rounded-2xl ${
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
              ¡ Anuncio Importante !
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Los mejores estudiantes del trimestre ganarán estos premios
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full  hover:scale-115 transition-transform duration-150 flex items-center justify-center bg-white/20 hover:bg-white/35 transition-colors text-white flex-shrink-0 ml-4"
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

        {/* Prizes — 2° | 1° | 3° */}
        <div
          className="grid grid-cols-[1fr_1.7fr_1fr] gap-3 p-3"
          style={{ background: "var(--color-bg, #fff)" }}>
          <PrizeCard
            prize={PRIZES[1]}
            isHero={false}
            classname="hover:scale-110 transition-transform duration-150"
          />
          <PrizeCard prize={PRIZES[0]} isHero={true} />
          <PrizeCard
            prize={PRIZES[2]}
            isHero={false}
            classname="hover:scale-110 transition-transform duration-150"
          />
        </div>

        {/* Footer */}

        <div
          className="flex gap-2 px-3 pb-4 border-t border-gray-100 pt-3 rounded-b-2xl"
          style={{ background: "var(--color-bg, #fff)" }}>
          <button
            onClick={handleClose}
            className=" hover:scale-110 transition-transform duration-150 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Ahora no
          </button>
          <button
            onClick={handleGoToRanking}
            className="hover:scale-103 transition-transform duration-150 flex-1 py-2.5 text-sm font-medium text-white bg-[#00C853] hover:bg-[#00b349] active:scale-[0.98] rounded-xl transition-all">
            ¡Ver mi posición en el ranking!
          </button>
        </div>
      </div>
    </div>
  );
}
