import React from "react";
import logo from "/logo_full.webp";

export default function FooterLp({
  onComoFunciona,
  onInicio,
  onIniciarSesion,
}) {
  return (
    <footer className="w-full border-t-2 border-[#FFE600] bg-white">
      <div className="flex items-center min-h-14 px-4 sm:px-6 lg:px-8 gap-4 py-3">
        {/* Logo + copyright */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src={logo}
            alt="Logo"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain"
          />
          <span className="text-xs text-gray-400 font-semibold hidden md:block max-w-xs leading-tight">
            © 2026 Quipu Yachay — Plataforma interactiva gamificada de educación
            financiera.
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-6 ml-auto">
          {[
            { label: "Iniciar sesión", action: onIniciarSesion },
            { label: "Introducción", action: onInicio },
            { label: "¿Cómo funciona una misión?", action: onComoFunciona },
          ].map((link) => (
            <a
              key={link.label}
              onClick={link.action}
              className="text-sm font-bold whitespace-nowrap cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: "#049140" }}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
