// components/ui/NextButton.jsx
import React from "react";

export default function StartButton({
  onClick,
  disabled,
  src = "/start.png", // tú pones la ruta final
  ariaLabel = "Empezar",
  className = "",
  // tamaño rectangular grande (puedes ajustar)
  w = 220,
  h = 64,
}) {
  return (
    <>
      {/* Animación “respiración” tipo game UI */}
      <style>{`
        @keyframes quipu-breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.04); filter: brightness(1.08); }
        }
      `}</style>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={[
          "inline-flex items-center justify-center select-none",
          "transition active:scale-[0.98]",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        ].join(" ")}
        style={{
          // hit area: ligeramente mayor que la imagen
          padding: 6,
        }}>
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            width: w,
            height: h,
            objectFit: "contain",
            // respiración solo si NO está disabled
            animation: disabled
              ? "none"
              : "quipu-breathe 1.6s ease-in-out infinite",
            transformOrigin: "center",
          }}
        />
      </button>
    </>
  );
}
