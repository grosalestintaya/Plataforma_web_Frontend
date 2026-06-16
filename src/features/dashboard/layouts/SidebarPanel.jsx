import React from "react";
import { LogOut, X } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";
import { useNavigate } from "react-router-dom";

export default function SidebarPanel({
  menuItems,
  mobileExpanded = true,
  isDesktop = false,
  isCollapsed = false,
  onToggleMobile,
  onLogout,
  mode = "desktop", // "desktop" | "mobile-modal"
}) {
  const navigate = useNavigate();

  const isMobileModal = mode === "mobile-modal";

  const rootClass = [
    "flex flex-col justify-between transition-all duration-300 ease-out",
    isMobileModal
      ? "relative h-full w-full shadow-none"
      : "fixed left-0 z-40 shadow-lg",
    isDesktop
      ? "top-4 bottom-2 h-[97vh] w-40 rounded-tr-2xl rounded-br-2xl"
      : isMobileModal
        ? "h-full w-full"
        : mobileExpanded
          ? "top-0 h-screen w-50 rounded-tr-3xl rounded-br-3xl"
          : "top-0 h-screen w-18 rounded-tr-3xl rounded-br-3xl",
  ].join(" ");

  return (
    <aside
      id="nav-bar"
      className={rootClass}
      style={{
        backgroundColor: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
      }}>
      <div className="min-h-0">
        {/* Header */}
        <div
          className={[
            "flex items-center justify-between",
            isDesktop ? "px-3 py-1" : "px-4 py-4",
          ].join(" ")}>
          <div
            className={[
              "flex min-w-0 items-center",
              isCollapsed
                ? "w-full justify-center"
                : isDesktop
                  ? "w-full flex-col"
                  : "gap-3",
            ].join(" ")}>
            <div
              className={["shrink-0", isDesktop ? "" : "rounded-xl p-1.5"].join(
                " ",
              )}>
              <img
                src="/logo.webp"
                alt="Logo"
                onClick={() => navigate("/app")}
                className={[
                  "object-contain transition-all duration-300 cursor-pointer select-none",
                  "hover:scale-110 active:scale-105",
                  isCollapsed
                    ? "h-9 w-9"
                    : isDesktop
                      ? "mb-2 h-35 w-35"
                      : "h-20 w-40",
                ].join(" ")}
                draggable={false}
              />
            </div>
          </div>

          {/* Botón cerrar solo para modal móvil */}
          {isMobileModal && (
            <button
              type="button"
              onClick={onToggleMobile}
              className="
                ml-2 inline-flex h-10 w-10 items-center justify-center
                rounded-xl border border-white/10 bg-white/5
                transition hover:bg-white/10 active:scale-95
              "
              aria-label="Cerrar menú">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav
          className={[
            "min-h-0",
            isDesktop ? "flex flex-col" : "mt-2 flex flex-col gap-1 px-2",
          ].join(" ")}>
          {menuItems.map((item) => (
            <SidebarNavItem
              key={item.path || item.name}
              item={item}
              collapsed={isCollapsed}
              isDesktop={isDesktop}
              mode={mode}
              onNavigate={() => {
                if (!isDesktop && onToggleMobile) {
                  onToggleMobile();
                }
              }}
            />
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className={isDesktop ? "mb-4" : "px-2 pb-4 pt-3"}>
        <button
          type="button"
          onClick={onLogout}
          title={isCollapsed ? "Salir" : undefined}
          className={[
            "sidebar-logout flex items-center rounded-xl transition-colors duration-200",
            isCollapsed
              ? "mx-auto h-12 w-12 justify-center"
              : isDesktop
                ? "mx-3 w-[calc(100%-1.5rem)] gap-3 px-4 py-2"
                : "w-full gap-3 px-4 py-3",
          ].join(" ")}>
          <LogOut size={20} />
          {!isCollapsed && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}
