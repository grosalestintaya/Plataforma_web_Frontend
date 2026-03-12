// components/ui/BackButton.jsx
import React from "react";
import backicon from "@/assets/activity/back.png"; // tú pones la ruta final

export default function BackButton({
  onClick,
  disabled = false,
  src = backicon,
  ariaLabel = "Volver",
  className = "",
  w = 220,
  h = 64,
}) {
  return (
    <>
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
