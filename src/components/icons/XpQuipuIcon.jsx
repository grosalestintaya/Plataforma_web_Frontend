import React from "react";

/**
 * XpQuipuIcon
 * Icono XP inspirado en quipu:
 * - Cuerda circular
 * - 3 cuerdas cortas colgantes
 * - Nudos simples (progreso / experiencia)
 *
 * Usa `currentColor` → controla color con Tailwind (text-*)
 */
export default function XpQuipuIcon({ className = "h-5 w-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Cuerda circular */}
      <circle
        cx="12"
        cy="9"
        r="6"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Detalle de torsión de la cuerda (muy sutil) */}
      <path
        d="M8.2 4.8c1 .6 2 .6 3 0 1-.6 2-.6 3 0 1 .6 2 .6 3 0"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* Cuerda colgante izquierda */}
      <path
        d="M9 15v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="9" cy="17" r="0.9" fill="currentColor" />
      <circle cx="9" cy="19" r="0.7" fill="currentColor" opacity="0.75" />

      {/* Cuerda colgante central (principal) */}
      <path
        d="M12 15v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17.2" r="1.1" fill="currentColor" />
      <circle cx="12" cy="19.6" r="0.85" fill="currentColor" opacity="0.8" />

      {/* Cuerda colgante derecha */}
      <path
        d="M15 15v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="15" cy="17" r="0.9" fill="currentColor" />
      <circle cx="15" cy="19" r="0.7" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
