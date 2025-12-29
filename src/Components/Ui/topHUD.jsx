import React from "react";
import { Settings } from "lucide-react";

export default function TopHUD({
  title,
  subtitle,
  onOpenSettings,
  leftLogoSrc,
}) {
  return (
    <div className="w-full flex items-center justify-between">
      {/* Barra blanca */}
      <div className="w-full rounded-2xl bg-white shadow-md px-5 py-3 flex items-center justify-between">
        {/* Izquierda: logo */}
        <div className="flex items-center gap-3 min-w-[140px]">
          {leftLogoSrc ? (
            <img
              src={leftLogoSrc}
              alt="Logo"
              className="h-10 w-10 object-contain"
            />
          ) : (
            <div className="h-10 w-10" />
          )}
        </div>

        {/* Centro: título/subtítulo */}
        <div className="flex-1 text-center px-3">
          {title ? (
            <div className="text-2xl font-black text-black leading-tight">
              {title}
            </div>
          ) : null}
          {subtitle ? (
            <div className="text-sm font-bold text-gray-600">
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Derecha: tuerca */}
        <div className="min-w-[140px] flex justify-end">
          <button
            type="button"
            onClick={onOpenSettings}
            className="h-12 w-12 rounded-xl hover:bg-gray-100 transition flex items-center justify-center"
            aria-label="Ajustes"
          >
            <Settings className="text-black" size={30} />
          </button>
        </div>
      </div>
    </div>
  );
}
    