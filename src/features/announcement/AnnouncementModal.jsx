import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ← añade esto

// Cambia los textos, imágenes y rutas según lo que definas con el admin
const PRIZES = [
  {
    place: 1,
    label: "Primer lugar",
    title: "Pelota Adidas Trionda League — Balón oficial del Mundial 2026",
    description:
      "El balón oficial de la Copa del Mundo FIFA 2026. Tecnología Pro con superficie sin costuras, certificación FIFA Quality Pro. Diseño exclusivo en rojo, verde y azul inspirado en los 3 países anfitriones.",
    image: "/assets/prizes/prize-1.webp",
    medalBg: "bg-yellow-400",
    medalText: "text-yellow-900",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-800",
    borderColor: "border-yellow-400",
    barColor: "bg-yellow-400",
    barHeight: "h-12",
    emoji: "🥇",
  },
  {
    place: 2,
    label: "Segundo lugar",
    title: "Xiaomi Smart Band 7",
    description:
      'Pulsera inteligente con pantalla AMOLED de 1.62", monitor de frecuencia cardíaca 24/7, sensor SpO₂, 120 modos deportivos, Always On Display y hasta 14 días de batería.',
    image: "/assets/prizes/prize-2.webp",
    medalBg: "bg-slate-300",
    medalText: "text-slate-700",
    badgeBg: "bg-slate-50",
    badgeText: "text-slate-700",
    borderColor: "border-slate-300",
    barColor: "bg-slate-300",
    barHeight: "h-9",
    emoji: "🥈",
  },
  {
    place: 3,
    label: "Tercer lugar",
    title: "Xiaomi Mi Pocket Speaker 2",
    description:
      "Parlante Bluetooth portátil con altavoces profesionales Tymphany, 5W de potencia, hasta 7 horas de reproducción y diseño compacto que cabe en cualquier mochila.",
    image: "/assets/prizes/prize-3.webp",
    medalBg: "bg-orange-300",
    medalText: "text-orange-900",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-800",
    borderColor: "border-orange-300",
    barColor: "bg-orange-300",
    barHeight: "h-7",
    emoji: "🥉",
  },
];
// Orden visual del podio: 2° - 1° - 3°
const PODIUM_ORDER = [PRIZES[1], PRIZES[0], PRIZES[2]];

export function AnnouncementModal({ isOpen, onClose }) {
  const [selected, setSelected] = useState(1);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate(); // ← añade esto

  useEffect(() => {
    if (isOpen) {
      // Frame delay para que la animación de entrada funcione
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activePrize = PRIZES.find((p) => p.place === selected);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };
  const handleGoToRanking = () => {
    handleClose();
    navigate("/app/ranking");
  };

  return (
    // Overlay
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/70" : "bg-black/0"
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}>
      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ background: "var(--color-bg, #fff)" }}>
        {/* Header verde */}
        <div className="relative bg-[#00C853] px-6 pt-5 pb-4 text-center">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/35 transition-colors text-white"
            aria-label="Cerrar anuncio">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <span className="inline-block bg-[#FFC400] text-yellow-900 text-[11px] font-medium px-3 py-0.5 rounded-full uppercase tracking-wide mb-2">
            ✦ Anuncio especial
          </span>
          <h2 className="text-white text-xl font-semibold mb-1">
            ¡Premios del ranking!
          </h2>
          <p className="text-white/80 text-sm">
            Los mejores estudiantes del trimestre ganarán estos premios
          </p>
        </div>

        {/* Podio */}
        <div className="px-6 pt-5 pb-2 bg-white dark:bg-gray-900">
          <div className="flex items-end justify-center gap-3">
            {PODIUM_ORDER.map((prize) => (
              <button
                key={prize.place}
                onClick={() => setSelected(prize.place)}
                className={`flex flex-col items-center transition-transform duration-200 focus:outline-none ${
                  selected === prize.place
                    ? "-translate-y-2"
                    : "hover:-translate-y-1"
                }`}>
                {/* Imagen del premio */}
                <div
                  className={`relative rounded-xl border-2 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800 transition-all duration-200 ${
                    prize.borderColor
                  } ${
                    prize.place === 1
                      ? "w-24 h-24"
                      : prize.place === 2
                        ? "w-[72px] h-[72px]"
                        : "w-16 h-16"
                  } ${selected === prize.place ? "ring-2 ring-offset-2 ring-[#00C853]" : ""}`}>
                  <img
                    src={prize.image}
                    alt={`Premio ${prize.place}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "flex";
                    }}
                  />
                  {/* Fallback emoji si no carga la imagen */}
                  <span
                    className="absolute inset-0 items-center justify-center text-3xl hidden"
                    aria-hidden="true">
                    {prize.emoji}
                  </span>
                </div>

                {/* Medalla con número */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mt-2 mb-1 ${prize.medalBg} ${prize.medalText}`}>
                  {prize.place}
                </div>

                <span className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-tight max-w-[80px]">
                  {prize.label}
                </span>

                {/* Barra del podio */}
                <div
                  className={`w-full mt-2 rounded-t-lg ${prize.barColor} ${prize.barHeight}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Panel de detalle del premio seleccionado */}
        <div className="mx-5 my-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 min-h-[88px] transition-all duration-200">
          {activePrize && (
            <>
              <span
                className={`inline-block text-[11px] font-medium px-3 py-0.5 rounded-full mb-2 ${activePrize.badgeBg} ${activePrize.badgeText}`}>
                {activePrize.emoji} {activePrize.label}
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {activePrize.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                {activePrize.description}
              </p>
            </>
          )}
        </div>

        {/* Footer con CTAs */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Ahora no
          </button>
          <button
            onClick={handleGoToRanking}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00C853] hover:bg-[#00b349] active:scale-[0.98] rounded-xl transition-all">
            ¡Ver mi posición en el ranking!
          </button>
        </div>
      </div>
    </div>
  );
}
